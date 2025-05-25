#!/usr/bin/env node

/**
 * Start My Day Automation Script
 * Runs morning standup and automatically sets up your highest priority task
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
const PROJECT_ID = 'PVT_kwHOAALNNc4A5x3U'; // Sprint Development - Orchestr8r
const STATUS_FIELD_ID = 'PVTSSF_lAHOAALNNc4A5x3UzguhPIo';

// Status option IDs
const STATUS_IDS: Record<string, string> = {
  'Todo': 'f75ad846',
  'In Progress': '47fc9ee4',
  'Done': '98236657'
};

// State files
const FOCUS_FILE = join(homedir(), '.orchestr8r-focus.json');
const CONTEXT_FILE = join(homedir(), '.orchestr8r-context.json');

interface FocusItem {
  itemId: string;
  title: string;
  setAt: string;
  projectId: string;
}

interface WorkContext {
  taskId: string;
  title: string;
  branch: string;
  startedAt: string;
  notes: string[];
}

interface GroupedItem {
  id: string;
  title: string;
  type: string;
  priority?: string;
  size?: string;
  url?: string;
}

/**
 * Extract field value by name
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
 * Get all items from the project
 */
async function getProjectItems(): Promise<ProjectV2Item[]> {
  try {
    const result = await projectOperations.getProjectItems({
      id: PROJECT_ID,
      first: 50,
      after: '',
      filter: ''
    });
    
    return result.items || [];
  } catch (error) {
    console.error('Error fetching project items:', error);
    return [];
  }
}

/**
 * Get items by status
 */
function getItemsByStatus(items: ProjectV2Item[], status: string): GroupedItem[] {
  return items
    .filter(item => getFieldValue(item, 'Status') === status)
    .map(item => ({
      id: item.id,
      title: getFieldValue(item, 'Title') || 'Untitled',
      type: item.type || 'ISSUE',
      priority: getFieldValue(item, 'Priority'),
      size: getFieldValue(item, 'Size'),
      url: item.content?.__typename === 'Issue' ? item.content.url : undefined
    }));
}

/**
 * Sort items by priority
 */
function sortByPriority(items: GroupedItem[]): GroupedItem[] {
  const priorityOrder: Record<string, number> = { 'P0': 0, 'P1': 1, 'P2': 2 };
  return items.sort((a, b) => {
    const aPriority = priorityOrder[a.priority || 'P2'] ?? 3;
    const bPriority = priorityOrder[b.priority || 'P2'] ?? 3;
    return aPriority - bPriority;
  });
}

/**
 * Generate branch name from title
 */
function generateBranchName(title: string): string {
  return 'feature/' + title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

/**
 * Set primary focus
 */
function setPrimaryFocus(item: GroupedItem): void {
  const focus: FocusItem = {
    itemId: item.id,
    title: item.title,
    setAt: new Date().toISOString(),
    projectId: PROJECT_ID
  };
  
  writeFileSync(FOCUS_FILE, JSON.stringify(focus, null, 2));
}

/**
 * Save work context
 */
function saveWorkContext(item: GroupedItem, branch: string): void {
  const context: WorkContext = {
    taskId: item.id,
    title: item.title,
    branch: branch,
    startedAt: new Date().toISOString(),
    notes: []
  };
  
  writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));
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
 * Move item to In Progress
 */
async function moveToInProgress(item: GroupedItem): Promise<boolean> {
  try {
    const client = projectOperations.githubClient;
    await client.updateProjectItemField({
      projectId: PROJECT_ID,
      itemId: item.id,
      fieldId: STATUS_FIELD_ID,
      value: { singleSelectOptionId: STATUS_IDS['In Progress'] }
    });
    return true;
  } catch (error) {
    console.error('Failed to update item status:', error);
    return false;
  }
}

/**
 * Run morning standup summary
 */
