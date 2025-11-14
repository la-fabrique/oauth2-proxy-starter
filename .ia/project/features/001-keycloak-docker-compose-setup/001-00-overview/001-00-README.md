# Feature 001 : keycloak-docker-compose-setup

## Objectif

Avoir un docker compose avec un Keycloak, une base de données et Mailpit. Le Keycloak doit être configurable par code (realm, client app, etc.). Il faut utiliser les plugins multitenant (anarsultanov/keycloak-multi-tenancy) et home idp discovery (sventorben/keycloak-home-idp-discovery). Keycloak doit être configuré pour envoyer les emails vers Mailpit. L'objectif est un POC qui se lance via docker compose dans un environnement de développement.

## Périmètre

### Inclus
- Docker Compose avec Keycloak, base de données et Mailpit
- Configuration de Keycloak par code (realm, client, etc.)
- Installation et configuration des plugins :
  - anarsultanov/keycloak-multi-tenancy (multitenant)
  - sventorben/keycloak-home-idp-discovery (home idp discovery)
- Configuration SMTP de Keycloak pour envoyer les emails vers Mailpit
- Interface web Mailpit accessible pour consulter les emails reçus
- Environnement de développement / POC
- Scripts et configurations nécessaires pour le démarrage

### Exclu
- Configuration pour la production
- TLS/HTTPS (optionnel pour POC/dev)
- Intégration avec d'autres services (oauth2-proxy, API, etc.)
- Configuration avancée de sécurité pour production

## Dépendances

Aucune (feature de départ)

## Livrables

- Fichier `docker-compose.yml` fonctionnel avec Keycloak, base de données et Mailpit
- Configuration Keycloak par code (realm, client, etc.)
- Configuration SMTP de Keycloak pointant vers Mailpit
- Scripts d'initialisation pour les plugins Keycloak
- Documentation de démarrage rapide
- Fichiers de configuration nécessaires (variables d'environnement, etc.)

## Critères d'acceptation

- ✅ Le docker-compose démarre sans erreur
- ✅ Les plugins sont installés et fonctionnels
- ✅ Le realm et le client sont créés automatiquement
- ✅ La base de données est configurée et connectée
- ✅ Keycloak est accessible
- ✅ Mailpit est accessible et fonctionnel
- ✅ La configuration SMTP de Keycloak est opérationnelle
- ✅ Les emails envoyés par Keycloak arrivent dans Mailpit

