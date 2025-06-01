# Installation Guide

## Quick Start with Smithery

The fastest way to install Orchestr8r-MCP:

```bash
npx -y @smithery/cli install orchestr8r-mcp --client claude
```

## Manual Installation

### Prerequisites
- Node.js 23+ or Bun runtime
- GitHub Personal Access Token
- Claude Desktop or compatible MCP client

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/orchestr8r-mcp.git
cd orchestr8r-mcp
```

### Step 2: Install Dependencies
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### Step 3: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
GITHUB_TOKEN=ghp_YOUR_PERSONAL_ACCESS_TOKEN
GITHUB_OWNER=your_github_username
```

### Step 4: Build the Server
```bash
bun run build
```

### Step 5: Configure Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "orchestr8r": {
      "command": "bun",
      "args": ["/path/to/orchestr8r-mcp/build/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_YOUR_TOKEN",
        "GITHUB_OWNER": "your_username"
      }
    }
  }
}
```

## Verify Installation

In Claude Desktop, type:
```
Can you list my GitHub projects?
```

Claude should respond with your GitHub Projects list.

## Next Steps
- Run the morning standup: `bun run src/scripts/morning-standup.ts`
- Read the [Quick Start Guide](./quick-start.md)
- Explore [available tools](../api/tools.md)