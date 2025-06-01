/**
 * Central type exports for orchestr8r-mcp
 * 
 * This file provides a single import point for all type definitions
 * used throughout the orchestr8r-mcp system.
 */

// Context-related types
export * from './context.js';

// GitHub API types
export * from './github-api-types.js';

// Re-export commonly used types for convenience
export type {
  WorkingContext,
  ContextUpdate,
  TaskState,
  ContextValidationResult,
  ContextStoreConfig,
  ContextMiddlewareOptions,
  ContextLockInfo,
  ContextOperationResult,
  ContextIntegrationStatus,
} from './context.js';

export type {
  ProjectV2Item,
  ProjectV2ItemFieldValue,
  ProjectV2Field,
  GitHubUser,
  GitHubRepository,
  GitHubIssue,
  GitHubProject,
} from './github-api-types.js';

// Type utilities
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Common utility types for MCP operations
export interface MCPToolResponse<T = any> {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    uri?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
  _meta?: {
    progressToken?: string;
    [key: string]: any;
  };
}

export interface MCPToolError {
  code: number;
  message: string;
  data?: any;
}

// Context-aware tool parameter types
export type ContextAwareParams<T> = Optional<T, 'projectId' | 'itemId'>;
export type ProjectContextParams<T> = Optional<T, 'projectId'>;
export type IssueContextParams<T> = Optional<T, 'itemId'>;

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: any;
}

// Operation result types
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// GitHub API response wrapper types
export interface GitHubAPIResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: Date;
  };
}

// Error types for different layers
export interface ServiceError {
  service: string;
  operation: string;
  message: string;
  code?: string;
  originalError?: Error;
  context?: Record<string, any>;
}

export interface MiddlewareError {
  middleware: string;
  phase: 'before' | 'after' | 'error';
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
}

// Configuration types
export interface ServiceConfig {
  enabled: boolean;
  timeout?: number;
  retries?: number;
  [key: string]: any;
}

// Event types for context changes
export interface ContextChangeEvent {
  type: 'update' | 'clear' | 'transition';
  before: WorkingContext | null;
  after: WorkingContext;
  timestamp: Date;
  source: string;
}

// Middleware function types
export type ContextMiddlewareFunction<TParams = any, TResult = any> = (
  params: TParams,
  context?: WorkingContext
) => Promise<TResult>;

export type ContextMiddlewareWrapper<TParams = any, TResult = any> = (
  fn: ContextMiddlewareFunction<TParams, TResult>
) => ContextMiddlewareFunction<TParams, TResult>;

// State transition types
export type StateTransitionFunction<TParams = any, TResult = any> = (
  params: TParams,
  result: TResult
) => TaskState | null;

// Lock types
export interface LockOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface LockResult {
  acquired: boolean;
  lockFile?: string;
  error?: string;
}

// Session types
export interface SessionInfo {
  id: string;
  startTime: Date;
  lastActivity: Date;
  operationCount: number;
  context: WorkingContext;
}

// Performance monitoring types
export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  metadata?: Record<string, any>;
}

// Integration status types
export interface IntegrationHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  message?: string;
  metrics?: Record<string, number>;
}

// Batch operation types
export interface BatchOperation<T = any> {
  id: string;
  type: string;
  params: T;
  priority?: number;
}

export interface BatchResult<T = any> {
  operation: BatchOperation<T>;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

// Cache types
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: Date;
  ttl?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
}

// Logging types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  service?: string;
  operation?: string;
  context?: Record<string, any>;
  error?: Error;
}

// Test utility types
export interface MockContext extends Partial<WorkingContext> {
  _isMock: true;
}

export interface TestScenario<TParams = any, TResult = any> {
  name: string;
  description: string;
  params: TParams;
  expectedResult: TResult;
  context?: Partial<WorkingContext>;
  shouldFail?: boolean;
}

// Type guards
export function isWorkingContext(obj: any): obj is WorkingContext {
  return obj && typeof obj === 'object' && 'sessionId' in obj && 'currentTaskState' in obj;
}

export function isMCPToolResponse(obj: any): obj is MCPToolResponse {
  return obj && typeof obj === 'object' && Array.isArray(obj.content);
}

export function isOperationResult(obj: any): obj is OperationResult {
  return obj && typeof obj === 'object' && 'success' in obj && 'timestamp' in obj;
}

export function isServiceError(obj: any): obj is ServiceError {
  return obj && typeof obj === 'object' && 'service' in obj && 'operation' in obj;
}

// Constants
export const TYPE_CONSTANTS = {
  TASK_STATES: ['research', 'implementation', 'testing', 'review', 'done', 'blocked'] as const,
  LOG_LEVELS: ['debug', 'info', 'warn', 'error'] as const,
  INTEGRATION_STATUSES: ['healthy', 'degraded', 'unhealthy'] as const,
  CONTEXT_CHANGE_TYPES: ['update', 'clear', 'transition'] as const,
} as const;
