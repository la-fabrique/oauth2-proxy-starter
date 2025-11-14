# Documentation - Configuration des rôles Keycloak

## Introduction

Cette documentation décrit la configuration des rôles dans Keycloak pour le contrôle d'accès basé sur les rôles (RBAC - Role-Based Access Control). Le projet utilise deux types de rôles : les rôles realm et les rôles application.

### Vue d'ensemble

Keycloak est configuré pour gérer :
- **Rôles realm** : Rôles globaux au niveau du realm (ex: `admin`, `customer`)
- **Rôles application** : Rôles spécifiques à un client OAuth2 (ex: `protected-data-read`, `protected-data-write`)

Ces rôles sont ensuite mappés dans les tokens JWT pour permettre l'autorisation dans l'API .NET Core et l'affichage conditionnel dans le front-end Vue.js.

### Dépendances

- **Keycloak** : Fournisseur d'identité OIDC (feature 001)
- **Client OAuth2** : Client `oauth-starter-client` configuré dans Keycloak

## Format de configuration

Le projet utilise le format JSON pour la configuration Keycloak via l'import de realm. Le fichier de configuration se trouve dans :

```
packages/others/keycloak-config/realms/realm-oauth-starter.json
```

Ce fichier est importé automatiquement au démarrage de Keycloak via la commande `start --import-realm`.

## Configuration des rôles realm

### Structure JSON

Les rôles realm sont définis dans la section `roles.realm` du fichier JSON :

```json
{
  "roles": {
    "realm": [
      {
        "id": "903caba7-8f88-4e52-ac25-0899488492e1",
        "name": "customer",
        "description": "Rôle client standard",
        "composite": false,
        "clientRole": false,
        "containerId": "8a40f833-441f-4827-b372-ccbcb0cae085",
        "attributes": {}
      },
      {
        "id": "7757341a-3cf1-4926-afd4-252bb9c71b62",
        "name": "admin",
        "description": "Rôle administrateur avec accès complet",
        "composite": false,
        "clientRole": false,
        "containerId": "8a40f833-441f-4827-b372-ccbcb0cae085",
        "attributes": {}
      }
    ]
  }
}
```

### Propriétés des rôles realm

- **id** : Identifiant unique du rôle (UUID). Généré automatiquement par Keycloak lors de la création via l'interface admin.
- **name** : Nom du rôle (ex: `customer`, `admin`)
- **description** : Description du rôle
- **composite** : Indique si le rôle est composite (peut contenir d'autres rôles). `false` pour les rôles simples.
- **clientRole** : Toujours `false` pour les rôles realm
- **containerId** : Identifiant du realm (UUID). Identique pour tous les rôles realm du même realm.
- **attributes** : Attributs personnalisés du rôle (objet vide par défaut)

### Rôles realm configurés

Le projet définit les rôles realm suivants :

1. **customer** : Rôle client standard
   - Description : "Rôle client standard"
   - Utilisé pour identifier les utilisateurs clients de base

2. **admin** : Rôle administrateur
   - Description : "Rôle administrateur avec accès complet"
   - Permet un accès complet à toutes les ressources

### Création d'un nouveau rôle realm

Pour ajouter un nouveau rôle realm :

1. **Via l'interface admin Keycloak** (recommandé pour obtenir l'UUID) :
   - Connectez-vous à l'interface admin Keycloak (http://localhost:8080)
   - Allez dans Realm "oauth-starter" > Roles > Create role
   - Remplissez le nom et la description
   - Copiez l'UUID du rôle depuis l'URL ou les détails du rôle

2. **Ajouter dans le fichier JSON** :
   ```json
   {
     "id": "<UUID_GÉNÉRÉ>",
     "name": "nouveau-role",
     "description": "Description du nouveau rôle",
     "composite": false,
     "clientRole": false,
     "containerId": "8a40f833-441f-4827-b372-ccbcb0cae085",
     "attributes": {}
   }
   ```

3. **Redémarrer Keycloak** pour importer la nouvelle configuration

## Configuration des rôles application

### Structure JSON

Les rôles application sont définis dans la section `roles.client["oauth-starter-client"]` du fichier JSON :

