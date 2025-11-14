# Features List

This document contains the list of features to be implemented, extracted from project documentation and requirements.

## Features

- [x] **001-keycloak-docker-compose-setup** : Configure Keycloak as OIDC identity provider with realm, confidential client, and OAuth2/OIDC settings. Set up Authorization Code flow, access token lifespan (5-15 min), refresh token rotation, and JWKS endpoint.
  - **Dependencies**: None
  - **Deliverable**: Keycloak realm configuration, client configuration (confidential type), redirect URI setup, token lifespan configuration, JWKS endpoint accessible, documentation of Keycloak setup
  - **Status**: Done

- [x] **002-oauth2-proxy-configuration** : Configure oauth2-proxy as authentication reverse proxy/BFF. Set up OIDC provider connection to Keycloak, client secret management, cookie settings (HttpOnly, Secure, SameSite), cookie-based session storage (no Redis), and upstream routing for /app and /api paths.
  - **Dependencies**: 001-keycloak-docker-compose-setup
  - **Deliverable**: oauth2-proxy configuration file, environment variables/secrets setup, cookie encryption configuration, upstream routing rules, OAuth2 endpoints (/oauth2/start, /oauth2/callback, /oauth2/sign_out), documentation
  - **Status**: Done

- [x] **003-vue-spa-application-with-vite-server** : Develop Vue.js SPA application with Vite and configure the integrated static file server. The application makes relative API calls to /api/* and relies on session cookie and oauth2-proxy for authentication. Vite serves the application assets (index.html, CSS, JS, JSON) and is accessible only through oauth2-proxy (not publicly exposed). The application should not store access/refresh tokens in localStorage/sessionStorage. Implement API calls for user profile/session information (/api/session or /api/profile).
  - **Dependencies**: 002-oauth2-proxy-configuration
  - **Deliverable**: Vue.js application source code with Vite, Vite configuration (vite.config.js), Dockerfile for app service, docker-compose configuration for app service, static file server via Vite (dev and preview modes), build configuration, API service layer, profile/session components, routing setup, integration with oauth2-proxy upstream, documentation
  - **Status**: Done

- [x] **004-dotnet-core-api** : Develop .NET Core API (Kestrel) with JWT validation middleware. Configure JWT validation using Microsoft.IdentityModel.Tokens, validate tokens via Keycloak JWKS, verify claims (aud, iss, exp), implement claim mapping for roles/scopes, and handle 401/403 errors appropriately.
  - **Dependencies**: 001-keycloak-docker-compose-setup, 002-oauth2-proxy-configuration
  - **Deliverable**: .NET Core API project, JWT validation middleware configuration, claim mapping logic, error handling middleware, API endpoints, configuration files
  - **Status**: Done

- [x] **005-keycloak-rbac-roles** : Implement Keycloak RBAC (Role-Based Access Control) with realm roles and application roles. Configure role assignment, role mapping in tokens, and role-based authorization in the API.
  - **Dependencies**: 001-keycloak-docker-compose-setup, 004-dotnet-core-api
  - **Deliverable**: Keycloak realm roles configuration, application roles configuration, role assignment to users, role mapping in access tokens, API authorization based on roles, documentation
  - **Status**: Done

- [ ] **006-security-headers-csp-sri** : Implement Content Security Policy (CSP) headers and Subresource Integrity (SRI) for critical scripts. Configure cache control headers (Cache-Control: private, no-store) for sensitive responses. Ensure security headers are properly set across all components.
  - **Dependencies**: 003-vue-spa-application-with-vite-server, 004-dotnet-core-api
  - **Deliverable**: CSP configuration, SRI implementation for scripts, cache control headers configuration, security headers middleware, documentation
  - **Status**: Pending

- [ ] **007-tls-https-configuration** : Configure TLS/HTTPS for all components (client<->oauth2-proxy<->Keycloak<->upstreams). Enable HSTS headers. Ensure TLS termination at oauth2-proxy level (or load balancer in front). **Note**: Optional for POC/dev environment, required for production.
  - **Dependencies**: 002-oauth2-proxy-configuration, 003-vue-spa-application-with-vite-server, 004-dotnet-core-api
  - **Deliverable**: TLS certificates configuration, HTTPS setup for all components, HSTS headers configuration, TLS termination configuration, documentation
  - **Status**: Pending

