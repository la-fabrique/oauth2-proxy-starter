# Documentation - Mapping des rôles dans les tokens JWT

## Introduction

Cette documentation explique comment les rôles Keycloak (realm roles et application roles) sont mappés dans les tokens JWT pour permettre l'autorisation dans l'API .NET Core et l'affichage conditionnel dans le front-end Vue.js.

### Vue d'ensemble

Le processus de mapping des rôles dans les tokens JWT comprend :
1. **Configuration des protocol mappers** dans Keycloak pour inclure les rôles dans les tokens
2. **Extraction des rôles** depuis les tokens JWT dans l'API .NET Core
3. **Transformation des rôles** depuis oauth2-proxy dans le front-end Vue.js

### Dépendances

- **Keycloak** : Fournisseur d'identité OIDC avec rôles configurés (feature 001, 005)
- **oauth2-proxy** : Reverse proxy qui transmet les tokens JWT (feature 002)
- **API .NET Core** : Extraction et utilisation des rôles pour l'autorisation (feature 004, 005)

## Configuration des protocol mappers dans Keycloak

### Scope "roles"

Les rôles sont mappés via le scope `roles` configuré dans Keycloak. Ce scope contient trois protocol mappers :

1. **audience resolve mapper** : Résout l'audience du token
2. **client roles mapper** : Mappe les rôles application dans `resource_access.{client_id}.roles`
3. **realm roles mapper** : Mappe les rôles realm dans `realm_access.roles`

### Configuration JSON

La configuration se trouve dans `packages/others/keycloak-config/realms/realm-oauth-starter.json` :

```json
{
  "clientScopes": [
    {
      "name": "roles",
      "protocolMappers": [
        {
          "name": "client roles",
          "protocolMapper": "oidc-usermodel-client-role-mapper",
          "config": {
            "claim.name": "resource_access.${client_id}.roles",
            "access.token.claim": "true",
            "id.token.claim": "true",
            "userinfo.token.claim": "true",
            "introspection.token.claim": "true",
            "multivalued": "true"
          }
        },
        {
          "name": "realm roles",
          "protocolMapper": "oidc-usermodel-realm-role-mapper",
          "config": {
            "claim.name": "realm_access.roles",
            "access.token.claim": "true",
            "id.token.claim": "true",
            "userinfo.token.claim": "true",
            "introspection.token.claim": "true",
            "multivalued": "true"
          }
        }
      ]
    }
  ]
}
```

### Paramètres des mappers

#### Client roles mapper

- **claim.name** : `resource_access.${client_id}.roles`
  - `${client_id}` est remplacé par l'ID du client (ex: `oauth-starter-client`)
  - Les rôles application sont placés dans `resource_access.oauth-starter-client.roles`
- **access.token.claim** : `true` - Inclut les rôles dans le token d'accès
- **id.token.claim** : `true` - Inclut les rôles dans le token ID
- **userinfo.token.claim** : `true` - Inclut les rôles dans la réponse `/userinfo`
- **introspection.token.claim** : `true` - Inclut les rôles lors de l'introspection du token
- **multivalued** : `true` - Indique que le claim est un tableau

#### Realm roles mapper

- **claim.name** : `realm_access.roles`
  - Les rôles realm sont placés dans `realm_access.roles`
- **access.token.claim** : `true` - Inclut les rôles dans le token d'accès
- **id.token.claim** : `true` - Inclut les rôles dans le token ID
- **userinfo.token.claim** : `true` - Inclut les rôles dans la réponse `/userinfo`
- **introspection.token.claim** : `true` - Inclut les rôles lors de l'introspection du token
- **multivalued** : `true` - Indique que le claim est un tableau

### Activation du scope "roles"

Le scope `roles` est automatiquement inclus dans les tokens pour le client `oauth-starter-client` car il est configuré comme scope par défaut dans Keycloak.

## Structure des tokens JWT

### Token d'accès (Access Token)

Après configuration des mappers, le token JWT contient les rôles dans les claims suivants :

