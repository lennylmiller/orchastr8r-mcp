/**
 * Scoring Schemas
 * Extends existing orchestr8r-mcp schemas with confidence scoring
 */

import { z } from 'zod';
import { FRVPOVScoreSchema } from './frvpov-engine.js';

// Extend the existing ProjectV2Item with scoring fields
export const ScoredProjectItemSchema = z.object({
  // All existing ProjectV2Item fields would go here
  // For now, just the essential fields we need
  id: z.string(),
  fieldValues: z.object({
    nodes: z.array(z.object({
      field: z.object({
        name: z.string()
      }),
      text: z.string().optional(),
      name: z.string().optional(),
      optionId: z.string().optional()
    }))
  }),
  
  // New scoring fields
  confidenceScore: z.number().min(0).max(100).optional(),
  frvpovData: FRVPOVScoreSchema.optional(),
  aiAssignable: z.boolean().default(false),
  humanReviewRequired: z.boolean().default(true),
  lastScoredAt: z.string().optional(),
  scoringVersion: z.string().default('1.0.0')
});

export type ScoredProjectItem = z.infer<typeof ScoredProjectItemSchema>;

// Scoring configuration
export const ScoringConfigSchema = z.object({
  // Minimum scores for AI automation
  minViabilityForAI: z.number().default(70),
  minConfidenceForAI: z.number().default(70),
  
  // Scoring weights (must sum to 1.0)
  weights: z.object({
    feasibility: z.number().default(0.3),
    risk: z.number().default(0.2),
    value: z.number().default(0.35),
    predictability: z.number().default(0.15)
  }),
  
  // Auto-assignment rules
  autoAssign: z.object({
    enabled: z.boolean().default(false),
    maxConcurrentTasks: z.number().default(3),
    priorityThreshold: z.enum(['P0', 'P1', 'P2']).default('P1'),
    sizeLimit: z.enum(['XS', 'S', 'M', 'L', 'XL']).default('M')
  }),
  
  // Review triggers
  reviewTriggers: z.object({
    highRisk: z.number().default(70),      // Risk score above this triggers review
    lowFeasibility: z.number().default(40), // Feasibility below this triggers review
    largeSizeThreshold: z.enum(['L', 'XL']).default('L')
  })
});

export type ScoringConfig = z.infer<typeof ScoringConfigSchema>;

// Batch scoring request
export const BatchScoringRequestSchema = z.object({
  projectId: z.string(),
  itemIds: z.array(z.string()).optional(), // If not provided, score all items
  config: ScoringConfigSchema.optional(),
  dryRun: z.boolean().default(false)
});

export type BatchScoringRequest = z.infer<typeof BatchScoringRequestSchema>;

// Scoring result
export const ScoringResultSchema = z.object({
  itemId: z.string(),
  title: z.string(),
  previousScore: z.number().optional(),
  newScore: z.number(),
  frvpov: FRVPOVScoreSchema,
  changed: z.boolean(),
  recommendation: z.enum(['ready', 'needs-review', 'not-ready']),
  suggestedActions: z.array(z.string())
});

export type ScoringResult = z.infer<typeof ScoringResultSchema>;

// Batch scoring response
export const BatchScoringResponseSchema = z.object({
  projectId: z.string(),
  scoredAt: z.string(),
  totalItems: z.number(),
  results: z.array(ScoringResultSchema),
  summary: z.object({
    readyForAI: z.number(),
    needsReview: z.number(),
    notReady: z.number(),
    averageConfidence: z.number(),
    averageViability: z.number()
  })
});

export type BatchScoringResponse = z.infer<typeof BatchScoringResponseSchema>;

// AI Assignment request
export const AIAssignmentRequestSchema = z.object({
  projectId: z.string(),
  itemId: z.string(),
  aiAgent: z.enum(['claude', 'gpt4', 'auto']).default('auto'),
  context: z.object({
    relatedFiles: z.array(z.string()).optional(),
    previousAttempts: z.array(z.object({
      timestamp: z.string(),
      agent: z.string(),
      result: z.enum(['success', 'failed', 'partial']),
      notes: z.string().optional()
    })).optional(),
    specialInstructions: z.string().optional()
  }).optional()
});

export type AIAssignmentRequest = z.infer<typeof AIAssignmentRequestSchema>;

// Default scoring configuration
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  minViabilityForAI: 70,
  minConfidenceForAI: 70,
  weights: {
    feasibility: 0.3,
    risk: 0.2,
    value: 0.35,
    predictability: 0.15
  },
  autoAssign: {
    enabled: false,
    maxConcurrentTasks: 3,
    priorityThreshold: 'P1',
    sizeLimit: 'M'
  },
  reviewTriggers: {
    highRisk: 70,
    lowFeasibility: 40,
    largeSizeThreshold: 'L'
  }
};

// Helper to create suggested actions based on scores
export function generateSuggestedActions(result: ScoringResult): string[] {
  const actions: string[] = [];
  const { frvpov } = result;
  
  if (frvpov.feasibility < 40) {
    actions.push('Break down into smaller subtasks');
    actions.push('Identify and resolve blockers');
  }
  
  if (frvpov.risk > 70) {
    actions.push('Add more detailed acceptance criteria');
    actions.push('Consider adding tests or validation steps');
  }
  
  if (frvpov.value < 40) {
    actions.push('Clarify business value and impact');
    actions.push('Consider if this should be deprioritized');
  }
  
  if (frvpov.predictability < 40) {
    actions.push('Add more detailed description');
    actions.push('Research similar completed tasks');
    actions.push('Consider a spike or proof-of-concept first');
  }
  
  if (frvpov.confidence < 60) {
    actions.push('Add missing task details (size, priority, description)');
  }
  
  return actions;
}
