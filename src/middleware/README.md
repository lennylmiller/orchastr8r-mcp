# Context Middleware Documentation

This directory contains middleware components that integrate the Persistent Context Tracker with existing orchestr8r-mcp tools.

## Overview

The context middleware provides transparent context injection into existing MCP tools without requiring modifications to their core implementations. This enables automatic context resolution and enhances tool functionality with persistent state management.

## Architecture

```
src/middleware/
├── context-middleware.ts    # Core middleware implementation
└── README.md               # This documentation
```

## Core Middleware (`context-middleware.ts`)

### Purpose
Provides non-intrusive context enhancement for existing orchestr8r-mcp tools through wrapper functions and middleware patterns.

### Key Features
- **Transparent Integration**: Enhances existing tools without code changes
- **Graceful Degradation**: Falls back to manual mode when context unavailable
- **Automatic Resolution**: Resolves projectId and itemId from context
- **Validation Support**: Optional context integrity validation
- **Error Handling**: Comprehensive error reporting with context information

## Middleware Patterns

### 1. Mandatory Context (`withContext`)

For tools that require context to function properly:

```typescript
import { ContextMiddleware } from '../middleware/context-middleware.js';

const enhancedTool = ContextMiddleware.withContext(async (params, context) => {
  // Tool implementation with guaranteed context
  console.log(`Current project: ${context.currentProjectId}`);
  console.log(`Task state: ${context.currentTaskState}`);
  
  // Use context for automatic parameter resolution
  const projectId = params.projectId || context.currentProjectId;
  return await someOperation(projectId);
});
```

**Use Cases**:
- Tools that depend on current project/issue context
- Workflow-specific operations
- State-dependent functionality

### 2. Optional Context (`withOptionalContext`)

For tools that can work with or without context:

```typescript
const flexibleTool = ContextMiddleware.withOptionalContext(async (params, context) => {
  if (context) {
    // Enhanced mode with context
    const projectId = params.projectId || context.currentProjectId;
    return await enhancedOperation(projectId, context);
  } else {
    // Manual mode without context
    if (!params.projectId) {
      throw new Error('projectId required when context unavailable');
    }
    return await basicOperation(params.projectId);
  }
});
```

**Use Cases**:
- Existing tools that should remain functional without context
- Tools with optional context enhancement
- Backward compatibility scenarios

### 3. Project Context Resolution (`withProjectContext`)

Specialized wrapper for GitHub Projects operations:

```typescript
import { withProjectContext } from '../middleware/context-middleware.js';

const projectTool = withProjectContext(async (params) => {
  // params.projectId automatically resolved from context if not provided
  // params.itemId automatically resolved from context if available
  return await projectOperations.updateItem(params);
});
```

**Features**:
- Automatic `projectId` resolution from `context.currentProjectId`
- Automatic `itemId` resolution from `context.currentIssueId`
- Validation that required parameters are available
- Contextual error messages

### 4. Issue Context Resolution (`withIssueContext`)

Specialized wrapper for GitHub Issues operations:

```typescript
import { withIssueContext } from '../middleware/context-middleware.js';

const issueTool = withIssueContext(async (params) => {
  // params.issueId automatically resolved from context if not provided
  return await issueOperations.updateIssue(params);
});
```

### 5. Task State Transitions (`withTaskStateTransition`)

Wrapper that automatically updates context based on tool execution:

```typescript
import { withTaskStateTransition } from '../middleware/context-middleware.js';

const implementationTool = withTaskStateTransition(
  async (params, context) => {
    // Perform implementation work
    const result = await doImplementation(params);
    return result;
  },
  (params, result) => {
    // Automatically transition to 'testing' when implementation completes
    return result.success ? 'testing' : null;
  }
);
```

## Integration Examples

### Enhancing Existing Tools

**Before** (manual parameter management):
```typescript
export const updateProjectItem = async (params: {
  projectId: string;
  itemId: string;
  status: string;
}) => {
  return await projectOperations.updateItemField({
    projectId: params.projectId,
    itemId: params.itemId,
    fieldId: STATUS_FIELD_ID,
    value: params.status
  });
};
```

