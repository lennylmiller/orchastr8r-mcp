// Load environment variables from .env file FIRST - before any other imports
import fs from "fs";
import path from "path";

// Manually load .env file to avoid CommonJS/ESM issues
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      }
    });
  }
} catch (error) {
  console.warn('Warning: Could not load .env file:', error);
}

// Environment variables loaded successfully

// Now import everything else after environment variables are loaded
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPrompts } from "./prompts/index.js";
import { registerTools } from "./tools/index.js";

const server = new McpServer(
	{
		name: "orchestr8r-mcp",
		version: "1.0.0",
	},
	{
		capabilities: {
			prompts: {},
			tools: {},
		},
	},
);

// Register prompts and tools using modular functions
registerPrompts(server);
registerTools(server);

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error("Server error:", error);
	process.exit(1);
});
