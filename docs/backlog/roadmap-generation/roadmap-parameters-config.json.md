# Roadmap Parameters Configuration

## Purpose
This file defines the parameter structure for creating reproducible phased roadmaps. Save your roadmap configurations here for reuse and automation.

## Master Configuration Template

```json
{
  "substrate_layer_config": {
    "version": "1.0",
    "created_date": "YYYY-MM-DD",
    "created_by": "github_username",
    "config_name": "descriptive_name_for_this_config"
  },
  
  "project": {
    "owner_id": "GitHub_Owner_ID",
    "title": "Project Title: Subtitle",
    "short_description": "One-line description of the project goal",
    "detailed_description": "Multi-paragraph description with context, goals, and success criteria",
    "visibility": "private|public",
    "timeline": {
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "total_weeks": 24,
      "buffer_percentage": 20
    },
    "tags": ["roadmap", "phased", "strategic"],
    "stakeholders": ["@username1", "@username2"]
  },
  
  "phases": [
    {
      "number": 1,
      "roman": "I",
      "title": "Phase Title",
      "short_name": "phase_key",
      "duration": {
        "weeks": 4,
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD"
      },
      "objectives": [
        "Primary objective statement",
        "Secondary objective statement",
        "Tertiary objective statement"
      ],
      "deliverables": [
        {
          "name": "Deliverable name",
          "description": "What this deliverable includes",
          "acceptance_criteria": "How we know it's done"
        }
      ],
      "dependencies": {
        "phases": [],
        "external": ["External dependency if any"]
      },
      "resources": {
        "assignees": ["@github_username"],
        "teams": ["team-name"],
        "estimated_hours": 160
      },
      "risks": [
        {
          "description": "Risk description",
          "probability": "high|medium|low",
          "impact": "high|medium|low",
          "mitigation": "How to address this risk"
        }
      ],
      "metadata": {
        "priority": "high|medium|low",
        "status": "not_started|in_progress|completed|blocked",
        "health": "on_track|at_risk|off_track",
        "completion_percentage": 0
      }
    }
  ],
  
  "custom_fields": [
    {
      "name": "Phase Status",
      "type": "SINGLE_SELECT",
      "options": [
        {"name": "Not Started", "color": "GRAY"},
        {"name": "In Progress", "color": "YELLOW"},
        {"name": "Completed", "color": "GREEN"},
        {"name": "Blocked", "color": "RED"}
      ]
    },
    {
      "name": "Health",
      "type": "SINGLE_SELECT",
      "options": [
        {"name": "On Track", "color": "GREEN"},
        {"name": "At Risk", "color": "YELLOW"},
        {"name": "Off Track", "color": "RED"}
      ]
    }
  ],
  
  "automation": {
    "update_frequency": "weekly",
    "reminder_day": "friday",
    "auto_rollup": true,
    "notifications": {
      "phase_complete": true,
      "phase_blocked": true,
      "weekly_summary": true
    }
  },
  
  "templates": {
    "phase_body_template": "## Objectives\\n{objectives}\\n\\n## Deliverables\\n{deliverables}\\n\\n## Duration\\n{duration} weeks\\n\\n## Dependencies\\n{dependencies}\\n\\n## Success Criteria\\n{success_criteria}",
    "status_update_template": "## Week of {date}\\n\\n### Progress\\n- {progress_items}\\n\\n### Blockers\\n- {blockers}\\n\\n### Next Steps\\n- {next_steps}"
  }
}
```

## Saved Configurations

