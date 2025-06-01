# Context Tracker Integration Guide

This guide explains how to integrate the Persistent Context Tracker v1.0 with existing orchestr8r-mcp tools and workflows.

## Overview

The Context Tracker provides seamless integration with existing MCP tools through middleware patterns, enabling automatic context resolution without requiring changes to existing tool implementations.

## Quick Start Integration

### 1. Basic Tool Enhancement

Transform an existing tool to use context:

**Before**:
```typescript
export const updateProjectStatus = async (params: {
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

**After**:
```typescript
import { ContextMiddleware } from '../middleware/context-middleware.js';

export const updateProjectStatus = ContextMiddleware.withProjectContext(async (params: {
  projectId?: string;  // Now optional - resolved from context
  itemId?: string;     // Now optional - resolved from context
  status: string;
}) => {
  // projectId and itemId automatically resolved from context if not provided
  return await projectOperations.updateItemField({
    projectId: params.projectId,  // Guaranteed to be available
    itemId: params.itemId,        // Resolved from context if not provided
    fieldId: STATUS_FIELD_ID,
    value: params.status
  });
});
```

### 2. MCP Tool Registration

Update your MCP tool registration to reflect optional parameters:

```typescript
// In src/index.ts
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'update-project-status',
      description: 'Update project item status with automatic context resolution',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { 
            type: 'string', 
            description: 'Project ID (auto-resolved from context if not provided)' 
          },
          itemId: { 
            type: 'string', 
            description: 'Item ID (auto-resolved from context if not provided)' 
          },
          status: { 
            type: 'string', 
            description: 'New status value',
            enum: ['Todo', 'In Progress', 'Done']
          }
        },
        required: ['status']  // Only status is required now
      }
    }
  ]
}));
```

## Integration Patterns

### 1. Mandatory Context Pattern

For tools that require context to function:

```typescript
import { ContextMiddleware } from '../middleware/context-middleware.js';

const contextRequiredTool = ContextMiddleware.withContext(async (params, context) => {
  // Context is guaranteed to be available
  console.log(`Working on project: ${context.currentProjectId}`);
  console.log(`Current task state: ${context.currentTaskState}`);
  
  // Use context for business logic
  if (context.currentTaskState === 'testing') {
    return await runTestSuite(params);
  } else {
    return await performImplementation(params);
  }
});
```

### 2. Optional Context Pattern

For tools that can work with or without context:

```typescript
const flexibleTool = ContextMiddleware.withOptionalContext(async (params, context) => {
  if (context) {
    // Enhanced mode with context
    return await enhancedOperation(params, context);
  } else {
    // Manual mode - require explicit parameters
    if (!params.projectId) {
      throw new Error('projectId required when context unavailable');
    }
    return await basicOperation(params);
  }
});
```

### 3. State Transition Pattern

For tools that should update context based on their execution:

```typescript
const implementationTool = ContextMiddleware.withTaskStateTransition(
  async (params, context) => {
    // Perform implementation work
    const result = await doImplementation(params);
    return result;
  },
  (params, result) => {
    // Automatically transition to 'testing' when implementation completes successfully
    return result.success ? 'testing' : null;
  }
);
```

## Existing Tool Migration

### Step-by-Step Migration Process

1. **Identify Context Dependencies**
   ```typescript
   // Analyze which parameters can be resolved from context
   const toolParams = {
     projectId: string;    // ✅ Can be resolved from context.currentProjectId
     itemId: string;       // ✅ Can be resolved from context.currentIssueId
     branchName: string;   // ✅ Can be resolved from context.activeBranch
     customValue: string;  // ❌ Must be provided by user
   };
   ```

2. **Choose Appropriate Middleware**
   ```typescript
   // For GitHub Projects operations
   const projectTool = ContextMiddleware.withProjectContext(implementation);
   
   // For GitHub Issues operations
   const issueTool = ContextMiddleware.withIssueContext(implementation);
   
   // For general context-aware operations
   const contextTool = ContextMiddleware.withOptionalContext(implementation);
   ```

3. **Update Parameter Schemas**
   ```typescript
   // Make context-resolvable parameters optional
   const updatedSchema = {
     type: 'object',
     properties: {
       projectId: { type: 'string', description: 'Project ID (auto-resolved)' },
       customValue: { type: 'string', description: 'User-provided value' }
     },
     required: ['customValue']  // Remove context-resolvable parameters
   };
   ```

4. **Test Both Modes**
   ```typescript
   // Test with explicit parameters (manual mode)
   await tool({ projectId: 'explicit-id', customValue: 'test' });
   
   // Test with context resolution (automatic mode)
   await contextStore.updateContext({ currentProjectId: 'context-id' });
   await tool({ customValue: 'test' });
   ```

### Migration Examples

#### GitHub Projects Tool
```typescript
// Before
export const moveProjectItem = async (params: {
  projectId: string;
  itemId: string;
  columnId: string;
}) => {
  return await projectOperations.moveItem(params);
};

// After
export const moveProjectItem = ContextMiddleware.withProjectContext(async (params: {
  projectId?: string;
  itemId?: string;
  columnId: string;
}) => {
  return await projectOperations.moveItem({
    projectId: params.projectId,
    itemId: params.itemId,
    columnId: params.columnId
  });
});
```

#### Git Operations Tool
```typescript
// Before
export const createBranch = async (params: {
  branchName: string;
  baseBranch: string;
}) => {
  return await gitOperations.createBranch(params);
};

