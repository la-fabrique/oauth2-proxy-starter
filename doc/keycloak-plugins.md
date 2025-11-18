# Configuration des plugins Keycloak

## Comportement automatique

Les plugins Keycloak sont **automatiquement détectés et chargés** par Keycloak lorsqu'ils sont placés dans le répertoire `/opt/keycloak/providers/` (monté depuis `./keycloak-plugins/` via Docker volume).

## Plugins installés

Les plugins suivants sont installés et disponibles :

1. **keycloak-multi-tenancy** (anarsultanov/keycloak-multi-tenancy)
   - Version : 26.1.0
   - Fichier : `keycloak-multi-tenancy-26.1.0.jar`
   - Description : Extension Keycloak pour créer un IAM multi-tenant pour les applications SaaS B2B

2. **keycloak-home-idp-discovery** (sventorben/keycloak-home-idp-discovery)
   - Version : 26.1.1
   - Fichier : `keycloak-home-idp-discovery.jar`
   - Description : Plugin pour la découverte automatique du fournisseur d'identité (IdP) d'origine

## Activation

Les plugins sont **automatiquement activés** au démarrage de Keycloak. Aucune configuration supplémentaire n'est nécessaire pour les rendre disponibles.

## Utilisation

Une fois Keycloak démarré, les plugins sont disponibles dans l'interface d'administration Keycloak et peuvent être utilisés dans les realms configurés.

Pour vérifier que les plugins sont bien chargés :
1. Connectez-vous à l'interface d'administration Keycloak (http://localhost:8080)
2. Allez dans la section "Server Info" ou "Providers"
3. Vérifiez que les plugins sont listés

## Configuration spécifique des plugins

Si une configuration spécifique est nécessaire pour utiliser les plugins dans un realm, consultez la documentation de chaque plugin :
- [keycloak-multi-tenancy](https://github.com/anarsultanov/keycloak-multi-tenancy)
- [keycloak-home-idp-discovery](https://github.com/sventorben/keycloak-home-idp-discovery)

## Notes

- Les plugins sont montés via un volume Docker : `./keycloak-plugins:/opt/keycloak/providers`
- Les modifications des fichiers JAR nécessitent un redémarrage de Keycloak pour être prises en compte
- Les plugins sont disponibles pour tous les realms configurés dans Keycloak

