# Context Tracker Testing Guide

This guide explains how to run, extend, and troubleshoot tests for the Persistent Context Tracker v1.0 implementation.

## Overview

The context tracker includes comprehensive test coverage across multiple layers:
- **Unit Tests**: Individual service and component testing
- **Integration Tests**: Cross-component interaction testing
- **End-to-End Tests**: Full workflow testing with real GitHub API
- **Performance Tests**: Load and concurrency testing

## Test Structure

```
tests/
├── unit/
│   ├── context-store.test.ts       # ContextStore service tests
│   ├── persistence-manager.test.ts # File persistence tests
│   ├── context-lock.test.ts        # Locking mechanism tests
│   └── context-middleware.test.ts  # Middleware tests
├── integration/
│   ├── github-integration.test.ts  # GitHub API integration
│   ├── mcp-tools.test.ts          # MCP tool integration
│   └── workflow.test.ts           # End-to-end workflows
├── performance/
│   ├── concurrency.test.ts        # Concurrent access tests
│   └── load.test.ts               # Load testing
└── fixtures/
    ├── mock-contexts.ts           # Test context data
    ├── mock-github-responses.ts   # GitHub API mocks
    └── test-helpers.ts            # Shared test utilities
```

## Running Tests

### All Tests
```bash
# Run complete test suite
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode for development
npm run test:watch
```

### Specific Test Categories
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Performance tests only
npm run test:performance

# Specific test file
npm test -- context-store.test.ts
```

### Test Environment Setup
```bash
# Set up test environment
cp .env.example .env.test
export NODE_ENV=test

# GitHub API tests (requires token)
export GITHUB_TOKEN=your_test_token
export TEST_PROJECT_ID=your_test_project_id
```

## Unit Tests

### Context Store Tests (`context-store.test.ts`)

**Coverage Areas**:
- Context initialization and defaults
- Context updates and validation
- Task state transitions
- Error handling and recovery
- Session management

**Key Test Cases**:
```typescript
describe('ContextStore', () => {
  it('should initialize with default context', async () => {
    const context = await contextStore.getCurrentContext();
    expect(context.currentTaskState).toBe('research');
    expect(context.sessionId).toMatch(/^session_/);
  });

  it('should update context fields', async () => {
    await contextStore.updateContext({
      currentProjectId: 'test-project-123',
      currentTaskState: 'implementation'
    });
    
    const context = await contextStore.getCurrentContext();
    expect(context.currentProjectId).toBe('test-project-123');
    expect(context.currentTaskState).toBe('implementation');
  });

  it('should validate task state transitions', async () => {
    await contextStore.updateContext({ currentTaskState: 'research' });
    
    // Valid transition
    await expect(contextStore.transitionTaskState('implementation')).resolves.toBeDefined();
    
    // Invalid transition (skip testing phase)
    await expect(contextStore.transitionTaskState('done')).rejects.toThrow();
  });
});
```

### Persistence Manager Tests (`persistence-manager.test.ts`)

**Coverage Areas**:
- File read/write operations
- Atomic operations and corruption prevention
- Directory creation and permissions
- Error handling and recovery
- JSON serialization/deserialization

### Context Lock Tests (`context-lock.test.ts`)

**Coverage Areas**:
- Lock acquisition and release
- Timeout handling
- Concurrent access protection
- Process cleanup
- Deadlock prevention

**Key Test Cases**:
```typescript
describe('ContextLock', () => {
  it('should acquire and release locks', async () => {
    const lock = new ContextLock();
    
    await lock.acquire();
    expect(lock.isLocked()).toBe(true);
    
    await lock.release();
    expect(lock.isLocked()).toBe(false);
  });

  it('should handle concurrent access', async () => {
    const lock1 = new ContextLock();
    const lock2 = new ContextLock();
    
    await lock1.acquire();
    
    // Second lock should timeout
    await expect(lock2.acquire(1000)).rejects.toThrow('Lock timeout');
    
    await lock1.release();
    await lock2.acquire(); // Should succeed now
  });
});
```

## Integration Tests

### GitHub Integration Tests (`github-integration.test.ts`)

**Requirements**:
- Valid GitHub token in environment
- Test project with appropriate permissions
- Network connectivity

**Coverage Areas**:
- Project ID validation
- Issue ID validation
- Project item status updates
- API error handling
- Rate limiting

**Setup**:
```typescript
describe('GitHub Integration', () => {
  beforeAll(async () => {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN required for integration tests');
    }
    
    // Initialize with test project
    await contextStore.updateContext({
      currentProjectId: process.env.TEST_PROJECT_ID
    });
  });

  it('should validate project exists', async () => {
    const isValid = await contextStore.validateContextIntegrity();
    expect(isValid.isValid).toBe(true);
  });
});
```

### MCP Tools Integration Tests (`mcp-tools.test.ts`)

**Coverage Areas**:
- Tool registration and discovery
- Parameter resolution from context
- Tool execution with context
- Error handling and reporting
- Response formatting

## Performance Tests

### Concurrency Tests (`concurrency.test.ts`)

**Coverage Areas**:
- Multiple simultaneous context updates
- Lock contention handling
- File system race conditions
- Memory usage under load

**Example**:
```typescript
describe('Concurrency', () => {
  it('should handle 100 concurrent updates', async () => {
    const promises = Array.from({ length: 100 }, (_, i) =>
      contextStore.updateContext({
        currentTaskState: i % 2 === 0 ? 'implementation' : 'testing'
      })
    );
    
    await expect(Promise.all(promises)).resolves.toBeDefined();
    
    // Verify final state is consistent
    const context = await contextStore.getCurrentContext();
    expect(['implementation', 'testing']).toContain(context.currentTaskState);
  });
});
```

## Test Utilities

### Mock Context Factory (`mock-contexts.ts`)

```typescript
export function createMockContext(overrides: Partial<WorkingContext> = {}): WorkingContext {
  return {
    currentProjectId: 'mock-project-123',
    currentIssueId: 'mock-issue-456',
    currentTaskState: 'implementation',
    sessionId: 'mock-session-789',
    lastUpdated: new Date(),
    ...overrides
  };
}

