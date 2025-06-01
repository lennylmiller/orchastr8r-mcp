To run "Claude Code" as an "MCP (Model Context Protocol)" server, you'll first need to ensure you have the "Claude Code CLI" installed and configured. Then, you'll use the claude mcp add command to register the Claude Code server with your MCP configuration. [1, 1, 2, 2, 3, 3]  
Detailed Steps: 

1. Install Claude Code CLI: [1, 3, 4]  
	• Make sure you have Node.js version 18 or higher installed. [1, 1]  
	• Install the Claude Code CLI globally using npm: npm install -g @anthropic-ai/claude-code. [1, 1]  

2. Configure Claude Code CLI: [3, 4, 5]  
	• You'll need to log in and accept the terms of service for the Claude Code CLI. The first time you run it, you might need to use the --dangerously-skip-permissions flag. [5, 5]  
	• On macOS, the first run might fail with permission errors, but subsequent runs should work fine. [5, 5]  

3. Add Claude Code as an MCP Server: [3, 6]  
	• Use the claude mcp add command. For example, to add Claude Code as a local server, you'd use: [6, 7]  

     claude mcp add claude-code-server --command claude --args "mcp serve"

• This command tells Claude Code to start an MCP server named claude-code-server using the claude command with the arguments mcp serve. [2, 3]  
• You can also add servers that use other transports like SSE (Server-Sent Events) using the --transport sse flag. [2]  

1. Verify the MCP Server: 
	• Use claude mcp list to see a list of all your configured MCP servers. [2, 2]  
	• You should see claude-code-server in the list. [2, 8]  

Using Claude Code as an MCP Server: 

• Once Claude Code is running as an MCP server, you can use it with various frameworks like Cursor or integrate it into your own applications that support the Model Context Protocol. 
• Claude Code provides tools like readFile, ls, edit, and more, which can be accessed through your MCP client. 
• Your MCP client is responsible for handling user confirmations for individual tool calls. [3]  

Key Considerations: 

• Make sure you have an active Anthropic API key. [9]  
• Consider security and management when using Claude Code as an MCP server, especially regarding user permissions for tool calls. [3]  
• You can configure Claude Code with global and project-level settings using claude config in your terminal or the /config command in the REPL. [10]  

AI responses may include mistakes.

[1] https://docs.anthropic.com/en/docs/claude-code/getting-started[2] https://docs.anthropic.com/en/docs/claude-code/tutorials[3] https://playbooks.com/mcp/claude-code[4] https://docs.anthropic.com/en/docs/claude-code/overview[5] https://github.com/steipete/claude-code-mcp[6] https://www.youtube.com/watch?v=JzgZlSKA_3E[7] https://scottspence.com/posts/configuring-mcp-tools-in-claude-code[8] https://www.analyticsvidhya.com/blog/2025/04/mcp-with-cursor-ai/[9] https://www.youtube.com/watch?v=oM2dXJnD80c[10] https://docs.anthropic.com/en/docs/claude-code/settings