### Configuration 1: Standard 6-Phase Development
```json
{
  "substrate_layer_config": {
    "version": "1.0",
    "config_name": "standard_6_phase_development"
  },
  "project": {
    "title": "{PROJECT_NAME}: 6-Phase Development Roadmap",
    "timeline": {
      "total_weeks": 20,
      "buffer_percentage": 20
    }
  },
  "phases": [
    {
      "number": 1,
      "roman": "I",
      "title": "Foundation & POC",
      "duration": {"weeks": 3}
    },
    {
      "number": 2,
      "roman": "II",
      "title": "Core Implementation",
      "duration": {"weeks": 4}
    },
    {
      "number": 3,
      "roman": "III",
      "title": "Integration",
      "duration": {"weeks": 3}
    },
    {
      "number": 4,
      "roman": "IV",
      "title": "Enhancement",
      "duration": {"weeks": 4}
    },
    {
      "number": 5,
      "roman": "V",
      "title": "Optimization",
      "duration": {"weeks": 3}
    },
    {
      "number": 6,
      "roman": "VI",
      "title": "Production Ready",
      "duration": {"weeks": 3}
    }
  ]
}
```

### Configuration 2: Rapid 4-Phase MVP
```json
{
  "substrate_layer_config": {
    "version": "1.0",
    "config_name": "rapid_4_phase_mvp"
  },
  "project": {
    "title": "{PROJECT_NAME}: MVP Roadmap",
    "timeline": {
      "total_weeks": 12,
      "buffer_percentage": 15
    }
  },
  "phases": [
    {
      "number": 1,
      "roman": "I",
      "title": "Discovery & Design",
      "duration": {"weeks": 2}
    },
    {
      "number": 2,
      "roman": "II",
      "title": "Core MVP Build",
      "duration": {"weeks": 4}
    },
    {
      "number": 3,
      "roman": "III",
      "title": "Testing & Iteration",
      "duration": {"weeks": 3}
    },
    {
      "number": 4,
      "roman": "IV",
      "title": "Launch Preparation",
      "duration": {"weeks": 3}
    }
  ]
}
```

### Configuration 3: Migration/Modernization
```json
{
  "substrate_layer_config": {
    "version": "1.0",
    "config_name": "migration_modernization"
  },
  "project": {
    "title": "{SYSTEM_NAME}: Modernization Roadmap",
    "timeline": {
      "total_weeks": 26,
      "buffer_percentage": 25
    }
  },
  "phases": [
    {
      "number": 1,
      "roman": "I",
      "title": "Assessment & Planning",
      "duration": {"weeks": 4}
    },
    {
      "number": 2,
      "roman": "II",
      "title": "Foundation & Architecture",
      "duration": {"weeks": 5}
    },
    {
      "number": 3,
      "roman": "III",
      "title": "Incremental Migration",
      "duration": {"weeks": 8}
    },
    {
      "number": 4,
      "roman": "IV",
      "title": "Validation & Testing",
      "duration": {"weeks": 4}
    },
    {
      "number": 5,
      "roman": "V",
      "title": "Cutover & Stabilization",
      "duration": {"weeks": 5}
    }
  ]
}
```

## Usage Instructions

1. **Select a configuration** that matches your project type
2. **Copy the configuration** to a new file
3. **Fill in the placeholders** with your specific values
4. **Adjust phases** as needed for your project
5. **Save as** `roadmap-config-[project-name].json`

## Automation Integration Points

These configurations are designed to integrate with orchestr8r-mcp:

```javascript
// Load configuration
const config = require('./roadmap-config-myproject.json');

// Create project
const project = await orchestr8r.createProject(config.project);

// Create phases
for (const phase of config.phases) {
  await orchestr8r.createPhase(project.id, phase);
}

// Set up automation
await orchestr8r.configureAutomation(project.id, config.automation);
```

## Best Practices

1. **Version your configs**: Keep track of changes over time
2. **Use descriptive names**: Make configs self-documenting
3. **Include all context**: Future you will thank present you
4. **Set realistic timelines**: Include buffer for unknowns
5. **Define clear deliverables**: Ambiguity kills roadmaps

## Next Steps

1. Create your project-specific configuration
2. Validate with stakeholders
3. Generate the GitHub Project
4. Set up automation hooks
5. Begin execution with Phase I
