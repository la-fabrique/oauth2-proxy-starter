# features-compress

Compress a completed feature by removing task-related files and directories while preserving essential feature information.

## Process

1. **Request feature identifier**:
   - Ask the user **in the user's language** for the feature number or name to compress
   - Examples: `001`, `001-keycloak-docker-compose-setup`
   - If the user provides only the number, search for the corresponding directory in `.ia/project/features/`

2. **Locate feature directory**:
   - Extract the feature number (format: `001`, `002`, etc.)
   - Search for the feature directory: `.ia/project/features/{feature-number}-{feature-title}/`
   - If the directory does not exist:
     - List available features in `.ia/project/features/` to help the user
     - Inform the user **in the user's language** and stop the process

3. **Verify feature completion status**:
   - Read the file `.ia/project/features/000-overview/000-features-list.md`
   - Find the corresponding feature entry (format: `- [ ] **{feature-number}-{feature-name}**` or `- [x] **{feature-number}-{feature-name}**`)
   - Check if the feature is marked as completed (`- [x]` and `**Status**: Done`)
   - Read the checklist file: `{feature-number}-00-overview/{feature-number}-00-checklist.md`
   - Count checked items (`- [x]`) vs unchecked items (`- [ ]`) in all sections
   - If the tasks-list file exists, read it to check task completion status
   - Determine if the feature appears to be completed:
     - Feature is marked as "Done" in features-list, AND
     - All checklist items are checked, AND
     - All tasks (if tasks-list exists) are completed

4. **Request confirmation if incomplete**:
   - If the feature is not marked as completed OR checklist/tasks are incomplete:
     - Inform the user **in the user's language** about the current status:
       - Feature status in features-list (Done/Pending)
       - Checklist completion (X/Y items checked)
       - Tasks completion (if applicable: X/Y tasks completed)
     - Warn the user **in the user's language** that compressing will permanently delete task specifications and task directories
     - Ask the user **in the user's language** if they still want to proceed with compression
     - If the user answers "no", stop the process
     - If the user answers "yes", proceed to the next step

