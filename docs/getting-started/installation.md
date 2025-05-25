# Installation Guide

## Prerequisites

- Node.js >= 18.0.0
- Bun >= 1.0.0
- GitHub Personal Access Token with appropriate permissions
- Claude Desktop (for MCP integration)

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/lennylmiller/orchestr8r-mcp.git
cd orchestr8r-mcp
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your GitHub token:

```bash
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your_username
```

### 4. Build the Project

```bash
bun run build
```

This runs GraphQL code generation and builds the TypeScript files.

## Claude Desktop Configuration

### Option 1: Install via Smithery (Recommended)

```bash
npx -y @smithery/cli install orchestr8r-mcp --client claude
```

### Option 2: Manual Configuration

Add to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "orchestr8r": {
      "command": "node",
      "args": ["/path/to/orchestr8r-mcp/build/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token",
        "GITHUB_OWNER": "your_username"
      }
    }
  }
}
```

Configuration file locations:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

## Verify Installation

1. Restart Claude Desktop
2. Test the connection:
   ```
   User: "List my GitHub projects"
   Claude: [Should list your GitHub projects]
   ```

## Development Setup

For development with hot-reloading:

```bash
# Build with source maps for debugging
bun run build:debug

# Run with inspector
bun run debug
```

See [Debugging Guide](../guides/debugging.md) for detailed debugging instructions.

## Troubleshooting

### Common Issues

**"MCP server not found"**
- Ensure the path in Claude Desktop config is absolute
- Check that the build completed successfully
- Verify file permissions

**"401 Unauthorized"**
- Check your GitHub token has required permissions:
  - `project` - Full control of projects
  - `repo` - Repository access
  - `read:project` - Read project access

**"Command not found: bun"**
- Install Bun: `curl -fsSL https://bun.sh/install | bash`
- Or use npm/yarn as alternatives

## Next Steps

- [First Project Tutorial](./first-project.md)
- [Configuration Reference](./configuration.md)
- [Sprint Management Guide](../guides/sprint-management.md)