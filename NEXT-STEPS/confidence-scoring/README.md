# Confidence Scoring Integration Plan

## Overview
This module brings the FRVPOV (Feasibility, Risk, Value, Predictability, Overall Viability) scoring system from inner-agility R&D into production use with orchestr8r-mcp.

## What's Included

### 1. frvpov-engine.ts
- Core scoring algorithm
- Calculates 5 dimensions of task readiness
- Returns AI automation recommendations
- Batch processing capabilities

### 2. scoring-schemas.ts  
- Zod schemas extending existing ProjectV2Item
- Configuration options for scoring thresholds
- Request/response schemas for MCP tools
- Helper functions for action generation

## Integration Steps

### Step 1: Add New MCP Tool (Day 5-6)
Create `calculate-confidence-score` tool in main index.ts:

```typescript
server.tool("calculate-confidence-score",
  {
    projectId: z.string(),
    itemId: z.string().optional(),
    config: ScoringConfigSchema.optional()
  },
  async (params) => {
    // Implementation here
  }
);
```

### Step 2: Extend Existing Schemas
Update `src/operations/projects.ts` to include confidence fields:

```typescript
// Add to existing item type
confidenceScore?: number;
frvpovData?: FRVPOVScore;
aiAssignable?: boolean;
```

### Step 3: Create Scoring Service
New file: `src/services/scoring-service.ts`

```typescript
export class ScoringService {
  async scoreItem(item: ProjectV2Item): Promise<ScoringResult>
  async batchScore(items: ProjectV2Item[]): Promise<BatchScoringResponse>
  async getReadyTasks(projectId: string): Promise<ScoredProjectItem[]>
}
```

### Step 4: Add to Morning Standup
Enhance morning-standup.ts to show confidence scores:

```typescript
// In formatItem function
if (item.confidenceScore) {
  parts.push(`[${item.confidenceScore}% confident]`);
}

// Add new section for AI-ready tasks
console.log('🤖 AI-Ready Tasks:');
readyTasks.forEach(task => {
  console.log(`   • ${task.title} (${task.confidenceScore}% confidence)`);
});
```

### Step 5: Create Scoring Script
New script: `src/scripts/score-tasks.ts`

```bash
# Score all tasks in project
bun run src/scripts/score-tasks.ts

# Score specific task
bun run src/scripts/score-tasks.ts ITEM_ID

# Show only AI-ready tasks
bun run src/scripts/score-tasks.ts --ready-only
```

## Configuration

Default thresholds (adjustable):
- **AI Automation**: 70% viability, 70% confidence
- **Human Review**: 50-69% viability or confidence  
- **Not Ready**: Below 50% on either metric

## How Scoring Works

### Feasibility (30% weight)
- Based on: task size, dependencies, assignment status
- Small tasks with clear ownership score higher

### Risk (20% weight)
- Based on: priority, size, technical debt labels
- High priority or large tasks are riskier

### Value (35% weight)
- Based on: priority, value-related labels
- P0 tasks and customer features score higher

### Predictability (15% weight)
- Based on: description quality, similar past work
- Well-defined tasks are more predictable

### Overall Viability
Weighted combination of all factors, determining if task is ready for AI automation.

## Future Enhancements

1. **Learning System**: Track actual vs predicted effort
2. **Team Calibration**: Adjust weights based on team patterns
3. **AI Agent Selection**: Match tasks to best AI model
4. **Automatic Assignment**: Assign high-confidence tasks to AI
5. **Progress Tracking**: Monitor AI task completion rates

## Testing

1. Run on sample tasks to verify scoring
2. Compare scores with human judgment
3. Adjust weights based on results
4. Track false positives/negatives

## ROI Metrics

Track these to prove value:
- Tasks automated per week
- Time saved per automated task
- Success rate of AI automations
- Reduction in review cycles

---

*Start with the MCP tool integration, then gradually expand usage*
