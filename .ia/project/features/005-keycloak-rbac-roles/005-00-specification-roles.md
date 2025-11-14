# Spécification des Rôles - Feature 005

## Définition des Rôles

### Rôles Realm (Keycloak)
- **`admin`** : Rôle administrateur avec accès complet
- **`customer`** : Rôle client standard

### Rôles Application (Keycloak)
- **`protectedData read`** : Permission de lecture des données protégées
- **`protectedData write`** : Permission d'écriture (création, modification, suppression) des données protégées

## Matrice d'Autorisation

| Action | Rôle requis |
|--------|-------------|
| GET /api/ProtectedData (liste) | `protectedData read` OU `admin` |
| GET /api/ProtectedData/{id} | `protectedData read` OU `admin` |
| POST /api/ProtectedData | `protectedData write` OU `admin` |
| PUT /api/ProtectedData/{id} | `protectedData write` OU `admin` |
| DELETE /api/ProtectedData/{id} | `protectedData write` OU `admin` |

## Évolutions Nécessaires

### 1. Configuration Keycloak
- [ ] **Créer les rôles realm** dans `packages/others/keycloak-config/realms/oauth-starter.yml` :
  - [ ] Rôle realm `admin` : Rôle administrateur avec accès complet
  - [ ] Rôle realm `customer` : Rôle client standard
- [ ] **Créer les rôles application** dans le même fichier YAML :
  - [ ] Rôle application `protectedData read` : Permission de lecture
  - [ ] Rôle application `protectedData write` : Permission d'écriture
- [ ] **Configurer le mapping des rôles dans les tokens JWT** :
  - [ ] Configurer le client `oauth-starter-client` pour inclure les rôles realm et application dans les tokens
  - [ ] Activer le mapper de rôles dans la configuration du client
- [ ] **Assigner les rôles aux utilisateurs de test** :
  - [ ] Créer/utiliser des utilisateurs de test avec différents rôles pour valider les permissions
  - [ ] Note : L'assignation des rôles aux utilisateurs peut nécessiter l'interface admin Keycloak si keycloak-config-cli ne le supporte pas

### 2. API .NET Core

#### 2.1 Configuration de l'autorisation
- [ ] Configurer la politique d'autorisation pour les rôles
- [ ] Mapper les claims de rôles depuis le token JWT (realm roles et application roles)
- [ ] Créer des policies d'autorisation :
  - `ProtectedDataRead` : Requiert `protectedData read` OU `admin`
  - `ProtectedDataWrite` : Requiert `protectedData write` OU `admin`

#### 2.2 Modification du contrôleur
- [ ] Appliquer `[Authorize(Policy = "ProtectedDataRead")]` sur les endpoints GET
- [ ] Appliquer `[Authorize(Policy = "ProtectedDataWrite")]` sur les endpoints POST, PUT, DELETE
- [ ] Tester que les erreurs 403 sont retournées pour les utilisateurs sans les permissions

#### 2.3 Nouveau endpoint (optionnel)
- [ ] Créer un endpoint `/api/session` ou `/api/user/roles` pour exposer les rôles de l'utilisateur connecté
- [ ] Retourner les rôles realm et application de l'utilisateur

### 3. Front Vue.js

#### 3.1 Types TypeScript
- [ ] Étendre le type `UserProfile` pour inclure les rôles :
  ```typescript
  export type UserProfile = Record<string, unknown> & {
    email?: string
    preferredUsername?: string
    roles?: string[] // Rôles de l'utilisateur
    realmRoles?: string[] // Rôles realm
    applicationRoles?: string[] // Rôles application
  }
  ```

#### 3.2 Service API
- [ ] Créer une fonction `getUserRoles()` pour récupérer les rôles depuis `/oauth2/userinfo` ou `/api/session`
- [ ] Créer des helpers pour vérifier les rôles :
  - `hasRole(role: string): boolean`
  - `hasAnyRole(roles: string[]): boolean`
  - `isAdmin(): boolean`
  - `canReadProtectedData(): boolean`
  - `canWriteProtectedData(): boolean`

#### 3.3 Composants UI
- [ ] **Créer les composants UI manquants dans `ProtectedDataView.vue`** :
  - [ ] Formulaire/modal pour créer une nouvelle donnée (bouton "Créer" + formulaire)
  - [ ] Formulaire/modal pour modifier une donnée existante (bouton "Modifier" sur chaque item)
  - [ ] Bouton "Supprimer" sur chaque item avec confirmation
  - [ ] Utiliser les fonctions API existantes : `createProtectedData`, `updateProtectedData`, `deleteProtectedData`
- [ ] **Masquer/afficher conditionnellement selon les permissions** :
  - [ ] Afficher le bouton "Créer" uniquement si l'utilisateur a `protectedData write` OU `admin`
  - [ ] Afficher les boutons "Modifier" et "Supprimer" uniquement si l'utilisateur a `protectedData write` OU `admin`
  - [ ] Les utilisateurs avec seulement `protectedData read` ne voient que la liste en lecture seule
- [ ] Afficher les rôles de l'utilisateur dans la page Profile (optionnel)
- [ ] Gérer les erreurs 403 avec des messages appropriés (ex: "Vous n'avez pas les permissions nécessaires pour cette action")

#### 3.4 Store Pinia (optionnel)
- [ ] Créer un store pour gérer l'état des rôles utilisateur
- [ ] Charger les rôles au démarrage de l'application
- [ ] Fournir des getters pour vérifier les permissions

## Décisions Validées

1. **Endpoint pour les rôles** : ✅ Utiliser `/oauth2/userinfo` (oauth2-proxy) qui expose déjà les claims du token

2. **Hiérarchie des rôles** : ✅ Le rôle `admin` a automatiquement tous les droits (read + write). Les policies d'autorisation doivent vérifier `protectedData read` OU `admin` pour la lecture, et `protectedData write` OU `admin` pour l'écriture.

3. **Configuration Keycloak** : ✅ Utiliser `keycloak-config-cli` déjà en place. Les rôles doivent être définis dans le fichier YAML de configuration du realm (`packages/others/keycloak-config/realms/oauth-starter.yml`).

## Questions Restantes à Valider

1. **Affichage des rôles** :
   - Afficher les rôles dans la page Profile ?
   - OU seulement utiliser les rôles pour l'autorisation UI (masquer/afficher les boutons) ?

2. **Gestion des erreurs 403** :
   - Afficher un message d'erreur générique ?
   - OU un message spécifique selon l'action tentée ?

