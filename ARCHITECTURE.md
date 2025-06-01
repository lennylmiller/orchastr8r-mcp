# Architecture

## Overview

Orchestr8r-MCP is built as a Model Context Protocol (MCP) server that provides AI assistants with powerful GitHub Projects automation capabilities. This document describes the current architecture and the roadmap toward a fully AI-orchestrated development lifecycle.

## Current Architecture

### Core Components

```
orchestr8r-mcp/
├── src/
│   ├── index.ts           # MCP server entry (770 lines - needs refactoring)
│   ├── operations/        # Business logic layer
│   │   ├── github-client.ts
│   │   ├── projects.ts    # 29 project operations
│   │   └── issues.ts      # Issue management
│   ├── graphql/          # GraphQL queries
│   │   ├── projects/     # 26 .graphql files
│   │   └── issues/       # Issue queries
│   └── types/            # Generated TypeScript types
```

### Technology Stack

- **Language**: TypeScript 5.8
- **Runtime**: Bun (for development), Node.js 23+ (production)
- **MCP SDK**: @modelcontextprotocol/sdk 1.6.1
- **GitHub API**: Octokit with GraphQL plugin
- **Validation**: Zod for runtime type safety
- **Build**: Custom TypeScript build with GraphQL codegen

### Current Implementation Pattern

```typescript
// Current monolithic pattern in index.ts
server.tool(
  "get-project",
  "Get a GitHub Project by ID",
  GetProjectSchema,
  async (input) => {
    const result = await projectOperations.getProject(input);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);
```

## Target Architecture

### Phase 1: Plugin Architecture (Immediate)

Transform the monolithic 770-line index.ts into a modular plugin system:

```typescript
// New plugin pattern
class ProjectsPlugin implements MCPPlugin {
  name = "projects";
  version = "1.0.0";
  
  tools = [
    {
      name: "get-project",
      description: "Get a GitHub Project by ID",
      schema: GetProjectSchema,
      handler: this.getProject.bind(this)
    },
    // ... 16 more project tools
  ];
  
  resources = [
    {
      uri: "projects://{projectId}",
      handler: this.getProjectResource.bind(this)
    }
  ];
}

// Clean server setup
const server = new McpServer({ name: "orchestr8r-mcp", version: "2.0.0" });
server.registerPlugin(new ProjectsPlugin());
server.registerPlugin(new IssuesPlugin());
server.registerPlugin(new AutomationPlugin());
```

### Phase 2: Production Hardening

#### Multi-Level Caching
```typescript
class CacheManager {
  private l1: Map<string, CacheEntry> = new Map();     // In-memory
  private l2: Redis;                                   // Distributed
  
  async get(key: string): Promise<any> {
    // L1 check (microseconds)
    if (this.l1.has(key)) return this.l1.get(key);
    
    // L2 check (milliseconds)
    const cached = await this.l2.get(key);
    if (cached) {
      this.l1.set(key, cached);  // Promote to L1
      return cached;
    }
    
    return null;
  }
}
```

#### Circuit Breaker Pattern
```typescript
class GitHubCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failures = 0;
  private lastFailureTime = 0;
  
  async call<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new McpError("GitHub API circuit breaker is OPEN");
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

### Phase 3: Multi-Service Architecture

```
┌─────────────────────────────────────┐
│   Natural Language Interface (NLI)   │ ← "Start my day"
├─────────────────────────────────────┤
│     MCP Aggregator (Orchestrator)    │ ← Routes to appropriate service
├─────────┬───────────┬───────────────┤
│   Git   │ PROJECT-  │    Context    │
│   Ops   │    MGR    │     Store     │ ← Specialized MCP servers
│   MCP   │   (this)  │      MCP      │
└─────────┴───────────┴───────────────┘
```

## Security Architecture

### Authentication & Authorization
- GitHub Personal Access Tokens (current)
- OAuth 2.1 with PKCE (planned)
- Fine-grained permissions per operation
- Token rotation and secure storage

### API Security
```typescript
class SecurityMiddleware {
  rateLimit = new RateLimiter({
    windowMs: 60 * 1000,  // 1 minute
    max: 100              // 100 requests per minute
  });
  
  validateToken(token: string): boolean {
    // Validate GitHub token format and permissions
  }
  
  auditLog(operation: string, params: any): void {
    // Log all operations for compliance
  }
}
```

## Performance Architecture

### Optimization Strategies
1. **GraphQL Query Optimization**: Batch requests, minimize round trips
2. **Caching**: Multi-level cache for Projects, Issues, and metadata
3. **Connection Pooling**: Reuse HTTP connections
4. **Async Operations**: Non-blocking I/O throughout

### Scalability Targets
- Response time: <200ms (p95)
- Concurrent connections: 1000+
- Cache hit rate: >80%
- Error rate: <0.1%

## Deployment Architecture

### Container Strategy
```dockerfile
FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "build/index.js"]
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orchestr8r-mcp
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: orchestr8r
        image: orchestr8r-mcp:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## Monitoring & Observability

### Structured Logging
```typescript
logger.info('tool.executed', {
  tool: 'get-project',
  projectId: 'PVT_123',
  duration: 145,
  cacheHit: true,
  userId: 'user123'
});
```

### Metrics Collection
- Tool execution counts and latency
- Cache hit/miss rates
- Error rates by operation
- GitHub API quota usage

### Distributed Tracing
- OpenTelemetry integration
- Request flow visualization
- Performance bottleneck identification

## Development Workflow

### Local Development
```bash
bun run dev          # Hot reload development
bun test --watch     # Continuous testing
bun run build:debug  # Debug build with source maps
```

### CI/CD Pipeline
1. **PR Checks**: Lint, type check, unit tests
2. **Integration Tests**: Test against GitHub API sandbox
3. **Security Scan**: Dependency vulnerabilities
4. **Build & Package**: Docker image creation
5. **Deploy**: Rolling update to Kubernetes

## Future Architecture: AODL Vision

The ultimate goal is an AI-Orchestrated Development Lifecycle where multiple specialized MCP servers work together:

1. **orchestr8r-mcp** (this project): GitHub Projects management
2. **git-ops-mcp**: Git operations and automation
3. **context-mcp**: Development context persistence
4. **ai-conductor**: Multi-agent orchestration

Each service remains focused and composable, communicating through the MCP Aggregator for complex workflows.