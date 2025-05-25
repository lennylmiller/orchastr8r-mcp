# Automation Workflows Guide

## Overview

orchestr8r-mcp enables powerful automation workflows for GitHub Projects. This guide covers practical automation patterns from simple to advanced.

## Basic Automation Patterns

### 1. Status Update Automation

Automatically update item status based on events:

```typescript
// When PR is opened, update status to "In Review"
async function onPullRequestOpened(pr: PullRequest) {
  const projectItem = await findProjectItem(pr.issueNumber);
  
  if (projectItem) {
    await updateProjectItemField({
      projectId: PROJECT_ID,
      itemId: projectItem.id,
      fieldId: STATUS_FIELD_ID,
      value: { singleSelectOptionId: "in-review-option-id" }
    });
  }
}
```

### 2. Daily Automation Tasks

```typescript
// Run every morning at 9 AM
async function morningAutomation() {
  // 1. Generate standup report
  const standupReport = await generateStandup();
  
  // 2. Check for stale items
  const staleItems = await findStaleItems(7); // 7 days
  
  // 3. Update sprint metrics
  await updateSprintDashboard();
  
  // 4. Send notifications
  await notifyTeam({
    standup: standupReport,
    staleItems: staleItems
  });
}
```

### 3. Label-Based Automation

```typescript
// React to label changes
async function onLabelAdded(item: ProjectItem, label: string) {
  switch(label) {
    case 'blocked':
      await moveToBlockedColumn(item);
      await notifyManager(item);
      break;
      
    case 'urgent':
      await updatePriority(item, 'Critical');
      await moveToTopOfBacklog(item);
      break;
      
    case 'needs-review':
      await assignReviewer(item);
      break;
  }
}
```

## Advanced Workflow Patterns

### 1. Smart Task Assignment

```typescript
interface TeamMember {
  id: string;
  skills: string[];
  currentLoad: number;
  availability: number;
}

async function smartAssignment(task: Task): Promise<string> {
  const team = await getTeamMembers();
  
  // Score each team member
  const scores = team.map(member => ({
    member,
    score: calculateAssignmentScore(task, member)
  }));
  
  // Sort by best match
  scores.sort((a, b) => b.score - a.score);
  
  // Assign to best match
  return scores[0].member.id;
}

function calculateAssignmentScore(task: Task, member: TeamMember): number {
  let score = 0;
  
  // Skill match (40% weight)
  const skillMatch = task.requiredSkills.filter(
    skill => member.skills.includes(skill)
  ).length / task.requiredSkills.length;
  score += skillMatch * 40;
  
  // Availability (30% weight)
  score += (member.availability / 40) * 30; // 40 hrs/week
  
  // Current load (30% weight - inverse)
  score += ((100 - member.currentLoad) / 100) * 30;
  
  return score;
}
```

### 2. Sprint Planning Automation

```typescript
async function automatedSprintPlanning(
  projectId: string,
  sprintCapacity: number
) {
  // Get velocity data
  const velocity = await getAverageVelocity(projectId, 3);
  const targetPoints = velocity * 0.8; // 80% of average
  
  // Get prioritized backlog
  const backlog = await getPrioritizedBacklog(projectId);
  
  // Select items for sprint
  const sprintItems = [];
  let currentPoints = 0;
  
  for (const item of backlog) {
    if (currentPoints + item.storyPoints <= targetPoints) {
      sprintItems.push(item);
      currentPoints += item.storyPoints;
    }
  }
  
  // Create sprint plan
  return {
    items: sprintItems,
    totalPoints: currentPoints,
    capacity: targetPoints,
    utilization: (currentPoints / targetPoints) * 100
  };
}
```

### 3. Dependency Management

```typescript
async function checkDependencies(item: ProjectItem) {
  const blockedBy = await getBlockingItems(item);
  
  if (blockedBy.length > 0) {
    // Add blocked label
    await addLabel(item, 'blocked');
    
    // Create dependency comment
    const comment = `Blocked by:\n${blockedBy.map(
      b => `- #${b.number}: ${b.title}`
    ).join('\n')}`;
    
    await addComment(item, comment);
    
    // Update status
    await updateStatus(item, 'Blocked');
  }
}
```

## Workflow Recipes

### Recipe 1: Feature Development Flow

```typescript
async function featureWorkflow(featureName: string) {
  // 1. Create epic for feature
  const epic = await createDraftIssue({
    title: `Epic: ${featureName}`,
    body: 'Feature implementation tracking'
  });
  
  // 2. Break down into tasks
  const tasks = await generateFeatureTasks(featureName);
  
  // 3. Create task issues
  for (const task of tasks) {
    const issue = await createDraftIssue({
      title: task.title,
      body: task.description
    });
    
    // Link to epic
    await linkToEpic(issue, epic);
    
    // Set fields
    await setTaskFields(issue, {
      storyPoints: task.estimate,
      priority: task.priority,
      assignee: await smartAssignment(task)
    });
  }
  
  // 4. Create feature branch
  await createFeatureBranch(featureName);
  
  return { epic, tasks };
}
```

