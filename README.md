# OAuth Starter Kit

Kit de démarrage pour une application OAuth2/OIDC avec Keycloak, oauth2-proxy, Vue.js et .NET Core API.

> **Note** : Ce projet utilise [spec-kit](https://github.com/github/spec-kit) pour le développement piloté par spécifications (Spec-Driven Development).

## Get started

Pour exécuter ce starter, il faut : 


- Copier le fichier `packages/others/.env.example` vers `packages/others/.env`
- Lancer le docker compose du dossier `packages/others`
```bash
docker compose up -d
```
- Accéder à l'app : `http://oauth2-proxy.localtest.me:4180/`
- S'authentifier avec un des login/pass : 
    - customer@dev.io / test
    - customer-read@dev.io / test
    - customer-write@dev.io / test
    - administrator@dev.io / test


## Documentation

La documentation du projet est disponible dans le dossier [`doc/`](doc/) :

### Configuration

- **[Configuration oauth2-proxy](doc/oauth2-proxy-configuration.md)** : Configuration complète d'oauth2-proxy comme reverse proxy d'authentification (BFF)
- **[Configuration des rôles Keycloak](doc/keycloak-roles-configuration.md)** : Configuration des rôles realm et application dans Keycloak pour le contrôle d'accès basé sur les rôles (RBAC)
- **[Plugins Keycloak](doc/keycloak-plugins.md)** : Liste des plugins disponibles, leur installation et leur activation dans Keycloak

### Keycloak RBAC

- **[Mapping des rôles dans les tokens JWT](doc/keycloak-role-mapping-jwt.md)** : Comment les rôles sont mappés dans les tokens JWT et extraits dans l'API
- **[Policies d'autorisation dans l'API .NET Core](doc/keycloak-authorization-policies.md)** : Configuration et utilisation des policies d'autorisation basées sur les rôles
- **[Helpers de vérification des rôles (front-end)](doc/keycloak-role-helpers-frontend.md)** : Utilisation des helpers pour vérifier les permissions dans les composants Vue.js
- **[Affichage conditionnel des composants UI](doc/keycloak-conditional-ui-display.md)** : Comment les composants UI s'adaptent selon les permissions de l'utilisateur
- **[Guide de test Keycloak RBAC](doc/keycloak-testing-guide.md)** : Guide complet pour tester les permissions avec différents utilisateurs et rôles

## Spec-Kit

### Next Steps

1. You're already in the project directory!
2. Start using slash commands with your AI agent:
   - 2.1 `/speckit.constitution` - Establish project principles
   - 2.2 `/speckit.specify` - Create baseline specification
   - 2.3 `/speckit.plan` - Create implementation plan
   - 2.4 `/speckit.tasks` - Generate actionable tasks
   - 2.5 `/speckit.implement` - Execute implementation

### Enhancement Commands

Optional commands that you can use for your specs (improve quality & confidence):

- `/speckit.clarify` (optional) - Ask structured questions to de-risk ambiguous areas before planning (run before `/speckit.plan` if used)
- `/speckit.analyze` (optional) - Cross-artifact consistency & alignment report (after `/speckit.tasks`, before `/speckit.implement`)
- `/speckit.checklist` (optional) - Generate quality checklists to validate requirements completeness, clarity, and consistency (after `/speckit.plan`)