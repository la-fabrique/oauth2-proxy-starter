# Résumé des Tâches - Feature 004 : dotnet-core-api

Ce document résume les informations importantes extraites des tâches de la feature 004 avant compression.

## Vue d'ensemble

La feature 004 a implémenté une API .NET 9 avec validation JWT via Keycloak, intégrée avec oauth2-proxy et le front-end Vue.js. L'API remplace les mocks du front-end et permet un test de bout en bout complet.

## Livrables - Fichiers créés

### Structure du projet API

- **`packages/api/`** : Répertoire racine du projet API .NET 9
- **`packages/api/Api.csproj`** : Fichier projet .NET 9 avec dépendances :
  - `Microsoft.AspNetCore.OpenApi` (Version 9.0.10)
  - `Microsoft.AspNetCore.Authentication.JwtBearer` (Version 9.0.0)
- **`packages/api/Program.cs`** : Point d'entrée de l'application avec :
  - Configuration JWT Bearer pour Keycloak
  - Middleware de copie `X-Forwarded-Access-Token` vers `Authorization`
  - Pipeline d'authentification et d'autorisation
  - Endpoint de healthcheck `/health`
- **`packages/api/appsettings.json`** : Configuration de l'API avec :
  - Section `Oidc` : Authority, Audience, ClientId
  - Logging configuré