### Recipe 2: Bug Triage Automation

```typescript
async function bugTriageWorkflow(bug: Issue) {
  // 1. Analyze severity
  const severity = await analyzeBugSeverity(bug);
  
  // 2. Set priority based on severity
  const priority = mapSeverityToPriority(severity);
  
  // 3. Add to project
  await addItemToProject({
    projectId: BUG_TRACKING_PROJECT,
    contentId: bug.id
  });
  
  // 4. Set fields
  await updateProjectItemFields(bug.id, {
    priority: priority,
    status: 'Triage',
    bugSeverity: severity
  });
  
  // 5. Assign if critical
  if (severity === 'Critical') {
    const assignee = await getOnCallDeveloper();
    await assignIssue(bug, assignee);
    await notifyUrgent(assignee, bug);
  }
}
```

### Recipe 3: Release Preparation

```typescript
async function prepareRelease(version: string) {
  const tasks = [];
  
  // 1. Create release milestone
  const milestone = await createMilestone({
    title: `v${version}`,
    dueDate: getNextReleaseDate()
  });
  
  // 2. Tag items for release
  const releaseItems = await getItemsForRelease(version);
  
  for (const item of releaseItems) {
    await updateMilestone(item, milestone);
    tasks.push(item);
  }
  
  // 3. Create release checklist
  const checklist = await createReleaseChecklist(version);
  
  // 4. Generate release notes draft
  const releaseNotes = await generateReleaseNotes(tasks);
  
  return {
    milestone,
    tasks,
    checklist,
    releaseNotes
  };
}
```

## Scheduled Automations

### Daily Automations

```javascript
// Schedule with cron: 0 9 * * 1-5 (Mon-Fri 9am)
const dailyTasks = [
  {
    name: 'Morning Standup',
    time: '09:00',
    action: generateDailyStandup
  },
  {
    name: 'Stale Item Check',
    time: '10:00',
    action: flagStaleItems
  },
  {
    name: 'PR Review Reminder',
    time: '14:00',
    action: sendReviewReminders
  },
  {
    name: 'End of Day Summary',
    time: '17:00',
    action: generateDailySummary
  }
];
```

### Weekly Automations

```javascript
// Schedule with cron: 0 9 * * 1 (Monday 9am)
const weeklyTasks = [
  {
    name: 'Sprint Planning',
    day: 'Monday',
    action: prepareSprintPlanningData
  },
  {
    name: 'Velocity Report',
    day: 'Friday',
    action: generateVelocityReport
  },
  {
    name: 'Retrospective Prep',
    day: 'Friday',
    action: prepareRetrospectiveData
  }
];
```

## Integration Patterns

### 1. Slack Integration

```typescript
async function postToSlack(channel: string, message: any) {
  const webhook = process.env.SLACK_WEBHOOK;
  
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel,
      ...message
    })
  });
}

// Usage
await postToSlack('#team-standup', {
  text: 'Daily Standup Report',
  blocks: formatStandupBlocks(standupData)
});
```

### 2. Email Notifications

```typescript
async function sendEmailNotification(recipient: string, subject: string, body: string) {
  // Using a service like SendGrid
  await emailService.send({
    to: recipient,
    subject,
    html: body,
    from: 'orchestr8r@company.com'
  });
}
```

### 3. Calendar Integration

```typescript
async function createSprintEvents(sprint: Sprint) {
  const events = [
    {
      title: `Sprint ${sprint.number} Planning`,
      date: sprint.startDate,
      duration: 120 // minutes
    },
    {
      title: `Sprint ${sprint.number} Review`,
      date: addDays(sprint.endDate, -1),
      duration: 60
    },
    {
      title: `Sprint ${sprint.number} Retrospective`,
      date: sprint.endDate,
      duration: 90
    }
  ];
  
  for (const event of events) {
    await calendarAPI.createEvent(event);
  }
}
```

## Error Handling and Recovery

### Retry Logic

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
      delay *= 2; // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Graceful Degradation

```typescript
async function robustAutomation() {
  const results = {
    standup: null,
    metrics: null,
    notifications: null
  };
  
  // Each step continues even if previous fails
  try {
    results.standup = await generateStandup();
  } catch (error) {
    console.error('Standup generation failed:', error);
  }
  
  try {
    results.metrics = await updateMetrics();
  } catch (error) {
    console.error('Metrics update failed:', error);
  }
  
  try {
    results.notifications = await sendNotifications(results);
  } catch (error) {
    console.error('Notifications failed:', error);
  }
  
  return results;
}
```

## Best Practices

1. **Idempotency**: Ensure automations can run multiple times safely
2. **Logging**: Log all actions for debugging and audit
3. **Rate Limiting**: Respect GitHub API limits
4. **Error Handling**: Always handle failures gracefully
5. **Testing**: Test automations in a sandbox project first
6. **Documentation**: Document all automation rules clearly
7. **Monitoring**: Set up alerts for automation failures

## Next Steps

- Start with simple status automations
- Build daily standup automation
- Implement smart task assignment
- Create custom workflows for your team

For specific examples, see our [automation examples](../examples/).