async function runMorningStandup(items: ProjectV2Item[]): Promise<void> {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  console.log(`📅 Starting Your Day - ${date}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const inProgress = getItemsByStatus(items, 'In Progress');
  const todo = sortByPriority(getItemsByStatus(items, 'Todo'));
  const done = getItemsByStatus(items, 'Done');
  
  // Quick summary
  console.log(`📊 Current Status:`);
  console.log(`   🏃 In Progress: ${inProgress.length} items`);
  console.log(`   📋 Todo: ${todo.length} items`);
  console.log(`   ✅ Done: ${done.length} items\n`);
  
  // Show current work
  if (inProgress.length > 0) {
    console.log(`🏃 Currently In Progress:`);
    inProgress.forEach(item => {
      console.log(`   • [${item.priority || 'P2'}] ${item.title} (${item.size || '?'})`);
    });
    console.log('');
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipStandup = args.includes('--skip-standup');
  
  console.log('🔄 Starting your development day...\n');
  
  const startTime = Date.now();
  
  try {
    // Get project items
    const items = await getProjectItems();
    
    if (!items || items.length === 0) {
      console.log('❌ No items found in the project.');
      return;
    }
    
    // Run morning standup unless skipped
    if (!skipStandup) {
      await runMorningStandup(items);
    }
    
    // Get current state
    const inProgress = getItemsByStatus(items, 'In Progress');
    const todo = sortByPriority(getItemsByStatus(items, 'Todo'));
    
    // Determine what to work on
    let targetItem: GroupedItem | null = null;
    let action: string = '';
    
    if (inProgress.length === 0 && todo.length > 0) {
      // No items in progress, start the highest priority
      targetItem = todo[0];
      action = 'start';
      console.log(`🎯 Starting highest priority task: "${targetItem.title}" [${targetItem.priority}]\n`);
    } else if (inProgress.length === 1) {
      // Continue with current item
      targetItem = inProgress[0];
      action = 'continue';
      console.log(`🎯 Continuing with: "${targetItem.title}" [${targetItem.priority}]\n`);
    } else if (inProgress.length > 1) {
      // Multiple items in progress - need to focus
      console.log('⚠️  You have multiple items in progress:');
      inProgress.forEach((item, i) => {
        console.log(`   ${i + 1}. [${item.priority}] ${item.title}`);
      });
      console.log('\n💡 Consider finishing one before starting another.');
      console.log('   Use --focus ITEM_ID to set your primary focus.\n');
      return;
    } else {
      console.log('✅ All caught up! No tasks to start.\n');
      console.log('💡 Next steps:');
      console.log('   • Create new tasks for the sprint');
      console.log('   • Review and groom the backlog');
      console.log('   • Plan the next sprint\n');
      return;
    }
    
    // Execute the action
    if (targetItem && action === 'start') {
      console.log('🚀 Setting up your workspace...\n');
      
      // Move to In Progress
      if (!dryRun) {
        console.log('   📍 Moving task to "In Progress"...');
        const moved = await moveToInProgress(targetItem);
        if (!moved) {
          console.log('   ❌ Failed to update task status');
          return;
        }
        console.log('   ✅ Task moved to "In Progress"');
      } else {
        console.log('   📍 Would move task to "In Progress" (dry run)');
      }
      
      // Set primary focus
      if (!dryRun) {
        setPrimaryFocus(targetItem);
        console.log('   🎯 Set as primary focus');
      } else {
        console.log('   🎯 Would set as primary focus (dry run)');
      }
      
      // Generate branch name
      const branchName = generateBranchName(targetItem.title);
      console.log(`   🌿 Suggested branch: ${branchName}`);
      
      // Save context
      if (!dryRun) {
        saveWorkContext(targetItem, branchName);
        console.log('   💾 Saved work context');
      } else {
        console.log('   💾 Would save work context (dry run)');
      }
      
      // Show next steps
      console.log('\n📝 Next steps:');
      console.log(`   1. Create and checkout branch:`);
      console.log(`      git checkout -b ${branchName}`);
      console.log(`   2. Open the issue in browser:`);
      if (targetItem.url) {
        console.log(`      open ${targetItem.url}`);
      }
      console.log(`   3. Start coding!`);
      
    } else if (targetItem && action === 'continue') {
      // Check current context
      let context: WorkContext | null = null;
      if (existsSync(CONTEXT_FILE)) {
        try {
          context = JSON.parse(readFileSync(CONTEXT_FILE, 'utf8'));
        } catch {}
      }
      
      if (context && context.taskId === targetItem.id) {
        console.log(`📂 Work context loaded:`);
        console.log(`   🌿 Branch: ${context.branch}`);
        console.log(`   ⏱️  Started: ${new Date(context.startedAt).toLocaleTimeString()}`);
        
        const currentBranch = await getCurrentBranch();
        if (currentBranch && currentBranch !== context.branch) {
          console.log(`\n💡 Switch to your work branch:`);
          console.log(`   git checkout ${context.branch}`);
        }
      } else {
        console.log('💡 No saved context for this task.');
        console.log('   Run with a Todo item to set up properly.');
      }
    }
    
    // Calculate time saved
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const estimatedManualTime = 180; // 3 minutes to check project, decide, and set up
    const timeSaved = Math.max(0, estimatedManualTime - timeSpent);
    
    console.log(`\n⏰ Time saved: ~${Math.round(timeSaved / 60)} minutes`);
    console.log(`📊 Automation completed in ${timeSpent} seconds`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
