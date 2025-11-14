# Documentation - Configuration oauth2-proxy

## Introduction

Cette documentation décrit la configuration complète d'oauth2-proxy mise en place dans le projet. oauth2-proxy agit comme un reverse proxy d'authentification (BFF - Backend For Frontend) qui gère l'authentification OAuth2/OIDC avec Keycloak et protège les applications en amont.

### Vue d'ensemble

oauth2-proxy est configuré pour :
- Gérer l'authentification OAuth2/OIDC avec Keycloak comme fournisseur d'identité
- Protéger les applications en amont (serveur de fichiers statiques et API .NET Core)
- Gérer les sessions utilisateur via des cookies sécurisés
- Router les requêtes authentifiées vers les services appropriés

### Dépendances

- **Keycloak** : Fournisseur d'identité OIDC (feature 001)
- Les services upstream (app et api) seront configurés dans les features suivantes

## Configuration OIDC et Connexion Keycloak

### Provider

oauth2-proxy est configuré pour utiliser Keycloak comme fournisseur OIDC :

```yaml
provider: "keycloak-oidc"
```

### Paramètres de connexion

- **Client ID** : `oauth-starter-client`
  - Client OAuth2 configuré dans le realm Keycloak `oauth-starter`
  - Type : Client confidentiel (publicClient: false)

- **OIDC Issuer URL** : `http://keycloak:8080/realms/oauth-starter`
  - URL du realm Keycloak utilisé pour la découverte OIDC
  - Utilisée pour récupérer les endpoints d'autorisation, token, etc.

- **Redirect URL** : `http://localhost:4180/oauth2/callback`
  - URL de callback après authentification Keycloak
  - Doit être configurée dans les redirectUris du client Keycloak

- **Client Secret** : Géré via variable d'environnement `OAUTH2_PROXY_CLIENT_SECRET`
  - Secret du client Keycloak (obligatoire pour les clients confidentiels)
  - **Important** : Le secret doit être obtenu depuis l'interface admin Keycloak :
    1. Connectez-vous à l'interface admin Keycloak (http://localhost:8080)
    2. Allez dans Realm "oauth-starter" > Clients > oauth-starter-client
    3. Copiez le secret depuis l'onglet "Credentials"
  - Le secret est stocké dans le fichier `.env` (non versionné)

### Configuration de développement

Pour le développement, la vérification de l'issuer OIDC est désactivée :
- `insecure_oidc_skip_issuer_verification: true`

**Note** : En production, cette option doit être définie à `false` et HTTPS doit être configuré.

## Endpoints OAuth2

oauth2-proxy expose trois endpoints principaux pour gérer le flux d'authentification :

### `/oauth2/start`

**Description** : Point d'entrée pour initier le processus d'authentification.

**Comportement** :
- Redirige l'utilisateur vers Keycloak pour l'authentification
- Génère un state et un nonce pour la sécurité
- Stocke ces valeurs pour la validation lors du callback

**Utilisation** :
- Accéder à cet endpoint déclenche le flux OAuth2
- L'utilisateur est redirigé vers la page de connexion Keycloak

### `/oauth2/callback`

**Description** : Endpoint de callback après authentification Keycloak.

**Comportement** :
- Reçoit le code d'autorisation de Keycloak
- Échange le code contre un access token et un refresh token
- Valide le state et le nonce pour la sécurité
- Crée une session utilisateur et définit un cookie de session
- Redirige l'utilisateur vers l'application protégée

**Flux** :
1. Keycloak redirige vers cet endpoint avec un code d'autorisation
2. oauth2-proxy échange le code contre des tokens
3. Une session est créée et un cookie est défini
4. L'utilisateur est redirigé vers l'application

### `/oauth2/sign_out`

**Description** : Endpoint pour la déconnexion.

**Comportement** :
- Invalide la session utilisateur
- Supprime le cookie de session
- Peut rediriger vers Keycloak pour la déconnexion complète (end_session endpoint)

**Note** : La fonctionnalité complète de logout sera implémentée dans la feature 009.

## Configuration des Cookies et Sessions

### Paramètres de cookies

Les cookies de session sont configurés avec les paramètres de sécurité suivants :

- **HttpOnly** : `true`
  - Empêche l'accès JavaScript au cookie (protection contre XSS)
  - Le cookie ne peut être lu que par le serveur

- **Secure** : `false` (développement) / `true` (production)
  - En développement HTTP : `false`
  - En production HTTPS : doit être `true`
  - Le cookie n'est envoyé que sur des connexions HTTPS si `true`

- **SameSite** : `strict`
  - Protection contre les attaques CSRF
  - Le cookie n'est envoyé que pour les requêtes du même site

### Stockage de session

