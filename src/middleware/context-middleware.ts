import { contextStore, type WorkingContext } from "../services/context-store.js";

/**
 * Context-aware tool handler function type
 */
export type ContextAwareHandler<T> = (params: T, context: WorkingContext) => Promise<any>;

/**
 * Optional context-aware tool handler function type
 */
export type OptionalContextHandler<T> = (params: T, context?: WorkingContext) => Promise<any>;

/**
 * Context middleware for transparent enhancement of existing MCP tools
 * Follows orchestr8r-mcp patterns for non-intrusive integration
 */
export class ContextMiddleware {
  /**
   * Enhance tool handler with mandatory context awareness
   * Throws error if context is unavailable
   */
  static withContext<T>(handler: ContextAwareHandler<T>) {
    return async (params: T) => {
      try {
        const context = await contextStore.getCurrentContext();
        return await handler(params, context);
      } catch (error) {
        console.error('Context middleware error:', error);
        throw new Error(`Context required but unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
  }

  /**
   * Enhance tool handler with optional context awareness
   * Gracefully degrades to manual mode if context unavailable
   */
  static withOptionalContext<T>(handler: OptionalContextHandler<T>) {
    return async (params: T) => {
      try {
        const context = await contextStore.getCurrentContext();
        return await handler(params, context);
      } catch (error) {
        console.warn('Context unavailable, falling back to manual mode:', error);
        return await handler(params, undefined);
      }
    };
  }

  /**
   * Validate context integrity before tool execution
   */
  static async validateContext(context: WorkingContext): Promise<boolean> {
    try {
      return await contextStore.validateContextIntegrity();
    } catch (error) {
      console.error('Context validation failed:', error);
      return false;
    }
  }

  /**
   * Enhanced tool wrapper that includes context validation and error handling
   * Follows existing orchestr8r-mcp error handling patterns
   */
  static withValidatedContext<T>(handler: ContextAwareHandler<T>) {
    return async (params: T) => {
      try {
        const context = await contextStore.getCurrentContext();
        
        // Validate context integrity
        const isValid = await ContextMiddleware.validateContext(context);
        if (!isValid) {
          console.warn('Context validation failed, but proceeding with current context');
        }

        return await handler(params, context);
      } catch (error) {
        console.error('Context-aware tool execution failed:', error);
        throw error;
      }
    };
  }

  /**
   * Auto-resolve project and issue IDs from context when not provided in params
   * Common pattern for context-enhanced tools
   */
  static resolveContextualParams<T extends Record<string, any>>(
    params: T,
    context: WorkingContext
  ): T & { projectId?: string; itemId?: string } {
    const resolved = { ...params } as T & { projectId?: string; itemId?: string };

    // Auto-resolve projectId if not provided
    if (!resolved.projectId && context.currentProjectId) {
      resolved.projectId = context.currentProjectId;
    }

    // Auto-resolve itemId if not provided
    if (!resolved.itemId && context.currentIssueId) {
      resolved.itemId = context.currentIssueId;
    }

    return resolved;
  }

  /**
   * Create context-aware error with additional context information
   */
  static createContextError(message: string, context?: WorkingContext): Error {
    const contextInfo = context ? {
      projectId: context.currentProjectId,
      issueId: context.currentIssueId,
      taskState: context.currentTaskState,
      sessionId: context.sessionId,
    } : { context: 'unavailable' };

    const errorMessage = `${message}\nContext: ${JSON.stringify(contextInfo, null, 2)}`;
    return new Error(errorMessage);
  }
}

/**
 * Convenience functions for common middleware patterns
 */

/**
 * Enhance existing project operation with context awareness
 * Automatically resolves projectId and itemId from context when not provided
 */
export function withProjectContext<T extends Record<string, any>>(
  handler: (params: T & { projectId: string; itemId?: string }) => Promise<any>
) {
  return ContextMiddleware.withOptionalContext(async (params: T, context?: WorkingContext) => {
    if (context) {
      const resolved = ContextMiddleware.resolveContextualParams(params, context);
      
      // Ensure projectId is available
      if (!resolved.projectId) {
        throw ContextMiddleware.createContextError(
          'No project context available. Set current project or provide projectId parameter.',
          context
        );
      }

      return await handler(resolved as T & { projectId: string; itemId?: string });
    } else {
      // Manual mode - require explicit projectId
      if (!params.projectId) {
        throw new Error('projectId parameter required when context is unavailable');
      }
      return await handler(params as T & { projectId: string; itemId?: string });
    }
  });
}

/**
 * Enhance existing issue operation with context awareness
 * Automatically resolves issueId from context when not provided
 */
export function withIssueContext<T extends Record<string, any>>(
  handler: (params: T & { issueId: string }) => Promise<any>
) {
  return ContextMiddleware.withOptionalContext(async (params: T, context?: WorkingContext) => {
    if (context) {
      const issueId = params.issueId || context.currentIssueId;
      
      if (!issueId) {
        throw ContextMiddleware.createContextError(
          'No issue context available. Set current issue or provide issueId parameter.',
          context
        );
      }

      return await handler({ ...params, issueId } as T & { issueId: string });
    } else {
      // Manual mode - require explicit issueId
      if (!params.issueId) {
        throw new Error('issueId parameter required when context is unavailable');
      }
      return await handler(params as T & { issueId: string });
    }
  });
}

/**
 * Enhance tool with automatic task state transitions
 * Updates context based on tool execution results
 */
export function withTaskStateTransition<T>(
  handler: (params: T, context: WorkingContext) => Promise<any>,
  getNewState?: (params: T, result: any) => string | null
) {
  return ContextMiddleware.withContext(async (params: T, context: WorkingContext) => {
    const result = await handler(params, context);
    
    // Auto-transition task state if function provided
    if (getNewState) {
      const newState = getNewState(params, result);
      if (newState && ['research', 'implementation', 'testing', 'review', 'done', 'blocked'].includes(newState)) {
        await contextStore.transitionTaskState(newState as any);
      }
    }

    return result;
  });
}