- **`packages/api/Models/ProtectedData.cs`** : Modèle de données (record C#) :
  - Propriétés : `Id` (string), `Description` (string)
  - Correspond au type TypeScript `ProtectedData` du front-end
- **`packages/api/Controllers/ProtectedDataController.cs`** : Contrôleur CRUD avec :
  - Route : `[Route("api/[controller]")]` → `/api/ProtectedData`
  - Attribut `[Authorize]` pour protéger tous les endpoints
  - Liste en mémoire pour le stockage (POC)
  - Endpoints : GET (liste et par ID), POST, PUT, DELETE
- **`packages/api/Dockerfile`** : Dockerfile multi-stage :
  - Phase build : `mcr.microsoft.com/dotnet/sdk:9.0`
  - Phase run : `mcr.microsoft.com/dotnet/aspnet:9.0`
  - Installation de `curl` pour healthcheck
  - Port interne 80
  - Variable d'environnement : `ASPNETCORE_URLS=http://+:80`
- **`packages/api/.dockerignore`** : Fichiers exclus du build Docker

### Configuration Docker Compose

- **`packages/others/docker-compose.yml`** : Service `api` ajouté :
  - Build context : `../api`
  - Port interne : 80 (pas d'exposition externe)
  - Dépendances : `keycloak` (condition: service_healthy)
  - Healthcheck : `curl -f http://localhost:80/health || exit 1`
  - Réseaux : `app`, `keycloak`

### Configuration oauth2-proxy

- **`packages/others/oauth2-config/oauth2-proxy.cfg`** : Mise à jour avec :
  - Multiple upstreams : `["http://api:80/api/", "http://app:80/"]`
  - Passage du token : `pass_access_token = true`
  - Le token JWT est transmis dans l'en-tête `X-Forwarded-Access-Token`

### Adaptation du front-end

- **`packages/front/src/services/api.ts`** : Remplacement des mocks par de vrais appels API :
  - `getProtectedData()` : GET `/api/ProtectedData`
  - `getProtectedDataById(id)` : GET `/api/ProtectedData/:id`
  - `createProtectedData(description)` : POST `/api/ProtectedData`
  - `updateProtectedData(id, description)` : PUT `/api/ProtectedData/:id`
  - `deleteProtectedData(id)` : DELETE `/api/ProtectedData/:id`
  - Tous les appels incluent `credentials: 'include'` pour les cookies de session

## Configuration Summary

### Configuration API (.NET)

**Fichier** : `packages/api/appsettings.json`

```json
{
  "Oidc": {
    "Authority": "http://keycloak.localtest.me:8080/realms/oauth-starter",
    "Audience": "oauth-starter-client",
    "ClientId": "oauth-starter-client"
  }
}
```

**Configuration JWT Bearer** (dans `Program.cs`) :
- Authority : Découverte automatique JWKS via l'issuer Keycloak
- RequireHttpsMetadata : `false` (pour développement HTTP)
- ValidIssuer : `http://keycloak.localtest.me:8080/realms/oauth-starter`
- ValidAudiences : `["oauth-starter-client", "account"]` (Keycloak utilise "account" par défaut)
- ValidateIssuer : `true`
- ValidateAudience : `true`
- ValidateLifetime : `true`
- ClockSkew : `TimeSpan.Zero` (pas de tolérance pour l'expiration)

### Configuration oauth2-proxy

**Fichier** : `packages/others/oauth2-config/oauth2-proxy.cfg`

```toml
upstreams = [
    "http://api:80/api/",
    "http://app:80/"
]

pass_access_token = true
```

**Comportement** :
- `/api/*` → routé vers `http://api:80/api/*`
- `/` → routé vers `http://app:80/`
- Le token JWT est transmis dans `X-Forwarded-Access-Token`

### Configuration Docker Compose

**Service `api`** :
- Build context : `../api`
- Port interne : 80
- Healthcheck : `curl -f http://localhost:80/health || exit 1`
- Dépendances : `keycloak` (service_healthy)

## Décisions architecturales importantes

### 1. Utilisation de `AddJwtBearer` au lieu de `Microsoft.Identity.Web`

**Décision** : Utilisation directe de `AddJwtBearer` au lieu de `Microsoft.Identity.Web`

**Raison** : `Microsoft.Identity.Web` est conçu spécifiquement pour Azure AD et utilise des validators Azure AD (AadIssuerValidator) qui ne fonctionnent pas avec Keycloak. L'utilisation directe de `AddJwtBearer` permet une configuration OIDC standard compatible avec Keycloak.

**Impact** : Configuration plus manuelle mais plus flexible et compatible avec Keycloak.

### 2. Middleware de copie `X-Forwarded-Access-Token` vers `Authorization`

**Décision** : Ajout d'un middleware personnalisé pour copier `X-Forwarded-Access-Token` vers `Authorization: Bearer <token>`

**Raison** : oauth2-proxy transmet le token JWT dans l'en-tête `X-Forwarded-Access-Token` (et non directement dans `Authorization`) lorsque `pass_access_token = true`. Le middleware ASP.NET Core JWT Bearer attend le token dans `Authorization: Bearer <token>`.

**Implémentation** :
```csharp
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api"))
    {
        var xForwardedToken = context.Request.Headers["X-Forwarded-Access-Token"].ToString();
        if (!string.IsNullOrEmpty(xForwardedToken) && string.IsNullOrEmpty(context.Request.Headers["Authorization"].ToString()))
        {
            context.Request.Headers["Authorization"] = $"Bearer {xForwardedToken}";
        }
    }
    await next();
});
```

### 3. Routage oauth2-proxy avec multiple upstreams

**Décision** : Configuration de multiple upstreams dans oauth2-proxy pour router `/api/*` vers l'API et `/` vers le front-end

**Configuration** :
```toml
upstreams = [
    "http://api:80/api/",
    "http://app:80/"
]
```

**Impact** : Aucune modification nécessaire du BASE_URL de Vue Router. Les routes Vue (`/`, `/profile`, `/protected-data`) fonctionnent normalement.

### 4. Stockage en mémoire pour le POC

**Décision** : Utilisation d'une liste statique en mémoire pour stocker les données protégées

**Raison** : POC - pas de base de données nécessaire pour cette feature

**Implémentation** : Liste statique dans `ProtectedDataController` avec exemples de données initiales

### 5. Validation des audiences multiples

**Décision** : Accepter à la fois "account" et "oauth-starter-client" comme audiences valides

**Raison** : Keycloak émet des tokens avec "account" comme audience par défaut, mais la configuration attend "oauth-starter-client"

**Configuration** :
```csharp
ValidAudiences = new[] { audience, "account" }
```

### 6. Endpoint de healthcheck sans authentification

**Décision** : L'endpoint `/health` est accessible sans authentification

**Raison** : Permet à docker-compose de vérifier l'état de santé du service sans token JWT

**Implémentation** : Endpoint défini avant `UseAuthentication()` et `UseAuthorization()`

## Variables d'environnement

Aucune variable d'environnement spécifique n'a été ajoutée pour l'API. La configuration est gérée via `appsettings.json`.

**Note** : Les variables d'environnement peuvent être utilisées pour surcharger la configuration dans `appsettings.json` si nécessaire (ASP.NET Core le supporte nativement).

## Notes d'implémentation importantes

### 1. Ordre du middleware

**Critique** : L'ordre des middlewares est important :
1. Middleware de copie `X-Forwarded-Access-Token` → `Authorization`
2. `UseAuthentication()`
3. `UseAuthorization()`
4. `MapControllers()`

### 2. Casse des routes API

**Important** : Le contrôleur utilise `[Route("api/[controller]")]`, ce qui résout en `/api/ProtectedData` (avec majuscule 'P'). Les appels front-end doivent utiliser `/api/ProtectedData` et non `/api/protected-data`.

### 3. Gestion des erreurs

**Comportement** :
- 401 Unauthorized : Token invalide, absent ou expiré
- 403 Forbidden : Token valide mais accès refusé (non utilisé dans cette feature, RBAC dans une feature future)
- 404 Not Found : Ressource non trouvée (pour GET/PUT/DELETE avec ID invalide)

### 4. Support HTTP pour développement

**Configuration** : `RequireHttpsMetadata = false` pour permettre HTTP en développement (Keycloak utilise HTTP)

**Note** : À changer en `true` pour la production avec HTTPS

### 5. Découverte automatique JWKS

**Fonctionnement** : L'API découvre automatiquement les clés JWKS via l'endpoint `.well-known/openid-configuration` de Keycloak en utilisant l'Authority configurée.

**Endpoint JWKS** : `http://keycloak.localtest.me:8080/realms/oauth-starter/.well-known/openid-configuration`

### 6. Intégration avec oauth2-proxy

**Flux** :
1. Utilisateur authentifié via oauth2-proxy
2. Front-end fait un appel vers `/api/ProtectedData`
3. oauth2-proxy route vers `http://api:80/api/ProtectedData`
4. oauth2-proxy ajoute `X-Forwarded-Access-Token` avec le token JWT
5. Middleware API copie vers `Authorization: Bearer <token>`
6. Middleware JWT Bearer valide le token
7. Contrôleur traite la requête

## Références des tâches

### Configuration et Setup
- **004-01** : Création du projet .NET 9
- **004-02** : Configuration Microsoft.Identity.Web (remplacée par AddJwtBearer)
- **004-03** : Configuration découverte JWKS
- **004-04** : Configuration validation claims

### Middleware
- **004-05** : Implémentation middleware JWT
- **004-06** : Implémentation gestion erreurs 401/403

### Endpoints API
- **004-07** : Création contrôleur ProtectedData
- **004-08 à 004-12** : Implémentation endpoints CRUD
- **004-13** : Endpoint healthcheck

### Containerisation
- **004-14** : Dockerfile
- **004-15** : Configuration docker-compose
- **004-16** : Healthcheck docker-compose

### Configuration oauth2-proxy
- **004-17** : Configuration multiple upstreams
- **004-18** : Configuration passage token JWT

### Adaptation front-end
- **004-19** : Vérification BASE_URL Vue Router
- **004-20** : Remplacement mocks par appels API réels

### Tests
- **004-21** : Test démarrage API
- **004-22** : Test validation JWT
- **004-23** : Test validation claims
- **004-24** : Test endpoints CRUD
- **004-25** : Test healthcheck
- **004-26 à 004-28** : Tests bout en bout

### Documentation
- **004-29** : Documentation API et intégration

## Limitations et considérations futures

### Limitations actuelles

1. **Stockage en mémoire** : Les données sont stockées en mémoire et seront perdues au redémarrage du conteneur
2. **Pas de RBAC** : La vérification des rôles n'est pas implémentée (feature future)
3. **HTTP uniquement** : Configuration pour développement HTTP, nécessite HTTPS pour production
4. **Pas de pagination** : Les endpoints retournent toutes les données sans pagination

### Considérations futures

1. **Base de données** : Remplacer le stockage en mémoire par une base de données
2. **RBAC** : Implémenter la vérification des rôles et permissions
3. **HTTPS** : Configurer TLS/HTTPS pour la production (feature 011)
4. **Pagination** : Ajouter la pagination aux endpoints de liste
5. **Logging structuré** : Améliorer le logging pour le monitoring (feature 010)

## Tests effectués

Tous les tests ont été effectués avec succès :
- ✅ API démarre correctement dans docker-compose
- ✅ Validation JWT via Keycloak JWKS fonctionne
- ✅ Validation des claims (aud, iss, exp) fonctionne
- ✅ Endpoints CRUD fonctionnent correctement
- ✅ Healthcheck répond correctement
- ✅ oauth2-proxy route correctement vers l'API
- ✅ oauth2-proxy transmet le token JWT
- ✅ Tests bout en bout réussis avec `test@example.com` / `test`

