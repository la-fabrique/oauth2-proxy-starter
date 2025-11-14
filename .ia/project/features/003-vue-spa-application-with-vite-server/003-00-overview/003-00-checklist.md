# Checklist - Feature 003 : vue-spa-application-with-vite-server

## Validation technique

- [x] Création du projet Vue.js avec Vite
- [x] Configuration de Vite (vite.config.js) pour le développement et la production
- [x] Configuration du serveur de développement Vite
- [x] Configuration du mode preview Vite pour les tests de build
- [x] Création du Dockerfile pour le service app
- [x] Configuration du service app dans docker-compose.yml
- [x] Intégration avec oauth2-proxy (upstream /app)
- [x] Configuration de Vue Router
- [x] Implémentation de la couche de service API avec mocks/bouchons pour /api/*
- [x] Création du composant de profil utilisateur
- [x] Intégration de l'appel à `/oauth2/userinfo` pour récupérer les informations utilisateur
- [x] Création du composant de signout
- [x] Implémentation de la redirection vers `/oauth2/sign_out` pour le signout
- [x] Vérification qu'aucun token n'est stocké dans localStorage/sessionStorage
- [x] Configuration du build de production
- [ ] Test que l'application démarre correctement avec Vite en mode dev
- [x] Test que l'application est accessible uniquement via oauth2-proxy (upstream /app)
- [x] Test que l'authentification via oauth2-proxy fonctionne (redirection vers Keycloak si non authentifié)
- [x] Test que les appels API vers /api/* utilisent les mocks/bouchons
- [x] Test que l'endpoint `/oauth2/userinfo` est appelé et affiche les informations utilisateur
- [x] Test que le signout via `/oauth2/sign_out` fonctionne correctement
- [x] Test que le routing Vue Router fonctionne correctement
- [x] Test que l'application démarre correctement via docker-compose
- [x] Documentation de l'application et de son intégration avec oauth2-proxy

