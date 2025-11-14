# Checklist - Feature 004 : dotnet-core-api

## Validation technique

- [x] Création du projet API .NET 9 dans `packages/api/`
- [x] Configuration de `Microsoft.Identity.Web` pour la validation JWT (https://learn.microsoft.com/en-us/entra/msal/dotnet/microsoft-identity-web/)
- [x] Configuration de la découverte automatique JWKS via l'issuer Keycloak
- [x] Configuration de la validation des claims (aud, iss, exp)
- [x] Implémentation du middleware de validation JWT
- [x] Implémentation du middleware de gestion d'erreurs 401/403
- [x] Création de l'endpoint `GET /api/protected-data` (liste)
- [x] Création de l'endpoint `GET /api/protected-data/:id` (détail)
- [x] Création de l'endpoint `POST /api/protected-data` (création)
- [x] Création de l'endpoint `PUT /api/protected-data/:id` (mise à jour)
- [x] Création de l'endpoint `DELETE /api/protected-data/:id` (suppression)
- [x] Création de l'endpoint de healthcheck (`/health` ou `/healthz`)
- [x] Création du Dockerfile pour le service API
- [x] Configuration du service API nommé `api` dans docker-compose.yml (port interne 80)
- [x] Configuration oauth2-proxy pour router `/api/*` vers `http://api:80`
- [x] Configuration oauth2-proxy pour passer le token JWT (`pass_access_token = true`)
- [x] Adaptation du front-end pour remplacer les mocks par de vrais appels API
- [x] Vérification que le BASE_URL de Vue Router n'a pas besoin d'être modifié
- [x] Configuration du healthcheck dans docker-compose.yml pour le service API
- [x] Test que l'API démarre correctement dans docker-compose
- [x] Test que l'API valide correctement les tokens JWT via Keycloak JWKS
- [x] Test que les claims (aud, iss, exp) sont vérifiés
- [x] Test que les erreurs 401 sont retournées pour les tokens invalides/absents
- [x] Test que les erreurs 403 sont retournées pour les accès refusés
- [x] Test que les endpoints CRUD `/api/protected-data` fonctionnent correctement
- [x] Test que l'endpoint de healthcheck répond correctement
- [x] Test que oauth2-proxy route `/api/*` vers le service API
- [x] Test que oauth2-proxy transmet le token JWT dans l'en-tête `Authorization: Bearer <token>`
- [x] Test de bout en bout : connexion avec `test@example.com` / `test`
- [x] Test de bout en bout : le front-end peut appeler l'API de manière sécurisée
- [x] Test de bout en bout : l'application complète (front + API) fonctionne via docker-compose
- [x] Documentation de l'API et de son intégration avec oauth2-proxy