**After** (context-enhanced):
```typescript
export const updateProjectItem = withProjectContext(async (params: {
  projectId?: string;  // Optional - resolved from context
  itemId?: string;     // Optional - resolved from context
  status: string;
}) => {
  // projectId and itemId automatically resolved from context
  return await projectOperations.updateItemField({
    projectId: params.projectId,  // Guaranteed to be available
    itemId: params.itemId,        // Resolved from context if not provided
    fieldId: STATUS_FIELD_ID,
    value: params.status
  });
});
```

### MCP Tool Registration

```typescript
// In src/index.ts
import { ContextMiddleware } from './middleware/context-middleware.js';

// Register context-enhanced tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'enhanced-project-tool',
      description: 'Project tool with automatic context resolution',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID (auto-resolved from context)' },
          action: { type: 'string', description: 'Action to perform' }
        },
        required: ['action']  // projectId not required due to context resolution
      }
    }
  ]
}));

// Handle tool calls with context middleware
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'enhanced-project-tool':
      return await ContextMiddleware.withProjectContext(async (params) => {
        // Implementation with automatic context resolution
        return await handleProjectAction(params);
      })(args);
  }
});
```

## Error Handling

### Context Errors

The middleware provides enhanced error messages with context information:

```typescript
// Automatic error enhancement
try {
  await contextAwareTool(params);
} catch (error) {
  // Error includes current context for debugging
  throw ContextMiddleware.createContextError(
    'Tool execution failed',
    currentContext
  );
}
```

### Validation Errors

```typescript
// Context validation before tool execution
const validatedTool = ContextMiddleware.withContext(async (params, context) => {
  const isValid = await ContextMiddleware.validateContext(context);
  if (!isValid) {
    throw new Error('Context validation failed - please refresh context');
  }
  
  return await toolImplementation(params, context);
});
```

## Configuration

### Middleware Options

```typescript
interface ContextMiddlewareOptions {
  required?: boolean;           // Fail if context unavailable
  validateIntegrity?: boolean;  // Validate context against GitHub
  autoResolve?: boolean;        // Auto-resolve parameters from context
  fallbackToManual?: boolean;   // Allow manual mode fallback
}
```

### Usage with Options

```typescript
const configuredTool = ContextMiddleware.withOptionalContext(
  async (params, context) => {
    // Tool implementation
  },
  {
    validateIntegrity: true,
    autoResolve: true,
    fallbackToManual: true
  }
);
```

## Best Practices

### 1. Parameter Design
- Make context-resolvable parameters optional
- Provide clear parameter descriptions
- Maintain backward compatibility

### 2. Error Messages
- Include context information in errors
- Provide actionable error messages
- Use consistent error formatting

### 3. Validation
- Validate context integrity for critical operations
- Handle validation failures gracefully
- Provide clear validation error messages

### 4. Performance
- Cache context validation results
- Avoid unnecessary context lookups
- Use appropriate middleware pattern for use case

## Testing

### Unit Tests
```typescript
import { ContextMiddleware } from '../middleware/context-middleware.js';
import { createMockContext } from '../test-utils/context-mocks.js';

describe('ContextMiddleware', () => {
  it('should resolve projectId from context', async () => {
    const mockContext = createMockContext({
      currentProjectId: 'test-project-123'
    });
    
    const tool = ContextMiddleware.withProjectContext(async (params) => {
      expect(params.projectId).toBe('test-project-123');
      return { success: true };
    });
    
    await tool({});
  });
});
```

### Integration Tests
```typescript
describe('Context Integration', () => {
  it('should enhance existing tools without breaking them', async () => {
    // Test that enhanced tools work with and without context
    const result1 = await enhancedTool({ projectId: 'manual-id' });
    const result2 = await enhancedTool({}); // Uses context
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues

**Context not available**:
- Ensure context store is initialized
- Check context file permissions
- Verify context middleware is properly imported

**Parameter resolution failing**:
- Verify context contains required fields
- Check parameter naming consistency
- Review middleware wrapper usage

**Performance issues**:
- Use appropriate middleware pattern
- Avoid unnecessary context validation
- Cache context lookups where possible

## Related Documentation

- [Context Store Service](../services/README.md)
- [Context Types](../types/context.ts)
- [MCP Tool Integration](../../docs/guides/mcp-integration.md)
- [Testing Guide](../../docs/testing/middleware-testing.md)