- **Type** : `cookie`
  - Les sessions sont stockées dans les cookies (pas de Redis)
  - Chaque requête contient les informations de session dans le cookie
  - Les cookies sont chiffrés pour la sécurité

### Chiffrement des cookies

- **Cookie Secret** : Géré via variable d'environnement `OAUTH2_PROXY_COOKIE_SECRET`
  - Secret utilisé pour chiffrer les cookies de session
  - Format : base64, minimum 32 bytes
  - **Génération d'un nouveau secret** :
    ```bash
    python3 -c 'import secrets, base64; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())'
    ```
    Ou avec openssl :
    ```bash
    openssl rand -base64 32
    ```
  - Le secret est stocké dans le fichier `.env` (non versionné)

## Routage Upstream

oauth2-proxy route les requêtes authentifiées vers les services en amont selon les chemins configurés :

### Règle `/app`

- **Chemin** : `/app`
- **Destination** : `http://app:3000`
- **Description** : Route les requêtes vers le serveur de fichiers statiques (application Vue.js)
- **Statut** : Le serveur sera configuré dans la feature 003

### Règle `/api`

- **Chemin** : `/api`
- **Destination** : `http://api:5000`
- **Description** : Route les requêtes vers l'API .NET Core
- **Statut** : L'API sera développée dans la feature 005

### Fonctionnement

1. L'utilisateur accède à une URL protégée (ex: `/app` ou `/api/*`)
2. Si non authentifié, oauth2-proxy redirige vers `/oauth2/start`
3. Après authentification, oauth2-proxy vérifie la session
4. Si la session est valide, la requête est proxifiée vers le service upstream approprié
5. Les headers d'authentification (tokens) sont ajoutés à la requête upstream si nécessaire

## Gestion des Secrets

### Principe

Les secrets ne sont **jamais hardcodés** dans les fichiers de configuration. Ils sont gérés via des variables d'environnement référencées dans `docker-compose.yml`.

### Variables d'environnement de secrets

#### `OAUTH2_PROXY_CLIENT_SECRET`

- **Description** : Secret du client OAuth2 Keycloak
- **Obligatoire** : Oui (pour les clients confidentiels)
- **Obtention** :
  1. Interface admin Keycloak : http://localhost:8080
  2. Realm "oauth-starter" > Clients > oauth-starter-client
  3. Onglet "Credentials" > Copier le secret
- **Stockage** : Fichier `.env` (non versionné)

#### `OAUTH2_PROXY_COOKIE_SECRET`

- **Description** : Secret pour le chiffrement des cookies de session
- **Obligatoire** : Oui
- **Format** : base64, minimum 32 bytes
- **Génération** :
  ```bash
  python3 -c 'import secrets, base64; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())'
  ```
  Ou :
  ```bash
  openssl rand -base64 32
  ```
- **Stockage** : Fichier `.env` (non versionné)

### Fichiers de configuration

- **`.env`** : Contient les valeurs réelles des secrets (non versionné, dans `.gitignore`)
- **`.env.example`** : Contient des placeholders/exemples (versionné)
- **`docker-compose.yml`** : Référence les variables via `${VARIABLE_NAME}`
- **`config/oauth2-proxy.yaml`** : Ne contient pas de secrets hardcodés

### Sécurité

- ✅ Le fichier `.env` est dans `.gitignore`
- ✅ Les secrets ne sont pas dans les fichiers versionnés
- ✅ Les placeholders dans `.env.example` indiquent clairement qu'il faut remplacer les valeurs

## Fichiers de Configuration

### `docker-compose.yml`

**Emplacement** : Racine du projet

**Contenu** : Configuration du service oauth2-proxy avec :
- Image Docker : `quay.io/oauth2-proxy/oauth2-proxy:latest`
- Ports exposés : `4180:4180`
- Dépendance : `keycloak`
- Arguments en ligne de commande avec variables d'environnement

**Exemple de configuration** :
```yaml
oauth2-proxy:
  image: quay.io/oauth2-proxy/oauth2-proxy:latest
  depends_on:
    - keycloak
  ports:
    - "4180:4180"
  command:
    - --provider=keycloak-oidc
    - --client-id=${OAUTH2_PROXY_CLIENT_ID}
    - --client-secret=${OAUTH2_PROXY_CLIENT_SECRET}
    # ... autres arguments
```

### `config/oauth2-proxy.yaml`

**Emplacement** : `config/oauth2-proxy.yaml`

**Contenu** : Fichier de configuration YAML alternatif (les paramètres sont aussi dans docker-compose.yml)

**Note** : Ce fichier ne contient pas de secrets hardcodés. Les secrets sont gérés via des variables d'environnement dans docker-compose.yml.

### `.env.example`

**Emplacement** : Racine du projet

**Contenu** : Exemple de variables d'environnement avec placeholders

**Utilisation** : Copier ce fichier vers `.env` et remplacer les placeholders par les valeurs réelles.

