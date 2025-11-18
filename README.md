# OAuth Starter Kit

Kit de démarrage pour une application OAuth2/OIDC avec Keycloak, oauth2-proxy, Vue.js et .NET Core API.

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