```json
{
  "iss": "http://keycloak.localtest.me:8080/realms/oauth-starter",
  "aud": "oauth-starter-client",
  "sub": "ef135603-9af7-4655-9104-48efe41cb14c",
  "realm_access": {
    "roles": ["customer", "admin"]
  },
  "resource_access": {
    "oauth-starter-client": {
      "roles": ["protected-data-read", "protected-data-write"]
    }
  },
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Structure des claims

- **realm_access.roles** : Tableau des rôles realm assignés à l'utilisateur
  - Exemple : `["customer", "admin"]`
- **resource_access.{client_id}.roles** : Tableau des rôles application assignés à l'utilisateur pour le client spécifié
  - Exemple : `["protected-data-read", "protected-data-write"]` pour le client `oauth-starter-client`

## Extraction des rôles dans l'API .NET Core

### Configuration dans Program.cs

Les rôles sont extraits depuis les tokens JWT et mappés vers les claims .NET Core dans `Program.cs` :

```csharp
options.Events = new JwtBearerEvents
{
    OnTokenValidated = async context =>
    {
        var claimsIdentity = (ClaimsIdentity?)context.Principal?.Identity;
        if (claimsIdentity == null) return;

        // Extract realm roles from realm_access.roles
        var realmAccessClaim = context.Principal?.FindFirst("realm_access");
        if (realmAccessClaim != null)
        {
            var realmAccess = JsonSerializer.Deserialize<JsonElement>(realmAccessClaim.Value);
            if (realmAccess.TryGetProperty("roles", out var realmRoles))
            {
                foreach (var role in realmRoles.EnumerateArray())
                {
                    var roleValue = role.GetString();
                    if (!string.IsNullOrEmpty(roleValue))
                    {
                        claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, roleValue));
                    }
                }
            }
        }

        // Extract client roles from resource_access.oauth-starter-client.roles
        var resourceAccessClaim = context.Principal?.FindFirst("resource_access");
        if (resourceAccessClaim != null && !string.IsNullOrEmpty(audience))
        {
            var resourceAccess = JsonSerializer.Deserialize<JsonElement>(resourceAccessClaim.Value);
            if (resourceAccess.TryGetProperty(audience, out var clientAccess))
            {
                if (clientAccess.TryGetProperty("roles", out var clientRoles))
                {
                    foreach (var role in clientRoles.EnumerateArray())
                    {
                        var roleValue = role.GetString();
                        if (!string.IsNullOrEmpty(roleValue))
                        {
                            claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, roleValue));
                        }
                    }
                }
            }
        }
    }
};
```

### Processus d'extraction

1. **Validation du token** : Le token JWT est validé par le middleware JWT Bearer
2. **Extraction des claims** : Les claims `realm_access` et `resource_access` sont extraits
3. **Parsing JSON** : Les claims JSON sont désérialisés en `JsonElement`
4. **Ajout des rôles** : Chaque rôle est ajouté comme claim de type `ClaimTypes.Role`
5. **Utilisation** : Les rôles sont accessibles via `User.IsInRole()` et `User.Claims`

### Utilisation dans les controllers

Les rôles extraits sont utilisés dans les policies d'autorisation :

```csharp
[HttpGet]
[Authorize(Policy = "protected-data-read")]
public IEnumerable<ProtectedData> Get()
{
    return _data;
}
```

Les policies vérifient les rôles via `User.IsInRole()` :

```csharp
options.AddPolicy("protected-data-read", policy =>
    policy.RequireAssertion(context =>
        context.User.IsInRole("protected-data-read") ||
        context.User.IsInRole("protected-data-write") ||
        context.User.IsInRole("admin")));
