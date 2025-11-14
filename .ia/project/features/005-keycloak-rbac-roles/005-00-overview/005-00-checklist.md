# Checklist - Feature 005 : keycloak-rbac-roles

## Validation technique

- [x] Création des rôles realm dans `packages/others/keycloak-config/realms/oauth-starter.yml` :
  - [x] Rôle realm `admin` créé
  - [x] Rôle realm `customer` créé
- [x] Création des rôles application dans le même fichier YAML :
  - [x] Rôle application `protectedData read` créé
  - [x] Rôle application `protectedData write` créé
- [x] Configuration du mapping des rôles dans les tokens JWT pour le client `oauth-starter-client` :
  - [x] Mapper de rôles realm configuré
  - [x] Mapper de rôles application configuré
  - [x] Les rôles apparaissent dans les tokens JWT (vérification via décodage du token)
- [x] Configuration des policies d'autorisation dans l'API .NET Core (`Program.cs`) :
  - [x] Policy `ProtectedDataRead` créée (requiert `protectedData read` OU `admin`)
  - [x] Policy `ProtectedDataWrite` créée (requiert `protectedData write` OU `admin`)
  - [x] Mapping des claims de rôles depuis le token JWT configuré
- [x] Modification du contrôleur `ProtectedDataController` :
  - [x] Attribut `[Authorize(Policy = "ProtectedDataRead")]` appliqué sur les endpoints GET
  - [x] Attribut `[Authorize(Policy = "ProtectedDataWrite")]` appliqué sur les endpoints POST, PUT, DELETE
- [x] Extension du type `UserProfile` dans `packages/front/src/types/api.ts` :
  - [x] Propriété `roles` ajoutée (optionnelle, tableau de strings)
  - [x] Propriété `realmRoles` ajoutée (optionnelle, tableau de strings)
  - [x] Propriété `applicationRoles` ajoutée (optionnelle, tableau de strings)
- [x] Création des helpers de vérification des rôles dans le front-end :
  - [x] Fonction `hasRole(role: string): boolean`
  - [x] Fonction `hasAnyRole(roles: string[]): boolean`
  - [x] Fonction `isAdmin(): boolean`
  - [x] Fonction `canReadProtectedData(): boolean`
  - [x] Fonction `canWriteProtectedData(): boolean`
- [x] Création des composants UI dans `ProtectedDataView.vue` :
  - [x] Formulaire/modal pour créer une nouvelle donnée (bouton "Créer" + formulaire)
  - [x] Formulaire/modal pour modifier une donnée existante (bouton "Modifier" sur chaque item)
  - [x] Bouton "Supprimer" sur chaque item avec confirmation
  - [x] Utilisation des fonctions API existantes : `createProtectedData`, `updateProtectedData`, `deleteProtectedData`
- [x] Affichage conditionnel des boutons selon les permissions :
  - [x] Bouton "Créer" affiché uniquement si l'utilisateur a `protectedData write` OU `admin`
  - [x] Boutons "Modifier" et "Supprimer" affichés uniquement si l'utilisateur a `protectedData write` OU `admin`
  - [x] Les utilisateurs avec seulement `protectedData read` ne voient que la liste en lecture seule
- [x] Création du store Pinia pour gérer l'état des rôles utilisateur :
  - [x] Store créé avec état des rôles
  - [x] Action pour charger les rôles depuis `/oauth2/userinfo`
  - [x] Getters pour vérifier les permissions (`isAdmin`, `canReadProtectedData`, `canWriteProtectedData`)
- [x] Affichage des rôles dans la page Profile :
  - [x] Les rôles sont récupérés depuis `/oauth2/userinfo`
  - [x] Les rôles sont affichés dans la page Profile (realm roles et application roles)
- [x] Gestion des erreurs 403 :
  - [x] Messages d'erreur spécifiques selon l'action tentée (création, modification, suppression)
  - [x] Messages clairs et compréhensibles pour l'utilisateur
