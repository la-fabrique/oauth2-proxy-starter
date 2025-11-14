# Feature 003 : vue-spa-application-with-vite-server

## Objectif

Développer une application Vue.js SPA avec Vite et configurer le serveur de fichiers statiques intégré. L'application fait des appels API relatifs à /api/* qui sont bouchonnés (mockés) en attendant la feature 004. L'application s'appuie sur les cookies de session et oauth2-proxy pour l'authentification. Vite sert les assets de l'application (index.html, CSS, JS, JSON) et est accessible uniquement via oauth2-proxy (pas d'exposition publique). L'application ne stocke pas les tokens d'accès/refresh dans localStorage/sessionStorage. Implémentation de la fonctionnalité de signout via `/oauth2/sign_out` et affichage des informations utilisateur via `/oauth2/userinfo`.

## Périmètre

### Inclus
- Application Vue.js SPA avec Vite
- Configuration Vite (modes dev et preview)
- Dockerfile et docker-compose pour le service app
- Intégration avec oauth2-proxy (upstream /app)
- Appels API mockés vers /api/* (bouchonnés)
- Utilisation de `/oauth2/userinfo` pour les informations utilisateur
- Fonctionnalité de signout via `/oauth2/sign_out`
- Page de profil utilisateur
- Pas de stockage de tokens dans localStorage/sessionStorage
- Configuration de routing Vue Router

### Exclu
- Serveur API réel (feature 004)
- Gestion manuelle des tokens (gérée par oauth2-proxy)
- Tests end-to-end complets (feature 006)

## Dépendances

- 002-oauth2-proxy-configuration

## Livrables

- Code source de l'application Vue.js avec Vite
- Configuration Vite (vite.config.js)
- Dockerfile pour le service app
- Configuration docker-compose pour le service app
- Serveur de fichiers statiques via Vite (modes dev et preview)
- Configuration de build
- Couche de service API (mockée/bouchonnée)
- Composant de profil utilisateur utilisant `/oauth2/userinfo`
- Composant de signout utilisant `/oauth2/sign_out`
- Configuration de routing Vue Router
- Intégration avec l'upstream oauth2-proxy (/app)
- Documentation

## Critères d'acceptation

- ✅ L'application Vue.js démarre correctement avec Vite
- ✅ L'application est accessible uniquement via oauth2-proxy (upstream /app)
- ✅ L'authentification via oauth2-proxy fonctionne (redirection vers Keycloak si non authentifié)
- ✅ Les appels API vers /api/* sont mockés/bouchonnés
- ✅ L'endpoint `/oauth2/userinfo` est appelé et affiche les informations utilisateur
- ✅ Le signout via `/oauth2/sign_out` fonctionne correctement
- ✅ Aucun token n'est stocké dans localStorage/sessionStorage
- ✅ Le routing Vue Router fonctionne correctement
- ✅ L'application est containerisée et démarre via docker-compose

