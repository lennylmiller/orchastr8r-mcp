# Debugging Orchestr8r MCP

## Quick Start: Debug with Claude Desktop (Recommended)

This is the setup you want if you're running the MCP server inside Claude Desktop and want to debug it from VS Code.

### Step 1: Set up your environment

```bash
# Copy the environment template
cp .env.example .env

# Edit .env and add your GitHub credentials
# GITHUB_TOKEN=ghp_your_actual_token
# GITHUB_OWNER=your_github_username
```

### Step 2: Build for debugging

```bash
bun run build:debug
```

This creates a debug build with source maps (required for breakpoints to work).

### Step 3: Configure Claude Desktop

1. Find your Claude Desktop config file:
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add this configuration (replace the path with your actual project path):

```json
{
  "mcpServers": {
    "orchestr8r-mcp": {
      "command": "node",
      "args": ["--inspect=9229", "/Users/YourName/path/to/orchestr8r-mcp/build/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here",
        "GITHUB_OWNER": "your_github_username"
      }
    }
  }
}
```

3. **Restart Claude Desktop completely** (Quit and reopen)

### Step 4: Start debugging in VS Code

1. Open VS Code in the orchestr8r-mcp project
2. Set a breakpoint in `src/index.ts` (try line 50 where tools are defined)
3. Open the Run and Debug panel (Cmd+Shift+D on Mac)
4. Select **"Attach to MCP Server (Claude Desktop)"** from the dropdown
5. Press F5 or click the green play button
6. In Claude Desktop, use the orchestr8r-mcp tools - your breakpoint should hit!

### Troubleshooting

**Breakpoint not hitting?**
- Make sure you ran `bun run build:debug` (not just `bun run build`)
- Check that Claude Desktop was fully restarted after config changes
- Verify the debugger attached successfully (bottom status bar in VS Code should show "Debugging")

**Can't attach debugger?**
- Check if port 9229 is already in use: `lsof -i :9229`
- Make sure the path in claude_desktop_config.json is absolute and correct
- Try a different port (change both in config and launch.json)

---

## Other Debugging Options

Once you're comfortable with Claude Desktop debugging, here are other useful options:

### Standalone Debugging (without Claude Desktop)
Perfect for testing specific functions or debugging without Claude:

```bash
# Option 1: Debug with Node (more stable)
Select "Debug MCP Server (Node)" in VS Code and press F5

# Option 2: Debug with Bun (faster)
Select "Debug MCP Server (Bun)" in VS Code and press F5

# Option 3: Debug TypeScript directly (no build needed)
Select "Debug TypeScript Directly (Bun)" in VS Code and press F5
```

### Quick Commands

- `bun run build:debug` - Build with source maps (always do this first!)
- `bun run debug` - Build and start with debugger
- `bun run debug:break` - Build and break on first line

### Pro Tips

1. **Set your breakpoints before connecting** - VS Code sometimes misses breakpoints set after attaching
2. **Use the Debug Console** - While paused, you can evaluate expressions and inspect variables
3. **Watch specific variables** - Add them to the Watch panel for easy monitoring
4. **Conditional breakpoints** - Right-click a breakpoint to add conditions (e.g., only break when `toolName === 'create-project'`)

### Common Issues

**"Cannot find module" errors?**
- You need to build first: `bun run build:debug`

**Breakpoints show as gray/unverified?**
- Source maps might be missing - rebuild with `bun run build:debug`
- Make sure you're setting breakpoints in `.ts` files, not `.js` files

**Changes not reflected when debugging?**
- You need to rebuild after code changes: `bun run build:debug`
- Then restart your debug session

Remember: The key is to always use `build:debug` (not just `build`) when you want to debug!