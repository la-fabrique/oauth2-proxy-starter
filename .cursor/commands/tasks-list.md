# tasks-list

Create the list of tasks necessary for an AI to implement a feature.

## Process

1. **Verify prerequisites**: 
   - Ask the user **in the user's language** for the feature number or name for which to create the task list
   - Verify that the feature directory exists in `.ia/project/features/`
   - Verify that `{feature-number}-00-overview/{feature-number}-00-README.md` and `{feature-number}-00-overview/{feature-number}-00-checklist.md` files exist
   - If prerequisites are not met, inform the user **in the user's language** and stop the process

2. **Read and analyze the feature**:
   - Read the feature's `{feature-number}-00-overview/{feature-number}-00-README.md` file to understand:
     - Primary objective
     - Scope (included/excluded)
     - Dependencies
     - Expected deliverables
     - Acceptance criteria
   - Read the `{feature-number}-00-overview/{feature-number}-00-checklist.md` file to identify all validation points:
     - Technical validation
     - Functional tests
     - Configuration
     - Documentation
     - Final validation

3. **Identify necessary actions**:
   - Analyze the objective and deliverables to determine actions an AI must perform
   - Break down the feature into concrete, actionable tasks
   - Each task must be:
     - Specific and measurable
     - Achievable by an AI
     - Logically ordered (respect dependencies between tasks)
     - Aligned with expected deliverables
   - Organize tasks into logical categories (e.g., configuration, development, tests, documentation)
   - **Number each task**: Assign a sequential number to each task using the format `{feature-number}-{task-number}-{task-name}`:
     - `{feature-number}`: The feature number (e.g., `001`, `002`)
     - `{task-number}`: Sequential task number within the feature, starting from `01` (e.g., `01`, `02`, `03`)
     - `{task-name}`: Descriptive task name in kebab-case (e.g., `configure-middleware`, `implement-login-endpoint`)
     - Example: `001-01-configure-authentication-middleware`, `001-02-implement-login-endpoint`

4. **Verify checklist coverage**:
   - For each checklist item, verify that at least one task enables its completion
   - Identify uncovered checklist items and create additional tasks if necessary
   - Ensure all acceptance criteria from the README are covered by tasks

5. **Structure the task list**:
   - Create the list structure with the following format:
     ```markdown
     # Liste des tâches - Feature {number} : {title}
     
     ## Contexte
     
     Cette liste de tâches a été générée pour la feature {number}-{title}.
     Objectif : {primary objective of the feature}
     
     ## Tâches
     
     ### {Category 1}
     
     - [ ] **{number}-{task-number}-{task-name}** : {Task description}
       - Livrable : {What must be produced}
       - Vérification : {How to verify the task is complete}
       - Couvre : {Relevant checklist items}
     
     - [ ] **{number}-{task-number}-{task-name}** : {Task description}
       - Livrable : {What must be produced}
       - Vérification : {How to verify the task is complete}
       - Couvre : {Relevant checklist items}
     
     ### {Category 2}
     
     - [ ] **{number}-{task-number}-{task-name}** : {Task description}
       ...
     
     ## Vérification de couverture
     
     ### Checklist couverte
     - ✅ {Checklist item 1} - Couvert par {number}-{task-number}-{task-name}
     - ✅ {Checklist item 2} - Couvert par {number}-{task-number}-{task-name}
     
     ### Critères d'acceptation couverts
     - ✅ {Acceptance criterion 1} - Couvert par {number}-{task-number}-{task-name}
     - ✅ {Acceptance criterion 2} - Couvert par {number}-{task-number}-{task-name}
     ```

6. **Present the list to the user**:
   - Display the generated task list
   - Ask for confirmation or adaptation **in the user's language**:
     - Are the tasks complete?
     - Are there any missing tasks?
     - Are there tasks to remove or modify?
     - Is the task order correct?
     - Are the categories appropriate?

