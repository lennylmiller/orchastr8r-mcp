# Orchestr8r

[![smithery badge](https://smithery.ai/badge/orchestr8r)](https://smithery.ai/server/orchestr8r)

An AI-powered development orchestrator that seamlessly manages your GitHub Projects, automates workflows, and enhances your development lifecycle through intelligent assistance.

<a href="https://glama.ai/mcp/servers/orchestr8r">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/orchestr8r/badge" alt="Orchestr8r MCP server" />
</a>

## Vision

Orchestr8r aims to be your intelligent development companion, orchestrating the entire Software Development Life Cycle (SDLC) through natural language interfaces. It simplifies developer workflows while maintaining full visibility and control over the development process.

## Features

- **GitHub Projects v2 API**: Full support for GitHub's GraphQL Projects v2 API
- **GitHub Issues**: Create, read, and update GitHub issues
- **GitHub Repositories**: Fetch repository details
- **Type Safety**: Built with TypeScript for maximum type safety

## Installation

### Installing via Smithery

To install Orchestr8r for Claude Desktop automatically via [Smithery](https://smithery.ai/server/orchestr8r):

```bash
npx -y @smithery/cli install orchestr8r --client claude
```

## Usage

### Manual Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/orchestr8r.git
   cd orchestr8r
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
        "/path/to/your/directory/orchestr8r/build/index.js"
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

## Available Operations

### Projects
- Create, read, update, and delete GitHub Projects
- Manage project fields, items, and status updates
- Convert draft issues to actual issues
- Archive and unarchive project items

### Issues
- Get issue details
- Add issues to projects

### Repositories
- Get repository information