## Variables d'Environnement

### Liste complète des variables

| Variable | Description | Obligatoire | Valeur par défaut/Exemple |
|----------|-------------|-------------|---------------------------|
| `OAUTH2_PROXY_HTTP_ADDRESS` | Adresse d'écoute HTTP | Oui | `0.0.0.0:4180` |
| `OAUTH2_PROXY_CLIENT_ID` | Client ID Keycloak | Oui | `oauth-starter-client` |
| `OAUTH2_PROXY_CLIENT_SECRET` | Secret du client Keycloak | Oui | (à configurer dans .env) |
| `OAUTH2_PROXY_OIDC_ISSUER_URL` | URL du realm Keycloak | Oui | `http://keycloak:8080/realms/oauth-starter` |
| `OAUTH2_PROXY_REDIRECT_URL` | URL de callback | Oui | `http://localhost:4180/oauth2/callback` |
| `OAUTH2_PROXY_COOKIE_SECRET` | Secret pour chiffrement cookies | Oui | (à générer et configurer dans .env) |
| `OAUTH2_PROXY_EMAIL_DOMAIN` | Domaine email autorisé | Oui | `*` (tous les emails) |

### Configuration dans `.env`

Toutes ces variables doivent être configurées dans votre fichier `.env` local :

1. Copier `.env.example` vers `.env`
2. Remplacer les placeholders par les valeurs réelles
3. Générer un nouveau `OAUTH2_PROXY_COOKIE_SECRET` si nécessaire
4. Obtenir `OAUTH2_PROXY_CLIENT_SECRET` depuis Keycloak

## Notes de Développement

### Configuration actuelle (Développement)

- **HTTP** : oauth2-proxy écoute sur HTTP (port 4180)
- **Cookie Secure** : `false` (pour permettre HTTP)
- **Vérification Issuer** : Désactivée (`insecure_oidc_skip_issuer_verification: true`)

### Changements pour la Production

Pour la production, les modifications suivantes sont nécessaires :

1. **HTTPS** : Configurer TLS/HTTPS (feature 012)
   - Certificats SSL/TLS
   - Configuration HTTPS dans oauth2-proxy

2. **Cookie Secure** : Passer à `true`
   - Modifier `--cookie-secure=true` dans docker-compose.yml
   - Ou `cookie_secure: true` dans config/oauth2-proxy.yaml

3. **Vérification Issuer** : Activer
   - Modifier `insecure_oidc_skip_issuer_verification: false`

4. **HSTS** : Activer les headers HSTS (feature 012)

5. **Secrets** : Utiliser un système de gestion de secrets plus sécurisé
   - Docker secrets (Docker Swarm)
   - Services de gestion de secrets (HashiCorp Vault, AWS Secrets Manager, etc.)

## Dépannage (Troubleshooting)

### Le service ne démarre pas

- Vérifier que Keycloak est démarré et accessible
- Vérifier que les variables d'environnement sont correctement configurées dans `.env`
- Vérifier les logs : `docker-compose logs oauth2-proxy`

### Erreur de connexion à Keycloak

- Vérifier que l'URL `OAUTH2_PROXY_OIDC_ISSUER_URL` est correcte
- Vérifier que le client Keycloak existe et est configuré correctement
- Vérifier que le client secret est correct dans `.env`

### Redirection vers Keycloak ne fonctionne pas

- Vérifier que l'URL de callback est configurée dans les redirectUris du client Keycloak
- Vérifier que `OAUTH2_PROXY_REDIRECT_URL` correspond à l'URL configurée dans Keycloak

### Cookies non définis

- Vérifier que `OAUTH2_PROXY_COOKIE_SECRET` est configuré et valide
- Vérifier que le format du secret est correct (base64, minimum 32 bytes)

## Références

- [Documentation officielle oauth2-proxy](https://oauth2-proxy.github.io/oauth2-proxy/)
- [Configuration oauth2-proxy](https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)

## Historique

- **Feature 002** : Configuration initiale d'oauth2-proxy
  - Tâche 002-01 : Ajout du service dans docker-compose.yml
  - Tâche 002-02 : Configuration des variables d'environnement
  - Tâche 002-03 : Configuration de la connexion OIDC Keycloak
  - Tâche 002-04 : Configuration des endpoints OAuth2
  - Tâche 002-05 : Configuration des paramètres de cookies
  - Tâche 002-06 : Configuration du stockage de session
  - Tâche 002-07 : Configuration du chiffrement des cookies
  - Tâche 002-08 : Configuration du routage upstream /app
  - Tâche 002-09 : Configuration du routage upstream /api
  - Tâche 002-10 : Création du fichier de configuration
  - Tâche 002-11 : Configuration de la gestion des secrets
  - Tâche 002-12 : Documentation (ce document)

