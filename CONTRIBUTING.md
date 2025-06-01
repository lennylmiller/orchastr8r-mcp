# Contributing to Orchestr8r-MCP

Thank you for your interest in contributing to Orchestr8r-MCP! This guide will help you get started with adding features, writing automation scripts, and improving the codebase.

## Getting Started

### Prerequisites
- Node.js 23+ or Bun runtime
- GitHub account with Personal Access Token
- Basic knowledge of TypeScript and GraphQL
- Familiarity with GitHub Projects v2

### Development Setup
```bash
# Clone the repository
git clone https://github.com/your-username/orchestr8r-mcp.git
cd orchestr8r-mcp

# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Add your GITHUB_TOKEN and GITHUB_OWNER

# Build and test
bun run build
bun test
```

## Code Patterns & Examples

### Adding a New MCP Tool

Follow this pattern when adding new tools:

```typescript
// In src/operations/projects.ts
export async function bulkUpdateProjectItems(params: {
  projectId: string;
  itemIds: string[];
  fieldId: string;
  value: any;
}): Promise<BulkUpdateResult> {
  const mutations = params.itemIds.map((itemId, index) => `
    mutation_${index}: updateProjectV2ItemFieldValue(input: {
      projectId: "${params.projectId}"
      itemId: "${itemId}"
      fieldId: "${params.fieldId}"
      value: ${JSON.stringify(params.value)}
    }) {
      projectV2Item {
        id
      }
    }
  `);
  
  const query = `mutation BulkUpdate { ${mutations.join('\n')} }`;
  return await githubClient.graphql(query);
}

// In src/index.ts - Register the tool
server.tool(
  "bulk-update-items",
  "Update multiple project items at once",
  BulkUpdateItemsSchema,
  async (params) => {
    const result = await projectOperations.bulkUpdateProjectItems(params);
    return {
      content: [{
        type: "text",
        text: `Updated ${result.updatedCount} items successfully`
      }]
    };
  }
);
```

### Writing Automation Scripts

All scripts follow the successful `morning-standup.ts` pattern:

```typescript
#!/usr/bin/env node

import { projectOperations } from "../operations/index.js";
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Configuration
const PROJECT_ID = 'PVT_kwHOAALNNc4A5x3U';
const STATUS_FIELD_ID = 'PVTSSF_lAHOAALNNc4A5x3UzguhPIo';

// State management
const STATE_FILE = join(homedir(), '.orchestr8r-state.json');

interface ScriptState {
  lastRun: string;
  metrics: {
    timeSaved: number;
    tasksCompleted: number;
  };
}

async function main(): Promise<void> {
  const startTime = Date.now();
  
  console.log('🚀 Starting automation...\n');
  
  try {
    // 1. Fetch data
    const items = await getProjectItems();
    
    // 2. Process and analyze
    const analysis = analyzeItems(items);
    
    // 3. Take actions
    await performAutomation(analysis);
    
    // 4. Report results
    const timeSaved = calculateTimeSaved(startTime);
    console.log(`\n⏰ Time saved: ~${timeSaved} minutes`);
    
    // 5. Save state
    updateState({ timeSaved });
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Console output with emojis
function displayResults(data: any): void {
  console.log('📊 Results:');
  console.log(`   ✅ Completed: ${data.completed}`);
  console.log(`   🏃 In Progress: ${data.inProgress}`);
  console.log(`   📋 Todo: ${data.todo}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

## Training Modules

New contributors should complete these modules:

### Module 1: Getting Started (30 min)
- Set up development environment
- Run existing scripts
- Understand MCP protocol basics
- Make first contribution

### Module 2: Sprint Management (45 min)
- GitHub Projects v2 concepts
- GraphQL queries
- Field management
- Automation opportunities

### Module 3: Workflow Automation (45 min)
- Script patterns
- State management
- Error handling
- Time tracking

### Module 4: Advanced Features (60 min)
- Plugin architecture
- Caching strategies
- Performance optimization
- Testing approaches

### Module 5: Real-World Scenarios (90 min)
- Build complete feature
- Handle edge cases
- Deploy to production
- Monitor usage

