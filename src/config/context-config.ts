/**
 * Configuration management for the Persistent Context Tracker v1.0
 * 
 * This file provides centralized configuration management with environment
 * variable support, validation, and default values for production deployment.
 */

import { z } from 'zod';
import path from 'path';
import os from 'os';

/**
 * Configuration schema for validation
 */
const ContextConfigSchema = z.object({
  // File system configuration
  persistencePath: z.string().default('.orchestr8r/context.json'),
  lockPath: z.string().default('.orchestr8r/context.lock'),
  backupPath: z.string().default('.orchestr8r/context.backup.json'),
  
  // Locking configuration
  lockTimeout: z.number().min(1000).max(60000).default(5000),
  maxRetries: z.number().min(1).max(10).default(3),
  retryDelay: z.number().min(100).max(5000).default(1000),
  
  // Performance configuration
  enableFileWatching: z.boolean().default(false),
  enableMemoryCache: z.boolean().default(true),
  cacheTimeout: z.number().min(1000).max(300000).default(30000),
  
  // GitHub integration configuration
  enableGitHubValidation: z.boolean().default(true),
  gitHubValidationTimeout: z.number().min(1000).max(30000).default(10000),
  gitHubRateLimitBuffer: z.number().min(0).max(1000).default(100),
  
  // Session configuration
  sessionTimeout: z.number().min(60000).max(86400000).default(3600000), // 1 hour
  enableSessionCleanup: z.boolean().default(true),
  maxConcurrentSessions: z.number().min(1).max(100).default(10),
  
  // Logging configuration
  enableDebugLogging: z.boolean().default(false),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  enablePerformanceLogging: z.boolean().default(false),
  
  // Development configuration
  isDevelopment: z.boolean().default(false),
  enableTestMode: z.boolean().default(false),
  enableMockGitHub: z.boolean().default(false),
});

/**
 * Configuration interface
 */
export type ContextConfig = z.infer<typeof ContextConfigSchema>;

/**
 * Environment variable mappings
 */
const ENV_MAPPINGS = {
  // File system
  ORCHESTR8R_CONTEXT_PATH: 'persistencePath',
  ORCHESTR8R_LOCK_PATH: 'lockPath',
  ORCHESTR8R_BACKUP_PATH: 'backupPath',
  
  // Locking
  ORCHESTR8R_LOCK_TIMEOUT: 'lockTimeout',
  ORCHESTR8R_MAX_RETRIES: 'maxRetries',
  ORCHESTR8R_RETRY_DELAY: 'retryDelay',
  
  // Performance
  ORCHESTR8R_ENABLE_FILE_WATCHING: 'enableFileWatching',
  ORCHESTR8R_ENABLE_MEMORY_CACHE: 'enableMemoryCache',
  ORCHESTR8R_CACHE_TIMEOUT: 'cacheTimeout',
  
  // GitHub
  ORCHESTR8R_ENABLE_GITHUB_VALIDATION: 'enableGitHubValidation',
  ORCHESTR8R_GITHUB_VALIDATION_TIMEOUT: 'gitHubValidationTimeout',
  ORCHESTR8R_GITHUB_RATE_LIMIT_BUFFER: 'gitHubRateLimitBuffer',
  
  // Session
  ORCHESTR8R_SESSION_TIMEOUT: 'sessionTimeout',
  ORCHESTR8R_ENABLE_SESSION_CLEANUP: 'enableSessionCleanup',
  ORCHESTR8R_MAX_CONCURRENT_SESSIONS: 'maxConcurrentSessions',
  
  // Logging
  ORCHESTR8R_DEBUG: 'enableDebugLogging',
  ORCHESTR8R_LOG_LEVEL: 'logLevel',
  ORCHESTR8R_ENABLE_PERFORMANCE_LOGGING: 'enablePerformanceLogging',
  
  // Development
  NODE_ENV: 'isDevelopment',
  ORCHESTR8R_TEST_MODE: 'enableTestMode',
  ORCHESTR8R_MOCK_GITHUB: 'enableMockGitHub',
} as const;

/**
 * Load configuration from environment variables and defaults
 */
function loadConfigFromEnv(): Partial<ContextConfig> {
  const config: any = {};
  
  for (const [envVar, configKey] of Object.entries(ENV_MAPPINGS)) {
    const value = process.env[envVar];
    if (value !== undefined) {
      // Type conversion based on schema
      switch (configKey) {
        case 'lockTimeout':
        case 'maxRetries':
        case 'retryDelay':
        case 'cacheTimeout':
        case 'gitHubValidationTimeout':
        case 'gitHubRateLimitBuffer':
        case 'sessionTimeout':
        case 'maxConcurrentSessions':
          config[configKey] = parseInt(value, 10);
          break;
        
        case 'enableFileWatching':
        case 'enableMemoryCache':
        case 'enableGitHubValidation':
        case 'enableSessionCleanup':
        case 'enableDebugLogging':
        case 'enablePerformanceLogging':
        case 'enableTestMode':
        case 'enableMockGitHub':
          config[configKey] = value.toLowerCase() === 'true';
          break;
        
        case 'isDevelopment':
          config[configKey] = value === 'development';
          break;
        
        default:
          config[configKey] = value;
      }
    }
  }
  
  return config;
}

/**
 * Resolve file paths relative to appropriate base directory
 */
function resolveFilePaths(config: ContextConfig): ContextConfig {
  // Always use a safe, accessible directory
  // For MCP servers, use the project directory or user home directory
  const baseDir = config.isDevelopment
    ? process.cwd()
    : process.cwd(); // Use project directory instead of root filesystem

  // Extract just the filename from the configured paths to avoid nested .orchestr8r directories
  const persistenceFile = path.basename(config.persistencePath);
  const lockFile = path.basename(config.lockPath);
  const backupFile = path.basename(config.backupPath);

  return {
    ...config,
    persistencePath: path.join(baseDir, '.orchestr8r', persistenceFile),
    lockPath: path.join(baseDir, '.orchestr8r', lockFile),
    backupPath: path.join(baseDir, '.orchestr8r', backupFile),
  };
}

