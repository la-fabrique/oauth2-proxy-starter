# features-init

Initialize a new feature specification following the project's structure and best practices.

## Process

1. **Load features list and identify feature**:
   - Read the file `.ia/project/features/000-overview/000-features-list.md`
   - If the file doesn't exist, inform the user and ask them to run `features-list` command first
   - Extract all features from the list (those with format `**{number}-{title}**`)
   - Identify pending features (those with `- [ ]` checkbox unchecked)
   - Ask the user **in the user's language** which feature they want to initialize:
     - Present the list of pending features with their numbers, titles, and brief descriptions
     - Allow the user to select by number or title
     - If only one pending feature exists, propose it and ask for confirmation
   - Extract the selected feature's information:
     - Feature number (e.g., `001`, `002`)
     - Feature title (e.g., `keycloak-docker-compose-setup`)
     - Brief description (from the list)
     - Dependencies (from the list)
     - Deliverables (from the list)

2. **Gather feature requirements**: Use the information from the features list as a starting point and ask the user directive questions **in the user's language** to complete and confirm all required information, following software engineering best practices:
   - **Primary goal**: Present the brief description from the list and ask the user to confirm or provide more details about the primary goal (Be specific about the problem it solves)
   - **Scope**: Ask what is included and what is explicitly excluded in this feature
   - **Dependencies**: Present the dependencies from the list and ask for confirmation or additions
   - **Deliverables**: Present the deliverables from the list and ask for confirmation or additions (Files, configurations, documentation, etc.)
   - **Acceptance criteria**: Ask what are the acceptance criteria (How will we know this feature is complete and working?)
   - **Optional sections for README and checklist**: Ask the user if they want to include the following optional sections in both the README and the checklist:
     - **Tests fonctionnels**: Ask if they want to add a "Tests fonctionnels" section and, if yes, gather the content for both README and checklist
     - **Configuration**: Ask if they want to add a "Configuration" section and, if yes, gather the content for both README and checklist
     - **Documentation**: Ask if they want to add a "Documentation" section and, if yes, gather the content for both README and checklist

3. **Validate feature information**: Present a summary of all gathered information to the user **in the user's language** and ask for final confirmation or modifications before proceeding.

4. **Use feature number and title**: 
   - Use the feature number extracted from the features list (e.g., `001`, `002`, `010`)
   - Use the feature title extracted from the features list (e.g., `keycloak-docker-compose-setup`)
   - Verify that the directory `.ia/project/features/{number}-{title}/` doesn't already exist (if it exists, inform the user that this feature is already initialized)

5. **Create feature structure**:
   - Create directory: `.ia/project/features/{number}-{title}/`
   - Create directory: `.ia/project/features/{number}-{title}/{number}-00-overview/` if it doesn't exist
   - Create `{number}-00-overview/{number}-00-README.md` with the following structure (include optional sections only if the user requested them):
     ```markdown
     # Feature {number} : {title}
     
     ## Objectif
     
     {Primary goal description}
     
     ## Périmètre
     
     ### Inclus
     - {List of what's included}
     
     ### Exclu
     - {List of what's explicitly excluded}
     
     ## Dépendances
     
     {List of dependencies or "Aucune (feature de départ)"}
     
     ## Livrables
     
     - {List of deliverables}
     
     ## Critères d'acceptation
     
     - ✅ {Acceptance criteria}
     
     {Include only if user requested:}
     ## Tests fonctionnels
     
     {Content for functional tests}
     
     {Include only if user requested:}
     ## Configuration
     
     {Content for configuration}
     
     {Include only if user requested:}
     ## Documentation
     
     {Content for documentation}
     ```
   - Create `{number}-00-overview/{number}-00-checklist.md` with the following structure (include optional sections only if the user requested them):
     ```markdown
     # Checklist - Feature {number} : {title}
     
     ## Validation technique
     
     - [ ] {Technical validation items}
     
     {Include only if user requested:}
     ## Tests fonctionnels
     
     - [ ] {Functional test items}
     
     {Include only if user requested:}
     ## Configuration
     
     - [ ] {Configuration items}
     
     {Include only if user requested:}
     ## Documentation
     
     - [ ] {Documentation items}    
    
     ```

6. **Populate files**: Fill in the README and checklist based on the information gathered from the user, ensuring all sections are complete and relevant. Only include the optional sections (Tests fonctionnels, Configuration, Documentation) in both the README and the checklist if the user requested them.

## Guidelines

- **Load features list first**: Always start by reading `.ia/project/features/000-overview/000-features-list.md` to get existing feature information
- **Ask questions in the user's language**: All questions and interactions with the user should be conducted in the language the user is using
- **Use existing information**: Leverage information from the features list (title, description, dependencies, deliverables) as a starting point for questions
- Ask one question at a time to avoid overwhelming the user, but present existing information from the list first
- Be directive: guide the user to provide complete information and confirm or complete what's already in the list
- The feature number and title come from the features list (format: `{number}-{title}` where number is zero-padded to 3 digits)
- All content in README and checklist should be in French (as per existing features)
- The feature title in the README header should be in English (as per existing pattern)
- Make sure the checklist items are specific, measurable and testable
- Verify that the feature directory doesn't already exist before creating it
- **Optional sections**: The sections "Tests fonctionnels", "Configuration", and "Documentation" are optional in both the README and the checklist. Always ask the user if they want to include each of these sections before adding them to either file

## Example

If the user wants to initialize feature "002-oauth2-proxy-configuration" from the features list:
- Read `.ia/project/features/000-overview/000-features-list.md`
- Extract feature information: number `002`, title `oauth2-proxy-configuration`, description, dependencies `001-keycloak-docker-compose-setup`, deliverables
- Present the information to the user and ask for confirmation/completion:
  - Primary goal: Present description from list, ask for confirmation or more details
  - Scope: Ask what's included/excluded
  - Dependencies: Present `001-keycloak-docker-compose-setup` from list, ask for confirmation
  - Deliverables: Present deliverables from list, ask for confirmation or additions
  - Acceptance criteria: Ask for acceptance criteria
- Use number `002` and title `oauth2-proxy-configuration` from the list
- Directory created: `.ia/project/features/002-oauth2-proxy-configuration/`
- Overview directory created: `.ia/project/features/002-oauth2-proxy-configuration/002-00-overview/`
- README created: `.ia/project/features/002-oauth2-proxy-configuration/002-00-overview/002-00-README.md`
- Checklist created: `.ia/project/features/002-oauth2-proxy-configuration/002-00-overview/002-00-checklist.md`
