# Feature 005 : keycloak-rbac-roles

## Objectif

Implémenter le contrôle d'accès basé sur les rôles (RBAC) avec Keycloak. Cette feature permet de définir des rôles realm (admin, customer) et des rôles application (protectedData read, protectedData write) pour contrôler l'accès aux ressources de l'API et masquer/afficher les fonctionnalités dans le front-end selon les permissions de l'utilisateur.

L'objectif principal est de sécuriser l'API .NET Core avec une autorisation basée sur les rôles présents dans les tokens JWT, et d'adapter l'interface utilisateur pour n'afficher que les actions autorisées selon les rôles de l'utilisateur connecté.

## Périmètre

### Inclus

- Configuration des rôles realm dans Keycloak (`admin`, `customer`) via keycloak-config-cli
- Configuration des rôles application dans Keycloak (`protectedData read`, `protectedData write`) via keycloak-config-cli
- Configuration du mapping des rôles dans les tokens JWT (realm roles et application roles)
- Configuration des policies d'autorisation dans l'API .NET Core :
  - `ProtectedDataRead` : Requiert `protectedData read` OU `admin`
  - `ProtectedDataWrite` : Requiert `protectedData write` OU `admin`
- Application des policies sur les endpoints du contrôleur `ProtectedDataController`
- Extension du type TypeScript `UserProfile` pour inclure les rôles
- Création d'helpers pour vérifier les permissions dans le front-end
- Création des composants UI manquants dans `ProtectedDataView.vue` :
  - Formulaire/modal pour créer une nouvelle donnée
  - Formulaire/modal pour modifier une donnée existante
  - Bouton "Supprimer" avec confirmation
- Affichage conditionnel des boutons selon les permissions (masquer/afficher selon les rôles)
- Affichage des rôles dans la page Profile (pour visualisation)
- Gestion des erreurs 403 avec des messages spécifiques selon l'action
- Store Pinia pour gérer l'état des rôles utilisateur
- Assignation des rôles aux utilisateurs de test pour valider les permissions

### Exclu

- Gestion des rôles via l'interface utilisateur (gestion uniquement via Keycloak admin ou keycloak-config-cli)
- Synchronisation des rôles avec des systèmes externes
- Gestion de la hiérarchie complexe de rôles (seulement la hiérarchie simple : admin a tous les droits)
- Tests end-to-end automatisés complets (sera dans une feature dédiée)
- Configuration TLS/HTTPS (feature 007)

## Dépendances

- **001-keycloak-docker-compose-setup** : Keycloak doit être configuré avec le realm et le client OAuth2, keycloak-config-cli doit être opérationnel
- **004-dotnet-core-api** : L'API .NET Core doit être fonctionnelle avec la validation JWT en place

## Livrables

- Configuration des rôles realm et application dans `packages/others/keycloak-config/realms/oauth-starter.yml`
- Configuration du mapping des rôles dans les tokens JWT pour le client `oauth-starter-client`
- Configuration des policies d'autorisation dans l'API .NET Core (`Program.cs`)
- Modification du contrôleur `ProtectedDataController` avec les attributs `[Authorize(Policy = "...")]`
- Extension du type `UserProfile` dans `packages/front/src/types/api.ts`
- Helpers de vérification des rôles dans le front-end
- Composants UI pour créer, modifier et supprimer les données dans `ProtectedDataView.vue`
- Store Pinia pour gérer l'état des rôles utilisateur
- Affichage des rôles dans la page Profile
- Gestion des erreurs 403 avec messages spécifiques
- Utilisateurs de test avec différents rôles assignés
- Documentation de la configuration RBAC et de son utilisation

## Critères d'acceptation

