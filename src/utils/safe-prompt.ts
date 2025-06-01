import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodTypeAny } from "zod";

/**
 * Safely register a prompt with the MCP server, working around the _def null issue
 * This wraps the original prompt method to ensure schema fields are properly initialized
 */
export function registerPromptSafely(
  server: McpServer,
  name: string,
  argsSchema: Record<string, ZodTypeAny>,
  handler: (args: any) => any
) {
  // Ensure all schema fields are valid Zod types
  const safeSchema: Record<string, ZodTypeAny> = {};
  
  for (const [key, value] of Object.entries(argsSchema)) {
    if (value && typeof value === 'object' && '_def' in value) {
      safeSchema[key] = value;
    } else {
      console.warn(`Skipping invalid schema field "${key}" in prompt "${name}"`);
    }
  }
  
  // Register with optional description parameter
  server.prompt(name, safeSchema, handler);
}

/**
 * Alternative approach: Monkey-patch the server's prompt method
 * to add null checks before accessing _def
 */
export function patchServerPromptMethod(server: McpServer) {
  const originalPrompt = server.prompt.bind(server);
  
  server.prompt = function(name: string, ...rest: any[]) {
    try {
      // Call original method
      return originalPrompt(name, ...rest);
    } catch (error) {
      console.error(`Error registering prompt "${name}":`, error);
      // Try to recover by registering without schema if possible
      if (rest.length >= 1) {
        const handler = rest[rest.length - 1];
        if (typeof handler === 'function') {
          console.warn(`Registering prompt "${name}" without schema due to error`);
          return originalPrompt(name, handler);
        }
      }
      throw error;
    }
  };
}