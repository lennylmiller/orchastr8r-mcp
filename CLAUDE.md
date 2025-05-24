# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Startup Commands

When first opening this project, please run:
```bash
bun run build
```

This ensures GraphQL types are generated and the project is built before making changes.

## Common Commands

```bash
# Install dependencies
bun install

# Build the server (runs GraphQL codegen first, then builds)
bun run build

# Generate GraphQL types from schema (also runs automatically with build)
bun run graphql-codegen

# Run the MCP server directly (after building)
bun run build/index.js

# Install via Smithery for Claude Desktop
npx -y @smithery/cli install orchestr8r-mcp --client claude
```

## Environment Setup

This codebase requires a GitHub Personal Access Token with appropriate permissions. Create a `.env` file with:

```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username_or_org
```

### Required GitHub Token Permissions
- `project` - Full control of projects
- `read:project` - Read access of projects
- `repo` - Full control of private repositories
- `repo:status` - Access commit status
- `repo_deployment` - Access deployment status
- `public_repo` - Access public repositories
- `repo:invite` - Access repository invitations
- `security_events` - Read and write security events

## Project Architecture

Orchestr8r MCP is an AI-powered development orchestrator built on the Model Context Protocol (MCP). It provides natural language interfaces for managing GitHub Projects, Issues, and development workflows through GitHub's GraphQL API.

### Key Components

1. **MCP Server** (`src/index.ts`)
   - Registers 29 tools and 6 prompts for GitHub operations
   - Uses StdioServerTransport for communication
   - All tools and prompts are defined with Zod schemas for validation

2. **GraphQL Operations** (`src/graphql/`)
   - Organized by domain: `issues/`, `projects/`, `repositories/`
   - Each `.graphql` file contains a single query or mutation
   - Files are loaded as strings at build time via custom esbuild plugin
   
3. **Operations Layer** (`src/operations/`)
   - `github-client.ts`: Core Octokit client with GraphQL and pagination support
   - `issues.ts`: Operations for GitHub Issues
   - `projects.ts`: Operations for GitHub Projects (main functionality)
   - `repositories.ts`: Operations for GitHub Repositories
   - Each operation function has its own Zod schema for parameter validation
   
4. **Type System**
   - GraphQL types auto-generated in `src/types/github-api-types.ts`
   - Manual type definitions in `src/types/graphql.d.ts`
   - All operations use TypeScript strict mode

### Data Flow

1. MCP client sends request to server via stdio
2. Server validates parameters using Zod schemas
3. GraphQL operation is loaded from bundled string
4. Request is executed via Octokit GraphQL client
5. Response is validated and serialized back to client

## Development Workflow

### Adding New GraphQL Operations

1. Create a new `.graphql` file in the appropriate directory under `src/graphql/`
2. Run `bun run build` to generate TypeScript types
3. Create an operation function in the corresponding file under `src/operations/`
4. Define a Zod schema for the operation parameters
5. Register the tool in `src/index.ts` with proper metadata

### Build Process

The build process (`build.ts`) uses esbuild with a custom plugin that:
- Loads `.graphql` files as strings
- Bundles everything into a single executable
- Outputs to `build/index.js` with shebang for direct execution

### Testing Strategy

Currently, there are no automated tests in this codebase. When adding tests:
1. Consider using Bun's built-in test runner (`bun test`)
2. Test the operations layer with mocked GitHub API responses
3. Validate Zod schemas with edge cases
4. Test GraphQL query construction

### Available Tools

The server provides comprehensive GitHub Projects V2 management:
- **Project Operations**: create, update, delete, copy projects
- **Field Management**: create, update, delete custom fields
- **Item Management**: add/remove items, update field values, archive/unarchive
- **Draft Issues**: create drafts, convert to real issues
- **Templates**: mark/unmark projects as templates
- **Status Updates**: manage project status updates

### Available Prompts

Six intelligent prompts for common workflows:
- Sprint creation and management
- Sprint review and retrospectives
- Sprint planning and refinement
- Project analysis

## GitHub Projects V2 Key Concepts

- **Projects**: Containers for organizing work items across repositories
- **Fields**: Custom fields (SingleSelect, Text, Number, Date, Iteration)
- **Items**: Issues and PRs added to projects
- **Draft Issues**: Temporary issues that exist only within a project
- **Node IDs**: All GitHub objects use global node IDs for GraphQL operations

## Troubleshooting

### Common Issues

1. **GraphQL Errors**: Check that node IDs are properly formatted (base64 encoded)
2. **Permission Errors**: Ensure GitHub token has all required scopes
3. **Build Failures**: Run `bun install` and ensure Bun version is up to date
4. **Type Errors**: Regenerate types with `bun run graphql-codegen`

### Debugging Tips

- GraphQL operations are logged in the operations layer
- Use environment variable `DEBUG=*` for verbose logging
- Check `server.log` for MCP server output
- Validate GraphQL queries at https://docs.github.com/en/graphql/overview/explorer

## MCP Configuration Example

For Claude Desktop, add to your config file:

```json
{
  "mcpServers": {
    "Orchestr8r": {
      "command": "bun",
      "args": ["/path/to/orchestr8r-mcp/build/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here",
        "GITHUB_OWNER": "your_org_or_username"
      }
    }
  }
}
```