/**
 * Validate configuration and provide helpful error messages
 */
function validateConfig(config: any): ContextConfig {
  try {
    return ContextConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join('\n');
      
      throw new Error(`Context configuration validation failed:\n${issues}`);
    }
    throw error;
  }
}

/**
 * Create configuration with environment overrides
 */
function createConfig(): ContextConfig {
  // Start with defaults
  const defaults = ContextConfigSchema.parse({});
  
  // Apply environment overrides
  const envConfig = loadConfigFromEnv();
  const mergedConfig = { ...defaults, ...envConfig };
  
  // Validate merged configuration
  const validatedConfig = validateConfig(mergedConfig);
  
  // Resolve file paths
  const finalConfig = resolveFilePaths(validatedConfig);
  
  return finalConfig;
}

/**
 * Global configuration instance
 */
export const contextConfig: ContextConfig = createConfig();

/**
 * Configuration utilities
 */
export const ContextConfigUtils = {
  /**
   * Get configuration value with type safety
   */
  get<K extends keyof ContextConfig>(key: K): ContextConfig[K] {
    return contextConfig[key];
  },

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return contextConfig.isDevelopment;
  },

  /**
   * Check if running in test mode
   */
  isTestMode(): boolean {
    return contextConfig.enableTestMode;
  },

  /**
   * Get file paths configuration
   */
  getFilePaths() {
    return {
      persistencePath: contextConfig.persistencePath,
      lockPath: contextConfig.lockPath,
      backupPath: contextConfig.backupPath,
    };
  },

  /**
   * Get performance configuration
   */
  getPerformanceConfig() {
    return {
      enableMemoryCache: contextConfig.enableMemoryCache,
      cacheTimeout: contextConfig.cacheTimeout,
      enableFileWatching: contextConfig.enableFileWatching,
      enablePerformanceLogging: contextConfig.enablePerformanceLogging,
    };
  },

  /**
   * Get GitHub integration configuration
   */
  getGitHubConfig() {
    return {
      enableGitHubValidation: contextConfig.enableGitHubValidation,
      gitHubValidationTimeout: contextConfig.gitHubValidationTimeout,
      gitHubRateLimitBuffer: contextConfig.gitHubRateLimitBuffer,
      enableMockGitHub: contextConfig.enableMockGitHub,
    };
  },

  /**
   * Get locking configuration
   */
  getLockingConfig() {
    return {
      lockTimeout: contextConfig.lockTimeout,
      maxRetries: contextConfig.maxRetries,
      retryDelay: contextConfig.retryDelay,
    };
  },

  /**
   * Get session configuration
   */
  getSessionConfig() {
    return {
      sessionTimeout: contextConfig.sessionTimeout,
      enableSessionCleanup: contextConfig.enableSessionCleanup,
      maxConcurrentSessions: contextConfig.maxConcurrentSessions,
    };
  },

  /**
   * Get logging configuration
   */
  getLoggingConfig() {
    return {
      enableDebugLogging: contextConfig.enableDebugLogging,
      logLevel: contextConfig.logLevel,
      enablePerformanceLogging: contextConfig.enablePerformanceLogging,
    };
  },

  /**
   * Reload configuration from environment
   */
  reload(): ContextConfig {
    const newConfig = createConfig();
    Object.assign(contextConfig, newConfig);
    return contextConfig;
  },

  /**
   * Export configuration for debugging
   */
  export(): ContextConfig {
    return { ...contextConfig };
  },
};

/**
 * Configuration validation for deployment
 */
export function validateDeploymentConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file system permissions
  try {
    const fs = require('fs');
    const path = require('path');
    
    const contextDir = path.dirname(contextConfig.persistencePath);
    if (!fs.existsSync(contextDir)) {
      warnings.push(`Context directory does not exist: ${contextDir}`);
    }
  } catch (error) {
    errors.push(`File system check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Check GitHub configuration
  if (contextConfig.enableGitHubValidation && !process.env.GITHUB_TOKEN) {
    warnings.push('GitHub validation enabled but GITHUB_TOKEN not set');
  }

  // Check performance settings
  if (contextConfig.lockTimeout < 1000) {
    warnings.push('Lock timeout is very low, may cause issues under load');
  }

  if (contextConfig.maxRetries > 5) {
    warnings.push('High retry count may cause delays under contention');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Environment-specific configuration presets
 */
export const ConfigPresets = {
  development: {
    isDevelopment: true,
    enableDebugLogging: true,
    logLevel: 'debug' as const,
    enablePerformanceLogging: true,
    enableMockGitHub: true,
    lockTimeout: 10000,
  },

  testing: {
    enableTestMode: true,
    enableMockGitHub: true,
    enableDebugLogging: false,
    enableFileWatching: false,
    enableMemoryCache: false,
    lockTimeout: 1000,
    maxRetries: 1,
  },

  production: {
    isDevelopment: false,
    enableDebugLogging: false,
    logLevel: 'warn' as const,
    enablePerformanceLogging: false,
    enableMockGitHub: false,
    enableSessionCleanup: true,
    lockTimeout: 5000,
    maxRetries: 3,
  },
} as const;

/**
 * Apply configuration preset
 */
export function applyConfigPreset(preset: keyof typeof ConfigPresets): void {
  const presetConfig = ConfigPresets[preset];
  Object.assign(contextConfig, presetConfig);
}