export function createMockContextUpdate(overrides: Partial<ContextUpdate> = {}): ContextUpdate {
  return {
    currentTaskState: 'testing',
    ...overrides
  };
}
```

### GitHub API Mocks (`mock-github-responses.ts`)

```typescript
export const mockProjectResponse = {
  data: {
    node: {
      id: 'PVT_kwHOAALNNc4A5x3U',
      title: 'Test Project',
      items: {
        nodes: [
          {
            id: 'PVTI_lAHOAALNNc4A5x3UzgK8cQs',
            content: {
              id: 'I_kwDOAALNNc6Kw8Er',
              title: 'Test Issue'
            }
          }
        ]
      }
    }
  }
};
```

### Test Helpers (`test-helpers.ts`)

```typescript
export async function withTempContext<T>(
  contextData: Partial<WorkingContext>,
  testFn: () => Promise<T>
): Promise<T> {
  const originalContext = await contextStore.getCurrentContext();
  
  try {
    await contextStore.updateContext(contextData);
    return await testFn();
  } finally {
    await contextStore.updateContext(originalContext);
  }
}

export function expectContextError(error: any, expectedCode: string) {
  expect(error).toBeInstanceOf(ContextError);
  expect(error.code).toBe(expectedCode);
}
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000
  }
});
```

### Test Setup (`tests/setup.ts`)

```typescript
import { beforeEach, afterEach } from 'vitest';
import { contextStore } from '../src/services/context-store.js';
import fs from 'fs/promises';

beforeEach(async () => {
  // Clean up test context files
  try {
    await fs.rm('.orchestr8r-test', { recursive: true, force: true });
  } catch (error) {
    // Ignore if directory doesn't exist
  }
  
  // Initialize clean context for each test
  await contextStore.clearContext();
});

afterEach(async () => {
  // Clean up after each test
  await contextStore.clearContext();
});
```

## Debugging Tests

### Debug Mode
```bash
# Run tests with debug output
DEBUG=orchestr8r:* npm test

# Run specific test with debugging
DEBUG=orchestr8r:context npm test -- context-store.test.ts
```

### Test Isolation
```bash
# Run single test case
npm test -- --grep "should update context fields"

# Run tests in specific file
npm test -- tests/unit/context-store.test.ts
```

### Coverage Analysis
```bash
# Generate detailed coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

## Writing New Tests

### Test Structure Template
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { contextStore } from '../../src/services/context-store.js';
import { createMockContext } from '../fixtures/mock-contexts.js';

describe('YourFeature', () => {
  beforeEach(async () => {
    // Setup for each test
    await contextStore.clearContext();
  });

  afterEach(async () => {
    // Cleanup after each test
  });

  describe('when condition X', () => {
    it('should do Y', async () => {
      // Arrange
      const mockContext = createMockContext({ /* overrides */ });
      
      // Act
      const result = await yourFunction(mockContext);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
```

### Best Practices
1. **Use descriptive test names** that explain the scenario
2. **Follow AAA pattern** (Arrange, Act, Assert)
3. **Test both success and failure cases**
4. **Use appropriate mocks** for external dependencies
5. **Clean up resources** in afterEach hooks
6. **Test edge cases** and boundary conditions

## Continuous Integration

### GitHub Actions
```yaml
name: Context Tracker Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## Troubleshooting

### Common Test Issues

**Tests timing out**:
- Increase test timeout in vitest.config.ts
- Check for hanging promises or file handles
- Verify cleanup in afterEach hooks

**File permission errors**:
- Ensure test directory is writable
- Check for leftover lock files
- Run tests with appropriate permissions

**GitHub API rate limiting**:
- Use test tokens with higher rate limits
- Implement proper mocking for CI
- Add delays between API calls

**Flaky tests**:
- Add proper cleanup between tests
- Use deterministic test data
- Avoid time-dependent assertions

## Related Documentation

- [Context Store Service](../../src/services/README.md)
- [Context Middleware](../../src/middleware/README.md)
- [API Documentation](../context-tracker-api.md)
- [Contributing Guide](../../CONTRIBUTING.md)
