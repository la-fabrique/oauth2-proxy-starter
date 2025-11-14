# Résumé des tâches - Feature 005 : keycloak-rbac-roles

## Vue d'ensemble

Cette feature implémente le contrôle d'accès basé sur les rôles (RBAC) avec Keycloak. Elle permet de définir des rôles realm (`admin`, `customer`) et des rôles application (`protected-data-read`, `protected-data-write`) pour contrôler l'accès aux ressources de l'API et masquer/afficher les fonctionnalités dans le front-end selon les permissions de l'utilisateur.

**Statut** : ✅ Complétée (25/25 tâches)

## Résumé des livrables

### Fichiers créés/modifiés

#### Configuration Keycloak
- **`packages/others/keycloak-config/realms/realm-oauth-starter.json`** :
  - Rôles realm : `admin`, `customer` (définis dans la section `roles.realm`)
  - Rôles application : `protected-data-read`, `protected-data-write` (définis dans `roles.client["oauth-starter-client"]`)
  - Protocol mappers configurés dans le scope "roles" :
    - Mapper realm roles : `oidc-usermodel-realm-role-mapper` → `realm_access.roles`
    - Mapper client roles : `oidc-usermodel-client-role-mapper` → `resource_access.oauth-starter-client.roles`
  - Utilisateurs de test avec rôles assignés :
    - `customer@dev.io` : rôle `customer` uniquement
    - `customer-read@dev.io` : rôle `customer` + `protected-data-read`
    - `customer-write@dev.io` : rôle `customer` + `protected-data-write`
    - `administrator@dev.io` : rôle `admin`

#### API .NET Core
- **`packages/api/Program.cs`** :
  - Mapping des claims de rôles depuis les tokens JWT (extraction depuis `realm_access.roles` et `resource_access.oauth-starter-client.roles`)
  - Policies d'autorisation :
    - `protected-data-read` : Requiert `protected-data-read` OU `protected-data-write` OU `admin`
    - `protected-data-write` : Requiert `protected-data-write` OU `admin`
- **`packages/api/Controllers/ProtectedDataController.cs`** :
  - Attributs `[Authorize(Policy = "protected-data-read")]` sur les endpoints GET
  - Attributs `[Authorize(Policy = "protected-data-write")]` sur les endpoints POST, PUT, DELETE

#### Front-end TypeScript/Vue.js
- **`packages/front/src/types/api.ts`** :
  - Extension du type `UserProfile` avec `roles?`, `realmRoles?`, `applicationRoles?` (tableaux de strings optionnels)
- **`packages/front/src/utils/roles.ts`** :
  - `hasRole(profile, role)` : Vérifie si l'utilisateur a un rôle spécifique
  - `hasAnyRole(profile, roles)` : Vérifie si l'utilisateur a au moins un des rôles
  - `isAdmin(profile)` : Vérifie si l'utilisateur est administrateur
  - `canReadProtectedData(profile)` : Vérifie la permission de lecture
  - `canWriteProtectedData(profile)` : Vérifie la permission d'écriture
- **`packages/front/src/services/api.ts`** :
  - Fonction `transformRoles()` pour transformer les groupes oauth2-proxy en rôles structurés
  - Support des formats : groupes oauth2-proxy, `realm_access.roles`, `resource_access.oauth-starter-client.roles`
- **`packages/front/src/views/ProtectedDataView.vue`** :
  - Formulaire/modal pour créer des données
  - Formulaire/modal pour modifier des données
  - Bouton "Supprimer" avec confirmation
  - Affichage conditionnel des boutons selon les permissions
  - Gestion des erreurs 403 avec messages spécifiques
- **`packages/front/src/views/ProfileView.vue`** :
  - Affichage des rôles realm et application de l'utilisateur

#### Documentation
- **`doc/keycloak-roles-configuration.md`** : Configuration des rôles dans Keycloak
- **`doc/keycloak-role-mapping-jwt.md`** : Mapping des rôles dans les tokens JWT
- **`doc/keycloak-authorization-policies.md`** : Policies d'autorisation dans l'API .NET Core
- **`doc/keycloak-role-helpers-frontend.md`** : Utilisation des helpers de vérification des rôles
- **`doc/keycloak-conditional-ui-display.md`** : Affichage conditionnel des composants UI
- **`doc/keycloak-testing-guide.md`** : Guide de test avec différents utilisateurs

