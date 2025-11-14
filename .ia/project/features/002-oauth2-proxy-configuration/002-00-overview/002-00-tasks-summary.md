# Résumé des Tâches - Feature 002 : oauth2-proxy-configuration

Ce document résume toutes les informations importantes extraites des tâches de la feature 002 avant leur compression. Il préserve les détails techniques, les décisions architecturales, et les configurations critiques pour la maintenance future du projet.

## Vue d'ensemble

La feature 002 a configuré oauth2-proxy comme reverse proxy d'authentification/BFF (Backend for Frontend) pour sécuriser l'accès aux applications et APIs. oauth2-proxy agit comme intermédiaire entre les clients et les services backend, gérant l'authentification OAuth2/OIDC avec Keycloak et le routage des requêtes authentifiées.

## Livrables créés

### Fichiers de configuration

1. **docker-compose.yml** (modifié)
   - Service `oauth2-proxy` ajouté avec :
     - Image : `quay.io/oauth2-proxy/oauth2-proxy:latest`
     - Port exposé : `4180:4180`
     - Dépendance : `keycloak`
     - Volume : `./config/oauth2-proxy.cfg:/config/oauth2-proxy.cfg:ro`
     - Variables d'environnement pour secrets : `OAUTH2_PROXY_CLIENT_SECRET`, `OAUTH2_PROXY_COOKIE_SECRET`
     - Commandes : `--config=/config/oauth2-proxy.cfg`, `--upstreams=/app=http://app:3000`, `--upstreams=/api=http://api:5000`

2. **config/oauth2-proxy.cfg** (créé)
   - Format : TOML (requis par oauth2-proxy)
   - Emplacement : `config/oauth2-proxy.cfg`
   - Contient toute la configuration oauth2-proxy (sauf secrets qui sont dans .env)

3. **.env.example** (modifié)
   - Section oauth2-proxy ajoutée avec toutes les variables d'environnement nécessaires
   - Placeholders pour les secrets avec instructions de génération

### Structure de répertoires

- `config/` : Répertoire créé pour les fichiers de configuration
  - `oauth2-proxy.cfg` : Configuration principale oauth2-proxy

## Configuration détaillée

### Configuration OIDC et connexion Keycloak

- **Provider** : `keycloak-oidc`
- **Client ID** : `oauth-starter-client`
- **Client Secret** : Géré via variable d'environnement `OAUTH2_PROXY_CLIENT_SECRET`
  - Stocké dans `.env` (non versionné)
  - Récupéré depuis l'interface admin Keycloak (Realm "oauth-starter" > Clients > oauth-starter-client > Credentials)
- **OIDC Issuer URL** : `http://keycloak:8080/realms/oauth-starter`
  - Utilise le nom du service Docker `keycloak` (réseau interne)
  - Realm : `oauth-starter`
- **Redirect URL** : `http://localhost:4180/oauth2/callback`
  - URL de callback OAuth2 après authentification Keycloak
  - Pour production, utiliser HTTPS (voir feature 012)
- **Email Domain** : `*` (autorise tous les emails)
- **Insecure OIDC Skip Issuer Verification** : `true` (pour développement, `false` pour production)

### Endpoints OAuth2

