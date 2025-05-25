/**
 * Quick Dashboard Server
 * Simple Express server to display orchestr8r-mcp data
 */

import express from 'express';
import { projectOperations } from '../../src/operations/index.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const app = express();
const PORT = process.env.PORT || 3000;

// State files
const FOCUS_FILE = join(homedir(), '.orchestr8r-focus.json');
const COMPLETED_FILE = join(homedir(), '.orchestr8r-completed.json');
const CONTEXT_DIR = join(homedir(), '.orchestr8r-contexts');

// Serve static files
app.use(express.static('public'));

// API endpoint for dashboard data
app.get('/api/dashboard', async (req, res) => {
  try {
    // Get project data
    const result = await projectOperations.getProjectItems({
      id: 'PVT_kwHOAALNNc4A5x3U',
      first: 50,
      after: '',
      filter: ''
    });
    
    const items = result.items || [];
    
    // Get current focus
    let currentFocus = null;
    if (existsSync(FOCUS_FILE)) {
      try {
        currentFocus = JSON.parse(readFileSync(FOCUS_FILE, 'utf8'));
      } catch {}
    }
    
    // Get completed tasks (last 7 days)
    let recentCompleted = [];
    if (existsSync(COMPLETED_FILE)) {
      try {
        const allCompleted = JSON.parse(readFileSync(COMPLETED_FILE, 'utf8'));
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        recentCompleted = allCompleted.filter(task => 
          new Date(task.completedAt) > weekAgo
        );
      } catch {}
    }
    
    // Group items by status
    const grouped = {
      todo: [],
      inProgress: [],
      done: [],
      blocked: []
    };
    
    items.forEach(item => {
      const status = getFieldValue(item, 'Status') || 'No Status';
      const taskData = {
        id: item.id,
        title: getFieldValue(item, 'Title') || 'Untitled',
        status: status,
        priority: getFieldValue(item, 'Priority'),
        size: getFieldValue(item, 'Size'),
        labels: item.content?.__typename === 'Issue' ? 
          item.content.labels?.nodes?.map(l => l.name) : []
      };
      
      // Check if blocked
      if (taskData.labels.includes('blocked')) {
        grouped.blocked.push(taskData);
      } else if (status === 'Todo') {
        grouped.todo.push(taskData);
      } else if (status === 'In Progress') {
        grouped.inProgress.push(taskData);
      } else if (status === 'Done') {
        grouped.done.push(taskData);
      }
    });
    
    // Calculate sprint metrics
    const sprintStart = new Date('2025-05-19');
    const today = new Date();
    const daysDiff = Math.floor((today - sprintStart) / (1000 * 60 * 60 * 24));
    const sprintDay = (daysDiff % 14) + 1;
    
    const totalItems = items.length;
    const completedItems = grouped.done.length;
    const progressPercentage = totalItems > 0 ? 
      Math.round((completedItems / totalItems) * 100) : 0;
    
    // Send dashboard data
    res.json({
      sprint: {
        name: 'Sprint Development - Orchestr8r',
        day: sprintDay,
        totalDays: 14,
        progressPercentage
      },
      currentFocus,
      tasks: grouped,
      metrics: {
        totalTasks: totalItems,
        completed: completedItems,
        inProgress: grouped.inProgress.length,
        blocked: grouped.blocked.length,
        recentlyCompleted: recentCompleted.length
      },
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Helper function (copy from scripts)
function getFieldValue(item: any, fieldName: string): string | undefined {
  const fieldValue = item.fieldValues?.nodes?.find(
    (node: any) => node.field?.name === fieldName
  );
  
  if (fieldValue?.__typename === 'ProjectV2ItemFieldTextValue') {
    return fieldValue.text;
  } else if (fieldValue?.__typename === 'ProjectV2ItemFieldSingleSelectValue') {
    return fieldValue.name || fieldValue.optionId;
  }
  
  return undefined;
}

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Orchestr8r Dashboard Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Dashboard: http://localhost:${PORT}
🔄 API: http://localhost:${PORT}/api/dashboard

Press Ctrl+C to stop
`);
});