- [x] Assignation des rôles aux utilisateurs de test :
  - [x] Utilisateur avec seulement `customer` (pas de rôles application)
  - [x] Utilisateur avec `protectedData read`
  - [x] Utilisateur avec `protectedData write`
  - [x] Utilisateur avec `admin`
- [x] Test que les rôles apparaissent dans les tokens JWT (vérification via décodage)
- [x] Test que les policies d'autorisation fonctionnent correctement :
  - [x] Test que GET nécessite `protectedData read` OU `admin`
  - [x] Test que POST, PUT, DELETE nécessitent `protectedData write` OU `admin`
- [x] Test que les erreurs 403 sont retournées pour les utilisateurs sans les permissions appropriées
- [x] Test que le rôle `admin` a automatiquement tous les droits (read + write)

## Tests fonctionnels

- [x] Test avec un utilisateur ayant seulement le rôle `customer` :
  - [x] L'utilisateur ne peut pas accéder aux endpoints de l'API (erreur 403)
  - [x] L'utilisateur ne voit aucun bouton dans l'interface
- [x] Test avec un utilisateur ayant le rôle `protectedData read` :
  - [x] L'utilisateur peut lire les données (GET /api/ProtectedData)
  - [x] L'utilisateur ne peut pas créer, modifier ou supprimer (erreur 403)
  - [x] L'utilisateur voit la liste des données mais pas les boutons de création/modification/suppression
- [x] Test avec un utilisateur ayant le rôle `protectedData write` :
  - [x] L'utilisateur peut lire les données (GET /api/ProtectedData)
  - [x] L'utilisateur peut créer, modifier et supprimer les données (POST, PUT, DELETE)
  - [x] L'utilisateur voit tous les boutons dans l'interface
- [x] Test avec un utilisateur ayant le rôle `admin` :
  - [x] L'utilisateur peut lire les données (GET /api/ProtectedData)
  - [x] L'utilisateur peut créer, modifier et supprimer les données (POST, PUT, DELETE)
  - [x] L'utilisateur voit tous les boutons dans l'interface
  - [x] L'utilisateur a automatiquement tous les droits même sans rôles application explicites
- [x] Test de l'affichage des rôles :
  - [x] Les rôles de l'utilisateur sont affichés dans la page Profile
  - [x] Les rôles sont récupérés depuis `/oauth2/userinfo`
- [x] Test de la gestion des erreurs 403 :
  - [x] Les erreurs 403 affichent des messages spécifiques selon l'action tentée
  - [x] Les messages sont clairs et compréhensibles pour l'utilisateur

## Configuration

- [x] Configuration des rôles dans `packages/others/keycloak-config/realms/oauth-starter.yml` :
  - [x] Rôles realm définis (`admin`, `customer`)
  - [x] Rôles application définis (`protectedData read`, `protectedData write`)
  - [x] Configuration appliquée via keycloak-config-cli
- [x] Configuration du client OAuth2 pour inclure les rôles dans les tokens :
  - [x] Mapper de rôles realm activé
  - [x] Mapper de rôles application activé
  - [x] Vérification que les rôles apparaissent dans les tokens JWT
- [x] Configuration des policies d'autorisation dans l'API .NET Core :
  - [x] Policies configurées dans `Program.cs`
  - [x] Mapping des claims de rôles configuré
  - [x] Vérification que les policies fonctionnent correctement
- [x] Configuration oauth2-proxy :
  - [x] Vérification que `/oauth2/userinfo` expose les rôles (aucune modification nécessaire)

## Documentation

- [x] Documentation de la configuration des rôles dans Keycloak (format YAML pour keycloak-config-cli)
- [x] Documentation du mapping des rôles dans les tokens JWT
- [x] Documentation des policies d'autorisation dans l'API .NET Core
- [x] Documentation de l'utilisation des helpers de vérification des rôles dans le front-end
- [x] Documentation de l'affichage conditionnel des composants UI selon les permissions
- [x] Guide de test avec différents utilisateurs et rôles

