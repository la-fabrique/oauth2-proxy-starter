# Feature 004 : dotnet-core-api

## Objectif

Développer une API .NET Core (Kestrel) avec middleware de validation JWT utilisant `microsoft-identity-web`. L'API valide les tokens JWT via Keycloak JWKS en respectant les standards OAuth2/OIDC. L'objectif principal est de permettre au front-end Vue.js d'appeler l'API de manière sécurisée via oauth2-proxy, qui transmet le token JWT dans l'en-tête `Authorization: Bearer <token>`.

L'API remplace les mocks/bouchons actuellement utilisés dans le front-end et permet un test de bout en bout de l'application complète.

## Périmètre

### Inclus

- Projet API .NET 9 avec Kestrel
- Configuration de `microsoft-identity-web` pour la validation JWT
- Validation des tokens via Keycloak JWKS (découverte automatique via issuer)
- Vérification des claims standards (aud, iss, exp)
- Middleware de gestion d'erreurs 401/403 approprié
- Endpoints API CRUD pour `/api/protected-data` :
  - `GET /api/protected-data` : Liste toutes les données protégées
  - `GET /api/protected-data/:id` : Récupère une donnée par ID
  - `POST /api/protected-data` : Crée une nouvelle donnée
  - `PUT /api/protected-data/:id` : Met à jour une donnée existante
  - `DELETE /api/protected-data/:id` : Supprime une donnée
