# Implementation Guide

## Core Patterns from morning-standup.ts

### 1. Script Structure Template

```typescript
#!/usr/bin/env node

/**
 * [Script Name] Automation Script
 * [Brief description of what it does]
 */

import { projectOperations } from "../operations/index.js";
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Configuration
const PROJECT_ID = 'PVT_kwHOAALNNc4A5x3U'; // Sprint Development - Orchestr8r
const STATUS_FIELD_ID = 'PVTSSF_lAHOAALNNc4A5x3UzguhPIo';

// Main function
async function main(): Promise<void> {
  console.log('🔄 Starting [task name]...\n');
  
  try {
    // Core logic here
    
    // Always report time saved
    console.log(`\n⏰ Time saved: ~X minutes`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

### 2. Common Functions to Reuse

```typescript
// Extract field value by name (copy from morning-standup.ts)
function getFieldValue(item: ProjectV2Item, fieldName: string): string | undefined

// Get all items from the project
async function getProjectItems(): Promise<ProjectV2Item[]>

// Group items by status
function groupItemsByStatus(items: ProjectV2Item[]): GroupedItems

// Format item for display
function formatItem(item: GroupedItem, isPrimaryFocus: boolean = false): string

// Calculate story points from size
function sizeToPoints(size?: string): number
```

### 3. State Management Pattern

```typescript
// Use JSON files in home directory for persistent state
const STATE_FILE = join(homedir(), '.orchestr8r-[feature].json');

interface StateData {
  // Define your state structure
  lastRun: string;
  currentContext: any;
}

function loadState(): StateData | null {
  if (!existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function saveState(state: StateData): void {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}
```

### 4. Console Output Guidelines

Use emojis for visual scanning:
- 🔄 Processing/Loading
- ✅ Success/Complete
- ❌ Error/Failed
- 🎯 Focus/Priority
- 📊 Stats/Metrics
- 💡 Suggestions
- ⏰ Time-related
- 📈 Progress
- 🚫 Blocked
- 🏃 In Progress

### 5. Command Line Arguments

```typescript
const args = process.argv.slice(2);
const command = args[0];

if (command === '--help' || command === '-h') {
  console.log(`
[Script Name]

Usage:
  bun run src/scripts/[script-name].ts [options]

Options:
  --option, -o VALUE    Description
  --help, -h            Show this help

Examples:
  bun run src/scripts/[script-name].ts
  bun run src/scripts/[script-name].ts --option value
`);
  return;
}
```

### 6. Error Handling Pattern

```typescript
try {
  // Main logic
} catch (error) {
  if (error instanceof SpecificError) {
    console.error('❌ Specific error:', error.message);
    console.log('\n💡 Try: [suggestion to fix]');
  } else {
    console.error('❌ Unexpected error:', error);
  }
  process.exit(1);
}
```

### 7. Time Tracking Pattern

```typescript
const startTime = Date.now();

// ... do work ...

const timeSpent = Math.round((Date.now() - startTime) / 1000);
const timeSaved = estimatedManualTime - timeSpent;
console.log(`\n⏰ Time saved: ~${timeSaved} seconds`);
console.log(`📊 Automation completed in ${timeSpent} seconds`);
```

## Specific Script Patterns

### start-my-day.ts
1. Run morning-standup internally
2. Automatically move highest priority todo to "In Progress"
3. Generate git branch name
4. Create context file for the task
5. Show commands to run

### complete-task.ts
1. Move current task to "Done"
2. Clear primary focus
3. Archive if needed
4. Suggest next task based on priority
5. Optionally set new focus

### context-switch.ts
1. Save current context (branch, files open, notes)
2. Commit work-in-progress if needed
3. Switch to new task context
4. Restore previous state if available

### end-of-day.ts
1. Show what was accomplished today
2. Move incomplete items back to "Todo" if needed
3. Generate summary for team updates
4. Create tomorrow's plan
5. Clear focus for fresh start

### weekly-review.ts
1. Calculate velocity for the week
2. Show completed vs planned
3. Identify blockers and patterns
4. Generate report for stakeholders
5. Suggest process improvements

## Testing Each Script

1. **Dry run mode**: Add `--dry-run` flag to preview actions
2. **Verbose mode**: Add `--verbose` for detailed logging
3. **Test data**: Create test project for safe experimentation
4. **Error cases**: Test with missing data, wrong IDs, etc.
5. **Time measurement**: Compare to manual process

## Integration Points

### With MCP Tools
```typescript
// Example: Using MCP tool from script
import { GitHubClient } from "../operations/github-client.js";

const client = new GitHubClient(process.env.GITHUB_TOKEN!);
const result = await client.updateProjectItemField({
  projectId: PROJECT_ID,
  itemId: item.id,
  fieldId: STATUS_FIELD_ID,
  value: { singleSelectOptionId: STATUS_IDS['In Progress'] }
});
```

### With Each Other
```typescript
// Scripts can call each other
import { main as runMorningStandup } from "./morning-standup.js";
await runMorningStandup();
```

## Performance Considerations

1. **Cache project data**: Don't fetch multiple times in one run
2. **Batch operations**: Update multiple items in one API call
3. **Async operations**: Use Promise.all for parallel work
4. **Progress indicators**: Show progress for long operations
5. **Fail fast**: Exit early on critical errors

## Remember

- Each script should work standalone
- Time savings must be measurable
- User experience over code elegance
- Test with real data before shipping
- Document assumptions clearly

---

*Follow these patterns for consistency and maintainability*
