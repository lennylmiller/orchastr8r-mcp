# Context Services Documentation

This directory contains the core services for the Persistent Context Tracker v1.0 implementation.

## Overview

The context services provide persistent, thread-safe context management for the orchestr8r-mcp system, enabling automatic linking between conversation snapshots, git workflows, and GitHub Projects at ticket-level granularity.

## Service Architecture

```
src/services/
├── context-store.ts          # Main context management service
├── persistence-manager.ts    # File-based persistence layer
├── context-lock.ts          # Concurrent access protection
└── README.md               # This documentation
```

## Core Services

### ContextStore (`context-store.ts`)

**Purpose**: Central context management service that coordinates all context operations.

**Key Features**:
- Multi-tier persistence (memory → file → git metadata)
- Thread-safe operations with automatic locking
- Context validation and integrity checking
- Session management with unique identifiers
- Integration with GitHub Projects API

**Usage**:
```typescript
import { contextStore } from './services/context-store.js';

// Get current context
const context = await contextStore.getCurrentContext();

// Update context
await contextStore.updateContext({
  currentProjectId: 'PVT_kwHOAALNNc4A5x3U',
  currentTaskState: 'implementation'
});

// Transition task state
await contextStore.transitionTaskState('testing');
```

**Key Methods**:
- `getCurrentContext()`: Retrieve current working context
- `updateContext(updates)`: Apply partial context updates
- `clearContext()`: Reset context to defaults
- `setCurrentProject(projectId)`: Set active GitHub project
- `setCurrentIssue(issueId)`: Set active GitHub issue
- `transitionTaskState(newState)`: Change task workflow state
- `validateContextIntegrity()`: Verify context against GitHub API

### PersistenceManager (`context-store.ts`)

**Purpose**: Handles file-based persistence with atomic operations.

**Key Features**:
- Atomic file operations to prevent corruption
- JSON serialization with date handling
- Directory management and creation
- Error handling and recovery
- Backup and restore capabilities

**Implementation Details**:
- Uses `.orchestr8r/context.json` for storage
- Automatically creates directory structure
- Handles date serialization/deserialization
- Provides fallback to default context on errors

### ContextLock (`context-store.ts`)

**Purpose**: Provides concurrent access protection using file locking.

**Key Features**:
- File-based locking mechanism
- Timeout handling for stuck locks
- Process ID tracking
- Automatic cleanup on process exit
- Deadlock prevention

**Implementation Details**:
- Uses `.orchestr8r/context.lock` for lock file
- 5-second default timeout
- Automatic lock release on process termination
- Retry logic for lock acquisition

## Integration Points

### GitHub Projects API
- Validates project and issue IDs against GitHub
- Updates project item status on task state transitions
- Maintains consistency between context and GitHub state

### Git Repository
- Tracks current branch in context
- Links commits to working context
- Future: Git metadata persistence tier

### MCP Protocol
- Exposes context operations as MCP tools
- Provides context middleware for existing tools
- Maintains protocol compliance

## Configuration

### Environment Variables
```bash
# Optional: Custom context storage path
ORCHESTR8R_CONTEXT_PATH=/custom/path/context.json

# Optional: Lock timeout in milliseconds
ORCHESTR8R_LOCK_TIMEOUT=10000
```

### Default Paths
- Context file: `.orchestr8r/context.json`
- Lock file: `.orchestr8r/context.lock`
- Relative to current working directory

## Error Handling

### Error Types
- `ContextError`: Base error class
- `ContextValidationError`: Schema validation failures
- `ContextPersistenceError`: File system operation failures
- `ContextLockError`: Lock acquisition/release failures

### Recovery Strategies
1. **File corruption**: Falls back to default context
2. **Lock timeout**: Retries with exponential backoff
3. **GitHub API errors**: Continues with local context
4. **Permission errors**: Logs error and uses memory-only mode

## Performance Considerations

### Memory Usage
- Single context instance in memory
- Minimal memory footprint (~1KB per context)
- Efficient JSON serialization

### File I/O
- Atomic write operations prevent corruption
- Lazy loading from disk
- Caching in memory for performance

### Concurrency
- File locking prevents race conditions
- Non-blocking operations where possible
- Timeout handling prevents deadlocks

## Testing

### Unit Tests
```bash
# Run context service tests
npm test src/services/

# Run specific test file
npm test context-store.test.ts
```

### Integration Tests
```bash
# Test with real GitHub API
npm run test:integration

# Test file system operations
npm run test:persistence
```

## Troubleshooting

### Common Issues

**Context not persisting**:
- Check file permissions on `.orchestr8r/` directory
- Verify disk space availability
- Check for file system errors in logs

**Lock timeout errors**:
- Increase `ORCHESTR8R_LOCK_TIMEOUT` environment variable
- Check for zombie processes holding locks
- Manually remove `.orchestr8r/context.lock` if stuck

**GitHub validation failures**:
- Verify GitHub token permissions
- Check project/issue ID validity
- Review network connectivity

### Debug Mode
```bash
# Enable debug logging
DEBUG=orchestr8r:context npm start

# Verbose context operations
ORCHESTR8R_DEBUG=true npm start
```

## Future Enhancements

### Planned Features
1. **Git metadata persistence**: Store context in git config
2. **Multi-user support**: User-specific context isolation
3. **Context history**: Track context changes over time
4. **Cloud synchronization**: Sync context across devices
5. **Advanced validation**: Deep GitHub integration validation

### Extension Points
- Custom persistence backends
- Additional validation rules
- Context transformation hooks
- Event-driven context updates

## Contributing

When modifying context services:

1. **Maintain backward compatibility** with existing context files
2. **Add comprehensive tests** for new functionality
3. **Update type definitions** in `src/types/context.ts`
4. **Document breaking changes** in CHANGELOG.md
5. **Follow existing error handling patterns**

## Related Documentation

- [Context Tracker API](../../docs/context-tracker-api.md)
- [Architecture Overview](../../docs/architecture/persistent-context-tracker-v1.0.md)
- [Integration Guide](../../docs/guides/context-integration.md)
- [Testing Guide](../../docs/testing/context-testing.md)
