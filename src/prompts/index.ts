import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register all prompts with the MCP server
 */
export function registerPrompts(server: McpServer) {
	// Sprint project creation prompt
	server.prompt(
		"create-sprint-project",
		{
			sprintName: z
				.string()
				.describe("Name of the sprint (e.g., 'Sprint 23', 'Q2 Sprint 1')"),
			startDate: z.string().describe("Start date of the sprint (ISO format)"),
			duration: z
				.string()
				.describe("Duration of sprint in days (typically 7, 14, or 30)"),
			goals: z.string().optional().describe("Primary goals for this sprint"),
		},
		({ sprintName, startDate, duration, goals }) => ({
			messages: [
				{
					role: "user",
					content: {
						type: "text",
						text: `Create a new Sprint (iteration) project for Agile development with the following details:
                - Sprint Name: ${sprintName}
                - Start Date: ${startDate}
                - Duration: ${duration} days${goals ? `\n- Goals: ${goals}` : ""}`,
					},
				},
			],
		}),
	);

	// Sprint backlog management prompt
	server.prompt(
		"manage-sprint-backlog",
		{
			projectId: z.string().describe("GitHub Project ID to manage"),
			filterStatus: z
				.string()
				.optional()
				.describe("Filter issues by status (e.g., 'Todo', 'In Progress')"),
			prioritizationStrategy: z
				.string()
				.optional()
				.describe(
					"Strategy for prioritization (e.g., 'value-based', 'effort-based')",
				),
		},
		({ projectId, filterStatus, prioritizationStrategy }) => ({
			messages: [
				{
					role: "user",
					content: {
						type: "text",
						text: `Organize and prioritize issues in the sprint backlog:
                - Project ID: ${projectId}${filterStatus ? `\n- Filter Status: ${filterStatus}` : ""}${prioritizationStrategy ? `\n- Prioritization Strategy: ${prioritizationStrategy}` : ""}`,
					},
				},
			],
		}),
	);

	// Sprint progress tracking prompt
	server.prompt(
		"track-sprint-progress",
		{
			projectId: z.string().describe("GitHub Project ID to track"),
			includeBurndown: z
				.string()
				.optional()
				.describe("Whether to include burndown metrics"),
			highlightBlockers: z
				.string()
				.optional()
				.describe("Whether to highlight blocked issues"),
		},
		({ projectId, includeBurndown, highlightBlockers }) => ({
			messages: [
				{
					role: "user",
					content: {
						type: "text",
						text: `Generate a status report of the current sprint progress:
                 - Project ID: ${projectId}${includeBurndown ? "\n- Include burndown metrics" : ""}${highlightBlockers ? "\n- Highlight blocked issues" : ""}`,
					},
				},
			],
		}),
	);

	// Sprint retrospective prompt
	server.prompt(
		"prepare-sprint-retrospective",
		{
			completedProjectId: z
				.string()
				.describe("GitHub Project ID of the completed sprint"),
			includeMetrics: z
				.string()
				.optional()
				.describe("Include completion metrics and statistics"),
			createNextSprint: z
				.string()
				.optional()
				.describe("Automatically create next sprint project"),
		},
		({ completedProjectId, includeMetrics, createNextSprint }) => ({
			messages: [
				{
					role: "user",
					content: {
						type: "text",
						text: `Prepare a retrospective report and plan for the next sprint:
- Completed Project ID: ${completedProjectId}${includeMetrics ? "\n- Include completion metrics and statistics" : ""}${createNextSprint ? "\n- Automatically create next sprint project" : ""}`,
					},
				},
			],
		}),
	);

	// Project template creation prompt
	server.prompt(
		"create-project-template",
		{
			templateName: z.string().describe("Name for the template"),
			customFields: z
				.string()
				.optional()
				.describe("Custom fields to include (e.g., 'Story Points', 'Priority')"),
			statusColumns: z
				.string()
				.optional()
				.describe(
					"Status columns to create (e.g., 'Todo,In Progress,Review,Done')",
				),
		},
		({ templateName, customFields, statusColumns }) => ({
			messages: [
				{
					role: "user",
					content: {
						type: "text",
						text: `Create a reusable project template for future sprints:
- Template Name: ${templateName}${customFields ? `\n- Custom Fields: ${customFields}` : ""}${statusColumns ? `\n- Status Columns: ${statusColumns}` : ""}`,
					},
				},
			],
		}),
	);

	// Code review prompt
	server.prompt(
		"review-code",
		{
			code: z.string().describe("Code to review"),
		},
		({ code }) => ({
			messages: [
				{
					role: "user",
					content: {
						type: "text",
						text: `Please review this code:\n\n${code}`,
					},
				},
			],
		}),
	);
}
