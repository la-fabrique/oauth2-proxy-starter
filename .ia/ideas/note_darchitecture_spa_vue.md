# Note d'architecture — Protection SPA (Vue) et API (.NET Core) avec oauth2-proxy + Keycloak

**Résumé**
- Objectif : Empêcher le téléchargement du HTML/CSS/JSON statique tant que l'utilisateur n'est pas authentifié via Keycloak (OIDC). Protéger aussi ultérieurement les routes API. Pas de CDN. Même domaine recommandé (`domain.com/app` / `domain.com/api`).
- Choix retenus : **oauth2-proxy** (mode stand‑alone comme BFF/proxy d'authentification), **Keycloak** pour l'IAM (Authorization Code, client confidential), **Vue.js** pour le front, **.NET Core** (Kestrel) pour l'API backend.

---

## Vue d'ensemble de l'architecture

```
[Browser]
  ⇅ HTTPS
[oauth2-proxy (auth reverse-proxy / BFF)]
  ↳ /app -> upstream: Static file server (serves protected Vue app assets)
  ↳ /api -> upstream: .NET Core API (Kestrel)
[oauth2-proxy] ↔ HTTPS ↔ [Keycloak] (OIDC Authorization Code)
[oauth2-proxy] ↔ Redis (session store, optionnel)
[.NET Core API] -> Validate JWT via Keycloak JWKS or introspection
```

- oauth2-proxy joue le rôle central : gestion du flow OIDC, session côté serveur (ou cookie chiffré), établissement de cookie d'auth, proxy des requêtes vers les upstreams seulement si session valide.
- Le front (Vue) est livré **uniquement** si l'utilisateur a une session active. Le SPA n'héberge **aucun** refresh token côté client.

---

## Composants (détails et responsabilités)

### oauth2-proxy (stand‑alone)
- *Responsabilités principales* :
  - Initiation du flux OIDC vers Keycloak (Authorization Code).
  - Gestion de la session utilisateur (cookie sécurisé) — options : cookie chiffré signé par oauth2-proxy, ou session store Redis pour persistance/scale.
  - Proxy des requêtes entrantes vers les upstreams seulement après authentification.
  - Injection optionnelle d'en-têtes d'identité (`X-Auth-User`, `X-Auth-Email`, `Authorization: Bearer <access_token>` si configuré) vers les upstreams.
  - Endpoints : `/oauth2/start`, `/oauth2/callback`, `/oauth2/sign_out` (ou équivalents).
- *Configuration recommandée* : client *confidential* dans Keycloak (client secret connu par oauth2-proxy), Authorization Code flow, refresh token rotation si Keycloak supporte.
- *Session store* :
  - Pour production, utiliser un **store centralisé** (Redis) si plusieurs instances oauth2-proxy seront déployées. En test, cookie-only chiffré peut suffire.
- *TLS & sécurité* : TLS termination au niveau d'oauth2-proxy (ou load balancer devant lui). Cookie : `HttpOnly; Secure; SameSite=Strict`.

### Keycloak
- *Responsabilités* : Identity provider OIDC, gestion des utilisateurs, roles & mappers.
- *Paramètres recommandés* :
  - Flow : **Authorization Code** (client confidential).
  - Access token court (5–15 min), refresh token avec rotation et expiration raisonnable.
  - Redirect URI vers `https://domain.com/oauth2/callback` (ou chemin choisi par oauth2-proxy).

### Static file server (upstream pour /app)
- Serveur simple (Nginx, static web server, ou même Kestrel static files) mais **derrière** oauth2-proxy. Ne doit pas être exposé publiquement.
- Sert `index.html`, CSS, JS, JSON (config) **uniquement** si la requête est proxée par oauth2-proxy et que la session est valide.

### .NET Core API (Kestrel)
- La API attend des requêtes proxées par oauth2-proxy. Deux modes recommandés :
  1. **Authoritative validation** : oauth2-proxy n'injecte pas d'`Authorization` ; la API exige un JWT et valide le JWT en local via Keycloak JWKS (recommandé si clients peuvent appeler directement).
  2. **Proxy-forwarded token** (mode courant ici) : oauth2-proxy forwarde `Authorization: Bearer <access_token>` et la API valide le token (signature via JWKS, vérification `aud`, `iss`, `exp`).
- *Best practice* : valider les claims côté API (roles, scopes) et ne jamais se baser uniquement sur en-têtes injectés sans validation cryptographique.

---

## Flow d'authentification (séquence)
1. L'utilisateur accède `GET https://domain.com/app/`.
2. oauth2-proxy détecte absence de session/cookie → redirige vers Keycloak (Authorization Code).
3. L'utilisateur authentifié sur Keycloak est redirigé vers oauth2-proxy `/oauth2/callback` avec `code`.
4. oauth2-proxy échange `code` + client secret auprès de Keycloak → reçoit `access_token` (+ `refresh_token` si demandé).
5. oauth2-proxy établit une session (cookie chiffré ou session id stocké en Redis) et pose le cookie au navigateur.
6. oauth2-proxy proxie ensuite la requête vers le static file server et sert `index.html` / `app.*.js` / `styles.css`.
7. Le SPA démarre ; toutes les requêtes vers `/api/*` vont aussi passer par oauth2-proxy (même domaine) qui ajoute l'en-tête `Authorization` côté upstream si configuré.
8. La API .NET Core valide le token puis traite la requête.
9. Quand l'access_token expire, oauth2-proxy utilise le `refresh_token` côté serveur pour obtenir un nouveau token (rotation).
10. Logout : oauth2-proxy supprime la session + redirige vers Keycloak end_session endpoint si nécessaire.

---

## Configuration et paramètres clés (recommandations)

### oauth2-proxy
- **Provider** : generic OIDC (Keycloak).  
- **Client type** : `confidential`, stocker client secret dans vault/secret manager.  
- **Cookie settings** : `HttpOnly`, `Secure`, `SameSite=Strict`, `SameSiteLax` si besoin pour sous-domaines. Cookie encryption/signing active.
- **Session storage** : Redis pour HA, sinon cookie-sessions chiffrés pour simplicité.  
- **Forward Authorization** : activer la transmission de `Authorization` vers upstream si tu veux que la API reçoive le `access_token`. Sinon, passer l'utilisateur via en-têtes d'identité mais exiger validation côté API.
- **Scopes** : `openid profile email` + scopes custom si nécessaire (ex: `roles`).

### Keycloak
- **Access token lifespan** : 5–15 min.  
- **Refresh token** : rotation activée, expiration entre 1h–24h selon tolérance sécurité.  
- **Client** : redirect URI configurée, `service accounts` si besoin d'app-to-app.  
- **JWKS** : exposé pour vérification par la API.

### .NET Core API
- **Validation JWT** : utiliser middleware JWT (Microsoft.IdentityModel.Tokens) -> configurer `Authority` (Keycloak issuer), `Audience`, token validation parameters.  
- **Claim mapping** : mapper `roles`/`scope` selon logique métier.
- **CSRF** : si tu dépends de cookies côté API, protéger les endpoints mutatifs via token CSRF. Si tout passe par `Authorization: Bearer`, CSRF devient moins critique mais rester vigilant.

### Vue SPA
- **Ne pas stocker** access/refresh tokens dans localStorage/sessionStorage.  
- SPA fait des appels `/api/*` relatifs ; le navigateur enverra le cookie de session, oauth2-proxy fera le proxy/injection du token.
- Pour personnalisation utilisateur, le front peut appeler `/api/session` ou `/api/profile` pour récupérer le profil une fois le SPA chargé.

---

## Sécurité (mesures obligatoires et recommandations)
- **TLS** partout (client<->oauth2-proxy<->Keycloak<->upstreams). HSTS.  
- **Cookies** : `HttpOnly; Secure; SameSite=Strict`.  
- **Token handling** : refresh tokens _jamais_ exposés au navigateur. Rotation activée.  
- **CSP & SRI** : Content Security Policy stricte, Subresource Integrity pour scripts critiques.  
- **Cache control** : `Cache-Control: private, no-store` pour réponses sensibles.  
- **JWT validation** : APIs valident signature via JWKS et claims (`aud`, `iss`, `exp`).  
- **Session invalidation** : support de logout et de révocation côté Keycloak.  
- **Protection contre replay** : short-lived access tokens + rotation.  
- **Logs & monitoring** : authentications, refresh failures, erreurs d'introspection.  
- **NTP** : synchronisation d'horloge sur tous les nœuds (JWT expiry).  

---

## Scalabilité & haute disponibilité
- **Stateless oauth2-proxy** : possible si sessions chiffrées dans cookie ; pour scale réel, utiliser Redis session store.  
- **Load balancing** : mettre un LB devant plusieurs instances oauth2-proxy pour HA (même si en prod tu souhaites garder "stand‑alone", prévoir LB pour tolérance).  
- **Keycloak** : déployer en cluster (DB partagé) pour haute disponibilité.  
- **.NET API** : horizontal scale, stateless si possible; utiliser Redis pour cache/locks si nécessaire.

---

## Flux d'erreur & cas limites
- **Refresh token expiré** : rediriger vers login Keycloak.  
- **Rejection côté API (token invalide)** : répondre 401 et (si pertinent) rediriger client vers login.  
- **Session store inaccessible (Redis down)** : prévoir fallback en mode dégradé (par ex. cookie-only si précédemment configuré) ou afficher message maintenance.

---

## Checklist de déploiement (minimale)
- [ ] Keycloak realm + client (confidential) créés et testés en dev.  
- [ ] oauth2-proxy configuré (client secret sécurisé), endpoints callback OK.  
- [ ] Static file server non-exposé, accessible uniquement par oauth2-proxy.  
- [ ] .NET Core API configurée pour valider JWT (issuer, audience).  
- [ ] Session store Redis (optionnel) déployé si scalabilité.  
- [ ] TLS & HSTS activés.  
- [ ] CSP & SRI mis en place.  
- [ ] Tests de bout en bout : login -> récupération assets -> appels API.  
- [ ] Tests sécurité (XSS, CSRF, pentest basique).  

---

## Points d'attention spécifiques à ce choix technique
- **oauth2-proxy** est solide pour protéger routes et assets sans écrire un BFF complet, mais :
  - Il **ne remplace pas** la validation token côté API : la confiance doit être cryptographique (JWT validation).  
  - Selon la version, il y a plusieurs options de stockage de session (cookie vs Redis) — choisir celle adaptée au modèle d'ops.  
- **Vue.js** : l'app ne doit pas implémenter de logique de refresh token côté client. Elle s'appuie sur l'existence de la session (cookie) et sur le proxy pour l'accès aux APIs.  
- **.NET Core** : déployer des middlewares pour validation JWT et gestion des erreurs 401/403 claire.

---

## Suggestions d'évolution (après MVP)
- Passer à un load balancer devant oauth2-proxy pour HA.  
- Ajouter introspection côté API pour tokens opaques si vous préférez opaque tokens à JWT.  
- Intégrer SSO multi-app via Keycloak realm.  
- Ajouter observabilité : traces distributed (OpenTelemetry), metrics Keycloak + oauth2-proxy.

---
