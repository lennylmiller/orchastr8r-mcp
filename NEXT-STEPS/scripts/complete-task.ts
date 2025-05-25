#!/usr/bin/env node

/**
 * Complete Task Automation Script
 * Marks current task as done and suggests the next priority
 */

import { projectOperations } from "../../src/operations/index.js";
import type { 
  ProjectV2Item,
  ProjectV2ItemFieldValue 
} from "../../src/types/github-api-types.js";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Project configuration
const PROJECT_ID = 'PVT_kwHOAALNNc4A5x3U';
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
const COMPLETED_FILE = join(homedir(), '.orchestr8r-completed.json');

interface FocusItem {
  itemId: string;
  title: string;
  setAt: string;
  projectId: string;
}

interface CompletedTask {
  itemId: string;
  title: string;
  completedAt: string;
  timeSpent?: number;
  size?: string;
}

interface GroupedItem {
  id: string;
  title: string;
  priority?: string;
  size?: string;
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
 * Get items by status
 */
function getItemsByStatus(items: ProjectV2Item[], status: string): GroupedItem[] {
  return items
    .filter(item => getFieldValue(item, 'Status') === status)
    .map(item => ({
      id: item.id,
      title: getFieldValue(item, 'Title') || 'Untitled',
      priority: getFieldValue(item, 'Priority'),
      size: getFieldValue(item, 'Size')
    }));
}

/**
 * Sort by priority
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
 * Load completed tasks history
 */
function loadCompletedTasks(): CompletedTask[] {
  if (!existsSync(COMPLETED_FILE)) return [];
  try {
    return JSON.parse(readFileSync(COMPLETED_FILE, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * Save completed task
 */
function saveCompletedTask(task: CompletedTask): void {
  const tasks = loadCompletedTasks();
  tasks.push(task);
  // Keep last 100 tasks
  if (tasks.length > 100) {
    tasks.splice(0, tasks.length - 100);
  }
  writeFileSync(COMPLETED_FILE, JSON.stringify(tasks, null, 2));
}

/**
 * Mark task as done
 */
async function markTaskDone(itemId: string): Promise<boolean> {
  try {
    const client = projectOperations.githubClient;
    await client.updateProjectItemField({
      projectId: PROJECT_ID,
      itemId: itemId,
      fieldId: STATUS_FIELD_ID,
      value: { singleSelectOptionId: STATUS_IDS['Done'] }
    });
    return true;
  } catch (error) {
    console.error('Failed to update task status:', error);
    return false;
  }
}

/**
 * Calculate velocity stats
 */
function calculateVelocity(): { today: number; week: number; points: number } {
  const tasks = loadCompletedTasks();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  
  let todayCount = 0;
  let weekCount = 0;
  let weekPoints = 0;
  
  const sizePoints: Record<string, number> = {
    'XS': 1, 'S': 2, 'M': 3, 'L': 5, 'XL': 8
  };
  
  tasks.forEach(task => {
    const completedDate = new Date(task.completedAt);
    if (completedDate >= weekStart) {
      weekCount++;
      weekPoints += sizePoints[task.size || ''] || 0;
      if (completedDate >= todayStart) {
        todayCount++;
      }
    }
  });
  
  return { today: todayCount, week: weekCount, points: weekPoints };
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const itemId = args[0];
  const skipNext = args.includes('--skip-next');
  const dryRun = args.includes('--dry-run');
  
  console.log('🔄 Completing task...\n');
  
  const startTime = Date.now();
  
  try {
    // Get all project items
    const result = await projectOperations.getProjectItems({
      id: PROJECT_ID,
      first: 50,
      after: '',
      filter: ''
    });
    
    const items = result.items || [];
    const inProgress = getItemsByStatus(items, 'In Progress');
    const todo = sortByPriority(getItemsByStatus(items, 'Todo'));
    
    // Determine which task to complete
    let targetItem: GroupedItem | null = null;
    
    if (itemId) {
      // Specific item provided
      targetItem = items
        .filter(item => item.id === itemId)
        .map(item => ({
          id: item.id,
          title: getFieldValue(item, 'Title') || 'Untitled',
          priority: getFieldValue(item, 'Priority'),
          size: getFieldValue(item, 'Size')
        }))[0];
        
      if (!targetItem) {
        console.error(`❌ Item ${itemId} not found`);
        return;
      }
    } else {
      // Check focus or current in progress
      const focus = existsSync(FOCUS_FILE) 
        ? JSON.parse(readFileSync(FOCUS_FILE, 'utf8')) as FocusItem
        : null;
        
      if (focus && focus.projectId === PROJECT_ID) {
        targetItem = inProgress.find(item => item.id === focus.itemId) || null;
      } else if (inProgress.length === 1) {
        targetItem = inProgress[0];
      } else if (inProgress.length > 1) {
        console.log('❓ Multiple tasks in progress. Which one to complete?');
        inProgress.forEach((item, i) => {
          console.log(`   ${i + 1}. [${item.priority}] ${item.title}`);
        });
        console.log('\n💡 Run with task ID: complete-task.ts ITEM_ID');
        return;
      }
    }
    
    if (!targetItem) {
      console.log('❌ No task to complete. Start a task first with start-my-day.ts');
      return;
    }
    
    // Complete the task
    console.log(`✅ Completing: "${targetItem.title}" [${targetItem.priority}]\n`);
    
    if (!dryRun) {
      console.log('   📍 Marking as "Done"...');
      const success = await markTaskDone(targetItem.id);
      if (!success) {
        console.log('   ❌ Failed to update task status');
        return;
      }
      console.log('   ✅ Task marked as done');
      
      // Save completion record
      const completed: CompletedTask = {
        itemId: targetItem.id,
        title: targetItem.title,
        completedAt: new Date().toISOString(),
        size: targetItem.size
      };
      saveCompletedTask(completed);
      console.log('   📊 Updated completion history');
      
      // Clear focus if this was the focused item
      const focus = existsSync(FOCUS_FILE) 
        ? JSON.parse(readFileSync(FOCUS_FILE, 'utf8')) as FocusItem
        : null;
      if (focus && focus.itemId === targetItem.id) {
        unlinkSync(FOCUS_FILE);
        console.log('   🎯 Cleared primary focus');
      }
      
      // Clear context
      if (existsSync(CONTEXT_FILE)) {
        const context = JSON.parse(readFileSync(CONTEXT_FILE, 'utf8'));
        if (context.taskId === targetItem.id) {
          unlinkSync(CONTEXT_FILE);
          console.log('   💾 Cleared work context');
        }
      }
    } else {
      console.log('   📍 Would mark as "Done" (dry run)');
      console.log('   📊 Would update completion history (dry run)');
      console.log('   🎯 Would clear focus/context (dry run)');
    }
    
    // Show velocity stats
    const velocity = calculateVelocity();
    console.log(`\n📈 Your velocity:`);
    console.log(`   Today: ${velocity.today} tasks completed`);
    console.log(`   This week: ${velocity.week} tasks (${velocity.points} points)`);
    
    // Suggest next task
    if (!skipNext && todo.length > 0) {
      const nextTask = todo[0];
      console.log(`\n🎯 Next priority: "${nextTask.title}" [${nextTask.priority}]`);
      console.log('\n💡 Start it with:');
      console.log('   bun run src/scripts/start-my-day.ts --skip-standup');
    } else if (todo.length === 0) {
      console.log('\n🎉 All done! No more tasks in Todo.');
      console.log('\n💡 Time to:');
      console.log('   • Take a break and celebrate!');
      console.log('   • Review what you accomplished');
      console.log('   • Plan the next tasks');
    }
    
    // Git reminder
    console.log('\n🔧 Don\'t forget to:');
    console.log('   • Commit your changes');
    console.log('   • Push to remote');
    console.log('   • Create/update pull request');
    
    // Time tracking
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const estimatedManualTime = 120; // 2 minutes to update status and decide next
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