## Architecture Guidelines

### Current State Improvements

When improving the existing code:

```typescript
// ❌ Current: Monolithic handler
server.tool("update-item", schema, async (params) => {
  // 50 lines of logic here
});

// ✅ Better: Extracted business logic
server.tool("update-item", schema, async (params) => {
  const result = await projectOps.updateItem(params);
  return formatResponse(result);
});
```

### Plugin Architecture (Future)

Prepare for the upcoming plugin refactor:

```typescript
export class SprintPlugin implements MCPPlugin {
  name = "sprint-management";
  
  tools = [
    this.createSprintTool(),
    this.planSprintTool(),
    this.reviewSprintTool()
  ];
  
  resources = [
    {
      uri: "sprint://{sprintId}/burndown",
      handler: this.getBurndownChart.bind(this)
    }
  ];
}
```

## Testing Guidelines

### Unit Tests
```typescript
import { expect, test, describe } from "bun:test";
import { calculateVelocity } from "../src/utils/metrics";

describe("metrics", () => {
  test("calculates velocity correctly", () => {
    const items = [
      { size: "S", status: "Done" },  // 2 points
      { size: "M", status: "Done" },  // 3 points
      { size: "L", status: "Done" }   // 5 points
    ];
    
    expect(calculateVelocity(items)).toBe(10);
  });
});
```

### Integration Tests
```typescript
test("morning standup integration", async () => {
  // Mock GitHub API
  mockGitHubAPI();
  
  // Run script
  const output = await runScript("morning-standup.ts");
  
  // Verify output
  expect(output).toContain("Daily Standup");
  expect(output).toContain("Time saved:");
});
```

## Common Tasks

### Add a Project Field
```typescript
// 1. Add GraphQL query
// src/graphql/projects/createProjectField.graphql
mutation CreateProjectV2Field($input: CreateProjectV2FieldInput!) {
  createProjectV2Field(input: $input) {
    field {
      id
      name
      dataType
    }
  }
}

// 2. Add operation
// src/operations/projects.ts
export async function createProjectField(params: CreateFieldParams) {
  return githubClient.graphql(CREATE_FIELD_MUTATION, params);
}

// 3. Register tool
// src/index.ts
server.tool("create-field", CreateFieldSchema, async (params) => {
  return await projectOperations.createProjectField(params);
});
```

### Add Status Transition
```typescript
// Implement smart status transitions
async function transitionStatus(
  item: ProjectItem,
  newStatus: string
): Promise<void> {
  const transitions = {
    "Todo": ["In Progress"],
    "In Progress": ["Review", "Blocked", "Done"],
    "Review": ["In Progress", "Done"],
    "Done": [] // Terminal state
  };
  
  const currentStatus = getFieldValue(item, "Status");
  const allowedTransitions = transitions[currentStatus] || [];
  
  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(`Invalid transition: ${currentStatus} → ${newStatus}`);
  }
  
  await updateItemStatus(item.id, newStatus);
}
```

## Pull Request Process

1. **Fork and Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow existing patterns
   - Add tests for new features
   - Update documentation

3. **Test Thoroughly**
   ```bash
   bun test
   bun run build
   bun run your-new-script.ts --dry-run
   ```

4. **Submit PR**
   - Clear description of changes
   - Link to related issues
   - Include time savings metrics
   - Add screenshots if applicable

### PR Checklist
- [ ] Tests pass (`bun test`)
- [ ] Build succeeds (`bun run build`)
- [ ] Documentation updated
- [ ] Time savings documented
- [ ] No sensitive data exposed
- [ ] Follows existing patterns

## Code Style

- Use TypeScript strict mode
- Prefer async/await over promises
- Use meaningful variable names
- Add JSDoc comments for public functions
- Keep functions under 50 lines
- Extract complex logic to utilities

## Getting Help

- 💬 GitHub Discussions for questions
- 🐛 GitHub Issues for bugs
- 📚 Check existing scripts for patterns
- 🤝 Tag @maintainers for review

## Recognition

Contributors who provide significant value will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Invited to shape roadmap
- Given early access to features

Thank you for helping make developer workflows more intelligent! 🚀