# Phased Roadmap Prompt Generator

## Purpose
This script generates prompts for creating phased roadmaps in GitHub Projects using the Substrate Layer of Resolution pattern.

## Primary Prompt Template

```
Create a GitHub Project roadmap with the following specifications:

PROJECT DETAILS:
- Name: {project_name}
- Goal: {project_goal}
- Timeline: {start_date} to {end_date}
- Total Phases: {phase_count}

PHASE BREAKDOWN:
{phases}

REQUIREMENTS:
1. Create project as a roadmap/timeline view
2. Each phase should be a draft issue
3. Set appropriate date ranges for each phase
4. Add dependencies between phases where noted
5. Use consistent naming: "Phase [Roman Numeral]: [Title]"
```

## Phase Generator Prompt

```
For phase {phase_number}:
- Title: Phase {phase_roman}: {phase_title}
- Duration: {duration_weeks} weeks
- Starting: {start_date}
- Objectives: {objectives}
- Deliverables: {deliverables}
- Dependencies: {dependencies}
- Priority: {priority}
```

## Quick Start Examples

### Example 1: Software Development Roadmap
```
Create a GitHub Project roadmap with the following specifications:

PROJECT DETAILS:
- Name: New Feature Development Roadmap
- Goal: Implement complete feature X with full testing and documentation
- Timeline: June 2025 to December 2025
- Total Phases: 6

PHASE BREAKDOWN:
Phase I: Research & POC (2 weeks)
- Validate technical approach
- Create proof of concept
- Document findings

Phase II: Core Development (4 weeks)
- Build fundamental components
- Implement basic functionality
- Unit testing

Phase III: Integration (3 weeks)
- Connect with existing systems
- API development
- Integration testing

Phase IV: Enhancement (3 weeks)
- Add advanced features
- Performance optimization
- UI polish

Phase V: Testing & QA (2 weeks)
- Comprehensive testing
- Bug fixes
- Performance validation

Phase VI: Deployment (2 weeks)
- Production preparation
- Documentation
- Rollout planning
```

### Example 2: Infrastructure Migration Roadmap
```
Create a GitHub Project roadmap with the following specifications:

PROJECT DETAILS:
- Name: Cloud Migration Roadmap
- Goal: Migrate on-premise infrastructure to cloud
- Timeline: Q3-Q4 2025
- Total Phases: 5

PHASE BREAKDOWN:
Phase I: Assessment (3 weeks)
- Current state analysis
- Cloud readiness assessment
- Migration strategy

Phase II: Planning (2 weeks)
- Architecture design
- Cost analysis
- Risk assessment

Phase III: Pilot Migration (4 weeks)
- Non-critical systems first
- Process validation
- Performance benchmarking

Phase IV: Production Migration (6 weeks)
- Phased production migration
- Data migration
- Cutover planning

Phase V: Optimization (3 weeks)
- Performance tuning
- Cost optimization
- Documentation update
```

## Parameterized Variables

### Required Parameters
- `project_name`: String - The name of your roadmap project
- `project_goal`: String - High-level objective
- `start_date`: Date - Project start date
- `end_date`: Date - Project end date
- `phase_count`: Integer - Number of phases (typically 4-8)

### Phase Parameters (for each phase)
- `phase_number`: Integer - Sequential number
- `phase_roman`: String - Roman numeral (I, II, III, etc.)
- `phase_title`: String - Descriptive phase name
- `duration_weeks`: Integer - Phase duration
- `objectives`: Array - Key objectives (3-5 items)
- `deliverables`: Array - Concrete deliverables
- `dependencies`: Array - Previous phases this depends on
- `priority`: String - high/medium/low

### Optional Parameters
- `assignees`: Array - GitHub usernames
- `labels`: Array - Additional labels
- `milestones`: Array - Key milestones within phases
- `risks`: Array - Identified risks per phase

## Automation Preparation

For future orchestr8r-mcp automation, structure your parameters as JSON:

```json
{
  "project": {
    "name": "Your Project Name",
    "goal": "Your project goal",
    "timeline": {
      "start": "2025-06-01",
      "end": "2025-12-31"
    }
  },
  "phases": [
    {
      "number": 1,
      "roman": "I",
      "title": "Foundation",
      "duration_weeks": 2,
      "objectives": ["obj1", "obj2"],
      "deliverables": ["del1", "del2"],
      "dependencies": [],
      "priority": "high"
    }
  ]
}
```

## Usage Tips

1. **Keep phases balanced**: 2-6 weeks per phase works best
2. **Clear dependencies**: Make phase relationships explicit
3. **Measurable outcomes**: Each phase needs concrete deliverables
4. **Buffer time**: Add 20% buffer for unexpected issues
5. **Regular reviews**: Plan for phase-end reviews

## Integration with GitHub Projects

After generating your prompt:
1. Use the GitHub Projects API to create the project
2. Create draft issues for each phase
3. Set up the timeline view
4. Configure fields (Status, Priority, Assignee)
5. Add any custom fields needed

## Future Enhancement Points
- Auto-calculate dates based on duration
- Dependency validation
- Resource allocation checking
- Progress tracking automation
- Status update reminders
