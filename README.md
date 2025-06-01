# Orchestr8r MCP

[![smithery badge](https://smithery.ai/badge/orchestr8r-mcp)](https://smithery.ai/server/orchestr8r-mcp)

## Overview

An AI-powered development orchestrator that seamlessly manages your GitHub Projects, automates workflows, and enhances your development lifecycle through intelligent assistance. Orchestr8r helps developers save **45-60 minutes daily** by automating routine tasks through natural language commands.

<a href="https://glama.ai/mcp/servers/orchestr8r-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/orchestr8r-mcp/badge" alt="Orchestr8r MCP server" />
</a>

## Vision: AI-Orchestrated Development Lifecycle (AODL)

Orchestr8r creates an intelligent development companion that allows developers to manage their entire workflow through natural language commands, abstracting away mechanical Git operations, project management tasks, and routine decisions while keeping developers informed and in control.

### Key Benefits
- ⏱️ **Time Saved**: 45-60 minutes per developer per day
- 🔄 **Context Switches**: 50% reduction through intelligent task management
- 🎯 **Focus**: Automates routine tasks so developers can focus on code
- 📊 **Standards**: Enforces team conventions without manual intervention

## Current Features

### 🚀 Production Ready
- **29 GitHub Projects v2 Tools**: Full CRUD operations for projects, issues, and fields
- **Morning Standup Automation**: Saves ~5 minutes daily with intelligent task prioritization
- **Sprint Progress Tracking**: Velocity calculations and sprint day tracking
- **Type Safety**: Built with TypeScript and Zod validation
- **MCP Protocol**: Compatible with Claude Desktop and other AI assistants

### 📋 In Development
- **Workflow Scripts**: `start-my-day`, `complete-task`, `context-switch` (ready to deploy)
- **Confidence Scoring**: FRVPOV engine for AI task assignment
- **Quick Dashboard**: Web interface for sprint visualization

## Installation

### Installing via Smithery

To install Orchestr8r for Claude Desktop automatically via [Smithery](https://smithery.ai/server/orchestr8r-mcp):

```bash
npx -y @smithery/cli install orchestr8r-mcp --client claude
```

## Usage

### Manual Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/orchestr8r-mcp.git
   cd orchestr8r-mcp
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a `.env` file with your GitHub token:
   ```
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_OWNER=your_github_username
   ```

4. Build the server:
   ```bash
   bun run build
   ```

5. Configure your MCP client with the following settings:

```json
{
  "mcpServers": {
    "Orchestr8r": {
      "command": "bun",
      "args": [
        "/path/to/your/directory/orchestr8r-mcp/build/index.js"
      ],
      "env": {
        "GITHUB_TOKEN": "your_github_personal_access_token",
        "GITHUB_OWNER": "your_github_username_or_org"
      }
    }
  }
}
```

## Environment Variables

- `GITHUB_TOKEN`: GitHub Personal Access Token with appropriate permissions
- `GITHUB_OWNER`: GitHub username or organization name

## GitHub Token Permissions

This MCP server requires a GitHub Personal Access Token (classic) with the following permissions:

- `project` - Full control of projects
- `read:project` - Read access of projects
- `repo` - Full control of private repositories
- `repo:status` - Access commit status
- `repo_deployment` - Access deployment status
- `public_repo` - Access public repositories
- `repo:invite` - Access repository invitations
- `security_events` - Read and write security events

## Development

### Commands

- Build: `bun run build`
- Generate GraphQL types: `bun run graphql-codegen`

## Project Structure

Orchestr8r is an MCP Server that orchestrates development workflows through GitHub's GraphQL API, with a focus on intelligent automation and developer productivity.

## Quick Start

### Try the Morning Standup
```bash
# See your sprint status and get recommendations
bun run src/scripts/morning-standup.ts

# Set your primary focus for the day
bun run src/scripts/morning-standup.ts --set-focus ITEM_ID
```

## Available Operations

### Projects (29 tools)
- Create, read, update, and delete GitHub Projects
- Manage project fields, items, and status updates
- Convert draft issues to actual issues
- Archive and unarchive project items
- Bulk update operations for efficiency

### Issues
- Create, read, update, and list issues
- Add issues to projects
- Manage labels and assignees

### Automation Scripts
- **morning-standup**: Daily sprint status and recommendations
- **start-my-day** (coming soon): Auto-assign highest priority task
- **complete-task** (coming soon): Mark done and suggest next task

For detailed documentation, see [docs/](./docs/).
