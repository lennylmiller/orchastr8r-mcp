/**
 * Core type definitions for the Persistent Context Tracker v1.0
 * 
 * This file provides centralized type definitions that resolve TypeScript errors
 * and enable proper type checking across the context tracking system.
 */

import { z } from 'zod';

/**
 * Task state enumeration for workflow management
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
 * Partial context update interface for incremental updates
 */
export interface ContextUpdate {
  currentProjectId?: string | null;
  currentIssueId?: string | null;
  currentTaskState?: TaskState;
  lastCommitSha?: string;
  activeBranch?: string;
  currentSprintId?: string;
  currentIteration?: string;
}

/**
 * Context validation result interface
 */
export interface ContextValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validationNote?: string;
}

/**
 * Context store configuration interface
 */
export interface ContextStoreConfig {
  persistencePath?: string;
  enableFileWatching?: boolean;
  lockTimeout?: number;
  maxRetries?: number;
  backupEnabled?: boolean;
}

/**
 * Context middleware options interface
 */
export interface ContextMiddlewareOptions {
  required?: boolean;
  validateIntegrity?: boolean;
  autoResolve?: boolean;
  fallbackToManual?: boolean;
}

/**
 * Context lock interface for concurrent access protection
 */
export interface ContextLockInfo {
  isLocked: boolean;
  lockFile: string;
  acquiredAt?: Date;
  processId?: number;
}

/**
 * Context persistence tier interface
 */
export interface PersistenceTier {
  name: string;
  priority: number;
  available: boolean;
  lastSync?: Date;
}

/**
 * Context session information interface
 */
export interface ContextSession {
  sessionId: string;
  startedAt: Date;
  lastActivity: Date;
  operationCount: number;
  isActive: boolean;
}

/**
 * Context operation result interface
 */
export interface ContextOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  operationType: string;
}

/**
 * Context integration status interface
 */
export interface ContextIntegrationStatus {
  githubProjects: boolean;
  gitRepository: boolean;
  fileSystem: boolean;
  memoryCache: boolean;
  lastValidation?: Date;
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
 * Zod schema for ContextUpdate validation
 */
export const ContextUpdateSchema = z.object({
  currentProjectId: z.string().nullable().optional(),
  currentIssueId: z.string().nullable().optional(),
  currentTaskState: z.enum(['research', 'implementation', 'testing', 'review', 'done', 'blocked']).optional(),
  lastCommitSha: z.string().optional(),
  activeBranch: z.string().optional(),
  currentSprintId: z.string().optional(),
  currentIteration: z.string().optional(),
});

/**
 * Type guard for WorkingContext
 */
export function isWorkingContext(obj: any): obj is WorkingContext {
  try {
    WorkingContextSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for ContextUpdate
 */
export function isContextUpdate(obj: any): obj is ContextUpdate {
  try {
    ContextUpdateSchema.parse(obj);
    return true;
  } catch {
    return false;
  }
}

/**
 * Default context factory function
 */
export function createDefaultContext(): WorkingContext {
  return {
    currentProjectId: null,
    currentIssueId: null,
    currentTaskState: 'research',
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    lastUpdated: new Date(),
  };
}

/**
 * Context serialization utilities
 */
export const ContextSerializer = {
  /**
   * Serialize context for storage
   */
  serialize(context: WorkingContext): string {
    return JSON.stringify({
      ...context,
      lastUpdated: context.lastUpdated.toISOString(),
    }, null, 2);
  },

  /**
   * Deserialize context from storage
   */
  deserialize(data: string): WorkingContext {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      lastUpdated: new Date(parsed.lastUpdated),
    };
  },
};

/**
 * Context error types
 */
export class ContextError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Partial<WorkingContext>
  ) {
    super(message);
    this.name = 'ContextError';
  }
}

export class ContextValidationError extends ContextError {
  constructor(message: string, context?: Partial<WorkingContext>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ContextValidationError';
  }
}

export class ContextPersistenceError extends ContextError {
  constructor(message: string, context?: Partial<WorkingContext>) {
    super(message, 'PERSISTENCE_ERROR', context);
    this.name = 'ContextPersistenceError';
  }
}

export class ContextLockError extends ContextError {
  constructor(message: string, context?: Partial<WorkingContext>) {
    super(message, 'LOCK_ERROR', context);
    this.name = 'ContextLockError';
  }
}

/**
 * Context constants
 */
export const CONTEXT_CONSTANTS = {
  DEFAULT_PERSISTENCE_PATH: '.orchestr8r/context.json',
  DEFAULT_LOCK_PATH: '.orchestr8r/context.lock',
  DEFAULT_LOCK_TIMEOUT: 5000,
  DEFAULT_MAX_RETRIES: 3,
  VALID_TASK_STATES: ['research', 'implementation', 'testing', 'review', 'done', 'blocked'] as const,
  SESSION_ID_PREFIX: 'session_',
} as const;
