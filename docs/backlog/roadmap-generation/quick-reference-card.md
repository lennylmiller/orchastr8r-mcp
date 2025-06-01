# Substrate Layer Quick Reference Card

## 🚀 Create a Roadmap in 5 Minutes

### Option 1: Quick Manual Setup
```bash
1. Create Project:
   - Go to github.com/[username]?tab=projects
   - Click "New project" → "Start from scratch"
   - Name: "[Project]: [Timeline]"
   - Switch to "Roadmap" view

2. Add Phases (as draft issues):
   Phase I: [Foundation/POC] - 3 weeks
   Phase II: [Core Build] - 4 weeks  
   Phase III: [Integration] - 3 weeks
   Phase IV: [Enhancement] - 4 weeks
   Phase V: [Polish] - 3 weeks
   Phase VI: [Production] - 3 weeks
```

### Option 2: orchestr8r-mcp Commands
```javascript
// Get your owner ID first
// Go to: https://api.github.com/users/YOUR_USERNAME

// Create project
create-project({
  ownerId: "YOUR_ID",
  title: "Your Roadmap Title",
  shortDescription: "Your goal"
})

// Add phases (repeat for each)
add-draft-issue({
  projectId: "PROJECT_ID",
  title: "Phase I: Your Phase",
  body: "Objectives, deliverables, duration"
})
```

## 📋 Standard Phase Templates

### Phase I - Foundation (3-4 weeks)
```
Title: Phase I: [Foundation/Research/POC]
Body: 
- Validate approach
- Create architecture
- Build proof of concept
- Document findings
```

### Phase II - Core (4-6 weeks)
```
Title: Phase II: [Core Implementation/Build]
Body:
- Build fundamental features
- Establish patterns
- Create base functionality
- Initial testing
```

### Phase III - Integration (3-4 weeks)
```
Title: Phase III: [Integration/Connection]
Body:
- Connect components
- API development
- System integration
- End-to-end testing
```

### Phase IV - Enhancement (3-5 weeks)
```
Title: Phase IV: [Enhancement/Features]
Body:
- Advanced features
- UI/UX polish
- Performance tuning
- User feedback incorporation
```

### Phase V - Refinement (2-3 weeks)
```
Title: Phase V: [Refinement/Optimization]
Body:
- Bug fixes
- Performance optimization
- Documentation
- Final testing
```

### Phase VI - Production (2-4 weeks)
```
Title: Phase VI: [Production/Launch]
Body:
- Deployment preparation
- Monitoring setup
- Rollout planning
- Knowledge transfer
```

## 🎯 Key Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| project_name | Your project title | "Q3 Platform Upgrade" |
| timeline | Start to end dates | "June-December 2025" |
| phase_count | Number of phases | 6 (standard) |
| duration_weeks | Weeks per phase | 2-6 weeks |
| buffer | Extra time buffer | 20-25% |

## 🔧 Custom Fields to Add

1. **Status**: Not Started | In Progress | Completed | Blocked
2. **Priority**: High | Medium | Low  
3. **Health**: On Track | At Risk | Off Track
4. **Progress**: 0-100%

## 📊 View Configuration

1. Switch to **Roadmap** view
2. Group by: None
3. Date field: Use phase dates
4. Zoom: Month view
5. Show today marker

## 💡 Pro Tips

1. **Phase Duration**: Keep between 2-6 weeks
2. **Dependencies**: Make explicit in descriptions
3. **Deliverables**: List 3-5 concrete outputs per phase
4. **Reviews**: Schedule at phase boundaries
5. **Buffer**: Always include 20% time buffer

## 🔄 Reusable Patterns

### For Development Projects
```
I: POC → II: Components → III: Integration → 
IV: Features → V: Polish → VI: Deploy
```

### For Migrations
```
I: Assessment → II: Planning → III: Pilot → 
IV: Migration → V: Validation → VI: Cutover
```

### For Process Changes
```
I: Analysis → II: Design → III: Pilot → 
IV: Rollout → V: Training → VI: Adoption
```

## 📝 Example Creation Script
```bash
# Save this as create-roadmap.sh
PROJECT_NAME="$1"
GOAL="$2"

echo "Creating roadmap: $PROJECT_NAME"
echo "Goal: $GOAL"

# Create project (fill in your owner ID)
create-project \
  --ownerId "MDQ6VXNlcjEyMzQ1" \
  --title "$PROJECT_NAME: 6-Month Roadmap" \
  --shortDescription "$GOAL"

echo "Project created! Now add phases manually or with script."
```

## 🚦 Status Colors

- 🔴 Red: Blocked/Off Track
- 🟡 Yellow: At Risk/In Progress  
- 🟢 Green: On Track/Completed
- ⚪ Gray: Not Started

## 📅 Timeline Math

- 6 phases × 3 weeks = 18 weeks
- Add 20% buffer = 22 weeks total
- ~5 months for complete roadmap

---
*Keep this reference handy when creating roadmaps!*