```json
{
  "roles": {
    "client": {
      "oauth-starter-client": [
        {
          "id": "fdf599d9-c163-4a3b-98af-06aae1078669",
          "name": "protected-data-read",
          "description": "Permission de lecture des données protégées",
          "composite": false,
          "clientRole": true,
          "containerId": "570f9d61-7b9e-40a0-976d-d8960e8e814c",
          "attributes": {}
        },
        {
          "id": "652e3d37-64aa-4c81-96d0-9dcd3ba0cbce",
          "name": "protected-data-write",
          "description": "Permission d'écriture (création, modification, suppression) des données protégées",
          "composite": false,
          "clientRole": true,
          "containerId": "570f9d61-7b9e-40a0-976d-d8960e8e814c",
          "attributes": {}
        }
      ]
    }
  }
}
```

### Propriétés des rôles application

- **id** : Identifiant unique du rôle (UUID). Généré automatiquement par Keycloak lors de la création via l'interface admin.
- **name** : Nom du rôle (ex: `protected-data-read`, `protected-data-write`)
- **description** : Description du rôle
- **composite** : Indique si le rôle est composite. `false` pour les rôles simples.
- **clientRole** : Toujours `true` pour les rôles application
- **containerId** : Identifiant du client OAuth2 (UUID). Identique pour tous les rôles application du même client.
- **attributes** : Attributs personnalisés du rôle (objet vide par défaut)

### Rôles application configurés

Le projet définit les rôles application suivants pour le client `oauth-starter-client` :

1. **protected-data-read** : Permission de lecture
   - Description : "Permission de lecture des données protégées"
   - Permet de lire les données protégées via les endpoints GET

2. **protected-data-write** : Permission d'écriture
   - Description : "Permission d'écriture (création, modification, suppression) des données protégées"
   - Permet de créer, modifier et supprimer les données protégées via les endpoints POST, PUT, DELETE
   - Inclut implicitement la permission de lecture

### Création d'un nouveau rôle application

Pour ajouter un nouveau rôle application :

1. **Via l'interface admin Keycloak** (recommandé pour obtenir l'UUID) :
   - Connectez-vous à l'interface admin Keycloak (http://localhost:8080)
   - Allez dans Realm "oauth-starter" > Clients > oauth-starter-client > Roles > Create role
   - Remplissez le nom et la description
   - Copiez l'UUID du rôle depuis l'URL ou les détails du rôle

2. **Ajouter dans le fichier JSON** :
   ```json
   {
     "id": "<UUID_GÉNÉRÉ>",
     "name": "nouveau-role-application",
     "description": "Description du nouveau rôle application",
     "composite": false,
     "clientRole": true,
     "containerId": "570f9d61-7b9e-40a0-976d-d8960e8e814c",
     "attributes": {}
   }
   ```

3. **Redémarrer Keycloak** pour importer la nouvelle configuration

## Assignation des rôles aux utilisateurs

### Structure JSON

Les rôles sont assignés aux utilisateurs dans la section `users` du fichier JSON :

```json
{
  "users": [
    {
      "username": "customer@dev.io",
      "realmRoles": [
        "customer"
      ],
      "clientRoles": {}
    },
    {
      "username": "customer-read@dev.io",
      "realmRoles": [
        "customer"
      ],
      "clientRoles": {
        "oauth-starter-client": [
          "protected-data-read"
        ]
      }
    },
    {
      "username": "customer-write@dev.io",
      "realmRoles": [
        "customer"
      ],
      "clientRoles": {
        "oauth-starter-client": [
          "protected-data-write"
        ]
      }
    },
    {
      "username": "administrator@dev.io",
      "realmRoles": [
        "admin"
      ],
      "clientRoles": {}
    }
  ]
}
```

### Assignation des rôles realm

Les rôles realm sont assignés dans le tableau `realmRoles` :

```json
"realmRoles": [
  "customer",
  "admin"
]
```

### Assignation des rôles application

Les rôles application sont assignés dans l'objet `clientRoles`, avec le nom du client comme clé :

```json
"clientRoles": {
  "oauth-starter-client": [
    "protected-data-read",
    "protected-data-write"
  ]
}
```

### Utilisateurs de test configurés

Le projet définit les utilisateurs de test suivants :

1. **customer@dev.io** : Utilisateur client de base
   - Rôles realm : `customer`
   - Rôles application : aucun
   - Permissions : Accès limité, pas d'accès aux données protégées

2. **customer-read@dev.io** : Utilisateur avec permission de lecture
   - Rôles realm : `customer`
   - Rôles application : `protected-data-read`
   - Permissions : Peut lire les données protégées, pas de modification

