#!/usr/bin/env node

/**
 * Context Switch Automation Script
 * Save current work context and switch to a new task
 */

import { projectOperations } from "../../src/operations/index.js";
import type { 
  ProjectV2Item,
  ProjectV2ItemFieldValue 
} from "../../src/types/github-api-types.js";
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Project configuration
const PROJECT_ID = 'PVT_kwHOAALNNc4A5x3U';

// Context storage
const CONTEXT_DIR = join(homedir(), '.orchestr8r-contexts');
const CURRENT_CONTEXT = join(homedir(), '.orchestr8r-context.json');

interface WorkContext {
  taskId: string;
  title: string;
  branch: string;
  startedAt: string;
  notes: string[];
  files?: string[];
  lastCommand?: string;
}

interface SwitchContext {
  fromTaskId?: string;
  toTaskId: string;
  switchedAt: string;
  reason?: string;
}

/**
 * Ensure context directory exists
 */
function ensureContextDir(): void {
  if (!existsSync(CONTEXT_DIR)) {
    const fs = require('fs');
    fs.mkdirSync(CONTEXT_DIR, { recursive: true });
  }
}

/**
 * Get current git branch
 */
async function getCurrentBranch(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD');
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Get modified files
 */
async function getModifiedFiles(): Promise<string[]> {
  try {
    const { stdout } = await execAsync('git status --porcelain');
    return stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.substring(3).trim());
  } catch {
    return [];
  }
}

/**
 * Get last git command from history
 */
