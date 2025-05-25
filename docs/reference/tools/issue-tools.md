# Issue Tools API Reference

## Overview

Issue tools provide integration with GitHub Issues, allowing you to create, update, and manage issues directly through orchestr8r-mcp.

## Tools

### get-issue

Retrieves a GitHub issue by number.

**Parameters:**
- `name` (string, required): Repository name (without owner)
- `number` (number, required): Issue number

**Returns:**
```typescript
{
  issue: {
    id: string;
    number: number;
    title: string;
    body: string;
    state: "open" | "closed";
    author: { login: string };
    assignees: Array<{ login: string }>;
    labels: Array<{ name: string; color: string }>;
    milestone: { title: string; number: number } | null;
    createdAt: string;
    updatedAt: string;
    closedAt: string | null;
  }
}
```

**Example:**
```
User: "Get issue #123 from orchestr8r-mcp repo"
Claude: [Retrieves issue details including title, status, assignees, and labels]
```

---

### list-issues

Lists issues from a repository with filtering options.

**Parameters:**
- `repo` (string, required): Repository name
- `state` (string, optional): `open`, `closed`, or `all` (default: `open`)
- `assignee` (string, optional): Filter by assignee username
- `labels` (array, optional): Filter by label names
- `milestone` (string, optional): Filter by milestone number or `*` for any
- `sort` (string, optional): `created`, `updated`, or `comments` (default: `created`)
- `direction` (string, optional): `asc` or `desc` (default: `desc`)
- `page` (number, optional): Page number (default: 1)
- `per_page` (number, optional): Items per page, max 100 (default: 30)

**Returns:**
```typescript
{
  issues: Array<{
    id: string;
    number: number;
    title: string;
    state: string;
    author: { login: string };
    assignees: Array<{ login: string }>;
    labels: Array<{ name: string }>;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    hasNext: boolean;
  }
}
```

**Example:**
```
User: "List all open bugs assigned to me"
Claude: [Lists issues with state=open, labels=["bug"], assignee="yourusername"]
```

---

### create-issue

Creates a new GitHub issue.

**Parameters:**
- `repo` (string, required): Repository name
- `title` (string, required): Issue title
- `body` (string, optional): Issue description (supports Markdown)
- `assignees` (array, optional): Usernames to assign
- `labels` (array, optional): Label names to apply
- `milestone` (number, optional): Milestone ID

**Returns:**
```typescript
{
  issue: {
    id: string;
    number: number;
    title: string;
    body: string;
    url: string;
    state: "open";
    author: { login: string };
    createdAt: string;
  }
}
```

**Example:**
```
User: "Create a bug report for login issues"
Claude: [Creates issue with appropriate title, description, and labels]
```

---

### update-issue

Updates an existing GitHub issue.

**Parameters:**
- `repo` (string, required): Repository name
- `issueNumber` (number, required): Issue number to update
- `title` (string, optional): New title
- `body` (string, optional): New body
- `state` (string, optional): `open` or `closed`
- `assignees` (array, optional): Replace assignees (null to clear)
- `labels` (array, optional): Replace labels (null to clear)
- `milestone` (number | null, optional): Milestone ID (null to clear)

**Returns:**
```typescript
{
  issue: {
    id: string;
    number: number;
    title: string;
    state: string;
    updatedAt: string;
  }
}
```

**Example:**
```
User: "Close issue #123 as resolved"
Claude: [Updates issue state to closed]
```

## Common Patterns

### Bug Report Creation

```typescript
// Create a bug report with standard template
const bugReport = await createIssue({
  repo: "my-app",
  title: "🐛 Login button not responding on mobile",
  body: `## Description
The login button does not respond to taps on iOS devices.

## Steps to Reproduce
1. Open app on iPhone
2. Navigate to login screen
3. Tap login button
4. Nothing happens

## Expected Behavior
Login form should submit when button is tapped.

## Environment
- Device: iPhone 12
- OS: iOS 16.4
- App Version: 2.3.1

## Screenshots
[Attach screenshots if applicable]`,
  labels: ["bug", "mobile", "high-priority"],
  assignees: ["mobile-team-lead"]
});
```

