# Conversation Prompts Tools & Templates Index

This directory contains reusable prompt templates and generators for creating and managing conversation documentation workflows. Unlike project-specific conversation folders, this directory contains meta-prompts and tools for generating documentation.

## Overview

The `-prompts` folder serves as a toolkit for conversation documentation automation. These prompts help standardize the process of capturing, organizing, and indexing AI assistant conversations across different projects and themes.

## Generators

Tools for automatically creating documentation structures and indexes.

### [Project-Aware Index Generator](./project-aware-index-generator.md)
**Purpose**: Generates comprehensive navigation indexes that link conversation documentation to their corresponding project codebases.
**Use Case**: Creates a master index.md file that connects conversation prompt folders to actual project directories at `/Users/LenMiller/code/banno/[project-name]/`. Includes project location references and repository links for seamless navigation between documentation and code.

### [Conversation Documentation Generator](./conversation-prompts-with-details.md)
**Purpose**: Automates the creation of thematic conversation documentation with detailed organization and indexing.
**Use Case**: Analyzes conversation history, identifies themes, extracts user messages chronologically, and creates organized folder structures with descriptive filenames and comprehensive index files. Perfect for preserving important AI assistant conversations with proper categorization.

## Templates

Reusable prompt templates for specific documentation tasks.

### [Index Generator Template](./index-generator.md)
**Purpose**: Template prompt for creating navigation hub indexes within the `-prompts` folder itself.
**Use Case**: Meta-template that provides the structure and requirements for generating this very index file. Includes directory scanning, content processing, and categorization guidelines for prompt tools and templates.

## File Organization Guidelines

- **Generators**: Tools that create new documentation structures or indexes
- **Templates**: Reusable prompt patterns for specific tasks
- **Utilities**: Helper prompts and workflow tools (none currently present)

## Usage Instructions

1. **For Project Documentation**: Use the `conversation-prompts-with-details.md` generator to create thematic conversation archives
2. **For Navigation**: Use the `project-aware-index-generator.md` to create master indexes linking documentation to projects
3. **For Meta-Documentation**: Use the `index-generator.md` template to maintain this tools directory

## File Modification Status

- `conversation-prompts-with-details.md`: Core conversation documentation generator
- `project-aware-index-generator.md`: Enhanced index generator with project linking
- `index-generator.md`: Meta-template for this index file
- `index.md`: This navigation hub (current file)

## Recommendations

- Consider creating subdirectories if the number of prompt files grows beyond 10-15 items
- Maintain consistent naming conventions: `[purpose]-[type].md` (e.g., `project-aware-index-generator.md`)
- Update this index whenever new prompt tools are added to the directory
- Test prompt templates regularly to ensure they work with current conversation documentation workflows

---

*Last Updated: Generated automatically based on current directory contents*