```

## Transformation des rôles dans le front-end

### Endpoint /oauth2/userinfo

Le front-end récupère les informations utilisateur depuis l'endpoint `/oauth2/userinfo` fourni par oauth2-proxy. Cet endpoint retourne les claims du token JWT.

### Format oauth2-proxy

oauth2-proxy peut retourner les rôles dans différents formats :

1. **Format groups** : `groups: ["role:admin", "role:oauth-starter-client:protected-data-read"]`
2. **Format direct** : `realm_access.roles` et `resource_access.oauth-starter-client.roles` si présents

### Transformation dans api.ts

La fonction `transformRoles()` dans `packages/front/src/services/api.ts` transforme les groupes oauth2-proxy en rôles structurés :

```typescript
function transformRoles(data: UserProfile): UserProfile {
  const realmRoles: string[] = []
  const applicationRoles: string[] = []

  // Traiter les groupes depuis oauth2-proxy
  const groups = data.groups as string[] | undefined
  if (groups && Array.isArray(groups)) {
    for (const group of groups) {
      // Format: "role:admin" -> realm role "admin"
      if (group.startsWith('role:') && group.split(':').length === 2) {
        const role = group.substring(5)
        realmRoles.push(role)
      }
      // Format: "role:oauth-starter-client:protected-data-read" -> application role
      else if (group.startsWith('role:oauth-starter-client:')) {
        const role = group.substring(26)
        applicationRoles.push(role)
      }
    }
  }

  // Essayer aussi d'extraire depuis realm_access et resource_access si présents
  if (data.realm_access?.roles) {
    realmRoles.push(...data.realm_access.roles)
  }
  if (data.resource_access?.['oauth-starter-client']?.roles) {
    applicationRoles.push(...data.resource_access['oauth-starter-client'].roles)
  }

  return {
    ...data,
    realmRoles: realmRoles.length > 0 ? realmRoles : undefined,
    applicationRoles: applicationRoles.length > 0 ? applicationRoles : undefined,
  }
}
```

### Utilisation dans les composants Vue

Les rôles transformés sont utilisés via les helpers de `utils/roles.ts` :

```typescript
import { canWriteProtectedData } from '../utils/roles'

const canWrite = () => {
  return canWriteProtectedData(userProfile.value)
}
```

## Vérification du mapping

### Vérifier dans Keycloak

1. Connectez-vous à l'interface admin Keycloak (http://localhost:8080)
2. Allez dans Realm "oauth-starter" > Client Scopes > roles
3. Vérifiez que les protocol mappers "client roles" et "realm roles" sont configurés
4. Vérifiez que tous les claims sont activés (access.token.claim, id.token.claim, userinfo.token.claim, introspection.token.claim)

### Vérifier dans les tokens JWT

1. Connectez-vous à l'application avec un utilisateur de test
2. Décodage du token JWT (via jwt.io ou un outil similaire)
3. Vérifiez que les rôles apparaissent dans :
   - `realm_access.roles` pour les rôles realm
   - `resource_access.oauth-starter-client.roles` pour les rôles application

### Vérifier dans l'API .NET Core

1. Ajoutez des logs dans `OnTokenValidated` pour voir les rôles extraits
2. Vérifiez que `User.IsInRole("protected-data-read")` retourne `true` pour les utilisateurs avec ce rôle
3. Testez les endpoints avec différents utilisateurs et vérifiez les réponses 403

### Vérifier dans le front-end

1. Ouvrez la console du navigateur
2. Vérifiez les logs de `loadUserProfile()` qui affichent les rôles détectés
3. Vérifiez que les boutons s'affichent/masquent correctement selon les rôles
4. Allez sur la page "Profil" pour voir les rôles affichés

## Dépannage

### Les rôles n'apparaissent pas dans les tokens JWT

- Vérifiez que les protocol mappers sont configurés dans le scope "roles"
- Vérifiez que le scope "roles" est assigné au client
- Vérifiez que les rôles sont assignés à l'utilisateur dans Keycloak
- Vérifiez que les claims sont activés dans les mappers (access.token.claim, etc.)

### Les rôles ne sont pas extraits dans l'API

- Vérifiez que le token JWT contient bien les claims `realm_access` et `resource_access`
- Vérifiez que l'audience du client correspond (`oauth-starter-client`)
- Vérifiez les logs dans `OnTokenValidated` pour voir les erreurs de parsing

### Les rôles ne sont pas transformés dans le front-end

- Vérifiez que `/oauth2/userinfo` retourne les groupes ou les rôles
- Vérifiez que la fonction `transformRoles()` est appelée
- Vérifiez les logs de la console pour voir les rôles détectés
- Vérifiez que le format des groupes correspond à celui attendu par `transformRoles()`

## Références

- [Documentation Keycloak - Protocol Mappers](https://www.keycloak.org/docs/latest/server_admin/#_protocol_mappers)
- [Documentation Keycloak - Client Scopes](https://www.keycloak.org/docs/latest/server_admin/#_client_scopes)
- [Documentation oauth2-proxy - User Info](https://oauth2-proxy.github.io/oauth2-proxy/docs/configuration/oauth_provider#keycloak-oidc-provider)