### Feature Request

```typescript
// Create a feature request
const feature = await createIssue({
  repo: "my-app",
  title: "✨ Add dark mode support",
  body: `## Feature Description
Add a dark mode theme option to reduce eye strain in low-light conditions.

## Use Case
Users working late at night need a darker interface.

## Proposed Solution
- Add theme toggle in settings
- Store preference in localStorage
- Apply CSS variables for theming

## Alternatives Considered
- System-based auto detection
- Time-based automatic switching`,
  labels: ["enhancement", "ux", "good-first-issue"]
});
```

### Bulk Issue Operations

```typescript
// Close all issues with a specific label
async function closeIssuesByLabel(repo: string, label: string) {
  const issues = await listIssues({
    repo,
    state: "open",
    labels: [label],
    per_page: 100
  });
  
  for (const issue of issues.issues) {
    await updateIssue({
      repo,
      issueNumber: issue.number,
      state: "closed"
    });
  }
}
```

## Integration with Projects

### Link Issues to Projects

When creating issues, they can be automatically added to projects:

```typescript
// Create issue and add to project
const issue = await createIssue({
  repo: "my-app",
  title: "Implement user authentication",
  labels: ["feature", "backend"]
});

// Add to project
await addItemToProject({
  projectId: "PVT_kwHOAALNNc4A5x3U",
  contentId: issue.issue.id
});

// Set project fields
await updateProjectItemField({
  projectId: "PVT_kwHOAALNNc4A5x3U",
  itemId: projectItem.id,
  fieldId: STORY_POINTS_FIELD,
  value: { number: 8 }
});
```

### Convert Draft Issues to Real Issues

```typescript
// Convert a draft issue in a project to a real issue
await convertDraftIssue({
  itemId: "PVTI_lAHOAALNNc4A5x3UzgavmyQ",
  repositoryId: "R_kgDOJKLMNO"
});
```

## Search and Filtering

### Complex Queries

```typescript
// Find high-priority bugs from this week
const urgentBugs = await listIssues({
  repo: "my-app",
  state: "open",
  labels: ["bug", "high-priority"],
  sort: "created",
  direction: "desc"
});

// Filter further by date
const thisWeeksBugs = urgentBugs.issues.filter(issue => {
  const created = new Date(issue.createdAt);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return created > weekAgo;
});
```

### Assignee Workload

```typescript
// Check assignee workload
async function getAssigneeWorkload(repo: string, assignee: string) {
  const issues = await listIssues({
    repo,
    state: "open",
    assignee,
    per_page: 100
  });
  
  return {
    total: issues.issues.length,
    byLabel: groupByLabel(issues.issues),
    oldest: issues.issues[issues.issues.length - 1],
    newest: issues.issues[0]
  };
}
```

## Error Handling

Common errors and solutions:

### Authentication Errors
```
Error: 401 Unauthorized
```
**Solution**: Check that your GitHub token has `repo` scope

### Not Found Errors
```
Error: 404 Not Found
```
**Solution**: Verify repository name and issue number exist

### Rate Limiting
```
Error: 403 API rate limit exceeded
```
**Solution**: Implement exponential backoff and caching

### Validation Errors
```
Error: 422 Validation Failed
```
**Solution**: Check required fields and data formats

## Best Practices

1. **Use Templates**: Create issue templates for consistency
2. **Label Strategy**: Develop a clear labeling taxonomy
3. **Milestone Planning**: Use milestones for release planning
4. **Assignee Balance**: Monitor and balance team workload
5. **Automation**: Integrate with project automation
6. **Search First**: Check for duplicates before creating
7. **Rich Formatting**: Use Markdown for clear communication

## Rate Limits

GitHub REST API rate limits:
- Authenticated: 5,000 requests/hour
- Per-repository: Additional limits may apply
- Search API: 30 requests/minute

Monitor with response headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Next Steps

- Create your first issue programmatically
- Set up issue templates
- Build automation workflows
- Integrate with project boards

For more examples, see [Issue Management Examples](../examples/issue-management.md).