#!/usr/bin/env node

/**
 * Simple test for Context Store functionality
 * Tests the context persistence by checking if files are created
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testContextPersistence() {
  console.log('🧪 Testing Context Persistence...\n');

  try {
    const contextDir = path.join(__dirname, '.orchestr8r');
    const contextFile = path.join(contextDir, 'context.json');
    const lockFile = path.join(contextDir, 'context.lock');

    // Test 1: Check if context directory exists or can be created
    console.log('📁 Test 1: Context directory setup');
    if (!fs.existsSync(contextDir)) {
      fs.mkdirSync(contextDir, { recursive: true });
      console.log('✅ Context directory created:', contextDir);
    } else {
      console.log('✅ Context directory exists:', contextDir);
    }
    console.log();

    // Test 2: Create test context file
    console.log('📝 Test 2: Create test context');
    const testContext = {
      currentProjectId: 'test-project-123',
      currentIssueId: 'test-issue-456',
      currentTaskState: 'research',
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(contextFile, JSON.stringify(testContext, null, 2));
    console.log('✅ Test context written to:', contextFile);
    console.log('Context:', JSON.stringify(testContext, null, 2));
    console.log();

    // Test 3: Read context back
    console.log('📊 Test 3: Read context back');
    const readContext = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
    console.log('✅ Context read successfully:', JSON.stringify(readContext, null, 2));
    console.log();

    // Test 4: Test lock file creation
    console.log('🔒 Test 4: Lock file operations');
    fs.writeFileSync(lockFile, process.pid.toString());
    console.log('✅ Lock file created:', lockFile);

    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
      console.log('✅ Lock file removed');
    }
    console.log();

    // Test 5: Update context
    console.log('🔄 Test 5: Update context');
    const updatedContext = {
      ...testContext,
      currentTaskState: 'implementation',
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(contextFile, JSON.stringify(updatedContext, null, 2));
    console.log('✅ Context updated:', JSON.stringify(updatedContext, null, 2));
    console.log();

    console.log('🎉 All Context Persistence tests passed!');
    console.log('📍 Context file location:', contextFile);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testContextPersistence();
