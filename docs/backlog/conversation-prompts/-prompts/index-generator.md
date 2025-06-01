Create a comprehensive index.md file at `/Users/LenMiller/code/banno/orchestr8r-mcp/docs/backlog/conversation-prompts/-prompts/index.md` that serves as a navigation hub for all prompt templates and generators in the `-prompts` folder.

**Context**: The `-prompts` folder contains reusable prompt templates and generators for conversation documentation workflows. Unlike project-specific conversation folders, this directory contains meta-prompts and tools for generating documentation.

**Requirements:**
1. **File Creation**: If `index.md` doesn't exist in the `-prompts` directory, create it with appropriate markdown structure
2. **Directory Scanning**: Scan all files within `/Users/LenMiller/code/banno/orchestr8r-mcp/docs/backlog/conversation-prompts/-prompts/`
3. **Content Processing**: For each `.md` file found:
   - Read the file content to understand its purpose
   - Extract the main functionality or use case (2-3 sentences maximum)
   - Generate a relative markdown link to the file
   - Categorize by type (generator, template, utility, etc.)
4. **Output Format**: Structure the index.md with:
   - Clear heading: "# Conversation Prompts Tools & Templates Index"
   - Brief introduction explaining the purpose of the `-prompts` folder
   - Organized sections by prompt type (Generators, Templates, Utilities)
   - Consistent markdown formatting with proper heading hierarchy

**Expected Structure:**
```markdown
# Conversation Prompts Tools & Templates Index

This directory contains reusable prompt templates and generators for creating and managing conversation documentation workflows.

## Generators
Tools for automatically creating documentation structures and indexes.

### [Project-Aware Index Generator](./project-aware-index-generator.md)
Generates comprehensive navigation indexes that link conversation documentation to their corresponding project codebases.

## Templates
Reusable prompt templates for specific documentation tasks.

### [Template Name](./template-file.md)
Brief description of the template's purpose and use case.

## Utilities
Helper prompts and tools for documentation workflows.

### [Utility Name](./utility-file.md)
Brief description of the utility's functionality.
```

**Error Handling**: 
- If a file cannot be read or parsed, note this in the summary
- Include file modification dates to help identify the most current versions
- Suggest organizing files into subdirectories if the folder becomes too large