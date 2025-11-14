# resume

Display a concise overview of project progress: list all features with their status (Done, In Progress, Pending), and show tasks progress for the last feature in progress.

## Process

**IMPORTANT**: This command is optimized to read ONLY two files maximum:
1. `.ia/project/features/000-overview/000-features-list.md` (always read)
2. The tasks-list file of the last feature in progress (only if one exists)

No other files should be read or checked.

1. **Read features list** (ONLY FILE 1):
   - Read the file `.ia/project/features/000-overview/000-features-list.md`
   - Extract all features with their:
     - Feature number and title (format: `{number}-{title}`)
     - Checkbox status (`- [x]` = checked, `- [ ]` = unchecked)
     - Status field (`**Status**: Done`, `**Status**: Pending`, or other)

2. **Identify potential features in progress** (from features list only):
   - For each feature, determine initial status from the features list:
     - **Done**: Checkbox is checked (`- [x]`) AND status is `Done`
     - **Potential In Progress**: Checkbox is unchecked (`- [ ]`) AND status is `Pending` (or not `Done`)
   - Find the last feature (by number) that is "Potential In Progress"
   - If no such feature exists, all features are either Done or truly Pending → skip to step 5
   - Extract the feature number and title to construct the tasks-list file path

3. **Read tasks for last potential feature in progress** (ONLY FILE 2, if needed):
   - Construct the tasks-list file path: `.ia/project/features/{feature-number}-{feature-title}/{feature-number}-00-overview/{feature-number}-00-tasks-list.md`
   - Attempt to read this file:
     - **If file exists and can be read**: Feature is "In Progress"
       - Extract all tasks with their:
         - Task identifier (format: `{feature-number}-{task-number}-{task-name}`)
         - Checkbox status (`- [x]` = completed, `- [ ]` = not completed)
       - Count completed vs total tasks
     - **If file doesn't exist or cannot be read**: Feature is "Pending" → skip to step 5

4. **Determine final feature statuses**:
   - All features before the last potential feature in progress: 
     - If checkbox is checked AND status is `Done` → "Done"
     - Otherwise → "Pending" (cannot determine "In Progress" without reading tasks-list, which we skip for efficiency)
   - Last potential feature in progress: 
     - "In Progress" if tasks-list was successfully read in step 3
     - "Pending" if tasks-list doesn't exist or couldn't be read
   - All features after: "Pending" (from features list, checkbox unchecked)
   - Count features by final status

5. **Display concise summary**:
   - Display a simple list format:
     ```
     ## Features Status
     
     - [x] 001-{title} : Done
     - [ ] 002-{title} : In Progress
     - [ ] 003-{title} : Pending
     ...
     
     ## Last Feature In Progress: {feature-number}-{feature-title}
     
     Tasks: {completed}/{total}
     
     - [x] {task-id} : {task-name}
     - [ ] {task-id} : {task-name}
     ...
     ```
   - If no feature is in progress, display only the features list
   - Keep the output concise: one line per feature, one line per task

## Guidelines

- **Efficiency**: Read ONLY two files maximum:
  - `.ia/project/features/000-overview/000-features-list.md` (always)
  - The tasks-list file of the last feature in progress (only if it exists)
- **No directory checks**: Do not check if directories exist, do not list directories, do not read any other files
- **Be concise**: Display only essential information in a simple list format
- **Clear status indicators**: Use `[x]` for completed, `[ ]` for not completed
- **Status determination**: 
  - A feature is "Done" if checkbox is checked AND status is `Done`
  - A feature is "In Progress" if checkbox is unchecked, status is `Pending`, AND its tasks-list file exists and can be read
  - A feature is "Pending" if checkbox is unchecked, status is `Pending`, AND its tasks-list file doesn't exist or cannot be read
- **Last feature priority**: Only show tasks for the last (highest number) feature in progress
- **No user interaction**: This is a read-only command that displays information
- **Simple format**: Use markdown list format for easy reading

## Example

If the features list contains:
- `001-keycloak-docker-compose-setup` : Done (checkbox checked, Status: Done)
- `002-oauth2-proxy-configuration` : In Progress (checkbox unchecked, tasks-list exists with 10 tasks, 7 completed)
- `003-static-file-server-setup` : Pending (checkbox unchecked, no tasks-list)

The output should be:

```
## Features Status

- [x] 001-keycloak-docker-compose-setup : Done
- [ ] 002-oauth2-proxy-configuration : In Progress
- [ ] 003-static-file-server-setup : Pending
- [ ] 004-vue-spa-application : Pending
- [ ] 005-dotnet-core-api : Pending
...

## Last Feature In Progress: 002-oauth2-proxy-configuration

Tasks: 7/10

- [x] 002-01-add-oauth2-proxy-service
- [x] 002-02-configure-oauth2-proxy-environment
- [x] 002-03-configure-keycloak-oidc-connection
- [x] 002-04-configure-oauth2-endpoints
- [x] 002-05-configure-cookie-settings
- [x] 002-06-configure-cookie-storage
- [x] 002-07-configure-cookie-encryption
- [ ] 002-08-configure-upstream-app
- [ ] 002-09-configure-upstream-api
- [ ] 002-10-create-oauth2-proxy-config-file
```

If no feature is in progress:

```
## Features Status

- [x] 001-keycloak-docker-compose-setup : Done
- [ ] 002-oauth2-proxy-configuration : Pending
- [ ] 003-static-file-server-setup : Pending
...
```