- ✅ Les rôles realm (`admin`, `customer`) sont créés dans Keycloak via keycloak-config-cli
- ✅ Les rôles application (`protectedData read`, `protectedData write`) sont créés dans Keycloak via keycloak-config-cli
- ✅ Les rôles apparaissent dans les tokens JWT (realm roles et application roles)
- ✅ Les policies d'autorisation `ProtectedDataRead` et `ProtectedDataWrite` sont configurées dans l'API .NET Core
- ✅ Les endpoints GET nécessitent `protectedData read` OU `admin`
- ✅ Les endpoints POST, PUT, DELETE nécessitent `protectedData write` OU `admin`
- ✅ Les erreurs 403 sont retournées pour les utilisateurs sans les permissions appropriées
- ✅ Le type `UserProfile` inclut les rôles (realm roles et application roles)
- ✅ Les helpers de vérification des rôles fonctionnent correctement
- ✅ Les composants UI pour créer, modifier et supprimer sont implémentés
- ✅ Les boutons sont masqués/affiches selon les permissions de l'utilisateur
- ✅ Les rôles sont affichés dans la page Profile
- ✅ Les erreurs 403 affichent des messages spécifiques selon l'action tentée
- ✅ Le store Pinia gère correctement l'état des rôles utilisateur
- ✅ Les utilisateurs avec seulement `protectedData read` ne voient que la liste en lecture seule
- ✅ Les utilisateurs avec `protectedData write` ou `admin` peuvent créer, modifier et supprimer les données
- ✅ Les utilisateurs avec le rôle `admin` ont automatiquement tous les droits (read + write)

## Tests fonctionnels

- Test avec un utilisateur ayant seulement le rôle `customer` (pas de rôles application) :
  - ✅ L'utilisateur ne peut pas accéder aux endpoints de l'API (erreur 403)
  - ✅ L'utilisateur ne voit aucun bouton dans l'interface

- Test avec un utilisateur ayant le rôle `protectedData read` :
  - ✅ L'utilisateur peut lire les données (GET /api/ProtectedData)
  - ✅ L'utilisateur ne peut pas créer, modifier ou supprimer (erreur 403)
  - ✅ L'utilisateur voit la liste des données mais pas les boutons de création/modification/suppression

- Test avec un utilisateur ayant le rôle `protectedData write` :
  - ✅ L'utilisateur peut lire les données (GET /api/ProtectedData)
  - ✅ L'utilisateur peut créer, modifier et supprimer les données (POST, PUT, DELETE)
  - ✅ L'utilisateur voit tous les boutons dans l'interface

- Test avec un utilisateur ayant le rôle `admin` :
  - ✅ L'utilisateur peut lire les données (GET /api/ProtectedData)
  - ✅ L'utilisateur peut créer, modifier et supprimer les données (POST, PUT, DELETE)
  - ✅ L'utilisateur voit tous les boutons dans l'interface
  - ✅ L'utilisateur a automatiquement tous les droits même sans rôles application explicites

- Test de l'affichage des rôles :
  - ✅ Les rôles de l'utilisateur sont affichés dans la page Profile
  - ✅ Les rôles sont récupérés depuis `/oauth2/userinfo`

- Test de la gestion des erreurs 403 :
  - ✅ Les erreurs 403 affichent des messages spécifiques selon l'action tentée
  - ✅ Les messages sont clairs et compréhensibles pour l'utilisateur

## Configuration

- **Configuration Keycloak** : Les rôles sont définis dans `packages/others/keycloak-config/realms/oauth-starter.yml` et appliqués via keycloak-config-cli
- **Configuration du client OAuth2** : Le client `oauth-starter-client` doit être configuré pour inclure les rôles dans les tokens JWT (realm roles et application roles)
- **Configuration de l'API .NET Core** : Les policies d'autorisation sont configurées dans `Program.cs` avec le mapping des claims de rôles
- **Configuration oauth2-proxy** : Aucune modification nécessaire, `/oauth2/userinfo` expose déjà les claims du token incluant les rôles

## Documentation

- Documentation de la configuration des rôles dans Keycloak (format YAML pour keycloak-config-cli)
- Documentation du mapping des rôles dans les tokens JWT
- Documentation des policies d'autorisation dans l'API .NET Core
- Documentation de l'utilisation des helpers de vérification des rôles dans le front-end
- Documentation de l'affichage conditionnel des composants UI selon les permissions
- Guide de test avec différents utilisateurs et rôles

