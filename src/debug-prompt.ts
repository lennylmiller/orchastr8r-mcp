// Debug script to check prompt schemas
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer(
    {
        name: "test-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            prompts: {},
            tools: {},
        },
    },
);

// Register a test prompt similar to the ones in index.ts
server.prompt(
    "test-prompt",
    {
        sprintName: z
            .string()
            .describe("Name of the sprint (e.g., 'Sprint 23', 'Q2 Sprint 1')"),
        startDate: z.string().describe("Start date of the sprint (ISO format)"),
        duration: z
            .string()
            .describe("Duration of sprint in days (typically 7, 14, or 30)"),
        goals: z.string().optional().describe("Primary goals for this sprint"),
    },
    ({ sprintName, startDate, duration, goals }) => ({
        messages: [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Test prompt with: ${sprintName}, ${startDate}, ${duration}, ${goals}`,
                },
            },
        ],
    }),
);

// Access the registered prompt to inspect it
const registeredPrompts = (server as any)._registeredPrompts;
console.log("Registered prompts:", Object.keys(registeredPrompts));

for (const [name, prompt] of Object.entries(registeredPrompts)) {
    console.log(`\nPrompt: ${name}`);
    console.log("Has argsSchema:", !!(prompt as any).argsSchema);
    
    if ((prompt as any).argsSchema) {
        const schema = (prompt as any).argsSchema;
        console.log("Schema type:", schema.constructor.name);
        console.log("Schema shape keys:", Object.keys(schema.shape || {}));
        
        // Check each field
        for (const [fieldName, field] of Object.entries(schema.shape || {})) {
            console.log(`  Field ${fieldName}:`, {
                type: (field as any).constructor.name,
                hasDef: !!(field as any)._def,
                defType: (field as any)._def ? typeof (field as any)._def : 'N/A'
            });
        }
    }
}