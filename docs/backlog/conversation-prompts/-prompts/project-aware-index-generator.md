**Modified Prompt for Project-Aware Conversation Prompts Index Generator:**

Create a comprehensive index.md file at the root path `/Users/LenMiller/code/banno/orchestr8r-mcp/docs/conversation-prompts/index.md` that serves as a navigation hub for all conversation prompt documentation and their associated projects.

**Context**: Each folder under `/Users/LenMiller/code/banno/orchestr8r-mcp/docs/conversation-prompts/` represents a project that has its actual codebase located at `/Users/LenMiller/code/banno/[project-name]/`.

**Requirements:**
1. **File Creation**: If `index.md` doesn't exist at the root path, create it with appropriate markdown structure
2. **Directory Traversal**: Recursively scan all subdirectories under `/Users/LenMiller/code/banno/orchestr8r-mcp/docs/conversation-prompts/`
3. **Exclusion Rule**: Skip any directories whose names start with a hyphen (`-`) character
4. **Content Processing**: For each valid directory found:
   - Locate and read the `index.md` file within that directory
   - Extract key information to create a concise summary (2-3 sentences maximum)
   - Generate a relative markdown link to that directory's index.md file
   - **NEW**: Identify the corresponding project directory at `/Users/LenMiller/code/banno/[directory-name]/`
   - **NEW**: Include project repository link if the project exists
5. **Output Format**: Structure the root index.md with:
   - Clear heading: "# Conversation Prompts Documentation Index"
   - Brief introduction explaining the purpose and project relationship
   - Organized list of directories with summaries, documentation links, and project references
   - Consistent markdown formatting with proper heading hierarchy

**Expected Structure:**
```markdown
# Conversation Prompts Documentation Index

This index provides navigation to all conversation prompt documentation organized by theme. Each documented conversation relates to a specific project located in the `/Users/LenMiller/code/banno/` directory.

## Available Documentation

### [Project Name](./project-name/index.md)
Brief summary of the conversation documentation content and purpose.
**Project Location**: `/Users/LenMiller/code/banno/project-name/`
**Repository**: [View Project](file:///Users/LenMiller/code/banno/project-name/) *(if project directory exists)*

### [Another Project](./another-project/index.md)
Brief summary of this conversation documentation content and purpose.
**Project Location**: `/Users/LenMiller/code/banno/another-project/`
**Repository**: [View Project](file:///Users/LenMiller/code/banno/another-project/) *(if project directory exists)*
```

**Error Handling**:
- If a directory lacks an index.md file, note this in the summary and suggest creating one
- If the corresponding project directory doesn't exist at `/Users/LenMiller/code/banno/[directory-name]/`, note this and suggest verifying the project location