# next

Identify the next pending task and execute it by calling `/tasks-init` and `/tasks-do` commands.

## Process

1. **Identify the next pending task**:
   - Read the features list file: `.ia/project/features/000-overview/000-features-list.md`
   - For each feature in order, check if it has a task list file: `.ia/project/features/{feature-number}-{feature-title}/{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
   - For each feature with a task list:
     - Read the task list file
     - Parse all tasks in the list (format: `- [ ] **{feature-number}-{task-number}-{task-name}**` or `- [x] **{feature-number}-{task-number}-{task-name}**`)
     - Find the first task marked as incomplete (`- [ ]`) that does not have a task specification directory yet
     - If a task is marked as incomplete (`- [ ]`) but has a specification directory, check if it's the next task to execute
     - Stop at the first incomplete task found
   - If no incomplete task is found in any feature, inform the user **in the user's language** that all tasks are completed and stop the process

2. **Present the identified task**:
   - Display the task identifier (format: `{feature-number}-{task-number}-{task-name}`)
   - Display the task description from the task list
   - Display the expected deliverable
   - Inform the user **in the user's language** about the identified task

3. **Ask for technical and functional choices**:
   - Before proceeding with task initialization and execution, ask the user **in the user's language**:
     - "Are there any technical or functional choices you need to make before proceeding with this task?"
     - "Do you have any preferences, constraints, or decisions regarding this task?"
   - Wait for the user's response
   - If the user provides choices, preferences, or decisions:
     - Document them clearly
     - Inform the user that these will be considered during task execution
   - If the user confirms there are no choices to make, proceed to the next step

4. **Call `/tasks-init` command**:
   - Execute the `/tasks-init` command with the task identifier as parameter
   - The command should be called with the full task identifier: `{feature-number}-{task-number}-{task-name}` or `{feature-number}-{task-number}`
   - Wait for the `/tasks-init` command to complete
   - If `/tasks-init` fails or encounters an error:
     - Inform the user **in the user's language** about the issue
     - Stop the process and do not proceed to `/tasks-do`

5. **Call `/tasks-do` command**:
   - After successful completion of `/tasks-init`, execute the `/tasks-do` command with the task identifier as parameter
   - The command should be called with the full task identifier: `{feature-number}-{task-number}-{task-name}` or `{feature-number}-{task-number}`
   - Wait for the `/tasks-do` command to complete
   - If `/tasks-do` fails or encounters an error:
     - Inform the user **in the user's language** about the issue
     - Provide guidance on how to resolve the issue

6. **Report completion**:
   - After both commands complete successfully, inform the user **in the user's language** that the task has been initialized and executed
   - Ask if the user wants to proceed with the next task (optionally call this command again)

## Guidelines

- **Ask questions in the user's language**: All questions and interactions with the user should be conducted in the language the user is using
- **Identify tasks systematically**: Check features in order and tasks within each feature in order
- **Respect task dependencies**: If a task has dependencies that are not completed, inform the user **in the user's language** and ask if they want to proceed anyway
- **Handle errors gracefully**: If task identification fails, inform the user clearly and provide guidance
- **Document user choices**: If the user provides technical or functional choices, document them for reference during task execution
- **Sequential execution**: Always call `/tasks-init` before `/tasks-do`, and do not proceed to `/tasks-do` if `/tasks-init` fails
- **Task identification priority**: 
  - First, find tasks that are marked as incomplete (`- [ ]`) in the task list
  - Among incomplete tasks, prioritize those that do not have a specification directory yet (need initialization)
  - If all incomplete tasks have specifications, identify the first incomplete task in sequence order

## Example

If the user calls `/next`:

1. Read features list: Find feature `003-vue-spa-application-with-vite-server` is pending
2. Read task list: `.ia/project/features/003-vue-spa-application-with-vite-server/003-00-overview/003-00-tasks-list.md`
3. Parse tasks:
   - `003-01-configure-vite-preview`: `- [x]` (completed)
   - `003-02-create-dockerfile`: `- [x]` (completed)
   - `003-03-configure-docker-compose`: `- [x]` (completed)
   - `003-04-configure-production-build`: `- [x]` (completed)
   - `003-05-configure-vue-router`: `- [ ]` (incomplete, no specification directory found)
4. Identify task: `003-05-configure-vue-router`
5. Present to user **in the user's language**: "La prochaine tâche identifiée est : 003-05-configure-vue-router - Configurer Vue Router pour la navigation dans l'application SPA"
6. Ask user **in the user's language**: "Y a-t-il des choix techniques ou fonctionnels à faire avant de poursuivre l'initialisation et l'exécution de cette tâche ?"
7. User responds: "Non, pas de choix particulier"
8. Call `/tasks-init 003-05-configure-vue-router`
9. After `/tasks-init` completes successfully, call `/tasks-do 003-05-configure-vue-router`
10. Report: "La tâche 003-05-configure-vue-router a été initialisée et exécutée avec succès."

If user provides choices:
6. Ask user: "Y a-t-il des choix techniques ou fonctionnels à faire avant de poursuivre l'initialisation et l'exécution de cette tâche ?"
7. User responds: "Oui, je veux utiliser Vue Router version 4.x et configurer le mode history"
8. Document choices: "Vue Router version 4.x, mode history"
9. Call `/tasks-init 003-05-configure-vue-router` (the command will consider user choices during execution)
10. Call `/tasks-do 003-05-configure-vue-router` (the command will consider user choices during execution)

