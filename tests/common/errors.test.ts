import { describe, test, expect } from 'bun:test';
import {
  GitHubError,
  GitHubValidationError,
  GitHubResourceNotFoundError,
  GitHubAuthenticationError,
  GitHubPermissionError,
  GitHubRateLimitError,
  GitHubConflictError,
  isGitHubError,
  createGitHubError
} from '../../src/common/errors';

describe('GitHub Error Classes', () => {
  describe('GitHubError', () => {
    test('should create base error with status and response', () => {
      const error = new GitHubError('Test error', 500, { detail: 'Server error' });
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(500);
      expect(error.response).toEqual({ detail: 'Server error' });
      expect(error.name).toBe('GitHubError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('GitHubResourceNotFoundError', () => {
    test('should create 404 error for missing resource', () => {
      const error = new GitHubResourceNotFoundError('Project PVT_123');
      
      expect(error.message).toBe('Resource not found: Project PVT_123');
      expect(error.status).toBe(404);
      expect(error.name).toBe('GitHubResourceNotFoundError');
    });
  });

  describe('GitHubAuthenticationError', () => {
    test('should create 401 error', () => {
      const error = new GitHubAuthenticationError();
      
      expect(error.message).toBe('Authentication failed');
      expect(error.status).toBe(401);
      expect(error.name).toBe('GitHubAuthenticationError');
    });

    test('should accept custom message', () => {
      const error = new GitHubAuthenticationError('Invalid token');
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('GitHubRateLimitError', () => {
    test('should include reset time', () => {
      const resetTime = new Date('2024-01-01T12:00:00Z');
      const error = new GitHubRateLimitError(resetTime);
      
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.status).toBe(429);
      expect(error.resetAt).toEqual(resetTime);
      expect(error.response).toEqual({
        message: 'Rate limit exceeded',
        reset_at: '2024-01-01T12:00:00.000Z'
      });
    });
  });

  describe('isGitHubError', () => {
    test('should identify GitHub errors', () => {
      const githubError = new GitHubError('Test', 500, {});
      const regularError = new Error('Test');
      
      expect(isGitHubError(githubError)).toBe(true);
      expect(isGitHubError(regularError)).toBe(false);
      expect(isGitHubError(null)).toBe(false);
      expect(isGitHubError(undefined)).toBe(false);
    });
  });

  describe('createGitHubError', () => {
    test('should create appropriate error based on status code', () => {
      const auth = createGitHubError(401, { message: 'Bad token' });
      expect(auth).toBeInstanceOf(GitHubAuthenticationError);
      expect(auth.message).toBe('Bad token');
      
      const notFound = createGitHubError(404, { message: 'Project' });
      expect(notFound).toBeInstanceOf(GitHubResourceNotFoundError);
      
      const rateLimit = createGitHubError(429, { 
        message: 'Too many requests',
        reset_at: '2024-01-01T12:00:00Z'
      });
      expect(rateLimit).toBeInstanceOf(GitHubRateLimitError);
      
      const validation = createGitHubError(422, { 
        message: 'Invalid field value',
        errors: [{ field: 'name', code: 'missing' }]
      });
      expect(validation).toBeInstanceOf(GitHubValidationError);
      expect(validation.message).toContain('Invalid field value');
      expect(validation.message).toContain('Details:');
      
      const generic = createGitHubError(500, { message: 'Server error' });
      expect(generic).toBeInstanceOf(GitHubError);
      expect(generic.message).toBe('Server error');
    });
  });
});