// After
export const createBranch = ContextMiddleware.withTaskStateTransition(
  async (params: {
    branchName: string;
    baseBranch?: string;
  }, context) => {
    const baseBranch = params.baseBranch || context?.activeBranch || 'main';
    const result = await gitOperations.createBranch({
      branchName: params.branchName,
      baseBranch
    });
    
    // Update context with new branch
    if (result.success) {
      await contextStore.updateContext({ activeBranch: params.branchName });
    }
    
    return result;
  },
  (params, result) => {
    // Transition to implementation when starting new branch
    return result.success ? 'implementation' : null;
  }
);
```

## Advanced Integration

### Custom Context Resolution

Create custom middleware for specific use cases:

```typescript
import { ContextMiddleware } from '../middleware/context-middleware.js';

const withCustomContext = (toolFn: Function) => {
  return ContextMiddleware.withOptionalContext(async (params, context) => {
    // Custom context resolution logic
    const resolvedParams = {
      ...params,
      sprintId: params.sprintId || context?.currentSprintId,
      iteration: params.iteration || context?.currentIteration,
    };
    
    return await toolFn(resolvedParams, context);
  });
};

// Usage
const sprintTool = withCustomContext(async (params, context) => {
  // Implementation with custom context resolution
});
```

### Context Validation Integration

Add context validation to critical operations:

```typescript
const criticalTool = ContextMiddleware.withContext(async (params, context) => {
  // Validate context integrity before proceeding
  const validation = await contextStore.validateContextIntegrity();
  if (!validation.isValid) {
    throw new Error(`Context validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Proceed with validated context
  return await performCriticalOperation(params, context);
});
```

### Batch Operations with Context

Handle multiple operations with shared context:

```typescript
const batchTool = ContextMiddleware.withProjectContext(async (params: {
  operations: Array<{ type: string; data: any }>;
}) => {
  const results = [];
  
  for (const operation of params.operations) {
    // Each operation inherits the resolved context
    const result = await performOperation(operation, {
      projectId: params.projectId,  // Resolved from context
      itemId: params.itemId         // Resolved from context
    });
    results.push(result);
  }
  
  return { results, totalOperations: results.length };
});
```

## Error Handling Integration

### Context-Aware Error Messages

```typescript
const enhancedTool = ContextMiddleware.withOptionalContext(async (params, context) => {
  try {
    return await toolImplementation(params, context);
  } catch (error) {
    // Enhance error with context information
    const contextInfo = context ? {
      projectId: context.currentProjectId,
      taskState: context.currentTaskState,
      sessionId: context.sessionId
    } : { contextAvailable: false };
    
    throw new Error(`Tool execution failed: ${error.message}\nContext: ${JSON.stringify(contextInfo)}`);
  }
});
```

### Graceful Degradation

```typescript
const robustTool = ContextMiddleware.withOptionalContext(async (params, context) => {
  try {
    if (context) {
      // Try enhanced mode first
      return await enhancedOperation(params, context);
    }
  } catch (error) {
    console.warn('Enhanced mode failed, falling back to basic mode:', error.message);
  }
  
  // Fallback to basic mode
  if (!params.projectId) {
    throw new Error('projectId required in manual mode');
  }
  
  return await basicOperation(params);
});
```

## Testing Integration

### Test Context-Enhanced Tools

```typescript
import { createMockContext } from '../test-utils/context-mocks.js';

describe('Enhanced Tool Integration', () => {
  it('should work with context resolution', async () => {
    const mockContext = createMockContext({
      currentProjectId: 'test-project-123'
    });
    
    // Mock context store
    jest.spyOn(contextStore, 'getCurrentContext').mockResolvedValue(mockContext);
    
    // Test tool with context resolution
    const result = await enhancedTool({ customParam: 'test' });
    
    expect(result.projectId).toBe('test-project-123');
  });
  
  it('should work without context', async () => {
    // Test manual mode
    const result = await enhancedTool({ 
      projectId: 'manual-project-456',
      customParam: 'test' 
    });
    
    expect(result.projectId).toBe('manual-project-456');
  });
});
```

## Best Practices

### 1. Parameter Design
- Make context-resolvable parameters optional
- Provide clear parameter descriptions indicating auto-resolution
- Maintain backward compatibility with explicit parameters

### 2. Error Handling
- Provide clear error messages when context is required but unavailable
- Include context information in error messages for debugging
- Implement graceful degradation where possible

### 3. Documentation
- Update tool descriptions to mention context integration
- Document which parameters are auto-resolved
- Provide examples of both manual and automatic usage

### 4. Testing
- Test both context-enabled and manual modes
- Verify parameter resolution works correctly
- Test error scenarios (missing context, invalid context)

## Troubleshooting

### Common Integration Issues

**Tool not resolving context parameters**:
- Verify middleware is properly imported and applied
- Check that context store is initialized
- Ensure context contains required fields

**Context validation failures**:
- Verify GitHub token permissions
- Check project/issue ID validity
- Review network connectivity

**Performance issues**:
- Use appropriate middleware pattern for use case
- Avoid unnecessary context lookups
- Cache context validation results

## Related Documentation

- [Context Middleware](../../src/middleware/README.md)
- [Context Store Service](../../src/services/README.md)
- [Testing Guide](../testing/context-testing.md)
- [API Documentation](../context-tracker-api.md)
