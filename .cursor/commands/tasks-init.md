# task-new

Create a detailed task specification for a feature task that enables an LLM to execute the task.

## Process

1. **Request feature and task information**:
   - Ask the user **in the user's language** for the feature number or name for which to create the task specification
   - Ask the user **in the user's language** for the task identifier or name (format: `{feature-number}-{task-number}-{task-name}` or just the task number)
   - If the user provides only the task number, extract the feature number from context or ask for it

2. **Verify feature prerequisites**:
   - Verify that the feature directory exists in `.ia/project/features/`
   - Verify that the following files exist in the feature directory:
     - `{feature-number}-00-overview/{feature-number}-00-README.md`
     - `{feature-number}-00-overview/{feature-number}-00-checklist.md`
     - `{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
   - If prerequisites are not met, inform the user **in the user's language** and stop the process

3. **Verify task exists in the list**:
   - Read the file `{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
   - Search for the requested task in the task list
   - Extract task information:
     - Task description
     - Expected deliverable
     - Verification method
     - Checklist items covered
   - If the task does not exist in the list, inform the user **in the user's language** and stop the process

4. **Read feature context and identify task boundaries**:
   - Read `{feature-number}-00-overview/{feature-number}-00-README.md` to understand:
     - Primary objective of the feature
     - Scope (included/excluded)
     - Dependencies
     - Expected deliverables
     - Acceptance criteria
   - Read `{feature-number}-00-overview/{feature-number}-00-checklist.md` to identify:
     - Technical validation points
     - Functional tests
     - Required configurations
     - Documentation items
   - **CRITICAL: Analyze subsequent tasks in the list** to identify what should NOT be included:
     - Read all tasks with numbers higher than the current task
     - Identify configurations, details, or steps that are explicitly mentioned in subsequent tasks
     - Mark these as OUT OF SCOPE for the current task
   - Read previous tasks (if any) to understand dependencies and what has already been done

5. **Create task structure**:
   - Extract the feature number (format: `001`, `002`, etc.)
   - Extract the task number (format: `01`, `02`, etc.)
   - Extract the task name (kebab-case format)
   - Create the directory: `.ia/project/features/{feature-number}-{feature-title}/{feature-number}-{task-number}-{task-name}/`
   - Create the file: `.ia/project/features/{feature-number}-{feature-title}/{feature-number}-{task-number}-{task-name}/{feature-number}-{task-number}-{task-name}.md`

6. **Write task specification**:
   - Create the file content with the following structure:
     ```markdown
     # Task {feature-number}-{task-number} : {Task Name}
     
     ## Context
     
     This task is part of feature {feature-number}-{feature-title}.
     Feature objective: {primary objective of the feature}
     
     ## Description
     
     {Detailed description of the task based on the task list entry}
     
     ## Objective
     
     {Clear objective of what this task should achieve}
     
     ## Expected Deliverables
     
     {List of expected deliverables, extracted from the task list}
     
     ## Execution Steps
     
     {Detailed steps that an AI should follow to complete this task:
     - Step 1: ...
     - Step 2: ...
     - Step 3: ...
     }
     
     ## Verification
     
     {How to verify the task is complete, extracted from the task list}
     
     ## Checklist Items Covered
     
     {List of checklist items this task covers, extracted from the task list}
     
     ## Dependencies
     
     {List of other tasks that must be completed before this one, if any}
     
     ## Notes and Considerations
     
     {Any additional notes, technical considerations, or important information}
     ```
   
   - Fill each section based on:
     - **PRIMARY SOURCE: Information extracted from the task list** (description, deliverable, verification, checklist)
     - Feature context (README, checklist) for understanding only, not for adding scope
     - **STRICT SCOPE ENFORCEMENT**: 
       - Only include steps and configurations explicitly mentioned in the task's deliverable and verification
       - Do NOT include configurations that are explicitly mentioned in subsequent tasks
       - If a subsequent task mentions "configure X with Y", do NOT include "Y" in the current task
       - If a subsequent task mentions "configure X with Y", the current task should only create the minimal structure for X, without Y
     - Previous tasks to understand dependencies and what already exists
     - Project best practices (only for guidance, not for expanding scope)

7. **Present the specification**:
   - Display the generated specification to the user
   - Ask for confirmation or adaptation **in the user's language**:
     - Is the description complete?
     - Are the execution steps clear?
     - Are there any missing elements?
     - Are the dependencies correct?
     - **Does the specification respect the task boundaries (not including elements from subsequent tasks)?**

8. **Finalize and save**:
   - Once the specification is validated by the user:
     - Save the file in the created directory
     - Confirm to the user **in the user's language** that the specification has been created

## Guidelines

- **Ask questions in the user's language**: All questions and interactions with the user should be conducted in the language the user is using
- **Be thorough but stay in scope**: The specification must contain enough detail for an LLM to execute the task without ambiguity, BUT must strictly respect the task boundaries
- **Respect the format**: Use the format `{feature-number}-{task-number}-{task-name}` for task identifiers
- **Include context**: Always include the feature context so the task is understood as part of the whole
- **Detail the steps**: Execution steps must be specific, measurable, and actionable, but ONLY for what is in the task's scope
- **Identify dependencies**: Analyze other tasks to identify logical dependencies
- **Use French for specification content**: All content in the task specification file should be in French (as per existing project documents)
- **Task title in header should be in English**: Follow the existing pattern (as in the task list)
- **Extract information from the list**: Use information from the task list (description, deliverable, verification, checklist) as the PRIMARY and STRICT source
- **Enrich with context**: Enhance with information from the feature README and checklist ONLY for understanding context, not for expanding scope
- **CRITICAL - Respect task boundaries**: 
  - Before writing execution steps, analyze ALL subsequent tasks in the task list
  - If a subsequent task explicitly mentions configuring something (e.g., "configure PostgreSQL with volumes"), do NOT include that configuration in the current task
  - If a subsequent task mentions "configure X with Y", the current task should only create the minimal structure for X, without Y
  - When in doubt, prefer a minimal implementation that matches the task's deliverable and verification criteria exactly
- **Scope validation**: 
  - Each execution step must be directly justified by the task's deliverable or verification criteria
  - If a step cannot be justified by the task list entry, it should be removed or moved to a note about future tasks
  - The verification section should only check what is explicitly mentioned in the task list

## Example

If the user wants to create a specification for task `001-01-create-docker-compose-base` from feature `001-keycloak-docker-compose-setup`:

- Verify feature exists: `.ia/project/features/001-keycloak-docker-compose-setup/`
- Verify files: `001-00-overview/001-00-README.md`, `001-00-overview/001-00-checklist.md`, `001-00-overview/001-00-tasks-list.md`
- Read task list and find `001-01-create-docker-compose-base`
- Extract: description (Create docker-compose.yml file with base services), deliverable (docker-compose.yml file with three services configured), verification (docker-compose.yml file exists and contains Keycloak, PostgreSQL and Mailpit services)
- **CRITICAL: Analyze subsequent tasks**:
  - 001-02: "configure PostgreSQL with volumes and environment variables" → Do NOT include volumes or detailed env vars in 001-01
  - 001-03: "configure Keycloak with environment variables, ports, dependencies" → Do NOT include detailed env vars or dependencies in 001-01
  - 001-04: "configure Mailpit with ports" → Do NOT include port configuration in 001-01
  - 001-05: "configure Docker network" → Do NOT include network configuration in 001-01
- Read README to understand feature objective
- Create directory: `.ia/project/features/001-keycloak-docker-compose-setup/001-01-create-docker-compose-base/`
- Create file: `.ia/project/features/001-keycloak-docker-compose-setup/001-01-create-docker-compose-base/001-01-create-docker-compose-base.md`
- Write specification with:
  - Feature context
  - Detailed task description
  - Execution steps (create file, declare services with minimal structure - image only, no detailed config)
  - Expected deliverables
  - Verification method
  - Checklist items covered
  - Notes explicitly stating that detailed configuration is in subsequent tasks

The specification should look like:

```markdown
# Task 001-01 : create-docker-compose-base

## Context

Cette tâche fait partie de la feature 001-keycloak-docker-compose-setup.
Objectif de la feature : Avoir un docker compose avec un Keycloak, une base de données et Mailpit...

## Description

Créer le fichier docker-compose.yml avec les services de base (Keycloak, base de données PostgreSQL, Mailpit).

## Objective

Créer la structure de base du fichier docker-compose.yml avec les trois services déclarés. Cette tâche établit uniquement la structure minimale permettant de valider que le fichier existe et contient les services. La configuration détaillée de chaque service sera effectuée dans les tâches suivantes.

## Expected Deliverables

- Fichier `docker-compose.yml` à la racine du projet
- Service Keycloak déclaré dans le docker-compose.yml
- Service PostgreSQL déclaré dans le docker-compose.yml
- Service Mailpit déclaré dans le docker-compose.yml

## Execution Steps

1. Créer le fichier `docker-compose.yml` à la racine du projet
2. Définir la version docker-compose (ex: version '3.8')
3. Déclarer le service PostgreSQL avec :
   - Nom du service (ex: `postgres` ou `db`)
   - Image Docker de base (ex: `postgres:15`)
   - Aucune variable d'environnement (sera dans 001-02)
   - Aucun volume (sera dans 001-02)
4. Déclarer le service Keycloak avec :
   - Nom du service (ex: `keycloak`)
   - Image Docker de base (ex: `quay.io/keycloak/keycloak:latest`)
   - Aucune variable d'environnement (sera dans 001-03)
   - Aucune dépendance (sera dans 001-03)
5. Déclarer le service Mailpit avec :
   - Nom du service (ex: `mailpit`)
   - Image Docker de base (ex: `axllent/mailpit`)
   - Aucune configuration de ports (sera dans 001-04)
6. S'assurer que la syntaxe YAML est valide

## Verification

- Le fichier `docker-compose.yml` existe à la racine du projet
- Le fichier contient les trois services : Keycloak, PostgreSQL et Mailpit
- Chaque service a au minimum un nom et une image Docker définie
- La syntaxe YAML est valide

## Checklist Items Covered

- Checklist - Validation technique - Docker Compose démarre sans erreur (structure de base)
- Checklist - Configuration - Ports exposés correctement (mentionné mais non implémenté dans cette tâche)

## Dependencies

Aucune (première tâche de la feature)

## Notes and Considerations

- Cette tâche crée uniquement la structure minimale du docker-compose.yml
- Les configurations détaillées seront effectuées dans les tâches suivantes :
  - 001-02 : Configuration détaillée de PostgreSQL (volumes, variables d'environnement)
  - 001-03 : Configuration détaillée de Keycloak (variables d'environnement, ports, dépendances)
  - 001-04 : Configuration détaillée de Mailpit (ports)
  - 001-05 : Configuration du réseau Docker
- Le fichier généré ne sera pas fonctionnel sans les configurations des tâches suivantes
- Utiliser des versions stables des images Docker pour éviter les problèmes de compatibilité
```
