#!/usr/bin/env node

/**
 * Morning Standup Automation Script
 * Generates a daily standup report from your GitHub Project
 */

import { projectOperations } from "../operations/index.js";
import type { 
  GetProjectItemsQuery,
  ProjectV2Item,
  ProjectV2ItemFieldValue,
  ProjectV2SingleSelectFieldOptionColor 
} from "../types/github-api-types.js";

// Project configuration
const PROJECT_ID = 'PVT_kwHOAALNNc4A5x3U'; // Sprint Development - Orchestr8r
const STATUS_FIELD_ID = 'PVTSSF_lAHOAALNNc4A5x3UzguhPIo';

// Status option IDs
const STATUS_IDS: Record<string, string> = {
  'Todo': 'f75ad846',
  'In Progress': '47fc9ee4',
  'Done': '98236657'
};

interface GroupedItem {
  id: string;
  title: string;
  type: string;
  priority?: string;
  size?: string;
  assignees?: string[];
}

interface GroupedItems {
  'Todo': GroupedItem[];
  'In Progress': GroupedItem[];
  'Done': GroupedItem[];
  'Blocked': GroupedItem[];
  'No Status': GroupedItem[];
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
  } else if (fieldValue?.__typename === 'ProjectV2ItemFieldNumberValue') {
    return fieldValue.number?.toString();
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
 * Group items by status
 */
function groupItemsByStatus(items: ProjectV2Item[]): GroupedItems {
  const grouped: GroupedItems = {
    'Todo': [],
    'In Progress': [],
    'Done': [],
    'Blocked': [],
    'No Status': []
  };
  
  items.forEach(item => {
    const status = getFieldValue(item, 'Status') || 'No Status';
    const title = getFieldValue(item, 'Title') || 'Untitled';
    const priority = getFieldValue(item, 'Priority');
    const size = getFieldValue(item, 'Size');
    
    const groupedItem: GroupedItem = {
      id: item.id,
      title,
      type: item.type || 'ISSUE',
      priority,
      size
    };
    
    // Check if item has blocked label
    if (item.content?.__typename === 'Issue' && 
        item.content.labels?.nodes?.some(label => label.name.toLowerCase() === 'blocked')) {
      grouped['Blocked'].push(groupedItem);
    } else if (status in grouped) {
      grouped[status as keyof GroupedItems].push(groupedItem);
    } else {
      grouped['No Status'].push(groupedItem);
    }
  });
  
  return grouped;
}

/**
 * Format item for display
 */
function formatItem(item: GroupedItem): string {
  const parts = ['  •'];
  
  if (item.priority) {
    parts.push(`[${item.priority}]`);
  }
  
  parts.push(item.title);
  
  if (item.size) {
    parts.push(`(${item.size})`);
  }
  
  return parts.join(' ');
}

/**
 * Get sprint day number (assuming 14-day sprints starting on Monday)
 */
function getSprintDay(): number {
  const today = new Date();
  const sprintStart = new Date('2025-05-19'); // Adjust to your sprint start
  const daysDiff = Math.floor((today.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24));
  return (daysDiff % 14) + 1;
}

/**
 * Calculate story points from size
 */
function sizeToPoints(size?: string): number {
  const sizeMap: Record<string, number> = {
    'XS': 1,
    'S': 2,
    'M': 3,
    'L': 5,
    'XL': 8
  };
  return sizeMap[size || ''] || 0;
}

/**
 * Generate standup report
 */
function generateStandupReport(groupedItems: GroupedItems, totalItems: number): void {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const sprintDay = getSprintDay();
  
  console.log(`
📅 Daily Standup - ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Sprint: Sprint Development - Orchestr8r
🏃‍♂️ Sprint Day ${sprintDay} of 14
`);

  // In Progress items
  console.log(`🏃 In Progress (${groupedItems['In Progress'].length}):`);
  if (groupedItems['In Progress'].length === 0) {
    console.log('   No items currently in progress');
  } else {
    groupedItems['In Progress'].forEach(item => {
      console.log(formatItem(item));
    });
  }
  console.log('');

  // Blocked items
  if (groupedItems['Blocked'].length > 0) {
    console.log(`🚫 Blocked (${groupedItems['Blocked'].length}):`);
    groupedItems['Blocked'].forEach(item => {
      console.log(formatItem(item));
    });
    console.log('');
  }

  // Todo items (prioritized)
  const prioritizedTodo = groupedItems['Todo'].sort((a, b) => {
    const priorityOrder: Record<string, number> = { 'P0': 0, 'P1': 1, 'P2': 2 };
    const aPriority = priorityOrder[a.priority || 'P2'] ?? 3;
    const bPriority = priorityOrder[b.priority || 'P2'] ?? 3;
    return aPriority - bPriority;
  });

  console.log(`📋 Ready to Start (${groupedItems['Todo'].length}):`);
  if (groupedItems['Todo'].length === 0) {
    console.log('   No items in todo');
  } else {
    prioritizedTodo.slice(0, 3).forEach(item => {
      console.log(formatItem(item));
    });
    if (groupedItems['Todo'].length > 3) {
      console.log(`   ... and ${groupedItems['Todo'].length - 3} more`);
    }
  }
  console.log('');

  // Done items (recent)
  console.log(`✅ Recently Completed (${groupedItems['Done'].length}):`);
  if (groupedItems['Done'].length === 0) {
    console.log('   No items completed yet this sprint');
  } else {
    groupedItems['Done'].forEach(item => {
      console.log(formatItem(item));
    });
  }
  console.log('');

  // Calculate velocity
  const completedPoints = groupedItems['Done'].reduce(
    (sum, item) => sum + sizeToPoints(item.size), 0
  );
  const inProgressPoints = groupedItems['In Progress'].reduce(
    (sum, item) => sum + sizeToPoints(item.size), 0
  );
  const totalPoints = Object.values(groupedItems).flat().reduce(
    (sum, item) => sum + sizeToPoints(item.size), 0
  );

  // Recommendations
  console.log('💡 Recommendations:');
  if (groupedItems['Blocked'].length > 0) {
    console.log('   → ⚠️  Address blocked items first');
  } else if (groupedItems['In Progress'].length === 0 && prioritizedTodo.length > 0) {
    const nextItem = prioritizedTodo[0];
    console.log(`   → Start with: "${nextItem.title}" [${nextItem.priority}]`);
    console.log(`   → Command: bun run build/index.js update-project-item-field --projectId ${PROJECT_ID} --itemId ${nextItem.id} --fieldId ${STATUS_FIELD_ID} --value '{"singleSelectOptionId":"${STATUS_IDS['In Progress']}"}'`);
  } else if (groupedItems['In Progress'].length > 2) {
    console.log('   → You have multiple items in progress. Consider finishing one before starting another.');
  } else if (groupedItems['Todo'].length === 0 && groupedItems['In Progress'].length === 0) {
    console.log('   → All caught up! Time to plan the next sprint or create new tasks.');
  } else {
    console.log('   → Keep working on your current tasks. You\'re doing great!');
  }
  
  // Sprint Progress
  const donePercentage = totalItems > 0 
    ? Math.round((groupedItems['Done'].length / totalItems) * 100) 
    : 0;
    
  console.log(`
📈 Sprint Progress: ${donePercentage}% complete (${groupedItems['Done'].length}/${totalItems} items)
📊 Velocity: ${completedPoints} points completed | ${inProgressPoints} points in progress
🎯 Sprint capacity: ${totalPoints} total points

⏰ Time saved today: ~5 minutes (automated standup)
`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🔄 Fetching project data...\n');
  
  try {
    // Get all project items
    const items = await getProjectItems();
    
    if (!items || items.length === 0) {
      console.log('No items found in the project. Add some tasks to get started!');
      console.log('\nTo add items, you can:');
      console.log('1. Use GitHub web interface');
      console.log('2. Use orchestr8r-mcp add-draft-issue command');
      console.log('3. Add existing issues with add-item-to-project command');
      return;
    }
    
    // Group by status
    const groupedItems = groupItemsByStatus(items);
    
    // Generate report
    generateStandupReport(groupedItems, items.length);
    
  } catch (error) {
    console.error('Error generating standup report:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}