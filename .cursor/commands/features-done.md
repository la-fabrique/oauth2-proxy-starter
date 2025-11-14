# features-done

Mark a feature as completed by verifying the checklist and tasks, then update the features-list file.

## Process

1. **Request feature identifier**:
   - Ask the user **in the user's language** for the feature number or name to mark as completed
   - Examples: `001`, `001-keycloak-docker-compose-setup`
   - If the user provides only the number, search for the corresponding directory in `.ia/project/features/`

2. **Locate feature files**:
   - Extract the feature number (format: `001`, `002`, etc.)
   - Search for the feature directory: `.ia/project/features/{feature-number}-{feature-title}/`
   - If the directory does not exist:
     - List available features in `.ia/project/features/` to help the user
     - Inform the user **in the user's language** and stop the process
   - Verify the existence of required files:
     - `{feature-number}-00-overview/{feature-number}-00-checklist.md`
     - `{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
   - If the files do not exist, inform the user **in the user's language** and stop the process

3. **Verify tasks and build mapping**:
   - Read the file `{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
   - Analyze all tasks in all sections
   - Identify completed tasks (`- [x]`) and uncompleted tasks (`- [ ]`)
   - Count the number of completed vs uncompleted tasks
   - **Read the "Vérification de couverture" section** to create a mapping:
     - For each checklist item listed in "Checklist couverte", extract:
       - The checklist item text (e.g., "Docker Compose démarre sans erreur")
       - The list of tasks that cover it (e.g., "001-01, 001-20")
     - Create a dictionary/mapping: `{checklist_item: [task_list]}`
     - Normalize the checklist item text to facilitate matching (remove ✅ prefixes, multiple spaces, etc.)
   - Store this mapping in memory for the next step

4. **Verify checklist and auto-check**:
   - Read the file `{feature-number}-00-overview/{feature-number}-00-checklist.md`
   - Analyze all checklist items (Technical validation, Functional tests, Configuration, Documentation, Final validation)
   - Identify unchecked items (`- [ ]`)
   - **For each unchecked item, verify if it can be automatically checked**:
     - Use the mapping created in step 3 to find the tasks that cover this item
     - If the item is not found in the mapping, leave it unchecked (it will need manual verification)
     - If the item is found in the mapping, verify if all corresponding tasks are marked as completed (from step 3 analysis)
     - If all corresponding tasks are completed, automatically check the checklist item (`- [ ]` → `- [x]`)
   - Save the updated checklist if items were automatically checked
   - Count the number of checked vs unchecked items (after automatic update)
   - Present the checklist status to the user **in the user's language**:
     - Display the number of completed items / total
     - If items were automatically checked, inform the user with the list of checked items
     - List remaining uncompleted items (if any)

5. **Present global status**:
   - Present the task status to the user **in the user's language**:
     - Display the number of completed tasks / total
     - List uncompleted tasks (if any)
   - Present the checklist status (already done in step 4, but summarize)

6. **Decision if incomplete**:
   - If the checklist is not complete OR if tasks are not completed:
     - Inform the user **in the user's language** that the feature is not complete
     - Display a summary of missing items (checklist and/or tasks)
     - Ask the user **in the user's language** if they still want to mark the feature as completed
     - If the user answers "no", stop the process
     - If the user answers "yes", proceed to the next step with a warning
   - If everything is completed, proceed directly to the next step

7. **Update features-list file**:
   - Read the file `.ia/project/features/000-overview/000-features-list.md`
   - Find the corresponding feature entry (format: `- [ ] **{feature-number}-{feature-name}**`)
   - If the feature is not found:
     - Inform the user **in the user's language** and stop the process
   - Check current status:
     - If the feature is already marked as completed (`- [x]` and `**Status**: Done`), inform the user **in the user's language** and ask if they want to unmark it
     - If unmarking is requested, change `- [x]` to `- [ ]` and `**Status**: Done` to `**Status**: Pending`
   - If the feature is not completed, update the entry:
     - Change the checkbox from `- [ ]` to `- [x]` to mark the feature as completed
     - Change the status from `**Status**: Pending` (or other) to `**Status**: Done`
   - Preserve all formatting, indentation, and surrounding content
   - Save the updated features-list file

8. **Confirm completion**:
   - Inform the user **in the user's language** that the feature has been marked as completed
   - Display the updated entry for confirmation
   - If items were incomplete, remind that they were marked as completed despite missing items

## Guidelines

- **Ask questions in the user's language**: All questions and interactions with the user should be conducted in the language the user is using
- **Complete verification**: Verify both the checklist AND tasks before marking as completed
- **Automatic checklist checking**: If a checklist item is not checked but all corresponding tasks are completed, automatically check the checklist item
- **Transparency**: Clearly display the checklist and task status to the user
- **User confirmation**: If items are incomplete, explicitly ask for confirmation before marking as completed
- **Preserve formatting**: Maintain exact formatting of files (indentation, spacing, markdown syntax)
- **Handle edge cases**:
  - If the feature does not exist, provide suggestions based on available features
  - If the feature is already marked as completed, inform the user and offer to unmark it
  - If files are missing, clearly inform the user
- **Status format**: Use `**Status**: Done` for a completed feature (format consistent with existing file)
- **Checklist-task matching**: The matching between checklist items and tasks should be flexible to handle formatting variations (spaces, ✅ prefixes, etc.)

## Example

If the user wants to mark feature `001-keycloak-docker-compose-setup` as completed:

1. User provides: `001` or `001-keycloak-docker-compose-setup`
2. Locate files: `.ia/project/features/001-keycloak-docker-compose-setup/001-00-overview/001-00-checklist.md` and `001-00-tasks-list.md`
3. Verify tasks:
   - Read the task list, count completed tasks (e.g., 35/35 completed)
   - Read the "Vérification de couverture" section and create mapping: "Docker Compose démarre sans erreur" → [001-01, 001-20]
4. Verify checklist:
   - Read the checklist, identify unchecked items
   - For each unchecked item, check in the mapping if all corresponding tasks are completed
   - Automatically check items whose tasks are all completed
   - Count checked items (e.g., 45/45 completed after automatic checking)
5. Present status: "Tasks: 35/35 completed. Checklist: 45/45 completed."
6. If everything is completed: Proceed directly to update
7. Update features-list: Change `- [ ] **001-keycloak-docker-compose-setup**` to `- [x] **001-keycloak-docker-compose-setup**` and `**Status**: Pending` to `**Status**: Done`
8. Confirm: "Feature '001-keycloak-docker-compose-setup' has been marked as completed in the features-list file."

If the checklist is not complete (e.g., 40/45 completed):
- Display: "Checklist: 40/45 completed. Tasks: 35/35 completed. 5 checklist items are not completed. Do you still want to mark the feature as completed?"
- If the user answers "yes", proceed with update with a warning
