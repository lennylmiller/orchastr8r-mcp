# Context Tracker API Documentation

## Overview

The Context Tracker provides persistent context management for orchestr8r-mcp, maintaining current GitHub Project ID, Issue ID, and Task State across sessions. This enables automatic linking between conversation snapshots, git workflows, and SCRUM automation at ticket-level granularity.

## Architecture

### Core Components

1. **ContextStore Service**: Central context management with thread-safe operations
2. **PersistenceManager**: File-based storage with atomic operations
3. **ContextLock**: Concurrent access protection using file locking
4. **ContextMiddleware**: Automatic context injection into tool responses
5. **MCP Tools**: Three new tools for context management

### Data Model

```typescript
interface WorkingContext {
  currentProjectId: string | null;
  currentIssueId: string | null;
  currentTaskState: TaskState;
  sessionId: string;
  lastUpdated: string;
}

type TaskState = 'research' | 'implementation' | 'testing' | 'review' | 'done' | 'blocked';
```

## MCP Tools

### 1. get-working-context

**Description**: Retrieve the current working context with optional validation.

**Parameters**:
- `includeValidation` (boolean, optional): Include context validation in response (default: true)

**Response**:
```json
{
  "currentProjectId": "PVT_kwDOABCDEF",
  "currentIssueId": "I_kwDOABCDEF",
  "currentTaskState": "implementation",
  "sessionId": "session_1748741006770_1m5jlc6ow",
  "lastUpdated": "2025-06-01T01:23:26.770Z",
  "isValid": true,
  "validationNote": "Context is valid"
}
```

**Example Usage**:
```bash
# Get current context with validation
mcp-tool get-working-context '{"includeValidation": true}'

# Get current context without validation
mcp-tool get-working-context '{"includeValidation": false}'
```

### 2. set-working-context

**Description**: Set the current working context (project, issue, task state).

**Parameters**:
- `projectId` (string, optional): GitHub Project ID to set as current
- `issueId` (string, optional): GitHub Issue ID to set as current  
- `taskState` (TaskState, optional): Current task state
- `clearExisting` (boolean, optional): Clear existing context before setting new values (default: false)

**Response**:
```json
{
  "message": "Context updated successfully",
  "context": {
    "currentProjectId": "PVT_kwDOABCDEF",
    "currentIssueId": "I_kwDOABCDEF",
    "currentTaskState": "research",
    "sessionId": "session_1748741006879_xcagup7tg",
    "lastUpdated": "2025-06-01T01:23:26.879Z"
  }
}
```

**Example Usage**:
```bash
# Set project and issue context
mcp-tool set-working-context '{
  "projectId": "PVT_kwDOABCDEF",
  "issueId": "I_kwDOABCDEF",
  "taskState": "research"
}'

# Update only task state
mcp-tool set-working-context '{"taskState": "implementation"}'

# Clear existing context and set new
mcp-tool set-working-context '{
  "projectId": "PVT_kwDOABCDEF",
  "clearExisting": true
}'
```

### 3. transition-task-state

**Description**: Transition current task to new state with automatic project updates.

**Parameters**:
- `newState` (TaskState, required): New task state to transition to
- `reason` (string, optional): Reason for state transition
- `updateProjectStatus` (boolean, optional): Automatically update project item status (default: true)

**Response**:
```json
{
  "message": "Task state transitioned to: implementation",
  "reason": "Starting implementation phase",
  "previousState": "research",
  "newState": "implementation",
  "context": {
    "currentProjectId": "PVT_kwDOABCDEF",
    "currentIssueId": "I_kwDOABCDEF",
    "currentTaskState": "implementation",
    "sessionId": "session_1748741006879_xcagup7tg",
    "lastUpdated": "2025-06-01T01:23:27.123Z"
  }
}
```

**Example Usage**:
```bash
# Transition to implementation with reason
mcp-tool transition-task-state '{
  "newState": "implementation",
  "reason": "Starting implementation phase",
  "updateProjectStatus": true
}'

# Quick transition without GitHub update
mcp-tool transition-task-state '{
  "newState": "testing",
  "updateProjectStatus": false
}'
```

## Task State Workflow

```
research → implementation → testing → review → done
    ↓              ↓           ↓        ↓
  blocked ←──────────────────────────────┘
```

**State Descriptions**:
- **research**: Investigating requirements, planning approach
- **implementation**: Active development work
- **testing**: Writing/running tests, QA validation
- **review**: Code review, peer feedback
- **done**: Task completed successfully
- **blocked**: Cannot proceed due to dependencies/issues

## Storage & Persistence

### File Locations
- **Context File**: `.orchestr8r/context.json`
- **Lock File**: `.orchestr8r/context.lock`

### Thread Safety
- File locking prevents concurrent access issues
- Atomic write operations ensure data consistency
- Automatic lock cleanup on process termination

### Session Management
- Unique session IDs generated per server instance
- Context persists across server restarts
- Session tracking for debugging and audit trails

## Integration with Existing Tools

### Middleware Integration
The Context Middleware automatically injects current context into responses from existing tools:

```json
{
  "result": "...",
  "context": {
    "currentProjectId": "PVT_kwDOABCDEF",
    "currentIssueId": "I_kwDOABCDEF", 
    "currentTaskState": "implementation"
  }
}
```

### GitHub Integration
When `updateProjectStatus: true`, state transitions automatically update GitHub Project item status fields.

## Error Handling

### Common Errors
- **Context Lock Timeout**: Another process is accessing context
- **Invalid Task State**: Provided state not in allowed enum
- **File Permission Error**: Cannot read/write context files
- **GitHub API Error**: Failed to update project status

### Error Response Format
```json
{
  "error": "Context lock timeout",
  "code": "LOCK_TIMEOUT",
  "details": "Could not acquire lock after 5000ms"
}
```

## Best Practices

1. **Always check context** before starting work on issues
2. **Use meaningful transition reasons** for audit trails
3. **Set project/issue context** at start of work sessions
4. **Transition to 'blocked'** when dependencies prevent progress
5. **Clear context** when switching between different projects

## Troubleshooting

### Context File Issues
```bash
# Check if context file exists
ls -la .orchestr8r/

# View current context
cat .orchestr8r/context.json

# Reset context (removes file)
rm .orchestr8r/context.json
```

### Lock File Issues
```bash
# Check for stuck lock files
ls -la .orchestr8r/context.lock

# Remove stuck lock (use with caution)
rm .orchestr8r/context.lock
```

### Validation Issues
Use `get-working-context` with `includeValidation: true` to diagnose context problems.
