# tasks-done

Marquer une tâche comme complétée dans le fichier task-list d'une feature.

## Process

1. **Demander les informations de la feature et de la tâche**:
   - Demander à l'utilisateur **dans la langue de l'utilisateur** le numéro ou le nom de la feature pour laquelle marquer une tâche comme complétée
   - Demander à l'utilisateur **dans la langue de l'utilisateur** la tâche à marquer comme complétée
     - L'utilisateur peut fournir:
       - L'identifiant de la tâche (ex: `001-21-test-keycloak-accessibility`)
       - Le texte exact de la tâche (correspondance complète ou partielle)
       - Le nom de la section et le numéro de la tâche (ex: "Tests et validation, tâche 001-21")
       - Un mot-clé unique de la tâche
   - Si l'utilisateur fournit seulement des informations partielles, rechercher les tâches correspondantes et présenter les options

2. **Localiser le fichier task-list**:
   - Extraire le numéro de la feature (format: `001`, `002`, etc.)
   - Rechercher le fichier task-list selon le pattern suivant:
     - `.ia/project/features/{feature-number}-{feature-title}/{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
   - Si le fichier n'est pas trouvé:
     - Lister les features disponibles dans `.ia/project/features/` pour aider l'utilisateur
     - Informer l'utilisateur **dans la langue de l'utilisateur** et arrêter le processus

3. **Lire le fichier task-list**:
   - Lire le fichier task-list pour comprendre sa structure
   - Identifier toutes les tâches et leur statut actuel
   - Noter les sections (ex: "Configuration Docker Compose", "Configuration Keycloak par code", "Tests et validation", "Documentation")

4. **Trouver la tâche correspondante**:
   - Rechercher la tâche qui correspond à l'entrée de l'utilisateur
   - Si plusieurs tâches correspondent:
     - Présenter toutes les tâches correspondantes à l'utilisateur **dans la langue de l'utilisateur**
     - Demander à l'utilisateur de sélectionner quelle tâche marquer comme complétée
   - Si aucune tâche ne correspond:
     - Présenter les tâches disponibles groupées par section
     - Demander à l'utilisateur **dans la langue de l'utilisateur** de sélectionner la tâche correcte
   - Si exactement une tâche correspond, procéder à l'étape suivante

5. **Vérifier le statut actuel**:
   - Vérifier si la tâche est déjà marquée comme complétée (`- [x]`)
   - Si déjà complétée:
     - Informer l'utilisateur **dans la langue de l'utilisateur** que la tâche est déjà marquée comme complétée
     - Demander s'il souhaite la démarquer (changer `- [x]` en `- [ ]`) ou si c'est une erreur
     - Si démarquage, procéder à l'étape 6 avec l'opération inverse
   - Si non complétée, procéder à l'étape 6

6. **Mettre à jour le fichier task-list**:
   - Trouver la tâche dans le fichier
   - Changer `- [ ]` en `- [x]` pour la marquer comme complétée (ou `- [x]` en `- [ ]` si démarquage)
   - Préserver tout le formatage, l'indentation et le contenu environnant
   - Sauvegarder le fichier task-list mis à jour

7. **Confirmer la complétion**:
   - Informer l'utilisateur **dans la langue de l'utilisateur** que la tâche a été marquée comme complétée (ou démarquée si c'était l'opération)
   - Afficher la tâche mise à jour pour confirmation
   - Optionnellement afficher la section et le contexte de la tâche mise à jour

8. **Vérifier le statut de complétion** (optionnel):
   - Si demandé par l'utilisateur ou si cela semble pertinent:
     - Compter combien de tâches sont complétées vs le total des tâches
     - Afficher la progression par section
     - Identifier les tâches restantes à compléter

## Guidelines

- **Poser des questions dans la langue de l'utilisateur**: Toutes les questions et interactions avec l'utilisateur doivent être menées dans la langue que l'utilisateur utilise
- **Être précis**: Lorsque plusieurs tâches correspondent, présenter clairement toutes les options pour éviter les erreurs
- **Préserver le formatage**: Maintenir le formatage exact du fichier task-list (indentation, espacement, syntaxe markdown)
- **Gérer les cas limites**: 
  - Si la tâche est déjà complétée, informer l'utilisateur et proposer de la démarquer
  - Si la tâche ne peut pas être trouvée, fournir des suggestions utiles basées sur les tâches disponibles
- **Vérifier avant de mettre à jour**: Toujours confirmer quelle tâche sera mise à jour avant d'effectuer les modifications
- **Respecter la structure du fichier**: Ne pas modifier les sections, en-têtes ou autres tâches
- **Fournir du contexte**: Lors de la confirmation, afficher le nom de la section et le contexte environnant pour aider l'utilisateur à vérifier que la bonne tâche a été mise à jour

## Exemple

Si l'utilisateur souhaite marquer une tâche comme complétée pour la feature `001-keycloak-docker-compose-setup`:

1. L'utilisateur fournit: Feature `001` ou `001-keycloak-docker-compose-setup`, tâche `001-21-test-keycloak-accessibility` ou "test-keycloak-accessibility"
2. Localiser le fichier: `.ia/project/features/001-keycloak-docker-compose-setup/001-00-overview/001-00-tasks-list.md`
3. Lire le task-list: Trouver toutes les tâches, identifier les sections
4. Trouver la tâche correspondante: Rechercher "001-21-test-keycloak-accessibility" → Trouvée dans la section "Tests et validation"
5. Vérifier le statut: La tâche est actuellement `- [ ]` (non complétée)
6. Mettre à jour le fichier: Changer `- [ ] **001-21-test-keycloak-accessibility**` en `- [x] **001-21-test-keycloak-accessibility**`
7. Confirmer: "La tâche '001-21-test-keycloak-accessibility' dans la section 'Tests et validation' a été marquée comme complétée."

Si l'utilisateur fournit des informations partielles comme "test-keycloak":
- La recherche trouve plusieurs correspondances: "001-21-test-keycloak-accessibility", "001-23-test-database-connection" (si de telles tâches existent)
- Présenter les deux options à l'utilisateur et demander laquelle marquer

Si la tâche est déjà complétée:
- Informer: "La tâche '001-21-test-keycloak-accessibility' est déjà marquée comme complétée. Souhaitez-vous la démarquer ?"