3. **customer-write@dev.io** : Utilisateur avec permission d'écriture
   - Rôles realm : `customer`
   - Rôles application : `protected-data-write`
   - Permissions : Peut lire, créer, modifier et supprimer les données protégées

4. **administrator@dev.io** : Administrateur
   - Rôles realm : `admin`
   - Rôles application : aucun
   - Permissions : Accès complet à toutes les ressources (le rôle `admin` a automatiquement tous les droits)

Tous les utilisateurs de test ont le mot de passe : `test`

## Mapping des rôles dans les tokens JWT

### Configuration des mappers

Les rôles sont mappés dans les tokens JWT via des protocol mappers configurés dans le scope `roles` :

1. **Realm roles mapper** : Mappe les rôles realm dans `realm_access.roles`
2. **Client roles mapper** : Mappe les rôles application dans `resource_access.oauth-starter-client.roles`

### Structure des tokens JWT

Après configuration des mappers, les tokens JWT contiennent :

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

Pour plus de détails sur le mapping des rôles dans les tokens JWT, consultez la documentation : `doc/keycloak-role-mapping-jwt.md`

## Utilisation dans l'API .NET Core

Les rôles sont extraits depuis les tokens JWT et mappés vers les claims .NET Core dans `Program.cs` :

- Les rôles realm sont extraits depuis `realm_access.roles`
- Les rôles application sont extraits depuis `resource_access.oauth-starter-client.roles`
- Tous les rôles sont ajoutés comme claims de type `ClaimTypes.Role`

Les policies d'autorisation utilisent ces rôles :

- `protected-data-read` : Requiert `protected-data-read` OU `admin`
- `protected-data-write` : Requiert `protected-data-write` OU `admin`

Pour plus de détails sur les policies d'autorisation, consultez la documentation : `doc/keycloak-authorization-policies.md`

## Utilisation dans le front-end Vue.js

Les rôles sont récupérés depuis l'endpoint `/oauth2/userinfo` et utilisés pour l'affichage conditionnel :

- Les helpers de vérification des rôles sont dans `packages/front/src/utils/roles.ts`
- Les boutons de création/modification/suppression sont affichés uniquement si l'utilisateur a les permissions nécessaires

Pour plus de détails sur l'utilisation des helpers, consultez la documentation : `doc/keycloak-role-helpers-frontend.md`

## Bonnes pratiques

### Nommage des rôles

- **Rôles realm** : Utilisez des noms courts et descriptifs (ex: `admin`, `customer`, `manager`)
- **Rôles application** : Utilisez un format `resource-action` (ex: `protected-data-read`, `protected-data-write`)

### Hiérarchie des permissions

- Le rôle `admin` a automatiquement tous les droits (read + write)
- Le rôle `protected-data-write` inclut implicitement la permission de lecture
- Les rôles application sont plus granulaires que les rôles realm

### Sécurité

- Ne créez pas de rôles avec des permissions trop larges
- Utilisez des rôles application pour des permissions spécifiques à une ressource
- Utilisez des rôles realm pour des permissions globales

## Vérification

### Vérifier les rôles dans Keycloak

1. Connectez-vous à l'interface admin Keycloak (http://localhost:8080)
2. Allez dans Realm "oauth-starter" > Roles pour voir les rôles realm
3. Allez dans Realm "oauth-starter" > Clients > oauth-starter-client > Roles pour voir les rôles application

### Vérifier les rôles dans les tokens JWT

1. Connectez-vous à l'application avec un utilisateur de test
2. Ouvrez les outils de développement du navigateur
3. Vérifiez les tokens JWT décodés (via oauth2-proxy ou directement depuis Keycloak)
4. Vérifiez que les rôles apparaissent dans `realm_access.roles` et `resource_access.oauth-starter-client.roles`

### Vérifier les rôles dans l'application

1. Connectez-vous à l'application avec un utilisateur de test
2. Allez sur la page "Profil" pour voir les rôles affichés
3. Allez sur la page "Données protégées" pour vérifier l'affichage conditionnel des boutons

## Références

- [Documentation Keycloak - Roles](https://www.keycloak.org/docs/latest/server_admin/#_roles)
- [Documentation Keycloak - Client Roles](https://www.keycloak.org/docs/latest/server_admin/#_client_roles)
- [Documentation Keycloak - Role Mappers](https://www.keycloak.org/docs/latest/server_admin/#_protocol_mappers)

