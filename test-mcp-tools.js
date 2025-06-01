// Test script for MCP tools
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Validate environment
if (!process.env.GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  console.error('Please set it with: export GITHUB_TOKEN=your_github_token');
  process.exit(1);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'lennylmiller';

async function testMCPConnection() {
  console.log('Testing MCP Connection...');
  
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
    env: {
      ...process.env,
      GITHUB_TOKEN,
      GITHUB_OWNER
    }
  });

  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to MCP server');

    // List available tools
    console.log('\nAvailable tools:');
    const tools = await client.listTools();
    tools.tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });

    // Test a simple tool - list projects
    console.log('\n\nTesting list_projects tool...');
    const result = await client.callTool('list_projects', { first: 5 });
    console.log('Projects:', JSON.stringify(result, null, 2));

    await client.close();
    console.log('\n✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMCPConnection().catch(console.error);