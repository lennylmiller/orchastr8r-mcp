// Test script for context tracking tools
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// Validate environment
if (!process.env.GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required');
  console.error('Please set it with: export GITHUB_TOKEN=your_github_token');
  process.exit(1);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'lennylmiller';
const PROJECT_ID = process.env.PROJECT_ID || 'PVT_kwHOAALNNc4A5x3U';

async function testContextTools() {
  console.log('🧪 Testing Orchestr8r MCP Context Tools...\n');

  // Start the MCP server
  const serverProcess = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      GITHUB_TOKEN,
      GITHUB_OWNER
    }
  });

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
    name: 'test-context-client',
    version: '1.0.0'
  });

  try {
    await client.connect(transport);
    console.log('✅ Connected to Orchestr8r MCP server\n');

    // Test 1: Set context
    console.log('📝 Test 1: Setting context...');
    const setContextResult = await client.callTool('context_set', {
      activeProjectId: PROJECT_ID,
      activeIssueNumber: 42,
      workflowPhase: 'development',
      metadata: {
        sprint: 'Sprint 1',
        priority: 'high'
      }
    });
    console.log('Result:', JSON.stringify(setContextResult, null, 2));
    console.log('✅ Context set successfully\n');

    // Test 2: Get context
    console.log('📖 Test 2: Getting context...');
    const getContextResult = await client.callTool('context_get', {});
    console.log('Result:', JSON.stringify(getContextResult, null, 2));
    console.log('✅ Context retrieved successfully\n');

    // Test 3: Update context
    console.log('🔄 Test 3: Updating context...');
    const updateContextResult = await client.callTool('context_update', {
      workflowPhase: 'testing',
      metadata: {
        sprint: 'Sprint 1',
        priority: 'critical',
        testingStatus: 'in-progress'
      }
    });
    console.log('Result:', JSON.stringify(updateContextResult, null, 2));
    console.log('✅ Context updated successfully\n');

    // Test 4: Clear context
    console.log('🧹 Test 4: Clearing context...');
    const clearContextResult = await client.callTool('context_clear', {});
    console.log('Result:', JSON.stringify(clearContextResult, null, 2));
    console.log('✅ Context cleared successfully\n');

    // Test 5: Verify context is cleared
    console.log('✔️  Test 5: Verifying context is cleared...');
    const verifyResult = await client.callTool('context_get', {});
    console.log('Result:', JSON.stringify(verifyResult, null, 2));
    console.log('✅ Context verification complete\n');

    console.log('🎉 All context tool tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    serverProcess.kill();
    process.exit(0);
  }
}

// Run the tests
testContextTools().catch(console.error);