# Documentation - Policies d'autorisation dans l'API .NET Core

## Introduction

Cette documentation explique comment les policies d'autorisation sont configurées et utilisées dans l'API .NET Core pour contrôler l'accès aux ressources basé sur les rôles Keycloak.

### Vue d'ensemble

Le système d'autorisation utilise :
- **Policies d'autorisation** : Définies dans `Program.cs` pour vérifier les rôles
- **Attributs `[Authorize]`** : Appliqués sur les controllers et actions pour protéger les endpoints
- **Rôles extraits** : Depuis les tokens JWT Keycloak et mappés vers les claims .NET Core

### Dépendances

- **Keycloak** : Fournisseur d'identité avec rôles configurés (feature 001, 005)
- **Mapping des rôles** : Extraction des rôles depuis les tokens JWT (feature 005)
- **JWT Bearer Authentication** : Validation des tokens JWT (feature 004)

## Configuration des policies

### Fichier de configuration

Les policies sont configurées dans `packages/api/Program.cs` dans la section `AddAuthorization` :

```csharp
builder.Services.AddAuthorization(options =>
{
    // Policy for reading protected data: requires protected-data-read OR protected-data-write OR admin
    // Note: protected-data-write includes read permission (write implies read)
    options.AddPolicy("protected-data-read", policy =>
        policy.RequireAssertion(context =>
            context.User.IsInRole("protected-data-read") ||
            context.User.IsInRole("protected-data-write") ||
            context.User.IsInRole("admin")));
    
    // Policy for writing protected data: requires protected-data-write OR admin
    options.AddPolicy("protected-data-write", policy =>
        policy.RequireAssertion(context =>
            context.User.IsInRole("protected-data-write") ||
            context.User.IsInRole("admin")));
});
```

### Structure des policies

Chaque policy est définie avec :
- **Nom de la policy** : Identifiant utilisé dans les attributs `[Authorize]`
- **RequireAssertion** : Fonction qui vérifie si l'utilisateur a les permissions nécessaires
- **Vérification des rôles** : Utilise `User.IsInRole()` pour vérifier les rôles

### Policy "protected-data-read"

**Objectif** : Autoriser la lecture des données protégées

**Rôles requis** :
- `protected-data-read` : Permission de lecture explicite
- `protected-data-write` : Permission d'écriture (inclut la lecture)
- `admin` : Rôle administrateur (tous les droits)

**Logique** : L'utilisateur peut lire s'il a au moins un de ces rôles

**Utilisation** : Appliquée sur les endpoints GET pour récupérer les données

### Policy "protected-data-write"

**Objectif** : Autoriser l'écriture (création, modification, suppression) des données protégées

**Rôles requis** :
- `protected-data-write` : Permission d'écriture explicite
- `admin` : Rôle administrateur (tous les droits)

**Logique** : L'utilisateur peut écrire s'il a au moins un de ces rôles

**Utilisation** : Appliquée sur les endpoints POST, PUT, DELETE pour modifier les données

## Utilisation dans les controllers

### Application sur les endpoints

Les policies sont appliquées via l'attribut `[Authorize]` dans `packages/api/Controllers/ProtectedDataController.cs` :

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProtectedDataController : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "protected-data-read")]
    public IEnumerable<ProtectedData> Get()
    {
        return _data;
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "protected-data-read")]
    public ActionResult<ProtectedData> Get(string id)
    {
        // ...
    }

    [HttpPost]
    [Authorize(Policy = "protected-data-write")]
    public ActionResult<ProtectedData> Post(ProtectedData data)
    {
        // ...
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "protected-data-write")]
    public ActionResult<ProtectedData> Put(string id, ProtectedData data)
    {
        // ...
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "protected-data-write")]
    public ActionResult Delete(string id)
    {
        // ...
    }
}
```

### Endpoints GET (lecture)

Les endpoints GET utilisent la policy `protected-data-read` :
- `GET /api/ProtectedData` : Liste toutes les données
- `GET /api/ProtectedData/{id}` : Récupère une donnée par ID

**Rôles autorisés** :
- `protected-data-read`
- `protected-data-write` (inclut la lecture)
- `admin`

### Endpoints POST/PUT/DELETE (écriture)

Les endpoints de modification utilisent la policy `protected-data-write` :
- `POST /api/ProtectedData` : Crée une nouvelle donnée
- `PUT /api/ProtectedData/{id}` : Met à jour une donnée existante
- `DELETE /api/ProtectedData/{id}` : Supprime une donnée

**Rôles autorisés** :
- `protected-data-write`
- `admin`

## Hiérarchie des permissions

### Rôle admin

Le rôle `admin` a automatiquement tous les droits :
- ✅ Lecture des données protégées
- ✅ Écriture des données protégées
- ✅ Toutes les autres permissions

**Implémentation** : Le rôle `admin` est vérifié dans toutes les policies

### Rôle protected-data-write

Le rôle `protected-data-write` inclut implicitement la permission de lecture :
- ✅ Lecture des données protégées (via policy `protected-data-read`)
- ✅ Écriture des données protégées (via policy `protected-data-write`)

**Implémentation** : Le rôle `protected-data-write` est vérifié dans la policy `protected-data-read`

### Rôle protected-data-read

Le rôle `protected-data-read` permet uniquement la lecture :
- ✅ Lecture des données protégées
- ❌ Écriture des données protégées

**Implémentation** : Le rôle `protected-data-read` est vérifié uniquement dans la policy `protected-data-read`

## Gestion des erreurs

### Erreur 401 (Unauthorized)

Retournée lorsque :
- L'utilisateur n'est pas authentifié
- Le token JWT est invalide ou expiré
- Le token JWT n'est pas présent dans la requête

**Réponse** :
```json
{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Unauthorized",
  "status": 401
}
```

### Erreur 403 (Forbidden)

Retournée lorsque :
- L'utilisateur est authentifié mais n'a pas les permissions nécessaires
- L'utilisateur n'a pas le rôle requis pour la policy

**Réponse** :
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403
}
```

