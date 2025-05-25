# Primary Focus Feature Demo

The morning standup script now supports tracking a single "primary focus" item that persists across runs.

## How to Use Primary Focus

### 1. View Current Standup (no focus set)
```bash
bun run src/scripts/morning-standup.ts
```

### 2. Set Primary Focus
```bash
# Set a specific item as your primary focus
bun run src/scripts/morning-standup.ts --set-focus PVTI_lAHOAALNNc4A5x3UzgavmyQ

# Or use the short flag
bun run src/scripts/morning-standup.ts -f PVTI_lAHOAALNNc4A5x3UzgavmyQ
```

### 3. View Standup with Focus
```bash
bun run src/scripts/morning-standup.ts
```

Now you'll see:
- 🎯 PRIMARY FOCUS section at the top
- The focused item marked with 🎯 in the In Progress list
- How long ago you set this focus

### 4. Clear Focus (when done)
```bash
bun run src/scripts/morning-standup.ts --clear-focus
# or
bun run src/scripts/morning-standup.ts -c
```

## Example Output with Primary Focus

```
📅 Daily Standup - Friday, May 23, 2025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Sprint: Sprint Development - Orchestr8r
🏃‍♂️ Sprint Day 5 of 14

🎯 PRIMARY FOCUS: "Implement morning standup automation"
   Set 2 hours ago

🏃 In Progress (1):
   🎯 [P0] Implement morning standup automation (S) ← PRIMARY FOCUS

📋 Ready to Start (4):
   • [P1] Create Git hooks for status sync (M)
   • [P1] Add task assignment automation (M)
   • [P2] Build sprint velocity dashboard (L)
   ... and 1 more
```

## Benefits

1. **Stay Focused**: Always know what your main task is
2. **Meeting Ready**: "What are you working on?" - check your primary focus
3. **Context Switching**: Quickly remember what you were doing after interruptions
4. **Daily Planning**: Set focus in morning, clear when done

## Focus File Location

Your focus is stored in: `~/.orchestr8r-focus.json`

This file persists between runs and contains:
- Item ID
- Item title
- When it was set
- Project ID

## Package.json Script

Add to package.json for easier use:
```json
"scripts": {
  "standup": "bun run src/scripts/morning-standup.ts",
  "focus": "bun run src/scripts/morning-standup.ts --set-focus"
}
```

Then use:
```bash
bun run standup
bun run focus ITEM_ID
```