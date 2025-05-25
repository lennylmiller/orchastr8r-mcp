# Sprint Management Guide

## Overview

This guide shows how to effectively manage sprints using orchestr8r-mcp, including sprint planning, daily standups, and retrospectives.

## Setting Up Sprints

### 1. Create a Sprint Project

```bash
# Using the create-sprint-project prompt
User: "Create a new sprint project for Q1 development"
Claude: [Creates project with iteration fields and standard configuration]
```

### 2. Configure Sprint Fields

Essential fields for sprint management:

- **Sprint/Iteration**: 2-week cycles (configurable)
- **Story Points**: Numeric field for estimation
- **Priority**: Critical, High, Medium, Low
- **Epic**: Group related work
- **Sprint Goal**: Text field for objectives

### 3. Sprint Planning

```javascript
// Example: Populate sprint backlog
const sprintItems = [
  {
    title: "Implement user authentication",
    storyPoints: 8,
    priority: "High",
    epic: "Foundation"
  },
  {
    title: "Add caching layer",
    storyPoints: 5,
    priority: "Medium",
    epic: "Performance"
  }
];

// Add items to sprint
for (const item of sprintItems) {
  await createDraftIssue({
    projectId: "YOUR_PROJECT_ID",
    title: item.title,
    body: `Story Points: ${item.storyPoints}`
  });
}
```

## Daily Standup Automation

### Morning Standup Script

```typescript
import { ProjectOperations } from 'orchestr8r-mcp';

async function dailyStandup(projectId: string) {
  // Get current iteration items
  const items = await orchestr8r.getProjectItems({
    id: projectId,
    first: 50,
    filter: 'iteration:@current'
  });
  
  // Categorize by status
  const report = {
    inProgress: items.filter(i => i.status === 'In Progress'),
    blocked: items.filter(i => i.labels.includes('blocked')),
    completed: items.filter(i => i.status === 'Done' && isToday(i.closedAt))
  };
  
  return formatStandupReport(report);
}
```

### Standup Report Format

```
🌅 Daily Standup - March 15, 2024
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Sprint 3 - Day 5 of 10

🏃 In Progress (3):
  • [HIGH] Auth implementation - @john (5pts)
  • [MED] Cache layer - @sarah (3pts)
  • [LOW] Documentation - @mike (2pts)

✅ Completed Yesterday (2):
  • Database schema migration
  • API endpoint scaffolding

🚫 Blocked (1):
  • Payment integration - Waiting for API keys

🎯 Today's Focus:
  • Complete auth implementation
  • Unblock payment integration
  • Start cache layer testing

📈 Sprint Progress: 35% complete (28/80 points)
```

## Sprint Velocity Tracking

### Calculate Velocity

```typescript
async function calculateVelocity(projectId: string, iterations: number = 3) {
  const velocities = [];
  
  for (let i = 0; i < iterations; i++) {
    const items = await getCompletedItems(projectId, i);
    const points = items.reduce((sum, item) => 
      sum + (item.storyPoints || 0), 0
    );
    velocities.push(points);
  }
  
  return {
    average: velocities.reduce((a, b) => a + b) / velocities.length,
    trend: calculateTrend(velocities),
    lastSprint: velocities[0]
  };
}
```

### Velocity Dashboard

```
📊 Team Velocity Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━

Sprint 1: ████████████████ 32 pts
Sprint 2: ████████████████████ 40 pts  
Sprint 3: ██████████████ 28 pts (current)

Average Velocity: 33.3 points/sprint
Trend: 📉 Decreasing
Recommendation: Review blockers and team capacity
```

## Sprint Reviews and Retrospectives

### Sprint Review Automation

```typescript
async function generateSprintReview(projectId: string, sprintNumber: number) {
  const metrics = await gatherSprintMetrics(projectId, sprintNumber);
  
  return {
    completed: metrics.completedItems,
    incomplete: metrics.incompleteItems,
    velocity: metrics.totalPoints,
    blockers: metrics.blockerCount,
    achievements: identifyAchievements(metrics),
    carryover: metrics.incompleteItems.filter(i => i.priority === 'High')
  };
}
```

### Retrospective Template

```markdown
## Sprint 3 Retrospective

### 🎉 What Went Well
- Completed authentication ahead of schedule
- Good collaboration on API design
- Effective use of pair programming

### 😔 What Didn't Go Well  
- Payment integration blocked for 3 days
- Underestimated caching complexity
- Too many context switches

### 💡 Action Items
1. [ ] Get payment API keys before sprint start
2. [ ] Add spike tasks for complex features
3. [ ] Implement focus time blocks

### 📊 Metrics
- Planned: 80 points
- Completed: 65 points (81%)
- Velocity: 32.5 (3-sprint avg)
```

## Best Practices

### 1. Sprint Planning
- Keep sprints consistent (2 weeks recommended)
- Plan for 80% capacity to allow for unknowns
- Always define a clear sprint goal
- Prioritize ruthlessly

### 2. Daily Management
- Run standup automation every morning
- Update task status immediately
- Flag blockers with labels
- Keep comments up-to-date

### 3. Sprint Boundaries
- No new work after sprint starts (use backlog)
- Complete work carries over with explanation
- Review and adjust estimates based on actuals

### 4. Continuous Improvement
- Track velocity trends over time
- Identify recurring blockers
- Celebrate achievements
- Implement retrospective action items

## Advanced Automation

### Auto-assign Tasks

```typescript
async function autoAssignTasks(projectId: string) {
  const unassigned = await getUnassignedTasks(projectId);
  const teamCapacity = await getTeamCapacity();
  
  for (const task of unassigned) {
    const bestMatch = findBestAssignee(task, teamCapacity);
    await assignTask(task.id, bestMatch.userId);
  }
}
```

### Sprint Health Monitoring

```typescript
async function checkSprintHealth(projectId: string) {
  const metrics = await getSprintMetrics(projectId);
  
  const warnings = [];
  
  if (metrics.blockedRatio > 0.2) {
    warnings.push("⚠️ High blocker ratio (>20%)");
  }
  
  if (metrics.velocityTrend < -10) {
    warnings.push("⚠️ Velocity dropping significantly");
  }
  
  if (metrics.scopeCreep > 0.1) {
    warnings.push("⚠️ Scope creep detected (>10%)");
  }
  
  return warnings;
}
```

## Integration with Git

### Branch Creation

```bash
# Create feature branches from issues
git checkout -b feature/AUTH-123-implement-login

# Link commits to issues
git commit -m "feat(auth): implement login flow

Implements OAuth2 login with GitHub provider
Closes #123"
```

### PR Automation

When PRs are created, orchestr8r-mcp can:
- Update issue status to "In Review"
- Add PR link to project item
- Notify reviewers
- Track review time

## Troubleshooting

### Common Issues

1. **Items not showing in current sprint**
   - Check iteration field configuration
   - Verify date ranges
   - Ensure items have iteration assigned

2. **Velocity calculations incorrect**
   - Verify story points field
   - Check completed status
   - Ensure date filtering is correct

3. **Automation not triggering**
   - Check API permissions
   - Verify project IDs
   - Review error logs

## Next Steps

- Set up your first sprint project
- Configure automation scripts
- Run a sprint retrospective
- Track velocity over 3 sprints

For more examples, see [Sprint Automation Examples](../examples/sprint-automation.md).