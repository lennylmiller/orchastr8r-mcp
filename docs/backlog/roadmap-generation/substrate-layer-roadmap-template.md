# Substrate Layer of Resolution - Phased Roadmap Template

## Overview
This template system creates consistent, phased high-level roadmaps in GitHub Projects. It's designed to be repeatable, parameterized, and future-ready for automation through orchestr8r-mcp.

## Core Concept
The "Substrate Layer of Resolution" represents the foundational planning layer where high-level phases are defined before diving into detailed implementation. Each phase represents a significant milestone in the project evolution.

## Template Structure

### Project Configuration
```yaml
project:
  title: "[PROJECT_NAME]: [TIMELINE_DESCRIPTION]"
  shortDescription: "[HIGH_LEVEL_GOAL_STATEMENT]"
  view: "roadmap"  # Timeline view
  dateRange: 
    start: "[START_DATE]"
    end: "[END_DATE]"
  visibility: "private"  # or "public"
```

### Phase Template
```yaml
phase:
  number: "[PHASE_NUMBER]"  # e.g., "I", "II", "III", etc.
  title: "Phase [NUMBER]: [PHASE_TITLE]"
  description: "[PHASE_DESCRIPTION]"
  objectives:
    - "[OBJECTIVE_1]"
    - "[OBJECTIVE_2]"
    - "[OBJECTIVE_3]"
  deliverables:
    - "[DELIVERABLE_1]"
    - "[DELIVERABLE_2]"
  duration: "[DURATION_IN_WEEKS]"
  dependencies:
    - phase: "[DEPENDENT_PHASE_NUMBER]"
      type: "[hard|soft]"
  fields:
    status: "[not_started|in_progress|completed|blocked]"
    priority: "[high|medium|low]"
    assignee: "[GITHUB_USERNAME]"
    labels: ["[LABEL_1]", "[LABEL_2]"]
```

## Standard Phase Patterns

### Phase I: Foundation/POC
- **Purpose**: Establish proof of concept and validate approach
- **Typical Duration**: 2-4 weeks
- **Key Deliverables**: POC implementation, feasibility report, architecture design

### Phase II: Core Implementation
- **Purpose**: Build fundamental components and infrastructure
- **Typical Duration**: 4-6 weeks
- **Key Deliverables**: Core components, basic functionality, initial testing

### Phase III: Integration
- **Purpose**: Connect components and establish workflows
- **Typical Duration**: 3-4 weeks
- **Key Deliverables**: Integrated system, API definitions, documentation

### Phase IV: Enhancement
- **Purpose**: Add advanced features and polish
- **Typical Duration**: 3-5 weeks
- **Key Deliverables**: Enhanced features, performance optimization, UI/UX improvements

### Phase V: Refinement
- **Purpose**: Fine-tune and optimize based on feedback
- **Typical Duration**: 2-3 weeks
- **Key Deliverables**: Refined implementation, bug fixes, performance metrics

### Phase VI: Production Ready
- **Purpose**: Prepare for production deployment
- **Typical Duration**: 2-4 weeks
- **Key Deliverables**: Production-ready code, deployment guides, monitoring setup

## Usage Instructions

1. **Copy this template** for each new roadmap project
2. **Replace all placeholders** (in square brackets) with actual values
3. **Adjust phases** based on project needs - add, remove, or modify
4. **Set realistic timelines** considering dependencies and resources
5. **Define clear deliverables** for each phase to measure progress

## GitHub Projects API Mapping

### Create Project
```javascript
{
  "title": "[PROJECT_TITLE]",
  "shortDescription": "[PROJECT_DESCRIPTION]",
  "readme": "[DETAILED_README]",
  "public": false
}
```

### Create Phase Items
```javascript
{
  "title": "[PHASE_TITLE]",
  "body": "[PHASE_DESCRIPTION]",
  "assignees": ["[ASSIGNEE_USERNAME]"],
  "labels": ["phase", "[PHASE_NUMBER]"]
}
```

## Future Automation Hooks
These markers indicate where orchestr8r-mcp automation can be integrated:

- `{{auto:project_create}}` - Automated project creation
- `{{auto:phase_generate}}` - Automated phase generation
- `{{auto:timeline_calculate}}` - Automated timeline calculation
- `{{auto:dependency_check}}` - Automated dependency validation
- `{{auto:progress_track}}` - Automated progress tracking

## Notes
- Phases can overlap in the timeline view
- Dependencies should be clearly marked
- Each phase should have measurable success criteria
- Regular status updates keep the roadmap valuable