- Endpoint de healthcheck pour le monitoring
- Configuration docker-compose pour le service API (port interne 80, pas d'exposition externe)
- Configuration oauth2-proxy pour router `/api/*` vers le service API
- Adaptation du front-end pour remplacer les mocks par de vrais appels API
- Tests de bout en bout avec l'utilisateur `test@example.com` / `test`
- Analyse technique détaillée du routage oauth2-proxy et impact sur Vue Router

### Exclu

- Vérification des rôles et RBAC (sera implémenté dans une feature dédiée)
- Gestion manuelle des tokens (gérée par oauth2-proxy)
- Tests end-to-end complets automatisés (feature 006)
- Configuration TLS/HTTPS (feature 011)
- Logout et invalidation de session (feature 008)

## Dépendances

- **001-keycloak-docker-compose-setup** : Keycloak doit être configuré avec le realm et le client OAuth2
- **002-oauth2-proxy-configuration** : oauth2-proxy doit être configuré pour gérer l'authentification
- **003-vue-spa-application-with-vite-server** : Le front-end doit être opérationnel pour tester les appels API

## Livrables

- Projet API .NET 9 dans `packages/api/`
- Configuration `microsoft-identity-web` avec validation JWT via Keycloak JWKS
- Middleware de validation JWT configuré
- Middleware de gestion d'erreurs 401/403
- Endpoints API CRUD pour `/api/protected-data`
- Endpoint de healthcheck (`/health` ou `/healthz`)
- Dockerfile pour le service API
- Configuration docker-compose pour le service API (port interne 80)
- Configuration oauth2-proxy mise à jour pour router `/api/*` vers `http://api:80`
- Adaptation du front-end (`packages/front/src/services/api.ts`) pour remplacer les mocks
- Analyse technique du routage oauth2-proxy et impact sur Vue Router
- Documentation de l'API et de son intégration

## Critères d'acceptation

- ✅ L'API .NET Core démarre correctement dans docker-compose
- ✅ L'API valide correctement les tokens JWT via Keycloak JWKS (découverte via issuer)
- ✅ Les claims standards (aud, iss, exp) sont vérifiés
- ✅ Les erreurs 401/403 sont gérées de manière appropriée
- ✅ Les endpoints CRUD `/api/protected-data` fonctionnent correctement
- ✅ L'endpoint de healthcheck répond correctement
- ✅ oauth2-proxy route `/api/*` vers le service API
- ✅ oauth2-proxy transmet le token JWT dans l'en-tête `Authorization: Bearer <token>`
- ✅ Le front-end peut appeler l'API de manière sécurisée (remplacement des mocks)
- ✅ Les tests de bout en bout fonctionnent avec l'utilisateur `test@example.com` / `test`
- ✅ L'application complète (front + API) fonctionne via docker-compose

## Analyse technique : Routage oauth2-proxy et impact sur Vue Router

### Contexte actuel

Actuellement, oauth2-proxy est configuré avec un seul upstream dans `oauth2-proxy.cfg` :
```toml
upstreams = [
    "http://app:80/"
]
```

Le front-end Vue.js est accessible via oauth2-proxy et utilise Vue Router avec `createWebHistory` et un `BASE_URL` relatif. Les routes Vue sont : `/`, `/profile`, `/protected-data`.

Les appels API du front-end sont faits vers `/api/*` (chemins absolus).

### Options de routage oauth2-proxy

#### Option 1 : Multiple upstreams dans oauth2-proxy (RECOMMANDÉE)

**Description** : Configurer oauth2-proxy avec plusieurs upstreams basés sur les chemins.

**Configuration** :
- Dans `oauth2-proxy.cfg` :
  ```toml
  upstreams = [
      "static|http://app:80/",
      "static|http://api:80/"
  ]
  ```
- Ou via flags en ligne de commande dans docker-compose.yml :
  ```yaml
  command:
    - --upstream=static|http://app:80/
    - --upstream=static|http://api:80/
  ```

**Comportement** :
- Les requêtes vers `/app/*` sont routées vers `http://app:80/`
- Les requêtes vers `/api/*` sont routées vers `http://api:80/`
- Les requêtes vers `/oauth2/*` sont gérées par oauth2-proxy (pas de routage upstream)

**Impact sur Vue Router** :
- **Problème potentiel** : Si oauth2-proxy route `/app` vers le front, alors le front doit être accessible via `/app` et non `/`
- **Solution** : Configurer le `BASE_URL` de Vue Router pour utiliser `/app` comme base
  - Dans `vite.config.ts` : `base: '/app/'`
  - Dans `router/index.ts` : `createWebHistory('/app/')`
- **Alternative** : Configurer oauth2-proxy pour router `/` vers le front et `/api` vers l'API
  - Mais cela nécessite de vérifier que les routes Vue Router ne rentrent pas en conflit avec `/api`

**Avantages** :
- ✅ Configuration simple et native d'oauth2-proxy
- ✅ Pas de service supplémentaire
- ✅ Routage clair et explicite
- ✅ Compatible avec le passage du token JWT via `pass_access_token = true`

**Inconvénients** :
- ⚠️ Nécessite d'adapter le BASE_URL de Vue Router si on utilise `/app` comme chemin
- ⚠️ Les URLs de l'application deviennent `http://oauth2-proxy:4180/app/` au lieu de `http://oauth2-proxy:4180/`

#### Option 2 : Routage `/` vers front et `/api` vers API

**Description** : Router `/` vers le front et `/api` vers l'API.

**Configuration** :
```toml
upstreams = [
    "static|http://app:80/",
    "static|http://api:80/"
]
```

**Comportement** :
- Les requêtes vers `/` (et chemins non `/api/*`) sont routées vers `http://app:80/`
- Les requêtes vers `/api/*` sont routées vers `http://api:80/`

**Impact sur Vue Router** :
- ✅ Pas besoin de modifier le BASE_URL de Vue Router
- ✅ Les routes Vue (`/`, `/profile`, `/protected-data`) fonctionnent normalement
- ✅ Les appels API vers `/api/*` sont automatiquement routés vers l'API

**Avantages** :
- ✅ Pas de modification nécessaire du front-end
- ✅ URLs plus propres (`http://oauth2-proxy:4180/` au lieu de `http://oauth2-proxy:4180/app/`)
- ✅ Configuration simple

**Inconvénients** :
- ⚠️ Nécessite de vérifier que oauth2-proxy route correctement les chemins non `/api/*` vers le front
- ⚠️ Les routes Vue doivent être configurées pour ne pas entrer en conflit avec `/api`

#### Option 3 : Reverse proxy Nginx (NON RECOMMANDÉE pour cette feature)

**Description** : Ajouter un service Nginx qui route vers app et api, puis oauth2-proxy route vers Nginx.

**Configuration** :
- Service Nginx qui route `/app` → `http://app:80` et `/api` → `http://api:80`
- oauth2-proxy route tout vers Nginx

**Avantages** :
- ✅ Plus de flexibilité pour le routage
- ✅ Peut gérer d'autres aspects (compression, cache, etc.)

**Inconvénients** :
- ❌ Complexité supplémentaire (service supplémentaire)
- ❌ Pas nécessaire pour cette feature
- ❌ Augmente la latence

### Recommandation : Option 2 (Routage `/` vers front et `/api` vers API)

**Justification** :
1. **Simplicité** : Pas de modification nécessaire du front-end Vue Router
2. **Standards** : Respecte les conventions (front sur `/`, API sur `/api`)
3. **Maintenabilité** : Configuration claire et explicite
4. **Performance** : Pas de service supplémentaire

**Configuration à implémenter** :

1. **oauth2-proxy.cfg** :
   ```toml
   upstreams = [
       "static|http://app:80/",
       "static|http://api:80/"
   ]
   ```

2. **Passage du token JWT** :
   ```toml
   pass_access_token = true
   ```
   Ou via flag : `--pass-access-token=true`

   Cela ajoute l'en-tête `Authorization: Bearer <token>` aux requêtes upstream vers l'API.

3. **Vérification du routage** :
   - Les requêtes vers `/` → `http://app:80/` (front)
   - Les requêtes vers `/api/*` → `http://api:80/api/*` (API)
   - Les requêtes vers `/oauth2/*` → gérées par oauth2-proxy

**Impact sur le front-end** :
- ✅ Aucune modification nécessaire du BASE_URL de Vue Router
- ✅ Les appels API vers `/api/*` fonctionnent automatiquement
- ✅ Les routes Vue (`/`, `/profile`, `/protected-data`) fonctionnent normalement

### Configuration microsoft-identity-web

L'API .NET doit être configurée pour :
1. **Découvrir automatiquement les clés JWKS** via l'issuer Keycloak
2. **Valider le token JWT** dans l'en-tête `Authorization: Bearer <token>`
3. **Vérifier les claims** : `aud`, `iss`, `exp`
4. **Gérer les erreurs** : Retourner 401 si token invalide/absent, 403 si accès refusé

**Configuration recommandée** :
```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(options =>
    {
        options.Authority = "http://keycloak.localtest.me:8080/realms/oauth-starter";
        options.Audience = "oauth-starter-client";
        options.TokenValidationParameters.ValidateIssuer = true;
        options.TokenValidationParameters.ValidateAudience = true;
        options.TokenValidationParameters.ValidateLifetime = true;
    });
```

### Tests de bout en bout

Pour tester l'intégration complète :
1. Démarrer tous les services via `docker-compose up`
2. Accéder à `http://oauth2-proxy.localtest.me:4180/` (ou l'URL configurée)
3. Se connecter avec `test@example.com` / `test`
4. Vérifier que le front-end charge correctement
5. Vérifier que les appels API vers `/api/protected-data` fonctionnent
6. Vérifier que les tokens JWT sont correctement validés par l'API