## Configuration

### Rôles Keycloak

#### Rôles realm
- **`admin`** : Rôle administrateur avec accès complet
- **`customer`** : Rôle client standard

#### Rôles application (client `oauth-starter-client`)
- **`protected-data-read`** : Permission de lecture des données protégées
- **`protected-data-write`** : Permission d'écriture (création, modification, suppression) des données protégées

### Protocol Mappers

#### Mapper realm roles
- **Type** : `oidc-usermodel-realm-role-mapper`
- **Claim name** : `realm_access.roles`
- **Activations** : `access.token.claim`, `id.token.claim`, `userinfo.token.claim`, `introspection.token.claim`
- **Multivalued** : `true`

#### Mapper client roles
- **Type** : `oidc-usermodel-client-role-mapper`
- **Claim name** : `resource_access.${client_id}.roles` (où `${client_id}` = `oauth-starter-client`)
- **Activations** : `access.token.claim`, `id.token.claim`, `userinfo.token.claim`, `introspection.token.claim`
- **Multivalued** : `true`

### Policies d'autorisation (.NET Core)

#### Policy `protected-data-read`
- **Rôles autorisés** : `protected-data-read` OU `protected-data-write` OU `admin`
- **Utilisation** : Endpoints GET (`/api/ProtectedData`, `/api/ProtectedData/{id}`)
- **Implémentation** : `RequireAssertion` avec vérification `User.IsInRole()`

#### Policy `protected-data-write`
- **Rôles autorisés** : `protected-data-write` OU `admin`
- **Utilisation** : Endpoints POST, PUT, DELETE (`/api/ProtectedData`, `/api/ProtectedData/{id}`)
- **Implémentation** : `RequireAssertion` avec vérification `User.IsInRole()`

### Mapping des rôles dans l'API

Les rôles sont extraits depuis les tokens JWT dans `OnTokenValidated` :
- **Rôles realm** : Extraits depuis `realm_access.roles` (JSON)
- **Rôles application** : Extraits depuis `resource_access.oauth-starter-client.roles` (JSON)
- **Mapping** : Chaque rôle est ajouté comme claim de type `ClaimTypes.Role`
- **Utilisation** : Accessibles via `User.IsInRole()` et `User.Claims`

## Utilisateurs de test

| Utilisateur | Rôles realm | Rôles application | Permissions |
|-------------|-------------|-------------------|-------------|
| `customer@dev.io` | `customer` | Aucun | ❌ Aucun accès aux données protégées |
| `customer-read@dev.io` | `customer` | `protected-data-read` | ✅ Lecture uniquement |
| `customer-write@dev.io` | `customer` | `protected-data-write` | ✅ Lecture + Écriture |
| `administrator@dev.io` | `admin` | Aucun | ✅ Tous les droits |

**Mot de passe** : `test` pour tous les utilisateurs

## Décisions importantes

### Architecture

1. **Format de configuration Keycloak** :
   - Utilisation du format JSON d'export Keycloak (`realm-oauth-starter.json`) plutôt que YAML keycloak-config-cli
   - Import automatique via `--import-realm` au démarrage de Keycloak

2. **Store Pinia** :
   - **Décision** : Pas de store Pinia en mode POC
   - **Raison** : Accès direct aux rôles depuis le profil utilisateur récupéré via `/oauth2/userinfo`
   - **Implémentation** : Les composants appellent `getUserInfo()` et utilisent les helpers avec le profil

3. **Validation de l'audience JWT** :
   - **Décision** : Désactivation de la validation de l'audience (`ValidateAudience = false`)
   - **Raison** : Les tokens émis par oauth2-proxy n'ont pas d'audience
   - **Fichier** : `packages/api/Program.cs`

4. **Hiérarchie des permissions** :
   - Le rôle `admin` a automatiquement tous les droits (read + write)
   - Le rôle `protected-data-write` inclut implicitement la permission de lecture
   - Vérifié dans les policies et les helpers front-end

### Sécurité

1. **Policies d'autorisation** :
   - Utilisation de `RequireAssertion` pour une logique OU explicite
   - Vérification des rôles via `User.IsInRole()`
   - Le rôle `admin` est vérifié dans toutes les policies