async function getLastGitCommand(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('history | grep "git " | tail -1');
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Extract field value
 */
function getFieldValue(item: ProjectV2Item, fieldName: string): string | undefined {
  const fieldValue = item.fieldValues?.nodes?.find(
    (node: ProjectV2ItemFieldValue) => node.field?.name === fieldName
  );
  
  if (fieldValue?.__typename === 'ProjectV2ItemFieldTextValue') {
    return fieldValue.text;
  } else if (fieldValue?.__typename === 'ProjectV2ItemFieldSingleSelectValue') {
    return fieldValue.name || fieldValue.optionId;
  }
  
  return undefined;
}

/**
 * Save current context
 */
async function saveCurrentContext(note?: string): Promise<WorkContext | null> {
  if (!existsSync(CURRENT_CONTEXT)) {
    console.log('❌ No active context to save');
    return null;
  }
  
  try {
    const context: WorkContext = JSON.parse(readFileSync(CURRENT_CONTEXT, 'utf8'));
    
    // Add current state
    context.branch = (await getCurrentBranch()) || context.branch;
    context.files = await getModifiedFiles();
    context.lastCommand = (await getLastGitCommand()) || undefined;
    
    if (note) {
      context.notes.push(`[${new Date().toISOString()}] ${note}`);
    }
    
    // Save to task-specific file
    ensureContextDir();
    const contextFile = join(CONTEXT_DIR, `${context.taskId}.json`);
    writeFileSync(contextFile, JSON.stringify(context, null, 2));
    
    return context;
  } catch (error) {
    console.error('Error saving context:', error);
    return null;
  }
}

/**
 * Load context for a task
 */
function loadTaskContext(taskId: string): WorkContext | null {
  const contextFile = join(CONTEXT_DIR, `${taskId}.json`);
  if (!existsSync(contextFile)) {
    return null;
  }
  
  try {
    return JSON.parse(readFileSync(contextFile, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Find task by partial match
 */
async function findTask(query: string): Promise<ProjectV2Item | null> {
  const result = await projectOperations.getProjectItems({
    id: PROJECT_ID,
    first: 50,
    after: '',
    filter: ''
  });
  
  const items = result.items || [];
  
  // Try exact ID match first
  let found = items.find(item => item.id === query);
  
  // Try title match
  if (!found) {
    const lowerQuery = query.toLowerCase();
    found = items.find(item => {
      const title = getFieldValue(item, 'Title') || '';
      return title.toLowerCase().includes(lowerQuery);
    });
  }
  
  return found || null;
}

/**
 * Show context switch suggestions
 */
function showSwitchSuggestions(from: WorkContext, to: ProjectV2Item): void {
  const toTitle = getFieldValue(to, 'Title') || 'Untitled';
  
  console.log('\n📝 Context switch checklist:');
  
  // Git status check
  if (from.files && from.files.length > 0) {
    console.log(`\n   1. Save your work (${from.files.length} modified files):`);
    console.log('      git add .');
    console.log(`      git commit -m "WIP: ${from.title}"`);
  }
  
  // Branch switch
  const savedContext = loadTaskContext(to.id);
  if (savedContext && savedContext.branch) {
    console.log(`\n   2. Switch to saved branch:`);
    console.log(`      git checkout ${savedContext.branch}`);
  } else {
    console.log(`\n   2. Create or switch branch:`);
    console.log(`      git checkout -b feature/${toTitle.toLowerCase().replace(/\s+/g, '-')}`);
  }
  
  // Context restoration
  if (savedContext && savedContext.notes.length > 0) {
    console.log(`\n   3. Previous context notes:`);
    savedContext.notes.slice(-3).forEach(note => {
      console.log(`      ${note}`);
    });
  }
  
  // Task update suggestion
  console.log(`\n   4. Update task status if needed:`);
  console.log('      bun run src/scripts/start-my-day.ts --skip-standup');
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const targetQuery = args[0];
  const note = args.slice(1).join(' ');
  
  if (!targetQuery || targetQuery === '--help') {
    console.log(`
Context Switch Script

Usage:
  bun run src/scripts/context-switch.ts TARGET [note...]

Arguments:
  TARGET    Task ID or title to switch to
  note      Optional note to save with current context

Examples:
  context-switch.ts PVTI_xyz123 "Stopping to help with urgent bug"
  context-switch.ts "login bug" "Switching to handle user report"
  context-switch.ts "implement auth"
`);
    return;
  }
  
  console.log('🔄 Switching context...\n');
  const startTime = Date.now();
  
  try {
    // Save current context
    console.log('💾 Saving current context...');
    const currentContext = await saveCurrentContext(note);
    
    if (currentContext) {
      console.log(`   ✅ Saved context for: "${currentContext.title}"`);
      if (currentContext.files && currentContext.files.length > 0) {
        console.log(`   📁 ${currentContext.files.length} modified files tracked`);
      }
    }
    
    // Find target task
    console.log('\n🔍 Finding target task...');
    const targetTask = await findTask(targetQuery);
    
    if (!targetTask) {
      console.error(`❌ Task not found: "${targetQuery}"`);
      console.log('\n💡 Try:');
      console.log('   • Using the exact task ID');
      console.log('   • A more specific title match');
      console.log('   • Checking if the task exists in the project');
      return;
    }
    
    const targetTitle = getFieldValue(targetTask, 'Title') || 'Untitled';
    const targetStatus = getFieldValue(targetTask, 'Status') || 'Unknown';
    console.log(`   ✅ Found: "${targetTitle}" [${targetStatus}]`);
    
    // Load previous context for target
    const previousContext = loadTaskContext(targetTask.id);
    if (previousContext) {
      console.log(`\n📂 Previous context found:`);
      console.log(`   🌿 Branch: ${previousContext.branch}`);
      console.log(`   ⏱️  Last worked: ${new Date(previousContext.startedAt).toLocaleDateString()}`);
      if (previousContext.notes.length > 0) {
        console.log(`   📝 ${previousContext.notes.length} context notes`);
      }
    } else {
      console.log('\n📂 No previous context for this task (starting fresh)');
    }
    
    // Create new context for target
    const newContext: WorkContext = previousContext || {
      taskId: targetTask.id,
      title: targetTitle,
      branch: '',
      startedAt: new Date().toISOString(),
      notes: []
    };
    
    if (!previousContext) {
      newContext.notes.push(`[${new Date().toISOString()}] Started work on this task`);
    } else {
      newContext.notes.push(`[${new Date().toISOString()}] Resumed work`);
    }
    
    // Save as current context
    writeFileSync(CURRENT_CONTEXT, JSON.stringify(newContext, null, 2));
    console.log('\n🎯 Switched context to new task');
    
    // Show suggestions
    if (currentContext) {
      showSwitchSuggestions(currentContext, targetTask);
    }
    
    // Track the switch
    const switchFile = join(CONTEXT_DIR, 'switches.json');
    const switches: SwitchContext[] = existsSync(switchFile) 
      ? JSON.parse(readFileSync(switchFile, 'utf8'))
      : [];
      
    switches.push({
      fromTaskId: currentContext?.taskId,
      toTaskId: targetTask.id,
      switchedAt: new Date().toISOString(),
      reason: note
    });
    
    // Keep last 50 switches
    if (switches.length > 50) {
      switches.splice(0, switches.length - 50);
    }
    writeFileSync(switchFile, JSON.stringify(switches, null, 2));
    
    // Time tracking
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n⏰ Time saved: ~2 minutes`);
    console.log(`📊 Context switch completed in ${timeSpent} seconds`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
