# new-features-list

Analyze files to extract potential features and create a features list that will be used to initialize actual feature specifications.

## Process

1. **Identify source files**: Ask the user which files or directories should be analyzed to extract features. These could be:
   - Architecture notes or design documents
   - Requirements documents
   - Technical specifications
   - Project documentation
   - Any other relevant files containing feature descriptions

2. **Read and analyze files**: 
   - Read all specified files
   - Analyze their content to identify potential features
   - Extract feature descriptions, requirements, or components mentioned
   - Look for patterns like:
     - Explicit feature lists
     - Component descriptions
     - Functional requirements
     - Technical tasks or milestones
     - User stories or use cases

3. **Extract features**: For each identified feature, extract:
   - Feature title (in kebab-case, English)
   - Brief description or purpose
   - Any dependencies mentioned
   - Any scope indicators (what's included/excluded)
   - Deliverable(s) for the feature

4. **Create or update features list**:
   - Ensure the directory `.ia/project/features/000-overview/` exists
   - Create or update `000-features-list.md` with the following structure:
     ```markdown
     # Features List
     
     This document contains the list of features to be implemented, extracted from project documentation and requirements.
     
     ## Features
     
     - [ ] **001-{feature-title-1}** : {Brief description}
       - **Dependencies**: {List of dependencies or "None"}
       - **Deliverable**: {Description of the deliverable(s) for this feature}
       - **Status**: Pending
     
     - [ ] **002-{feature-title-2}** : {Brief description}
       - **Dependencies**: {List of dependencies or "None"}
       - **Deliverable**: {Description of the deliverable(s) for this feature}
       - **Status**: Pending
     
     ...
     ```
   
   - If the file already exists, merge new features with existing ones (avoid duplicates)
   - Sort features logically (by dependencies, by domain, or chronologically)
   - **Feature titles must match directory names**: The feature title format `{feature-number}-{feature-name}` must exactly match the directory name that will be created (e.g., `001-keycloak-docker-compose-setup` matches directory `001-keycloak-docker-compose-setup/`)

5. **Present the list**: Show the user the generated features list and ask for:
   - Confirmation of extracted features
   - Any additions or modifications
   - Removal of features that shouldn't be included
   - Reordering if needed

6. **Define execution order**: Work with the user to determine the execution order of features:
   - Consider dependencies between features
   - Consider logical development flow
   - Consider priority and business value
   - Assign sequential numbers starting from 001 to each feature
   - Update feature titles to include the numeric prefix in the format `{feature-number}-{feature-name}` (e.g., `001-user-registration`, `002-user-login`)
   - **Important**: The feature title format must exactly match the directory name that will be created (e.g., `001-keycloak-docker-compose-setup` will create directory `001-keycloak-docker-compose-setup/`)

7. **Finalize**: Once confirmed, save the final features list to `.ia/project/features/000-overview/000-features-list.md`

## Guidelines

- **Ask questions in the user's language**: All questions and interactions with the user should be conducted in the language the user is using
- Be thorough in analysis: read files completely and extract all potential features
- Use descriptive, kebab-case titles for features (e.g., `user-authentication`, `api-gateway-setup`)
- **Feature titles must include numeric prefix**: After defining execution order, prefix each feature title with a three-digit number starting from 001 in the format `{feature-number}-{feature-name}` (e.g., `001-user-authentication`, `002-api-gateway-setup`)
- **Feature titles must match directory names**: The feature title format `{feature-number}-{feature-name}` must exactly match the directory name that will be created (e.g., `001-keycloak-docker-compose-setup` matches directory `001-keycloak-docker-compose-setup/`)
- **Use checkboxes**: Each feature must be listed with a checkbox `- [ ]` to track completion status
- Group related features together when possible
- Identify dependencies between features when mentioned in the source files
- **Each feature must have a deliverable**: Extract and document what will be delivered for each feature (e.g., code, documentation, configuration files, tests, etc.)
- If a feature is ambiguous, include it but note the ambiguity in the description
- The features list is a planning document - features will be created individually using `features-init` command
- Ensure the directory structure exists before creating the file

## Example

If analyzing a requirements document that mentions:
- "User registration and login"
- "Create and manage blog posts"
- "Add comments to posts"
- "Search functionality for posts"

The features list might include:

- [ ] **001-user-registration** : Allow users to create accounts with email and password
  - **Dependencies**: None
  - **Deliverable**: Registration form component, validation logic, API endpoint for user creation, database schema for users
  - **Status**: Pending

- [ ] **002-user-login** : Authenticate users with email and password
  - **Dependencies**: 001-user-registration
  - **Deliverable**: Login form component, authentication service, session management, API endpoint for login
  - **Status**: Pending

- [ ] **003-blog-post-management** : Create, edit, delete, and view blog posts
  - **Dependencies**: 002-user-login
  - **Deliverable**: Post creation form, post editor, post list view, API endpoints for CRUD operations, database schema for posts
  - **Status**: Pending

- [ ] **004-post-comments** : Allow authenticated users to add comments to blog posts
  - **Dependencies**: 003-blog-post-management
  - **Deliverable**: Comment form component, comment display component, API endpoint for comments, database schema for comments
  - **Status**: Pending

- [ ] **005-post-search** : Search blog posts by title and content
  - **Dependencies**: 003-blog-post-management
  - **Deliverable**: Search input component, search results view, search API endpoint, search indexing logic
  - **Status**: Pending
