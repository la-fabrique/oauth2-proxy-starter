# Guide de test - Keycloak RBAC Roles

## Introduction

Ce guide explique comment tester la feature Keycloak RBAC (Role-Based Access Control) avec différents utilisateurs et rôles pour valider que les permissions fonctionnent correctement.

### Vue d'ensemble

Le guide couvre :
- Les utilisateurs de test disponibles
- Les scénarios de test pour chaque utilisateur
- Les résultats attendus pour chaque scénario
- Comment vérifier que les permissions fonctionnent

### Prérequis

- Keycloak démarré et accessible (http://localhost:8080)
- oauth2-proxy démarré et accessible (http://localhost:4180)
- API .NET Core démarrée
- Front-end Vue.js démarré

## Utilisateurs de test

### customer@dev.io

**Rôles** :
- Realm : `customer`
- Application : Aucun

**Permissions** :
- ❌ Lecture des données protégées
- ❌ Écriture des données protégées

**Mot de passe** : `test`

### customer-read@dev.io

**Rôles** :
- Realm : `customer`
- Application : `protected-data-read`

**Permissions** :
- ✅ Lecture des données protégées
- ❌ Écriture des données protégées

**Mot de passe** : `test`

### customer-write@dev.io

**Rôles** :
- Realm : `customer`
- Application : `protected-data-write`

**Permissions** :
- ✅ Lecture des données protégées (incluse dans write)
- ✅ Écriture des données protégées

**Mot de passe** : `test`

### administrator@dev.io

**Rôles** :
- Realm : `admin`
- Application : Aucun

**Permissions** :
- ✅ Lecture des données protégées (tous les droits)
- ✅ Écriture des données protégées (tous les droits)

**Mot de passe** : `test`

## Scénarios de test

### Test 1 : Utilisateur customer@dev.io (sans permissions)

**Objectif** : Vérifier qu'un utilisateur sans rôles application ne peut pas accéder aux données protégées.

**Étapes** :
1. Connectez-vous avec `customer@dev.io` / `test`
2. Naviguez vers la page "Données protégées"

**Résultats attendus** :
- ❌ Erreur 403 affichée : "Vous n'avez pas la permission de lire les données"
- ❌ Aucune donnée affichée
- ❌ Bouton "Créer" : Non visible
- ❌ Boutons "Modifier" : Non visibles
- ❌ Boutons "Supprimer" : Non visibles

**Vérifications API** :
- `GET /api/ProtectedData` : 403 Forbidden
- `GET /api/ProtectedData/1` : 403 Forbidden
- `POST /api/ProtectedData` : 403 Forbidden
- `PUT /api/ProtectedData/1` : 403 Forbidden
- `DELETE /api/ProtectedData/1` : 403 Forbidden

### Test 2 : Utilisateur customer-read@dev.io (lecture seule)

**Objectif** : Vérifier qu'un utilisateur avec `protected-data-read` peut lire mais pas modifier.

**Étapes** :
1. Connectez-vous avec `customer-read@dev.io` / `test`
2. Naviguez vers la page "Données protégées"
3. Vérifiez l'affichage des données
4. Vérifiez l'affichage des boutons

**Résultats attendus** :
- ✅ Liste des données protégées affichée (lecture seule)
- ❌ Bouton "Créer" : Non visible
- ❌ Boutons "Modifier" : Non visibles
- ❌ Boutons "Supprimer" : Non visibles

**Vérifications API** :
- ✅ `GET /api/ProtectedData` : 200 OK (liste des données)
- ✅ `GET /api/ProtectedData/1` : 200 OK (donnée par ID)
- ❌ `POST /api/ProtectedData` : 403 Forbidden
- ❌ `PUT /api/ProtectedData/1` : 403 Forbidden
- ❌ `DELETE /api/ProtectedData/1` : 403 Forbidden

**Vérifications front-end** :
- ✅ Page "Profil" : Affiche les rôles `customer` (realm) et `protected-data-read` (application)
- ✅ Console : Log "Profil utilisateur chargé" avec `canWrite: false`

### Test 3 : Utilisateur customer-write@dev.io (lecture + écriture)

**Objectif** : Vérifier qu'un utilisateur avec `protected-data-write` peut lire et modifier.

**Étapes** :
1. Connectez-vous avec `customer-write@dev.io` / `test`
2. Naviguez vers la page "Données protégées"
3. Vérifiez l'affichage des boutons
4. Testez la création d'une donnée
5. Testez la modification d'une donnée
6. Testez la suppression d'une donnée

**Résultats attendus** :
- ✅ Liste des données protégées affichée
- ✅ Bouton "Créer" : Visible
- ✅ Boutons "Modifier" : Visibles
- ✅ Boutons "Supprimer" : Visibles

**Vérifications API** :
- ✅ `GET /api/ProtectedData` : 200 OK
- ✅ `GET /api/ProtectedData/1` : 200 OK
- ✅ `POST /api/ProtectedData` : 201 Created
- ✅ `PUT /api/ProtectedData/1` : 200 OK
- ✅ `DELETE /api/ProtectedData/1` : 204 No Content

**Vérifications front-end** :
- ✅ Page "Profil" : Affiche les rôles `customer` (realm) et `protected-data-write` (application)
- ✅ Console : Log "Profil utilisateur chargé" avec `canWrite: true`
- ✅ Formulaire de création : S'affiche et fonctionne
- ✅ Formulaire de modification : S'affiche et fonctionne
- ✅ Confirmation de suppression : S'affiche et fonctionne

### Test 4 : Utilisateur administrator@dev.io (admin)

**Objectif** : Vérifier qu'un utilisateur avec `admin` a tous les droits.

**Étapes** :
1. Connectez-vous avec `administrator@dev.io` / `test`
2. Naviguez vers la page "Données protégées"
3. Vérifiez l'affichage des boutons
4. Testez toutes les opérations (création, modification, suppression)

**Résultats attendus** :
- ✅ Liste des données protégées affichée
- ✅ Bouton "Créer" : Visible
- ✅ Boutons "Modifier" : Visibles
- ✅ Boutons "Supprimer" : Visibles

**Vérifications API** :
- ✅ `GET /api/ProtectedData` : 200 OK
- ✅ `GET /api/ProtectedData/1` : 200 OK
- ✅ `POST /api/ProtectedData` : 201 Created
- ✅ `PUT /api/ProtectedData/1` : 200 OK
- ✅ `DELETE /api/ProtectedData/1` : 204 No Content

**Vérifications front-end** :
- ✅ Page "Profil" : Affiche le rôle `admin` (realm)
- ✅ Console : Log "Profil utilisateur chargé" avec `canWrite: true`
- ✅ Toutes les fonctionnalités sont accessibles

## Vérifications détaillées

### Vérification des rôles dans Keycloak

1. Connectez-vous à l'interface admin Keycloak (http://localhost:8080)
2. Allez dans Realm "oauth-starter" > Users
3. Sélectionnez un utilisateur de test
4. Allez dans l'onglet "Role Mappings"
5. Vérifiez que les rôles sont correctement assignés :
   - **Realm Roles** : Vérifiez les rôles realm assignés
   - **Client Roles** : Vérifiez les rôles application assignés pour `oauth-starter-client`

### Vérification des rôles dans les tokens JWT

1. Connectez-vous à l'application avec un utilisateur de test
2. Ouvrez les outils de développement du navigateur
3. Allez dans l'onglet "Network"
4. Trouvez une requête vers `/api/ProtectedData`
5. Vérifiez l'en-tête `Authorization` (Bearer token)
6. Décodage du token JWT (via jwt.io ou un outil similaire)
7. Vérifiez que les rôles apparaissent dans :
   - `realm_access.roles` pour les rôles realm
   - `resource_access.oauth-starter-client.roles` pour les rôles application

### Vérification des rôles dans l'API .NET Core

1. Ajoutez des logs dans `Program.cs` dans `OnTokenValidated` :
   ```csharp
   _logger.LogInformation("User roles: {Roles}", 
       string.Join(", ", claimsIdentity.Claims
           .Where(c => c.Type == ClaimTypes.Role)
           .Select(c => c.Value)));
   ```
2. Testez avec différents utilisateurs
3. Vérifiez les logs pour voir les rôles extraits

### Vérification des rôles dans le front-end

1. Connectez-vous à l'application avec un utilisateur de test
2. Ouvrez la console du navigateur
3. Vérifiez les logs de `loadUserProfile()` :
   ```
   Profil utilisateur chargé: {
     email: "customer-write@dev.io",
     realmRoles: ["customer"],
     applicationRoles: ["protected-data-write"],
     canWrite: true
   }
   ```
4. Allez sur la page "Profil" pour voir les rôles affichés

## Matrice de test

| Utilisateur | GET | POST | PUT | DELETE | Bouton Créer | Boutons Modifier/Supprimer |
|-------------|-----|------|-----|--------|--------------|---------------------------|
| customer@dev.io | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ Non visible | ❌ Non visibles |
| customer-read@dev.io | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ Non visible | ❌ Non visibles |
| customer-write@dev.io | ✅ 200 | ✅ 201 | ✅ 200 | ✅ 204 | ✅ Visible | ✅ Visibles |
| administrator@dev.io | ✅ 200 | ✅ 201 | ✅ 200 | ✅ 204 | ✅ Visible | ✅ Visibles |

## Dépannage

### Les rôles n'apparaissent pas dans les tokens JWT

- Vérifiez que les protocol mappers sont configurés dans Keycloak
- Vérifiez que les rôles sont assignés à l'utilisateur
- Vérifiez que le scope "roles" est activé pour le client

### Les permissions ne fonctionnent pas dans l'API

- Vérifiez que les rôles sont extraits depuis les tokens JWT
- Vérifiez que les policies sont configurées correctement
- Vérifiez les logs de l'API pour voir les erreurs

### Les boutons ne s'affichent pas correctement

- Vérifiez que le profil utilisateur est chargé
- Vérifiez que les helpers de rôles fonctionnent correctement
- Vérifiez les logs de la console pour voir les rôles détectés

## Références

- [Documentation - Configuration des rôles Keycloak](doc/keycloak-roles-configuration.md)
- [Documentation - Mapping des rôles dans les tokens JWT](doc/keycloak-role-mapping-jwt.md)
- [Documentation - Policies d'autorisation](doc/keycloak-authorization-policies.md)
- [Documentation - Helpers de vérification des rôles](doc/keycloak-role-helpers-frontend.md)
- [Documentation - Affichage conditionnel](doc/keycloak-conditional-ui-display.md)