7. **Finalize and save**:
   - Once the list is validated by the user:
     - Extract the feature number (format: `001`, `002`, etc.)
     - Create the directory `.ia/project/features/{feature-number}-{feature-title}/{feature-number}-00-overview/` if necessary
     - Save the task list to `.ia/project/features/{feature-number}-{feature-title}/{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
     - Confirm to the user **in the user's language** that the list has been saved

## Guidelines

- **Ask questions in the user's language**: All questions and interactions with the user should be conducted in the language the user is using
- **Be thorough**: Ensure all necessary actions are identified
- **Be specific**: Each task must be detailed enough to be executed by an AI
- **Respect logical order**: Organize tasks respecting dependencies (e.g., configuration before development, development before tests)
- **Verify coverage**: Ensure each checklist item and each acceptance criterion is covered by at least one task
- **Use structured format**: Organize tasks into logical categories to facilitate understanding
- **Include metadata**: Each task must indicate its deliverable, verification method, and checklist items it covers
- **Number tasks sequentially**: Each task must have a unique identifier in the format `{feature-number}-{task-number}-{task-name}`:
  - Feature number: zero-padded 3-digit number (e.g., `001`, `002`)
  - Task number: zero-padded 2-digit number starting from `01` (e.g., `01`, `02`, `10`)
  - Task name: descriptive name in kebab-case (lowercase with hyphens)
  - Tasks are numbered sequentially across all categories (e.g., `001-01-...`, `001-02-...`, `001-03-...`)
- All content in the task list file should be in French (as per existing project documents)
- The feature title in the header should be in English (as in the README)

## Example

If the user wants to create a task list for feature `001-user-authentication`:
- Read `001-00-overview/001-00-README.md` to understand: objective (secure user login), scope (login/logout included, password reset excluded), dependencies (Keycloak setup), deliverables (auth endpoints, middleware), acceptance criteria (successful login, token validation)
- Read `001-00-overview/001-00-checklist.md` to identify validation points: technical (endpoints functional, middleware configured, token validation), functional (login flow works, logout works, token refresh works), configuration (OAuth2 client config, redirect URIs), documentation (API docs, authentication flow docs)
- Generate tasks covering: authentication middleware setup, login endpoint implementation, logout endpoint implementation, token validation logic, session management, error handling, API documentation
- Verify coverage: all checklist items mapped to tasks, all acceptance criteria covered
- Directory created: `.ia/project/features/001-user-authentication/001-00-overview/`
- Task list saved to: `.ia/project/features/001-user-authentication/001-00-overview/001-00-tasks-list.md`

The task list might include:

### Configuration et Middleware

- [ ] **001-01-configure-authentication-middleware** : Implémenter le middleware pour valider les tokens JWT et gérer les sessions
  - Livrable : Middleware d'authentification configuré avec validation JWT
  - Vérification : Le middleware intercepte les requêtes et valide les tokens
  - Couvre : Checklist - Validation technique - Middleware d'authentification configuré

- [ ] **001-02-configure-oauth2-keycloak** : Configurer les paramètres de connexion au provider Keycloak (client ID, secret, endpoints)
  - Livrable : Configuration OAuth2 avec les paramètres Keycloak
  - Vérification : La configuration est présente et valide
  - Couvre : Checklist - Configuration - Configuration OAuth2 client configurée

### Endpoints d'authentification

- [ ] **001-03-implement-login-endpoint** : Créer l'endpoint `/api/auth/login` qui initie le flux OAuth2 avec Keycloak
  - Livrable : Endpoint POST `/api/auth/login` fonctionnel
  - Vérification : L'endpoint redirige vers Keycloak pour l'authentification
  - Couvre : Checklist - Tests fonctionnels - Le flux de login fonctionne

- [ ] **001-04-implement-callback-endpoint** : Créer l'endpoint `/api/auth/callback` qui gère le retour depuis Keycloak et échange le code contre un token
  - Livrable : Endpoint GET `/api/auth/callback` qui échange le code et crée la session
  - Vérification : L'endpoint reçoit le code, échange le token et crée la session utilisateur
  - Couvre : Checklist - Tests fonctionnels - Le callback OAuth2 fonctionne

- [ ] **001-05-implement-logout-endpoint** : Créer l'endpoint `/api/auth/logout` qui invalide la session et redirige vers Keycloak
  - Livrable : Endpoint POST `/api/auth/logout` qui invalide la session
  - Vérification : L'endpoint invalide la session et redirige vers Keycloak
  - Couvre : Checklist - Tests fonctionnels - Le flux de logout fonctionne

### Validation et gestion des tokens

- [ ] **001-06-implement-jwt-validation** : Créer la logique de validation des tokens (signature, expiration, claims)
  - Livrable : Fonction de validation JWT avec vérification de signature et expiration
  - Vérification : Les tokens invalides ou expirés sont rejetés
  - Couvre : Checklist - Validation technique - La validation des tokens fonctionne, Critères d'acceptation - Token validation

- [ ] **001-07-implement-session-management** : Créer le système de gestion des sessions utilisateur (création, stockage, invalidation)
  - Livrable : Système de gestion de sessions avec stockage sécurisé
  - Vérification : Les sessions sont créées au login et supprimées au logout
  - Couvre : Checklist - Validation technique - La gestion des sessions fonctionne

### Documentation

- [ ] **001-08-document-authentication-endpoints** : Créer la documentation API pour les endpoints login, callback et logout
  - Livrable : Documentation API avec exemples de requêtes/réponses
  - Vérification : La documentation est complète et accessible
  - Couvre : Checklist - Documentation - Documentation API des endpoints d'authentification

...

