# Feature 002 : oauth2-proxy-configuration

## Objectif

Configurer oauth2-proxy comme reverse proxy d'authentification/BFF. Mettre en place la connexion au fournisseur OIDC Keycloak, la gestion des secrets client, les paramètres de cookies (HttpOnly, Secure, SameSite), le stockage de session basé sur cookies (sans Redis), et le routage upstream pour les chemins /app et /api.

## Périmètre

### Inclus
- Configuration d'oauth2-proxy comme service Docker dans docker-compose.yml
- Configuration de la connexion OIDC vers Keycloak (URL, client ID, client secret)
- Configuration des cookies de session (HttpOnly, Secure, SameSite=Strict)
- Stockage de session basé sur cookies (pas de Redis)
- Routage upstream pour /app (vers le serveur de fichiers statiques)
- Routage upstream pour /api (vers l'API .NET Core)
- Configuration des endpoints OAuth2 (/oauth2/start, /oauth2/callback, /oauth2/sign_out)
- Gestion des variables d'environnement et secrets
- Configuration du chiffrement des cookies
- Documentation de la configuration

### Exclu
- Configuration du serveur de fichiers statiques (feature 003)
- Développement de l'application Vue.js (feature 004)
- Développement de l'API .NET Core (feature 005)
- Configuration TLS/HTTPS (feature 012)
- Tests end-to-end complets (feature 007)
- Fonctionnalité de logout complète (feature 009)
- Monitoring et logging avancés (feature 011)

## Dépendances

- 001-keycloak-docker-compose-setup

## Livrables

- Fichier de configuration oauth2-proxy
- Configuration des variables d'environnement/secrets
- Configuration du chiffrement des cookies
- Règles de routage upstream
- Endpoints OAuth2 (/oauth2/start, /oauth2/callback, /oauth2/sign_out)
- Documentation

## Critères d'acceptation

- ✅ oauth2-proxy démarre correctement et se connecte à Keycloak
- ✅ Les endpoints OAuth2 sont accessibles et fonctionnels
- ✅ Le routage upstream fonctionne pour /app et /api
- ✅ Les cookies de session sont correctement configurés (HttpOnly, Secure, SameSite)
- ✅ La redirection vers Keycloak pour l'authentification fonctionne
- ✅ Le callback OAuth2 fonctionne correctement