5. **Identify files and directories to remove**:
   - List all directories in the feature directory: `.ia/project/features/{feature-number}-{feature-title}/`
   - Identify task directories (format: `{feature-number}-{task-number}-{task-name}/` where task-number is not `00`)
   - Identify the tasks-list file: `{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
   - Create a list of all items to be deleted

6. **Extract important information from tasks** (CRITICAL - before deletion):
   - For each task directory identified in step 5:
     - Read the task file: `{feature-number}-{task-number}-{task-name}/{feature-number}-{task-number}-{task-name}.md`
     - Extract and collect the following information:
       - **Expected Deliverables**: All files, configurations, and artifacts created by the task
         - File paths and names
         - Directory structures created
         - Configuration files and their purposes
       - **Files created/modified**: Any files mentioned in Execution Steps or Expected Deliverables
         - Full paths relative to project root
         - Purpose of each file
       - **Important decisions**: Key decisions from "Notes and Considerations" section
         - Architectural choices
         - Design patterns selected
         - Technology choices and rationale
       - **Configuration details**: Critical configuration values, parameters, or settings
         - Configuration keys and values
         - Default values and their meanings
         - Configuration file locations
       - **Environment variables**: Any new environment variables added or modified
         - Variable names
         - Descriptions and purposes
         - Default values or examples
         - Whether they are required or optional
       - **Architectural decisions**: Important architectural choices or patterns
         - System design decisions
         - Integration patterns
         - Security considerations
       - **Dependencies**: External dependencies or relationships with other tasks
         - Task dependencies
         - External library or service dependencies
       - **Important notes**: Any warnings, limitations, or considerations that impact the project
         - Security considerations
         - Performance implications
         - Known limitations
         - Future considerations
   - Read the tasks-list file: `{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
     - Extract task titles and their completion status
     - Note any important context or organization information
     - Extract task groupings or categories if present
   - Organize all extracted information into a structured summary:
     - Group by category (Deliverables, Configurations, Decisions, Environment Variables, etc.)
     - Include task references where relevant (e.g., "Task 002-10: Created config/oauth2-proxy.yaml")
     - Preserve critical technical details
     - Maintain relationships between tasks and their outputs
     - Structure the summary for easy reference and maintenance

7. **Create or update feature summary document**:
   - Read the README file: `{feature-number}-00-overview/{feature-number}-00-README.md`
   - Verify it contains essential information (Objective, Scope, Dependencies, Deliverables, Acceptance Criteria)
   - Create a separate summary file: `{feature-number}-00-overview/{feature-number}-00-tasks-summary.md`
     - This file will preserve all important information extracted from tasks
     - Use a clear markdown structure with sections
   - Structure the summary document with the following sections:
     - **Overview**: Brief summary of what was implemented
     - **Deliverables Summary**: 
       - Complete list of all files created (with paths)
       - Directory structures created
       - Configuration files and their purposes
       - Organized by task or by type
     - **Configuration Summary**: 
       - Key configuration values and parameters
       - Configuration file locations
       - Default values and their meanings
       - Organized by component or service
     - **Environment Variables**: 
       - Complete list of variables added or modified
       - Variable names, descriptions, purposes
       - Default values or examples
       - Required vs optional status
       - Reference to .env.example if applicable
     - **Important Decisions**: 
       - Architectural choices and rationale
       - Design patterns selected
       - Technology choices and reasons
       - Security considerations
     - **Implementation Notes**: 
       - Critical implementation details
       - Known limitations or constraints
       - Performance considerations
       - Future considerations or recommendations
     - **Task References**: 
       - List of tasks that contributed to each deliverable (if relevant)
       - Task organization and dependencies
   - Ensure all impactful information for the project is preserved before deletion
   - Format the document for easy reading and maintenance

8. **Delete task-related files and directories**:
   - Delete the tasks-list file: `{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
   - For each task directory identified in step 5:
     - Delete the entire directory and all its contents: `{feature-number}-{task-number}-{task-name}/`
   - Confirm each deletion to the user **in the user's language**

9. **Verify preservation of essential files**:
   - Verify that the following files still exist:
     - `{feature-number}-00-overview/{feature-number}-00-README.md`
     - `{feature-number}-00-overview/{feature-number}-00-checklist.md`
     - `{feature-number}-00-overview/{feature-number}-00-tasks-summary.md` (if created)
   - Verify that the summary document contains the extracted important information
   - If any essential file is missing, inform the user **in the user's language** immediately

10. **Confirm compression**:
   - Inform the user **in the user's language** that the feature has been compressed
   - Display a summary:
     - Number of task directories deleted
     - Files deleted (tasks-list.md, task directories)
     - Files preserved (README.md, checklist.md, tasks-summary.md if created)
     - Important information extracted and preserved in summary
   - Remind the user that task specifications have been permanently removed, but important information has been preserved in the summary

## Guidelines

- **Ask questions in the user's language**: All questions and interactions with the user should be conducted in the language the user is using
- **Verify completion before compression**: Check feature status in features-list, checklist completion, and task completion before proceeding
- **Request confirmation for incomplete features**: Always ask for explicit confirmation if the feature is not marked as completed
- **Extract information before deletion**: CRITICAL - Always read and extract important information from all task files before deleting them
- **Preserve impactful information**: Extract and preserve all information that impacts the project (deliverables, configurations, decisions, environment variables, architectural choices)
- **Preserve essential files**: Always keep README.md and checklist.md files
- **Create summary document**: Create a tasks-summary.md file or add a section to README.md to preserve extracted information
- **Delete task-related content**: Remove all task directories and the tasks-list.md file only after information extraction
- **Handle errors gracefully**: If a file or directory cannot be deleted, inform the user clearly
- **Provide clear feedback**: Show what was deleted, what was preserved, and what information was extracted
- **Safety first**: Warn users about permanent deletion of task specifications, but reassure that important information is preserved

## Example

If the user wants to compress feature `001-keycloak-docker-compose-setup`:

1. User provides: `001` or `001-keycloak-docker-compose-setup`
2. Locate directory: `.ia/project/features/001-keycloak-docker-compose-setup/`
3. Verify completion:
   - Read features-list: Feature is marked as `- [x]` and `**Status**: Done`
   - Read checklist: All items are checked (e.g., 45/45)
   - Read tasks-list: All tasks are completed (e.g., 35/35)
   - Feature appears completed → proceed directly to compression
4. Identify items to delete:
   - Task directories: `001-01-create-docker-compose-base/`, `001-02-.../`, etc.
   - Tasks-list file: `001-00-overview/001-00-tasks-list.md`
5. Extract important information:
   - Read all 35 task files
   - Extract deliverables (files created: docker-compose.yml, keycloak-config/, etc.)
   - Extract configurations (Keycloak settings, SMTP configuration, etc.)
   - Extract decisions (plugin choices, architecture decisions, etc.)
   - Extract environment variables (KEYCLOAK_ADMIN, DB_PASSWORD, etc.)
   - Organize into structured summary
6. Create summary:
   - Create `001-00-overview/001-00-tasks-summary.md` with extracted information
   - Structure the summary with sections: Overview, Deliverables Summary, Configuration Summary, Environment Variables, Important Decisions, Implementation Notes, Task References
7. Delete:
   - Delete `001-00-overview/001-00-tasks-list.md`
   - Delete all task directories (e.g., 35 directories)
8. Verify preservation:
   - `001-00-overview/001-00-README.md` ✓
   - `001-00-overview/001-00-checklist.md` ✓
   - `001-00-overview/001-00-tasks-summary.md` ✓ (with all important information)
9. Confirm: "Feature '001-keycloak-docker-compose-setup' has been compressed. Extracted and preserved: deliverables, configurations, decisions, and environment variables. Deleted: 35 task directories and tasks-list.md. Preserved: README.md, checklist.md, and tasks-summary.md."

If the feature is not completed (e.g., checklist has 40/45 items checked):
- Display: "Feature status: Done in features-list. Checklist: 40/45 items checked. Tasks: 35/35 completed. The feature appears incomplete. Compressing will permanently delete all task specifications, but important information will be extracted and preserved in a summary document. Do you still want to proceed?"
- If user confirms "yes", proceed with information extraction, summary creation, then deletion
- If user answers "no", stop the process

