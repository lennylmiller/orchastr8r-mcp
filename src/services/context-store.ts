import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { projectOperations } from "../operations/index.js";

/**
 * Task state enumeration for development workflow tracking
 */
export type TaskState = 
  | 'research'      // Investigating, planning, designing
  | 'implementation' // Active coding
  | 'testing'       // Writing/running tests
  | 'review'        // Code review, PR process
  | 'done'          // Task completed
  | 'blocked';      // Waiting on external dependencies

/**
 * Core working context interface that persists across MCP server sessions
 */
export interface WorkingContext {
  // Core context identifiers
  currentProjectId: string | null;
  currentIssueId: string | null;
  currentTaskState: TaskState;
  
  // Session management
  sessionId: string;
  lastUpdated: Date;
  
  // Workflow state
  lastCommitSha?: string;
  activeBranch?: string;
  
  // SCRUM context
  currentSprintId?: string;
  currentIteration?: string;
}

/**
 * Zod schema for WorkingContext validation
 */
export const WorkingContextSchema = z.object({
  currentProjectId: z.string().nullable(),
  currentIssueId: z.string().nullable(),
  currentTaskState: z.enum(['research', 'implementation', 'testing', 'review', 'done', 'blocked']),
  sessionId: z.string(),
  lastUpdated: z.date(),
  lastCommitSha: z.string().optional(),
  activeBranch: z.string().optional(),
  currentSprintId: z.string().optional(),
  currentIteration: z.string().optional(),
});

/**
 * Multi-tier persistence manager for context data
 */
class PersistenceManager {
  private memoryCache: Map<string, WorkingContext> = new Map();
  private readonly filePath: string;

  constructor() {
    // Create .orchestr8r directory in project root
    this.filePath = path.join(process.cwd(), '.orchestr8r', 'context.json');
  }

  /**
   * Persist context to all available tiers
   */
  async persist(context: WorkingContext): Promise<void> {
    try {
      // Tier 1: Memory cache (fastest)
      this.memoryCache.set('current', context);

      // Tier 2: File system (reliable)
      await this.ensureDirectoryExists();
      const serializedContext = {
        ...context,
        lastUpdated: context.lastUpdated.toISOString(),
      };
      await fs.writeFile(this.filePath, JSON.stringify(serializedContext, null, 2));

      // Tier 3: Git metadata (future enhancement)
      // TODO: Implement git config persistence in future iteration
    } catch (error) {
      console.error('Context persistence error:', error);
      throw new Error(`Failed to persist context: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load context from available tiers
   */
  async load(): Promise<WorkingContext> {
    try {
      // Try Tier 1: Memory cache first
      const cached = this.memoryCache.get('current');
      if (cached) {
        return cached;
      }

      // Try Tier 2: File system
      try {
        const fileContent = await fs.readFile(this.filePath, 'utf8');
        const parsed = JSON.parse(fileContent);
        
        // Convert ISO string back to Date
        const context: WorkingContext = {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
        };

        // Validate loaded context
        const validated = WorkingContextSchema.parse(context);
        
        // Promote to memory cache
        this.memoryCache.set('current', validated);
        return validated;
      } catch (fileError) {
        // File doesn't exist or is invalid, return default context
        return this.getDefaultContext();
      }
    } catch (error) {
      console.error('Context loading error:', error);
      return this.getDefaultContext();
    }
  }

  /**
   * Create default context when no persisted context exists
   */
  private getDefaultContext(): WorkingContext {
    return {
      currentProjectId: null,
      currentIssueId: null,
      currentTaskState: 'research',
      sessionId: this.generateSessionId(),
      lastUpdated: new Date(),
    };
  }

  /**
   * Generate unique session identifier
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Ensure the .orchestr8r directory exists
   */
  private async ensureDirectoryExists(): Promise<void> {
    const dir = path.dirname(this.filePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

/**
 * Concurrency control for context updates
 */
class ContextLock {
  private locked = false;
  private queue: Array<() => Promise<void>> = [];

  /**
   * Execute operation with exclusive lock
   */
  async withLock<T>(operation: () => Promise<T>): Promise<T> {
    if (this.locked) {
      return new Promise((resolve, reject) => {
        this.queue.push(async () => {
          try {
            resolve(await operation());
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    this.locked = true;
    try {
      return await operation();
    } finally {
      this.locked = false;
      const next = this.queue.shift();
      if (next) {
        // Process next operation asynchronously
        next().catch(console.error);
      }
    }
  }
}

/**
 * Central context store service for managing persistent working context
 * Follows existing orchestr8r-mcp service patterns
 */
export class ContextStore {
  private context: WorkingContext | null = null;
  private readonly persistenceManager: PersistenceManager;
  private readonly contextLock: ContextLock;

  constructor() {
    this.persistenceManager = new PersistenceManager();
    this.contextLock = new ContextLock();
  }

  /**
   * Get current working context, loading from persistence if needed
   */
  async getCurrentContext(): Promise<WorkingContext> {
    if (!this.context) {
      this.context = await this.persistenceManager.load();
    }
    return { ...this.context }; // Return copy to prevent external mutation
  }

  /**
   * Update context with partial changes
   */
  async updateContext(updates: Partial<WorkingContext>): Promise<void> {
    await this.contextLock.withLock(async () => {
      const current = await this.getCurrentContext();
      this.context = {
        ...current,
        ...updates,
        lastUpdated: new Date(),
      };
      await this.persistenceManager.persist(this.context);
    });
  }

  /**
   * Clear all context data
   */
  async clearContext(): Promise<void> {
    await this.contextLock.withLock(async () => {
      this.context = {
        currentProjectId: null,
        currentIssueId: null,
        currentTaskState: 'research',
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lastUpdated: new Date(),
      };
      await this.persistenceManager.persist(this.context);
    });
  }

  /**
   * Set current project with validation
   */
  async setCurrentProject(projectId: string): Promise<void> {
    // Validate project exists using existing operations
    try {
      await projectOperations.getProject({ id: projectId });
      await this.updateContext({ currentProjectId: projectId });
    } catch (error) {
      throw new Error(`Invalid project ID: ${projectId}. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set current issue with validation
   */
  async setCurrentIssue(issueId: string): Promise<void> {
    // TODO: Add issue validation when issue operations are available
    await this.updateContext({ currentIssueId: issueId });
  }

  /**
   * Transition task state with validation
   */
  async transitionTaskState(newState: TaskState): Promise<void> {
    await this.updateContext({ currentTaskState: newState });
  }

  /**
   * Link commit SHA to current context
   */
  async linkCommitToContext(commitSha: string): Promise<void> {
    await this.updateContext({ lastCommitSha: commitSha });
  }

  /**
   * Sync context with current git branch
   */
  async syncWithGitBranch(): Promise<void> {
    // TODO: Implement git branch detection in future iteration
    // For now, this is a placeholder for the interface
  }

  /**
   * Validate context integrity against GitHub API
   */
  async validateContextIntegrity(): Promise<boolean> {
    try {
      const context = await this.getCurrentContext();
      
      // Validate project if set
      if (context.currentProjectId) {
        await projectOperations.getProject({ id: context.currentProjectId });
      }

      // TODO: Validate issue if set (when issue operations are available)
      
      return true;
    } catch (error) {
      console.error('Context validation failed:', error);
      return false;
    }
  }
}

// Export singleton instance following orchestr8r-mcp patterns
export const contextStore = new ContextStore();
