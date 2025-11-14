# tasks-do

Execute a specific task from a feature by reading its specification and implementing what is required.

## Process

1. **Request task identifier**:
   - Ask the user **in the user's language** for the task identifier (format: `{feature-number}-{task-number}` or `{feature-number}-{task-number}-{task-name}`)
   - Examples: `001-01`, `001-01-create-docker-compose-base`
   - If the user provides only the task number (e.g., `01`), extract the feature number from context or ask for it

2. **Locate task specification file**:
   - Extract the feature number (format: `001`, `002`, etc.)
   - Extract the task number (format: `01`, `02`, etc.)
   - Extract the task name if provided, or search for it in the feature directory
   - Search for the task specification file in the following pattern:
     - `.ia/project/features/{feature-number}-{feature-title}/{feature-number}-{task-number}-{task-name}/{feature-number}-{task-number}-{task-name}.md`
   - If the file is not found:
     - List available tasks in the feature directory to help the user
     - Inform the user **in the user's language** and stop the process

3. **Read task specification**:
   - Read the task specification file to understand:
     - Context and feature objective
     - Task description and objective
     - Expected deliverables
     - Execution steps
     - Verification criteria
     - Dependencies
     - Notes and considerations

4. **Check for comments from previous tasks**:
   - Read the task list file: `.ia/project/features/{feature-number}-{feature-title}/{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
   - Search for comments in previous tasks (tasks with numbers lower than the current task number)
   - Look for lines matching the pattern: `  - Note pour la prochaine tâche : {comment content}`
   - Collect all relevant comments from completed previous tasks
   - If comments are found:
     - Present them to the user **in the user's language** with context about which task they came from
     - Explain how these comments might be relevant to the current task
     - Ask the user **in the user's language** if they want to take these comments into account during execution
     - Document the comments to be considered during the execution phase
   - If no comments are found, proceed normally

5. **Check dependencies**:
   - Read the task list file: `.ia/project/features/{feature-number}-{feature-title}/{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
   - Check if any dependencies (previous tasks) are marked as completed
   - If dependencies are not completed, inform the user **in the user's language** and ask if they want to proceed anyway

6. **Gather required information**:
   - Before executing, identify any missing information needed:
     - Package versions (e.g., Docker image versions, npm package versions)
     - Configuration values (e.g., ports, environment variables, paths)
     - Prerequisites (e.g., installed tools, system requirements)
     - User preferences (e.g., naming conventions, directory structure)
   - For each missing piece of information, ask the user **in the user's language**:
     - Use clear, specific questions
     - Provide examples or suggestions when appropriate
     - Allow the user to skip optional items
   - Document the user's choices for reference during execution
   - **Take into account any comments from previous tasks** that were identified in step 4 when gathering information (e.g., if a comment mentions specific versions, use them as suggestions or defaults)

7. **Execute the task**:
   - Follow the execution steps from the task specification
   - Create, modify, or delete files as required
   - Implement configurations as specified
   - Follow best practices and project conventions
   - If a step fails or encounters an issue:
     - Inform the user **in the user's language** about the problem
     - Propose solutions or ask for guidance
     - Do not proceed with subsequent steps until the issue is resolved
   - **Apply any relevant comments from previous tasks** that were identified in step 4 during execution (e.g., use specific versions, follow configurations mentioned in comments)

8. **Verify completion**:
   - Perform all verification steps listed in the task specification
   - Check that all expected deliverables are present and correct
   - Validate configurations, syntax, and structure
   - If verification fails:
     - Inform the user **in the user's language** about what failed
     - Fix the issues or ask for guidance
     - Re-verify until all checks pass

9. **Update task list**:
   - Read the task list file: `.ia/project/features/{feature-number}-{feature-title}/{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
   - Find the task entry in the list (format: `- [ ] **{feature-number}-{task-number}-{task-name}**`)
   - Mark the task as completed by changing `- [ ]` to `- [x]`
   - **If needed, add a comment for the next task**:
     - Identify the next task in the list (the task with the next sequential number)
     - If there are important notes, considerations, or information that would be helpful for the next task (e.g., versions chosen, configurations made, issues encountered, decisions taken), ask the user **in the user's language** if they want to add a comment for the next task
     - If the user confirms, ask them **in the user's language** what comment to add, or propose a comment based on what was done
     - Add the comment as a new line after the completed task entry, in the format: `  - Note pour la prochaine tâche : {comment content}`
     - The comment should be placed right after marking the task as completed, before the next task entry
   - Save the updated task list file
   - Confirm to the user **in the user's language** that the task has been marked as completed (and mention if a comment was added)

10. **Report completion**:
   - Summarize what was accomplished **in the user's language**
   - List all deliverables created or modified
   - Mention any important notes or considerations for subsequent tasks
   - Ask if the user wants to proceed with the next task

## Guidelines

- **Ask questions in the user's language**: All questions and interactions with the user should be conducted in the language the user is using
- **Be thorough**: Follow all execution steps and verification criteria from the task specification
- **Respect the specification**: Do not deviate from the task specification unless explicitly requested by the user
- **Handle errors gracefully**: If something goes wrong, inform the user clearly and propose solutions
- **Verify before marking complete**: Only mark a task as completed after all verification steps pass
- **Update the task list**: Always update the task list file after successful completion
- **Ask for missing information**: Do not guess or assume values for versions, packages, or configurations - always ask the user
- **Provide context**: When asking questions, provide context from the task specification to help the user make informed decisions
- **Follow project conventions**: Respect existing code style, file structure, and naming conventions in the project
- **Document choices**: When the user provides information (versions, configurations, etc.), consider documenting it in comments or configuration files for future reference
- **Consider previous task comments**: Always check for comments from previous tasks before starting execution, as they may contain important information (versions, configurations, decisions) that should be taken into account

## Example

If the user wants to execute task `001-01`:

1. User provides: `001-01`
2. Locate file: `.ia/project/features/001-keycloak-docker-compose-setup/001-01-create-docker-compose-base/001-01-create-docker-compose-base.md`
3. Read specification: Understand that this task requires creating a `docker-compose.yml` file with three services (Keycloak, PostgreSQL, Mailpit) with minimal configuration
4. Check for comments: Read the task list file, search for comments from previous tasks (none found, as this is the first task)
5. Check dependencies: No dependencies (first task)
6. Gather information: Ask the user **in the user's language**:
   - "Quelle version de PostgreSQL souhaitez-vous utiliser ? (ex: postgres:15, postgres:latest)"
   - "Quelle version de Keycloak souhaitez-vous utiliser ? (ex: quay.io/keycloak/keycloak:latest)"
   - "Quelle version de Mailpit souhaitez-vous utiliser ? (ex: axllent/mailpit:latest)"
7. Execute: Create `docker-compose.yml` with the three services using the versions provided by the user
8. Verify: Check that the file exists, contains all three services, and has valid YAML syntax
9. Update task list: 
   - Change `- [ ] **001-01-create-docker-compose-base**` to `- [x] **001-01-create-docker-compose-base**` in the task list file
   - Ask the user if they want to add a comment for the next task (001-02)
   - If yes, add a comment like: `  - Note pour la prochaine tâche : Versions utilisées - PostgreSQL: postgres:15, Keycloak: quay.io/keycloak/keycloak:latest, Mailpit: axllent/mailpit:latest`
10. Report: "La tâche 001-01 a été complétée. Le fichier docker-compose.yml a été créé avec les services Keycloak, PostgreSQL et Mailpit. Les configurations détaillées seront ajoutées dans les tâches suivantes."

If executing task `001-02` (after 001-01 is completed with a comment):
1-3. Same as above
4. Check for comments: Read the task list file, find the comment from task 001-01: "Versions utilisées - PostgreSQL: postgres:15, Keycloak: quay.io/keycloak/keycloak:latest, Mailpit: axllent/mailpit:latest"
   - Present this comment to the user **in the user's language**: "La tâche précédente (001-01) a laissé une note indiquant les versions utilisées. Souhaitez-vous utiliser ces mêmes versions pour la configuration PostgreSQL ?"
   - If the user confirms, use these versions as defaults when gathering information

