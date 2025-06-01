# Morning Standup Guide

The morning standup script automates your daily standup process, saving approximately 5 minutes each day.

## Features

- =Ê Sprint progress tracking (day X of Y)
- <¯ Primary focus management
- =È Velocity calculations
- =« Blocked items highlighting
- =¡ Smart recommendations

## Basic Usage

```bash
# Run the standup
bun run src/scripts/morning-standup.ts

# Set primary focus
bun run src/scripts/morning-standup.ts --set-focus ITEM_ID

# Clear focus
bun run src/scripts/morning-standup.ts --clear-focus
```

## Output Example

```
=Å Daily Standup - Monday, May 25, 2025


=Ê Sprint: Sprint Development - Orchestr8r
<ÃB Sprint Day 7 of 14

<¯ PRIMARY FOCUS: "Add confidence scoring system"
   Set 2 hours ago

<Ã In Progress (2):
  <¯ [P0] Add confidence scoring system (M)  PRIMARY FOCUS
  " [P1] Refactor plugin architecture (L)

=« Blocked (1):
  " [P0] Deploy to production (S)

=Ë Ready to Start (5):
  " [P0] Create end-of-day script (S)
  " [P1] Add caching layer (M)
  " [P1] Write API documentation (M)
  ... and 2 more

 Recently Completed (3):
  " [P0] Morning standup script (M)
  " [P1] GitHub Projects integration (L)
  " [P2] Add TypeScript types (S)

=¡ Recommendations:
   ’    Address blocked items first

=È Sprint Progress: 21% complete (3/14 items)
=Ê Velocity: 10 points completed | 8 points in progress
<¯ Sprint capacity: 47 total points

ð Time saved today: ~5 minutes (automated standup)
```

## Configuration

Edit these constants in the script:

```typescript
const PROJECT_ID = 'PVT_kwHOAALNNc4A5x3U'; // Your project ID
const STATUS_FIELD_ID = 'PVTSSF_lAHOAALNNc4A5x3UzguhPIo'; // Status field
```

## Primary Focus Feature

The primary focus helps you stay on track:

1. **Set Focus**: Marks one item as your main priority
2. **Persistent**: Survives across standup runs
3. **Visual**: Shows with <¯ emoji
4. **Time Tracking**: Shows when focus was set

## Tips

- Run first thing in the morning
- Use `--set-focus` after standup to commit to a task
- Review blocked items before starting new work
- Track velocity trends week over week

## Customization

You can customize:
- Sprint duration (default: 14 days)
- Priority order (P0, P1, P2)
- Size to points mapping
- Status categories

## Troubleshooting

If no items appear:
1. Check PROJECT_ID matches your project
2. Verify GITHUB_TOKEN has project access
3. Ensure project has items with Status field