2. **Transformation des rôles front-end** :
   - Support de plusieurs formats (groupes oauth2-proxy, `realm_access`, `resource_access`)
   - Gestion robuste des cas où les rôles sont déjà dans le bon format
   - Extraction depuis différents emplacements pour compatibilité maximale

### Implémentation

1. **Affichage conditionnel** :
   - Gestion de l'état de chargement du profil (`profileLoading`)
   - Les boutons ne s'affichent qu'après chargement du profil
   - Utilisation de `v-if` pour masquer complètement les éléments (pas de `v-show`)

2. **Gestion des erreurs** :
   - Messages d'erreur spécifiques selon l'action (création, modification, suppression)
   - Messages clairs et compréhensibles pour l'utilisateur
   - Gestion dans le service API et les composants Vue

## Notes techniques

### Format des tokens JWT

Les tokens JWT contiennent les rôles dans la structure suivante :
```json
{
  "realm_access": {
    "roles": ["customer", "admin"]
  },
  "resource_access": {
    "oauth-starter-client": {
      "roles": ["protected-data-read", "protected-data-write"]
    }
  }
}
```

### Format oauth2-proxy

oauth2-proxy peut retourner les rôles dans le format :
- `groups: ["role:admin", "role:oauth-starter-client:protected-data-read"]`

La fonction `transformRoles()` transforme ce format en :
- `realmRoles: ["admin"]`
- `applicationRoles: ["protected-data-read"]`

### Noms des rôles

- **Rôles realm** : `admin`, `customer` (camelCase)
- **Rôles application** : `protected-data-read`, `protected-data-write` (kebab-case)

### Noms des policies

- **Policies .NET Core** : `protected-data-read`, `protected-data-write` (kebab-case, correspond aux noms des rôles)

## Références aux tâches

### Configuration Keycloak
- **005-01** : Configuration des rôles realm
- **005-02** : Configuration des rôles application
- **005-03** : Configuration des protocol mappers
- **005-04** : Création des utilisateurs de test

### Configuration API .NET Core
- **005-05** : Mapping des claims de rôles
- **005-06** : Configuration des policies d'autorisation
- **005-07** : Application des policies sur les controllers

### Front-end
- **005-08** : Extension du type UserProfile
- **005-09** : Création des helpers de vérification des rôles
- **005-10** : Store Pinia (skippé en mode POC)
- **005-11** : Formulaire de création
- **005-12** : Formulaire de modification
- **005-13** : Bouton de suppression
- **005-14** : Affichage conditionnel des boutons
- **005-15** : Affichage des rôles dans Profile
- **005-16** : Gestion des erreurs 403

### Tests et Validation
- **005-17** : Tests des rôles dans les tokens JWT (skippé en mode POC)
- **005-18** : Tests des policies d'autorisation
- **005-19** : Tests de l'affichage conditionnel

### Documentation
- **005-20** : Documentation de la configuration des rôles Keycloak
- **005-21** : Documentation du mapping des rôles dans les tokens JWT
- **005-22** : Documentation des policies d'autorisation
- **005-23** : Documentation des helpers de vérification des rôles
- **005-24** : Documentation de l'affichage conditionnel
- **005-25** : Guide de test

## Limitations et considérations

1. **Mode POC** :
   - Pas de store Pinia (accès direct au profil)
   - Tests des rôles dans les tokens JWT skippés (vérification indirecte via policies)
   - Validation de l'audience JWT désactivée

2. **Format de configuration** :
   - Utilisation du format JSON Keycloak plutôt que YAML keycloak-config-cli
   - Les rôles sont définis dans `realm-oauth-starter.json` plutôt que dans un fichier YAML séparé

3. **Sécurité** :
   - L'affichage conditionnel est uniquement pour l'UX
   - L'API doit toujours vérifier les permissions côté serveur
   - Ne jamais faire confiance uniquement au front-end pour la sécurité

## Vérification

### Checklist
- ✅ 33/33 items cochés (Validation technique, Tests fonctionnels, Configuration, Documentation)

### Tests validés
- ✅ Utilisateur `customer` : Aucun accès (403)
- ✅ Utilisateur `protected-data-read` : Lecture seule
- ✅ Utilisateur `protected-data-write` : Lecture + Écriture
- ✅ Utilisateur `admin` : Tous les droits

### Documentation
- ✅ 6 documents créés dans `doc/`
- ✅ README mis à jour avec références vers la documentation

