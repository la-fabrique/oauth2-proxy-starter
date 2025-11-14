# Checklist - Feature 002 : oauth2-proxy-configuration

## Validation technique

- [x] oauth2-proxy est ajouté comme service dans docker-compose.yml
- [x] Le service oauth2-proxy démarre correctement
- [x] La connexion OIDC vers Keycloak est configurée (URL, client ID, client secret)
- [x] La connexion entre oauth2-proxy et Keycloak fonctionne
- [x] Le fichier de configuration oauth2-proxy est créé et valide
- [x] Les variables d'environnement et secrets sont configurés correctement
- [x] Les cookies de session sont configurés avec HttpOnly, Secure, SameSite
- [x] Le stockage de session basé sur cookies fonctionne (sans Redis)
- [x] Le chiffrement des cookies est configuré et fonctionnel
- [x] Le routage upstream pour /app est configuré
- [x] Le routage upstream pour /api est configuré
- [x] L'endpoint /oauth2/start est accessible et fonctionnel
- [x] L'endpoint /oauth2/callback est accessible et fonctionnel
- [x] L'endpoint /oauth2/sign_out est accessible et fonctionnel
- [x] La redirection vers Keycloak pour l'authentification fonctionne
- [x] Le callback OAuth2 depuis Keycloak fonctionne correctement
- [x] Les sessions sont créées et maintenues après authentification