### Messages d'erreur dans le front-end

Le front-end gère les erreurs 403 avec des messages spécifiques :
- Création : "Vous n'avez pas la permission de créer des données"
- Modification : "Vous n'avez pas la permission de modifier des données"
- Suppression : "Vous n'avez pas la permission de supprimer des données"

## Exemples d'utilisation

### Exemple 1 : Utilisateur avec protected-data-read

**Utilisateur** : `customer-read@dev.io`
**Rôles** : `customer` (realm), `protected-data-read` (application)

**Résultats** :
- ✅ `GET /api/ProtectedData` : 200 OK (a le rôle `protected-data-read`)
- ✅ `GET /api/ProtectedData/1` : 200 OK (a le rôle `protected-data-read`)
- ❌ `POST /api/ProtectedData` : 403 Forbidden (n'a pas le rôle `protected-data-write`)
- ❌ `PUT /api/ProtectedData/1` : 403 Forbidden (n'a pas le rôle `protected-data-write`)
- ❌ `DELETE /api/ProtectedData/1` : 403 Forbidden (n'a pas le rôle `protected-data-write`)

### Exemple 2 : Utilisateur avec protected-data-write

**Utilisateur** : `customer-write@dev.io`
**Rôles** : `customer` (realm), `protected-data-write` (application)

**Résultats** :
- ✅ `GET /api/ProtectedData` : 200 OK (a le rôle `protected-data-write` qui inclut la lecture)
- ✅ `GET /api/ProtectedData/1` : 200 OK (a le rôle `protected-data-write` qui inclut la lecture)
- ✅ `POST /api/ProtectedData` : 201 Created (a le rôle `protected-data-write`)
- ✅ `PUT /api/ProtectedData/1` : 200 OK (a le rôle `protected-data-write`)
- ✅ `DELETE /api/ProtectedData/1` : 204 No Content (a le rôle `protected-data-write`)

### Exemple 3 : Utilisateur admin

**Utilisateur** : `administrator@dev.io`
**Rôles** : `admin` (realm)

**Résultats** :
- ✅ `GET /api/ProtectedData` : 200 OK (a le rôle `admin`)
- ✅ `GET /api/ProtectedData/1` : 200 OK (a le rôle `admin`)
- ✅ `POST /api/ProtectedData` : 201 Created (a le rôle `admin`)
- ✅ `PUT /api/ProtectedData/1` : 200 OK (a le rôle `admin`)
- ✅ `DELETE /api/ProtectedData/1` : 204 No Content (a le rôle `admin`)

### Exemple 4 : Utilisateur sans permissions

**Utilisateur** : `customer@dev.io`
**Rôles** : `customer` (realm)

**Résultats** :
- ❌ `GET /api/ProtectedData` : 403 Forbidden (n'a pas les rôles requis)
- ❌ `GET /api/ProtectedData/1` : 403 Forbidden (n'a pas les rôles requis)
- ❌ `POST /api/ProtectedData` : 403 Forbidden (n'a pas les rôles requis)
- ❌ `PUT /api/ProtectedData/1` : 403 Forbidden (n'a pas les rôles requis)
- ❌ `DELETE /api/ProtectedData/1` : 403 Forbidden (n'a pas les rôles requis)

## Création de nouvelles policies

### Étapes pour créer une nouvelle policy

1. **Définir la policy dans Program.cs** :
   ```csharp
   options.AddPolicy("nouvelle-policy", policy =>
       policy.RequireAssertion(context =>
           context.User.IsInRole("nouveau-role") ||
           context.User.IsInRole("admin")));
   ```

2. **Appliquer la policy sur les endpoints** :
   ```csharp
   [HttpGet("nouvelle-route")]
   [Authorize(Policy = "nouvelle-policy")]
   public ActionResult NouvelleAction()
   {
       // ...
   }
   ```

3. **Tester avec différents utilisateurs** :
   - Utilisateur avec le rôle requis : doit avoir accès
   - Utilisateur sans le rôle requis : doit recevoir 403
   - Utilisateur admin : doit avoir accès

## Bonnes pratiques

### Nommage des policies

- Utilisez un format descriptif : `resource-action` (ex: `protected-data-read`)
- Évitez les noms génériques : `read`, `write`
- Soyez cohérent avec les noms des rôles

### Hiérarchie des permissions

- Le rôle `admin` doit avoir tous les droits
- Les rôles d'écriture doivent inclure la lecture
- Vérifiez toujours le rôle `admin` dans les policies

### Sécurité

- Ne créez pas de policies trop permissives
- Vérifiez toujours les rôles dans les policies
- Utilisez `RequireAssertion` pour des vérifications complexes

## Vérification

### Vérifier la configuration

1. Vérifiez que les policies sont définies dans `Program.cs`
2. Vérifiez que les attributs `[Authorize]` sont appliqués correctement
3. Vérifiez que les rôles sont extraits depuis les tokens JWT

### Tester les policies

1. Connectez-vous avec différents utilisateurs de test
2. Testez chaque endpoint avec chaque utilisateur
3. Vérifiez que les réponses 403 sont retournées correctement
4. Vérifiez que les réponses 200/201 sont retournées pour les utilisateurs autorisés

## Références

- [Documentation ASP.NET Core - Authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)
- [Documentation ASP.NET Core - Role-based Authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/roles)