Les endpoints suivants sont configurés (valeurs par défaut d'oauth2-proxy) :

- **`/oauth2/start`** : Point d'entrée pour initier l'authentification
  - Redirige l'utilisateur vers Keycloak pour l'authentification
- **`/oauth2/callback`** : Endpoint de callback OAuth2
  - Appelé par Keycloak après authentification de l'utilisateur
  - Crée la session oauth2-proxy
- **`/oauth2/sign_out`** : Endpoint de déconnexion
  - Permet à l'utilisateur de se déconnecter et supprime la session

### Configuration des cookies et sessions

- **HttpOnly** : `true`
  - Empêche l'accès JavaScript aux cookies (protection contre XSS)
- **Secure** : `false` (développement HTTP)
  - Pour production avec HTTPS, utiliser `true`
  - En développement HTTP, `false` permet aux cookies de fonctionner
- **SameSite** : `strict`
  - Sécurité maximale contre CSRF
  - Cookies jamais envoyés en cross-site
  - Alternative : `lax` si problèmes avec flux OAuth2 cross-site
- **Cookie Secret** : Géré via variable d'environnement `OAUTH2_PROXY_COOKIE_SECRET`
  - Format : base64, minimum 32 bytes
  - Génération : `python3 -c 'import secrets, base64; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())'`
  - Ou : `openssl rand -base64 32`
  - Stocké dans `.env` (non versionné)

### Stockage de session

- **Type** : `cookie` (stockage basé sur cookies)
- **Redis** : Non utilisé (pas de service Redis dans docker-compose.yml)
- **Avantages** :
  - Simplicité : Pas besoin de service externe
  - Pas de dépendance supplémentaire
  - Convient pour POC/développement
- **Inconvénients** :
  - Limitation de taille (~4KB par cookie)
  - Pas de partage de session entre instances multiples
  - Pour production avec plusieurs instances, Redis serait préférable

### Routage upstream

Configuration du routage des requêtes authentifiées vers les services backend :

- **`/app`** → `http://app:3000`
  - Serveur de fichiers statiques (sera configuré dans feature 003)
  - Placeholder jusqu'à ce que le service soit créé
- **`/api`** → `http://api:5000`
  - API .NET Core (sera configurée dans feature 005)
  - Placeholder jusqu'à ce que l'API soit créée

**Comportement** :
- Les requêtes vers `/app` et `/api` sont authentifiées par oauth2-proxy
- Si non authentifié, redirection vers Keycloak
- Une fois authentifié, routage vers le service upstream correspondant
- Les requêtes vers `/oauth2/*` ne sont pas routées vers l'upstream (gérées par oauth2-proxy)

### Configuration HTTP

- **HTTP Address** : `0.0.0.0:4180`
  - Écoute sur toutes les interfaces réseau du conteneur
  - Port 4180 (port HTTP par défaut d'oauth2-proxy)
  - Pour HTTPS, utiliser le port 8443 (voir feature 012)

## Variables d'environnement

Toutes les variables d'environnement sont documentées dans `.env.example` :

### Variables de base

- `OAUTH2_PROXY_HTTP_ADDRESS` : Adresse d'écoute HTTP (défaut: `0.0.0.0:4180`)

### Variables OIDC

- `OAUTH2_PROXY_CLIENT_ID` : ID du client OAuth2 dans Keycloak (défaut: `oauth-starter-client`)
- `OAUTH2_PROXY_CLIENT_SECRET` : **SECRET** - Secret du client OAuth2 (à configurer dans `.env`)
- `OAUTH2_PROXY_OIDC_ISSUER_URL` : URL du provider OIDC (défaut: `http://keycloak:8080/realms/oauth-starter`)
- `OAUTH2_PROXY_REDIRECT_URL` : URL de callback OAuth2 (défaut: `http://localhost:4180/oauth2/callback`)

### Variables de sécurité

- `OAUTH2_PROXY_COOKIE_SECRET` : **SECRET** - Secret pour chiffrement des cookies (à générer et configurer dans `.env`)
  - Format : base64, minimum 32 bytes
  - Génération : `python3 -c 'import secrets, base64; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())'`

### Variables optionnelles

- `OAUTH2_PROXY_EMAIL_DOMAIN` : Domaine email autorisé (défaut: `*` pour tous)

**Note importante** : Les secrets (`OAUTH2_PROXY_CLIENT_SECRET`, `OAUTH2_PROXY_COOKIE_SECRET`) doivent être configurés dans le fichier `.env` local (non versionné). Le fichier `.env.example` contient uniquement des placeholders.

## Décisions architecturales importantes

### 1. Stockage de session basé sur cookies

**Décision** : Utiliser le stockage de session basé sur cookies (pas Redis)

**Rationale** :
- Simplicité pour un POC/développement
- Pas de dépendance externe supplémentaire
- Configuration minimale requise

**Considérations futures** :
- Pour production avec plusieurs instances, considérer Redis pour le partage de session
- Limitation de taille des cookies (~4KB)

### 2. Cookie Secure en développement

**Décision** : `cookie-secure=false` pour développement HTTP

**Rationale** :
- Permet aux cookies de fonctionner en développement sans HTTPS
- Nécessaire car l'environnement de développement utilise HTTP

**Production** :
- Utiliser `cookie-secure=true` avec HTTPS (voir feature 012)

### 3. Insecure OIDC Skip Issuer Verification

**Décision** : `insecure_oidc_skip_issuer_verification=true` pour développement

**Rationale** :
- Permet de contourner les problèmes de vérification de certificat en développement
- Nécessaire pour HTTP en développement

**Production** :
- Utiliser `false` pour une sécurité maximale avec HTTPS

### 4. Gestion des secrets via variables d'environnement

**Décision** : Secrets gérés via variables d'environnement dans `.env` (non versionné)

**Rationale** :
- Sécurité : Les secrets ne sont pas hardcodés dans les fichiers de configuration
- Flexibilité : Facile à changer selon l'environnement
- Simplicité : Approprié pour développement/POC

**Implémentation** :
- Secrets référencés via `${OAUTH2_PROXY_CLIENT_SECRET}` et `${OAUTH2_PROXY_COOKIE_SECRET}` dans docker-compose.yml
- Secrets stockés dans `.env` (dans `.gitignore`)
- `.env.example` contient des placeholders avec instructions

**Alternatives pour production** :
- Docker secrets (Docker Swarm)
- Services de gestion de secrets (HashiCorp Vault, AWS Secrets Manager)
- Fichiers de secrets montés en volumes read-only

### 5. Format de configuration : TOML

**Décision** : Utiliser un fichier de configuration TOML (`config/oauth2-proxy.cfg`)

**Rationale** :
- oauth2-proxy requiert le format TOML pour les fichiers de configuration
- Centralise la configuration (sauf secrets)
- Facilite la maintenance

**Note** : Les upstreams sont passés en ligne de commande dans docker-compose.yml car le format dans TOML peut poser problème.

### 6. Routage upstream avec placeholders

**Décision** : Configurer les upstreams `/app` et `/api` même si les services n'existent pas encore

**Rationale** :
- Permet de configurer oauth2-proxy complètement avant les features suivantes
- Les erreurs de connexion upstream sont normales tant que les services n'existent pas
- Facilite l'intégration progressive

## Notes de développement

### Configuration pour développement HTTP

- `cookie-secure=false` : Nécessaire pour HTTP
- `insecure_oidc_skip_issuer_verification=true` : Nécessaire pour HTTP
- `redirect_url=http://localhost:4180/oauth2/callback` : URL HTTP locale

### Configuration pour production HTTPS

Les modifications suivantes seront nécessaires (voir feature 012) :

- `cookie-secure=true` : Activer pour HTTPS
- `insecure_oidc_skip_issuer_verification=false` : Désactiver pour sécurité
- `redirect_url=https://...` : URL HTTPS
- Configuration TLS/HTTPS pour tous les composants

## Dépannage

### Problèmes courants

1. **Service oauth2-proxy ne démarre pas**
   - Vérifier les variables d'environnement dans `.env`
   - Vérifier la syntaxe du fichier `config/oauth2-proxy.cfg`
   - Vérifier que Keycloak est démarré et accessible

2. **Connexion à Keycloak échoue**
   - Vérifier que Keycloak est accessible depuis le conteneur oauth2-proxy (`http://keycloak:8080`)
   - Vérifier l'URL OIDC issuer
   - Vérifier que le client existe dans Keycloak
   - Vérifier le client secret

3. **Cookies ne fonctionnent pas**
   - Vérifier `cookie-secure` (doit être `false` pour HTTP)
   - Vérifier que `cookie-secret` est configuré et valide (32 bytes minimum)
   - Vérifier les paramètres SameSite si problèmes cross-site

4. **Erreurs de connexion upstream**
   - Normal si les services `/app` et `/api` n'existent pas encore
   - Vérifier que les URLs upstream sont correctes une fois les services créés

## Références aux tâches

Cette feature a été implémentée via 13 tâches :

- **002-01** : Ajout du service oauth2-proxy dans docker-compose.yml
- **002-02** : Configuration des variables d'environnement de base
- **002-03** : Configuration de la connexion OIDC vers Keycloak
- **002-04** : Configuration des endpoints OAuth2
- **002-05** : Configuration des paramètres de cookies (HttpOnly, Secure, SameSite)
- **002-06** : Configuration du stockage de session basé sur cookies
- **002-07** : Configuration du chiffrement des cookies
- **002-08** : Configuration du routage upstream pour `/app`
- **002-09** : Configuration du routage upstream pour `/api`
- **002-10** : Création du fichier de configuration oauth2-proxy
- **002-11** : Configuration de la gestion des secrets
- **002-12** : Documentation de la configuration
- **002-13** : Tests de démarrage et connexion à Keycloak

## Fichiers créés/modifiés

### Fichiers créés

- `config/oauth2-proxy.cfg` : Configuration principale oauth2-proxy (format TOML)

### Fichiers modifiés

- `docker-compose.yml` : Service oauth2-proxy ajouté
- `.env.example` : Variables d'environnement oauth2-proxy ajoutées

### Fichiers de documentation

- `doc/oauth2-proxy-configuration.md` : Documentation complète de la configuration (créée par tâche 002-12)

## Dépendances

- **Feature 001** : keycloak-docker-compose-setup
  - Keycloak doit être configuré et opérationnel
  - Realm `oauth-starter` doit exister
  - Client `oauth-starter-client` doit être configuré comme confidentiel

## Considérations futures

1. **Production** :
   - Activer HTTPS (feature 012)
   - Utiliser `cookie-secure=true`
   - Désactiver `insecure_oidc_skip_issuer_verification`
   - Considérer Redis pour le stockage de session si plusieurs instances

2. **Scalabilité** :
   - Pour plusieurs instances oauth2-proxy, utiliser Redis pour le partage de session
   - Configurer un load balancer devant oauth2-proxy

3. **Sécurité** :
   - Utiliser des services de gestion de secrets en production
   - Implémenter des healthchecks pour oauth2-proxy
   - Configurer des limites de taux (rate limiting)

4. **Monitoring** :
   - Ajouter des logs structurés (feature 011)
   - Configurer des métriques et alertes

