# Project Tools API Reference

## Overview

Project tools provide comprehensive management of GitHub Projects V2, including creating, updating, and querying projects and their items.

## Tools

### get-project

Retrieves a GitHub Project by its ID.

**Parameters:**
- `id` (string, required): The GitHub Project node ID (e.g., `PVT_kwHOAALNNc4A5x3U`)

**Returns:**
```typescript
{
  node: {
    id: string;
    title: string;
    shortDescription: string | null;
    url: string;
    creator: { login: string };
    public: boolean;
    closed: boolean;
    createdAt: string;
    updatedAt: string;
    number: number;
  }
}
```

**Example:**
```
User: "Get details for project PVT_kwHOAALNNc4A5x3U"
Claude: [Uses get-project tool and returns project details]
```

---

### list-projects

Lists GitHub Projects for a user or organization.

**Parameters:**
- `login` (string, optional): GitHub username or organization. Defaults to GITHUB_OWNER env var
- `first` (number, required): Number of projects to return (max 100)
- `after` (string, optional): Cursor for pagination

**Returns:**
```typescript
{
  projects: Array<{
    id: string;
    title: string;
    shortDescription: string | null;
    url: string;
    number: number;
    createdAt: string;
    updatedAt: string;
    closed: boolean;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  }
}
```

**Example:**
```
User: "List my first 10 projects"
Claude: [Uses list-projects with first=10]
```

---

### create-project

Creates a new GitHub Project V2.

**Parameters:**
- `ownerId` (string, required): The owner ID to create the project under
- `title` (string, required): The title of the project
- `repositoryId` (string, optional): Repository to link the project to
- `teamId` (string, optional): Team to link the project to

**Returns:**
```typescript
{
  createProjectV2: {
    projectV2: {
      id: string;
      title: string;
      url: string;
    }
  }
}
```

**Example:**
```
User: "Create a new project called 'Q1 Sprint Planning'"
Claude: [Uses create-project tool with appropriate parameters]
```

---

### update-project

Updates an existing GitHub Project.

**Parameters:**
- `projectId` (string, required): The ID of the project to update
- `title` (string, optional): New title
- `shortDescription` (string, optional): New description
- `public` (boolean, optional): Set visibility
- `closed` (boolean, optional): Close or reopen project
- `readme` (string, optional): Readme content

**Returns:**
```typescript
{
  updateProjectV2: {
    projectV2: {
      id: string;
      title: string;
      shortDescription: string;
    }
  }
}
```

---

### delete-project

Deletes a GitHub Project.

**Parameters:**
- `projectId` (string, required): The ID of the project to delete

**Returns:**
```typescript
{
  deleteProjectV2: {
    projectV2: {
      id: string;
      title: string;
    }
  }
}
```

⚠️ **Warning:** This action cannot be undone. All project data will be permanently deleted.

---

### copy-project

Creates a copy of an existing project.

**Parameters:**
- `projectId` (string, required): Source project ID
- `ownerId` (string, required): Owner for the new project
- `title` (string, required): Title for the new project
- `includeDraftIssues` (boolean, required): Whether to copy draft issues

**Returns:**
```typescript
{
  copyProjectV2: {
    projectV2: {
      id: string;
      title: string;
      url: string;
    }
  }
}
```

---

### get-project-columns

Gets the status columns (workflow states) for a project.

**Parameters:**
- `id` (string, required): Project ID

**Returns:**
```typescript
{
  fields: Array<{
    __typename: string;
    id: string;
    name: string;
    options?: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  }>
}
```

---

### get-project-fields

Gets all fields configured for a project.

**Parameters:**
- `id` (string, required): Project ID

**Returns:**
```typescript
{
  fields: Array<{
    __typename: string;
    id: string;
    name: string;
    dataType?: string;
    options?: Array<{
      id: string;
      name: string;
      description?: string;
      color: string;
    }>;
    configuration?: {
      iterations: Array<{
        startDate: string;
        duration: number;
      }>;
    };
  }>
}
```

---

### get-project-items

Retrieves items (issues, PRs, drafts) from a project.

**Parameters:**
- `id` (string, required): Project ID
- `first` (number, required): Number of items to return (max 100)
- `after` (string, optional): Pagination cursor
- `filter` (string, optional): Filter expression

**Returns:**
```typescript
{
  items: Array<{
    id: string;
    type: "ISSUE" | "PULL_REQUEST" | "DRAFT_ISSUE";
    fieldValues: {
      nodes: Array<{
        __typename: string;
        text?: string;
        number?: number;
        name?: string;
        field: {
          name: string;
          id: string;
        };
      }>;
    };
    content: {
      __typename: string;
      number?: number;
      title?: string;
    };
  }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  }
}
```

