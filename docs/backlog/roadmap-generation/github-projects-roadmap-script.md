# GitHub Projects Roadmap Creation Script

## Overview
This script provides the exact function calls needed to create a phased roadmap in GitHub Projects using the available orchestr8r-mcp tools.

## Script Template

```javascript
// Roadmap Creation Script
// Replace all {variables} with your actual values

// Step 1: Create the Project
const projectData = {
  ownerId: "{OWNER_ID}",  // Get this from your GitHub user/org
  title: "{PROJECT_NAME}: {TIMELINE_DESCRIPTION}",
  shortDescription: "{HIGH_LEVEL_GOAL_STATEMENT}",
  readme: `# {PROJECT_NAME}

## Overview
{DETAILED_PROJECT_DESCRIPTION}

## Timeline
- Start: {START_DATE}
- End: {END_DATE}
- Total Duration: {TOTAL_WEEKS} weeks

## Phases
{PHASE_SUMMARY_LIST}

## Success Criteria
{SUCCESS_CRITERIA}
`,
  public: false
};

// Create project
const project = await createProject(projectData);
const projectId = project.id;

// Step 2: Create Custom Fields (if needed)
const statusField = await createProjectField({
  projectId: projectId,
  dataType: "SINGLE_SELECT",
  name: "Phase Status",
  singleSelectOptions: [
    { name: "Not Started", color: "GRAY", description: "Phase has not begun" },
    { name: "In Progress", color: "YELLOW", description: "Phase is actively being worked on" },
    { name: "Completed", color: "GREEN", description: "Phase deliverables are complete" },
    { name: "Blocked", color: "RED", description: "Phase is blocked by dependencies" }
  ]
});

const priorityField = await createProjectField({
  projectId: projectId,
  dataType: "SINGLE_SELECT",
  name: "Priority",
  singleSelectOptions: [
    { name: "High", color: "RED", description: "Critical path item" },
    { name: "Medium", color: "YELLOW", description: "Important but not critical" },
    { name: "Low", color: "BLUE", description: "Nice to have" }
  ]
});

// Step 3: Create Phase Items
const phases = [
  {
    title: "Phase I: {PHASE_1_TITLE}",
    body: `## Objectives
{PHASE_1_OBJECTIVES}

## Deliverables
{PHASE_1_DELIVERABLES}

## Duration
{PHASE_1_DURATION} weeks

## Dependencies
None - This is the first phase

## Success Criteria
{PHASE_1_SUCCESS_CRITERIA}`,
    assigneeIds: ["{ASSIGNEE_ID_1}"],
    startDate: "{PHASE_1_START}",
    endDate: "{PHASE_1_END}",
    priority: "High"
  },
  {
    title: "Phase II: {PHASE_2_TITLE}",
    body: `## Objectives
{PHASE_2_OBJECTIVES}

## Deliverables
{PHASE_2_DELIVERABLES}

## Duration
{PHASE_2_DURATION} weeks

## Dependencies
- Phase I must be completed

## Success Criteria
{PHASE_2_SUCCESS_CRITERIA}`,
    assigneeIds: ["{ASSIGNEE_ID_2}"],
    startDate: "{PHASE_2_START}",
    endDate: "{PHASE_2_END}",
    priority: "High"
  },
  // ... continue for all phases
];

// Create draft issues for each phase
for (const phase of phases) {
  const item = await addDraftIssue({
    projectId: projectId,
    title: phase.title,
    body: phase.body,
    assigneeIds: phase.assigneeIds
  });
  
  // Set custom field values
  await updateProjectItemField({
    projectId: projectId,
    itemId: item.id,
    fieldId: priorityField.id,
    value: { singleSelectOptionId: getPriorityOptionId(phase.priority) }
  });
  
  // Set dates if using date fields
  if (dateField) {
    await updateProjectItemField({
      projectId: projectId,
      itemId: item.id,
      fieldId: startDateField.id,
      value: { date: phase.startDate }
    });
  }
}

// Step 4: Configure View
// Note: View configuration may need to be done manually in GitHub UI
// as API support for view configuration is limited
```

## Function Reference

### Available Functions from orchestr8r-mcp:

1. **create-project**
   - Creates a new GitHub Project
   - Required: ownerId, title
   - Optional: shortDescription, readme, public

2. **add-draft-issue**
   - Adds a draft issue to a project
   - Required: projectId, title, body
   - Optional: assigneeIds

3. **create-project-field**
   - Creates custom fields for the project
   - Required: projectId, dataType, name
   - Optional: singleSelectOptions (for SINGLE_SELECT type)

4. **update-project-item-field**
   - Updates field values for project items
   - Required: projectId, itemId, fieldId, value

5. **get-project-fields**
   - Lists all fields in a project
   - Required: projectId

6. **get-project-items**
   - Lists all items in a project
   - Required: projectId

## Quick Start Command Sequence

```bash
# 1. Get your GitHub user/org ID
# Use GitHub API or UI to find your ownerId

# 2. Create the project
create-project --ownerId "YOUR_ID" --title "Your Roadmap" --shortDescription "Your description"

# 3. Note the returned project ID
# PROJECT_ID=PVT_kwHOAALNNc4A5xeZ

# 4. Add your phases as draft issues
add-draft-issue --projectId "PROJECT_ID" --title "Phase I: Foundation" --body "Phase description"

# 5. Configure fields and view in GitHub UI
# Navigate to the project and set up timeline view
```

## Example: Creating a 3-Phase Roadmap

```javascript
// Real example with actual values
const createThreePhaseRoadmap = async () => {
  // Create project
  const project = await createProject({
    ownerId: "MDQ6VXNlcjEyMzQ1Njc4",  // Your actual owner ID
    title: "Q3 2025 Product Roadmap",
    shortDescription: "Three-phase approach to new feature rollout",
    public: false
  });
  
  // Define phases
  const phases = [
    {
      title: "Phase I: Research & Design",
      body: "User research, competitive analysis, and initial designs",
      duration: "2 weeks"
    },
    {
      title: "Phase II: Implementation",
      body: "Core feature development and testing",
      duration: "4 weeks"
    },
    {
      title: "Phase III: Launch",
      body: "Final testing, documentation, and rollout",
      duration: "2 weeks"
    }
  ];
  
  // Create draft issues for each phase
  for (const phase of phases) {
    await addDraftIssue({
      projectId: project.id,
      title: phase.title,
      body: phase.body,
      assigneeIds: []
    });
  }
  
  console.log(`Roadmap created: ${project.url}`);
};
```

## Tips for Success

1. **Get Owner ID**: Use `query { viewer { id } }` in GitHub GraphQL Explorer
2. **Plan Phases**: Keep phases between 2-6 weeks for manageable chunks
3. **Use Draft Issues**: These are perfect for high-level planning
4. **Add Details Later**: Start with phase structure, add details as you go
5. **Review Regularly**: Update phase status and dates as project progresses

## Future Automation

This script structure is designed to be easily automated:
- Parameter validation
- Date calculation based on durations
- Dependency management
- Progress tracking
- Status updates

Save parameters in JSON format for easy reuse and automation.
