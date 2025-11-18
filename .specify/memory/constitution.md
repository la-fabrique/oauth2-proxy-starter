<!--
Sync Impact Report:
Version change: N/A → 1.0.0 (initial constitution)
Modified principles: N/A (new constitution)
Added sections: Core Principles (5), Security & Configuration, Development Workflow, Governance
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section compatible
  ✅ spec-template.md - No direct constitution references
  ✅ tasks-template.md - No direct constitution references
  ⚠️ Follow-up: Review all command files in .cursor/commands/ for agent-specific references
Follow-up TODOs: None
-->

# OAuth Starter Kit Constitution

## Core Principles

### I. Security-First OAuth2/OIDC Architecture
Toute fonctionnalité d'authentification et d'autorisation DOIT respecter les standards OAuth2/OIDC. L'architecture BFF (Backend For Frontend) via oauth2-proxy est obligatoire pour protéger les applications en amont. Les tokens JWT DOIVENT être validés côté serveur avec vérification de l'issuer, de l'audience (si applicable) et de la durée de vie. Les secrets et credentials ne DOIVENT JAMAIS être hardcodés dans le code source ou les fichiers de configuration versionnés.

**Rationale**: La sécurité est la priorité absolue dans un projet OAuth2/OIDC. L'architecture BFF isole les tokens sensibles du frontend, réduisant les risques d'exposition. La validation stricte des tokens garantit l'intégrité de l'authentification.

### II. Documentation Complète et Maintenue
Toute fonctionnalité, configuration ou processus DOIT être documenté dans le dossier `doc/`. La documentation DOIT inclure : vue d'ensemble, dépendances, étapes de configuration, exemples d'utilisation, et guides de test. Les fichiers de configuration DOIVENT être accompagnés de commentaires explicatifs. Les changements majeurs DOIVENT être documentés avant l'implémentation.

**Rationale**: Un kit de démarrage doit servir de référence complète. La documentation exhaustive facilite l'adoption, réduit les erreurs de configuration, et permet la maintenance à long terme.

### III. Configuration via Variables d'Environnement
Tous les secrets, credentials, et paramètres sensibles DOIVENT être gérés via des variables d'environnement. Un fichier `.env.example` DOIT exister pour documenter les variables requises. Le fichier `.env` réel NE DOIT PAS être versionné (doit être dans `.gitignore`). Les valeurs par défaut pour le développement local DOIVENT être documentées.

**Rationale**: La séparation des secrets de la configuration versionnée est une pratique de sécurité essentielle. Le fichier `.env.example` guide les développeurs sans exposer de données sensibles.

### IV. Architecture Modulaire et Conteneurisée
Le projet DOIT être organisé en packages modulaires (`api`, `front`, `others`). Chaque composant DOIT être conteneurisable via Docker. Le `docker-compose.yml` DOIT orchestrer tous les services nécessaires (Keycloak, oauth2-proxy, API, frontend). Les services DOIVENT être configurés pour fonctionner ensemble via le réseau Docker.

**Rationale**: L'architecture modulaire facilite le développement, les tests, et le déploiement. La conteneurisation garantit la reproductibilité et simplifie l'intégration des différents composants.

### V. Testabilité et Validation
Chaque fonctionnalité d'autorisation DOIT être testable avec différents utilisateurs et rôles. Les guides de test DOIVENT documenter les scénarios de test avec des utilisateurs de test prédéfinis. Les configurations de test DOIVENT être reproductibles et documentées. Les tests d'intégration DOIVENT valider le flux OAuth2 complet (authentification → token → autorisation).

**Rationale**: La testabilité est cruciale pour valider les politiques d'autorisation complexes. Des guides de test clairs permettent de vérifier rapidement que les permissions fonctionnent correctement.

## Security & Configuration

### Gestion des Secrets
- Les secrets DOIVENT être stockés dans des variables d'environnement
- Le fichier `.env.example` DOIT documenter toutes les variables requises
- Les secrets générés (comme `OAUTH2_PROXY_COOKIE_SECRET`) DOIVENT inclure des instructions de génération dans la documentation
- Les credentials Keycloak DOIVENT être obtenus via l'interface admin, jamais hardcodés

### Configuration Keycloak
- La configuration Keycloak DOIT être versionnée via des fichiers JSON d'import de realm
- Les rôles realm et application DOIVENT être documentés avec leur usage
- Les clients OAuth2 DOIVENT être configurés selon les standards (client ID, secret, redirect URIs)
- Les mappings de rôles dans les tokens JWT DOIVENT être cohérents entre Keycloak et l'API

### Configuration oauth2-proxy
- oauth2-proxy DOIT être configuré comme reverse proxy BFF
- Les routes upstream DOIVENT être clairement définies et documentées
- La configuration DOIT supporter le développement local (HTTP autorisé) et la production (HTTPS requis)

## Development Workflow

### Structure du Projet
- Le code source DOIT être organisé dans `packages/` par composant (api, front, others)
- La documentation DOIT être dans `doc/` à la racine
- Les configurations Docker DOIVENT être dans `packages/others/`
- Les spécifications de features DOIVENT suivre la structure `.specify/` si utilisée

### Processus de Développement
- Les nouvelles fonctionnalités DOIVENT être documentées avant l'implémentation
- Les changements de configuration DOIVENT être testés avec les utilisateurs de test prédéfinis
- Les modifications d'autorisation DOIVENT être validées avec le guide de test Keycloak RBAC
- Les commits DOIVENT inclure des messages clairs décrivant les changements

### Qualité et Maintenance
- Le code DOIT suivre les conventions du langage (C# pour API, TypeScript pour frontend)
- Les dépendances DOIVENT être à jour et documentées
- Les breaking changes DOIVENT être documentés dans le README ou les release notes

## Governance

Cette constitution définit les principes non-négociables pour le développement et la maintenance du OAuth Starter Kit. Elle prime sur toutes les autres pratiques du projet.

### Amendements
- Les amendements DOIVENT être documentés avec justification
- La version DOIT être incrémentée selon le versioning sémantique :
  - **MAJOR** : Suppression ou redéfinition majeure de principes, changements incompatibles
  - **MINOR** : Ajout de nouveaux principes ou sections, expansion matérielle des règles
  - **PATCH** : Clarifications, corrections de typo, raffinements non-sémantiques
- La date de dernière modification DOIT être mise à jour lors de chaque amendement

### Conformité
- Toutes les PRs et reviews DOIVENT vérifier la conformité avec cette constitution
- Les violations DOIVENT être justifiées dans la section "Complexity Tracking" des plans d'implémentation
- La complexité ajoutée DOIT être justifiée par rapport aux alternatives plus simples

### Guidance de Développement
- Le README principal fournit les instructions de démarrage rapide
- La documentation dans `doc/` fournit les détails de configuration et d'utilisation
- Les guides de test fournissent les procédures de validation

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
