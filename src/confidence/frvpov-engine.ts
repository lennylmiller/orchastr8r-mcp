/**
 * FRVPOV Engine
 * Feasibility, Risk, Value, Predictability, Overall Viability scoring
 * 
 * Ported from inner-agility R&D work for production use
 */

import { z } from 'zod';

// Score schema for each dimension (0-100)
export const ScoreSchema = z.number().min(0).max(100);

// FRVPOV scoring result
export const FRVPOVScoreSchema = z.object({
  feasibility: ScoreSchema,
  risk: ScoreSchema,
  value: ScoreSchema,
  predictability: ScoreSchema,
  overallViability: ScoreSchema,
  confidence: ScoreSchema,
  recommendation: z.enum(['ready', 'needs-review', 'not-ready']),
  reasoning: z.string()
});

export type FRVPOVScore = z.infer<typeof FRVPOVScoreSchema>;

// Task attributes that affect scoring
export const TaskAttributesSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  priority: z.enum(['P0', 'P1', 'P2']).optional(),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL']).optional(),
  labels: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
  customFields: z.record(z.any()).optional()
});

export type TaskAttributes = z.infer<typeof TaskAttributesSchema>;

/**
 * Calculate feasibility score
 * How achievable is this task given current resources?
 */
function calculateFeasibility(task: TaskAttributes): number {
  let score = 70; // Base score
  
  // Size affects feasibility
  const sizeImpact: Record<string, number> = {
    'XS': 20,
    'S': 15,
    'M': 0,
    'L': -15,
    'XL': -30
  };
  score += sizeImpact[task.size || 'M'] || 0;
  
  // Clear description improves feasibility
  if (task.description && task.description.length > 100) {
    score += 10;
  }
  
  // Dependencies reduce feasibility
  if (task.dependencies && task.dependencies.length > 0) {
    score -= task.dependencies.length * 5;
  }
  
  // Assigned tasks are more feasible
  if (task.assignee) {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate risk score
 * What's the risk of failure or complications?
 */
function calculateRisk(task: TaskAttributes): number {
  let risk = 30; // Base risk
  
  // Priority affects risk perception
  const priorityRisk: Record<string, number> = {
    'P0': 20,  // High priority = high risk if failed
    'P1': 10,
    'P2': 0
  };
  risk += priorityRisk[task.priority || 'P2'] || 0;
  
  // Larger tasks are riskier
  const sizeRisk: Record<string, number> = {
    'XS': -10,
    'S': -5,
    'M': 0,
    'L': 15,
    'XL': 30
  };
  risk += sizeRisk[task.size || 'M'] || 0;
  
  // Technical debt labels increase risk
  const riskyLabels = ['tech-debt', 'breaking-change', 'security', 'performance'];
  const hasRiskyLabels = task.labels?.some(label => 
    riskyLabels.some(risky => label.toLowerCase().includes(risky))
  );
  if (hasRiskyLabels) {
    risk += 20;
  }
  
  // No description is risky
  if (!task.description || task.description.length < 50) {
    risk += 15;
  }
  
  return Math.max(0, Math.min(100, risk));
}

/**
 * Calculate value score
 * How valuable is completing this task?
 */
function calculateValue(task: TaskAttributes): number {
  let value = 50; // Base value
  
  // Priority directly correlates with value
  const priorityValue: Record<string, number> = {
    'P0': 40,
    'P1': 20,
    'P2': 0
  };
  value += priorityValue[task.priority || 'P2'] || 0;
  
  // Value labels
  const valueLabels = ['feature', 'customer-request', 'revenue', 'ux'];
  const hasValueLabels = task.labels?.some(label =>
    valueLabels.some(val => label.toLowerCase().includes(val))
  );
  if (hasValueLabels) {
    value += 15;
  }
  
  // Smaller high-priority tasks have great value/effort ratio
  if (task.priority === 'P0' && ['XS', 'S'].includes(task.size || '')) {
    value += 15;
  }
  
  return Math.max(0, Math.min(100, value));
}

/**
 * Calculate predictability score
 * How well can we estimate the effort and outcome?
 */
function calculatePredictability(task: TaskAttributes): number {
  let predictability = 60; // Base predictability
  
  // Well-defined tasks are predictable
  if (task.description && task.description.length > 200) {
    predictability += 20;
  }
  
  // Size estimates improve predictability
  if (task.size) {
    predictability += 10;
  }
  
  // Similar past work improves predictability
  const predictableLabels = ['bug', 'refactor', 'documentation', 'test'];
  const hasPredictableLabels = task.labels?.some(label =>
    predictableLabels.some(pred => label.toLowerCase().includes(pred))
  );
  if (hasPredictableLabels) {
    predictability += 15;
  }
  
  // Research/exploration tasks are less predictable
  const unpredictableLabels = ['research', 'exploration', 'poc', 'experiment'];
  const hasUnpredictableLabels = task.labels?.some(label =>
    unpredictableLabels.some(unpred => label.toLowerCase().includes(unpred))
  );
  if (hasUnpredictableLabels) {
    predictability -= 25;
  }
  
  return Math.max(0, Math.min(100, predictability));
}

/**
 * Calculate overall viability and confidence scores
 */
export function calculateFRVPOV(task: TaskAttributes): FRVPOVScore {
  const feasibility = calculateFeasibility(task);
  const risk = calculateRisk(task);
  const value = calculateValue(task);
  const predictability = calculatePredictability(task);
  
  // Overall viability is weighted combination
  // Higher weight on value and feasibility
  const overallViability = Math.round(
    (feasibility * 0.3) +
    ((100 - risk) * 0.2) +  // Invert risk for positive correlation
    (value * 0.35) +
    (predictability * 0.15)
  );
  
  // Confidence is based on how much information we have
  let confidence = 50;
  if (task.description && task.description.length > 100) confidence += 20;
  if (task.size) confidence += 15;
  if (task.priority) confidence += 15;
  
  // Determine recommendation
  let recommendation: 'ready' | 'needs-review' | 'not-ready';
  let reasoning: string;
  
  if (overallViability >= 70 && confidence >= 70) {
    recommendation = 'ready';
    reasoning = 'High viability and confidence - ready for AI automation';
  } else if (overallViability >= 50 || confidence >= 60) {
    recommendation = 'needs-review';
    reasoning = 'Moderate scores - human review recommended before automation';
  } else {
    recommendation = 'not-ready';
    reasoning = 'Low viability or confidence - needs more definition';
  }
  
  // Add specific reasoning
  if (risk > 70) {
    reasoning += '. High risk detected - careful review needed';
  }
  if (feasibility < 40) {
    reasoning += '. Low feasibility - may be blocked or too complex';
  }
  if (value < 40) {
    reasoning += '. Low value - consider priority';
  }
  
  return {
    feasibility,
    risk,
    value,
    predictability,
    overallViability,
    confidence,
    recommendation,
    reasoning
  };
}

/**
 * Batch calculate scores for multiple tasks
 */
export function batchCalculateFRVPOV(tasks: TaskAttributes[]): FRVPOVScore[] {
  return tasks.map(task => calculateFRVPOV(task));
}

/**
 * Get tasks ready for AI automation
 */
export function filterReadyTasks(
  tasks: TaskAttributes[],
  minViability = 70,
  minConfidence = 70
): { task: TaskAttributes; score: FRVPOVScore }[] {
  return tasks
    .map(task => ({ task, score: calculateFRVPOV(task) }))
    .filter(({ score }) => 
      score.overallViability >= minViability && 
      score.confidence >= minConfidence
    )
    .sort((a, b) => b.score.overallViability - a.score.overallViability);
}

/**
 * Format score for display
 */
export function formatFRVPOVScore(score: FRVPOVScore): string {
  const bar = (value: number) => {
    const filled = Math.round(value / 10);
    return '█'.repeat(filled) + '░'.repeat(10 - filled);
  };
  
  return `
FRVPOV Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feasibility:    ${bar(score.feasibility)} ${score.feasibility}%
Risk:           ${bar(score.risk)} ${score.risk}%
Value:          ${bar(score.value)} ${score.value}%
Predictability: ${bar(score.predictability)} ${score.predictability}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall:        ${bar(score.overallViability)} ${score.overallViability}%
Confidence:     ${bar(score.confidence)} ${score.confidence}%

Recommendation: ${score.recommendation.toUpperCase()}
${score.reasoning}
`;
}