## Field Management Tools

### create-project-field

Creates a custom field in a project.

**Parameters:**
- `projectId` (string, required): Project ID
- `dataType` (string, required): One of: `TEXT`, `NUMBER`, `DATE`, `SINGLE_SELECT`, `ITERATION`
- `name` (string, required): Field name
- `singleSelectOptions` (array, optional): Options for SINGLE_SELECT fields
  - `name` (string): Option name
  - `description` (string): Option description
  - `color` (string): One of: `RED`, `ORANGE`, `YELLOW`, `GREEN`, `BLUE`, `PURPLE`, `PINK`, `GRAY`

**Example:**
```
User: "Add a Priority field with High, Medium, Low options"
Claude: [Creates SINGLE_SELECT field with appropriate options]
```

---

### update-project-field

Updates an existing field configuration.

**Parameters:**
- `fieldId` (string, required): Field ID to update
- `name` (string, optional): New name
- `singleSelectOptions` (array, optional): Updated options

---

### delete-project-field

Removes a field from a project.

**Parameters:**
- `fieldId` (string, required): Field ID to delete

⚠️ **Warning:** This will remove the field and all its values from all items.

## Item Management Tools

### add-draft-issue

Creates a draft issue within a project.

**Parameters:**
- `projectId` (string, required): Project ID
- `title` (string, required): Issue title
- `body` (string, optional): Issue description
- `assigneeIds` (array, optional): User IDs to assign

---

### add-item-to-project

Adds an existing issue or PR to a project.

**Parameters:**
- `projectId` (string, required): Project ID
- `contentId` (string, required): Issue or PR node ID

---

### update-project-item-field

Updates a field value for a project item.

**Parameters:**
- `projectId` (string, required): Project ID
- `itemId` (string, required): Item ID
- `fieldId` (string, required): Field ID
- `value` (object, required): New value
  - For text: `{ text: "value" }`
  - For number: `{ number: 42 }`
  - For date: `{ date: "2024-01-01" }`
  - For single-select: `{ singleSelectOptionId: "option_id" }`

---

### bulk-update-project-item-field

Updates a field value for multiple items at once.

**Parameters:**
- `projectId` (string, required): Project ID
- `itemIds` (array, required): Array of item IDs
- `fieldId` (string, required): Field ID
- `value` (object, required): New value (same format as update-project-item-field)

**Returns:**
```typescript
Array<{
  itemId: string;
  success: boolean;
}>
```

---

### delete-project-item

Removes an item from a project.

**Parameters:**
- `projectId` (string, required): Project ID
- `itemId` (string, required): Item ID to remove

---

### archive-project-item

Archives an item in a project.

**Parameters:**
- `projectId` (string, required): Project ID
- `itemId` (string, required): Item ID to archive

---

### unarchive-project-item

Unarchives a previously archived item.

**Parameters:**
- `projectId` (string, required): Project ID
- `itemId` (string, required): Item ID to unarchive

## Template and Status Tools

### mark-project-as-template

Marks a project as a template for reuse.

**Parameters:**
- `projectId` (string, required): Project ID

---

### unmark-project-as-template

Removes template status from a project.

**Parameters:**
- `projectId` (string, required): Project ID

---

### update-project-status

Updates the project's status indicator.

**Parameters:**
- `statusUpdateId` (string, required): Status update ID
- `body` (string, required): Status description
- `startDate` (string, required): Start date
- `targetDate` (string, required): Target completion date
- `status` (string, required): One of: `ON_TRACK`, `AT_RISK`, `OFF_TRACK`, `COMPLETE`, `INACTIVE`

## Best Practices

1. **Always check field types** before updating values
2. **Use bulk operations** when updating multiple items
3. **Handle pagination** for large result sets
4. **Cache project IDs** to avoid repeated lookups
5. **Use meaningful field names** for better organization

## Error Handling

Common errors:
- `401 Unauthorized`: Check GitHub token permissions
- `404 Not Found`: Verify project/item IDs
- `422 Validation Failed`: Check field value formats
- `403 Forbidden`: Ensure you have project access

## Rate Limits

GitHub GraphQL API has a point-based rate limit system:
- Simple queries: 1 point
- Complex queries: 2-10 points
- Mutations: 10 points
- Limit: 5,000 points per hour

Monitor your usage with the `X-RateLimit-*` headers.