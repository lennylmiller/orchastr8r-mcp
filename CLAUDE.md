# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Orchestr8r MCP is an MCP (Model Context Protocol) server that provides AI-powered development orchestration for GitHub Projects, focusing on intelligent automation and developer productivity through GitHub's GraphQL API.

## Development Commands

### Build and Development
- **Build**: `bun run build` - Build the TypeScript project and generate GraphQL types
- **Build with debug**: `bun run build:debug` - Build with sourcemaps for debugging
- **Development**: `bun run dev` - Run in development mode with hot reload
- **Debug**: `bun run debug` - Build and run with Node.js inspector
- **Debug with breakpoint**: `bun run debug:break` - Build and run with inspector pausing on start

### Testing
- **Run tests**: `bun test`
- **Watch tests**: `bun test --watch`
- **Run specific test**: `bun test tests/operations/projects.test.ts`

### Automation Scripts
- **Morning standup**: `bun run src/scripts/morning-standup.ts`
- **Start my day**: `bun run src/scripts/start-my-day.ts`
- **Complete task**: `bun run src/scripts/complete-task.ts`
- **Context switch**: `bun run src/scripts/context-switch.ts`

## Architecture

### Core Structure
- **MCP Server**: Built using `@modelcontextprotocol/sdk` for communication with AI clients
- **GitHub Integration**: Uses Octokit with GraphQL and REST plugins for GitHub API access
- **Type Safety**: Full TypeScript with generated types from GraphQL operations
- **Operations Layer**: Centralized operations in `src/operations/` for projects, issues, and repositories
- **Automation Scripts**: Daily workflow scripts in `src/scripts/` saving 30+ minutes per day

### Key Components
1. **Server Entry**: `src/index.ts` - MCP server initialization and tool registration (770 lines - needs refactoring)
2. **GitHub Client**: `src/operations/github-client.ts` - Centralized GitHub API client
3. **GraphQL Operations**: `src/graphql/` - GraphQL queries organized by domain
4. **Automation Scripts**: `src/scripts/` - Daily workflow automation
5. **Type Generation**: Automated via graphql-codegen from `.graphql` files

### Environment Configuration
Required environment variables:
- `GITHUB_TOKEN`: GitHub Personal Access Token with project, repo permissions
- `GITHUB_OWNER`: GitHub username or organization

## Primary Development Project

**Project #10: Sprint Development - Orchestr8r** (ID: `PVT_kwHOAALNNc4A5x3U`)
- This is the main project for tracking orchestr8r-mcp development
- Uses 2-week sprints for iterative development
- All development tasks and issues should be added to this project

## Documentation Structure

The project now uses industry-standard documentation:
- **README.md** - Overview, vision, quick start
- **ARCHITECTURE.md** - Technical design and system architecture
- **ROADMAP.md** - Implementation timeline and phases
- **CONTRIBUTING.md** - How to contribute and code patterns
- **docs/** - Detailed guides and API documentation
  - `getting-started/` - Installation and setup
  - `guides/` - How-to guides for features
  - `api/` - Tool and API reference

## MCP Tools Available

The server exposes 29 tools for GitHub Projects management:
- Project operations: create, read, update, delete projects
- Item management: add/remove items, update fields, archive/unarchive
- Field management: create/update/delete custom fields
- Issue operations: create, read, update issues
- Draft issues: create and convert draft issues to real issues

## Development Guidelines

1. **GraphQL First**: All GitHub API interactions should use GraphQL when possible
2. **Type Safety**: Always generate types after adding new GraphQL queries
3. **Error Handling**: Use the custom error types in `src/common/errors.ts`
4. **Testing**: Add tests for new operations in the appropriate test files
5. **MCP Protocol**: Follow MCP specifications for tool and prompt definitions
6. **Ship Daily**: Working code > Perfect architecture - deliver value every day

## Next Steps

Immediate priorities from ROADMAP.md:
1. Test and deploy the 3 scripts moved to `src/scripts/`
2. Create `end-of-day.ts` and `weekly-review.ts` scripts
3. Document all 29 MCP tools in `docs/api/tools.md`
4. Begin plugin architecture refactoring