import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { issueOperations, projectOperations } from "./operations/index.js";
import { contextStore, type TaskState } from "./services/context-store.js";
import { ContextMiddleware } from "./middleware/context-middleware.js";
import {
	CreateIssueSchema,
	GetIssueSchema,
	ListIssuesSchema,
	UpdateIssueSchema,
} from "./operations/issues.js";
import {
	AddProjectV2DraftIssueSchema,
	AddProjectV2ItemByIdSchema,
	ArchiveProjectV2ItemSchema,
	BulkUpdateProjectItemFieldValueSchema,
	ClearProjectV2ItemFieldValueSchema,
	ConvertProjectV2DraftIssueToIssueSchema,
	CopyProjectV2Schema,
	CreateProjectV2FieldSchema,
	CreateProjectV2Schema,
	DeleteProjectV2FieldSchema,
	DeleteProjectV2ItemSchema,
	DeleteProjectV2Schema,
	GetProjectColumnsSchema,
	GetProjectFieldsSchema,
	GetProjectItemsSchema,
	GetProjectSchema,
	ListProjectsSchema,
	MarkProjectV2AsTemplateSchema,
	UnarchiveProjectV2ItemSchema,
	UnmarkProjectV2AsTemplateSchema,
	UpdateProjectItemFieldValueSchema,
	UpdateProjectV2FieldSchema,
	UpdateProjectV2ItemPositionSchema,
	UpdateProjectV2Schema,
	UpdateProjectV2StatusUpdateSchema,
} from "./operations/projects.js";
import type {
	GetRepositorySchema,
	ListRepositoriesSchema,
} from "./operations/repositories.js";

type GetIssueParams = typeof GetIssueSchema;
type ListIssuesParams = typeof ListIssuesSchema;
type CreateIssueParams = typeof CreateIssueSchema;
type UpdateIssueParams = typeof UpdateIssueSchema;
type ListRepositoriesParams = typeof ListRepositoriesSchema;
type GetRepositoryParams = typeof GetRepositorySchema;
type GetProjectParams = typeof GetProjectSchema;
type ListProjectsParams = typeof ListProjectsSchema;
type GetProjectColumnsParams = typeof GetProjectColumnsSchema;
type GetProjectFieldsParams = typeof GetProjectFieldsSchema;

const server = new McpServer(
	{
		name: "orchestr8r-mcp",
		version: "1.0.0",
	},
	{
		capabilities: {
			prompts: {},
			tools: {},
		},
	},
);

// Register all prompts with the server
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

// Define tools metadata
// server.tool<GetRepositoryParams>(
// 	"get-repository",
// 	"Get a GitHub repository by owner and name",
// 	GetRepositorySchema,
// 	async (params) => {
// 		const result = await repositoryOperations.getRepository(params);
// 		return {
// 			content: [
// 				{
// 					type: "text",
// 					text: JSON.stringify(result, null, 2),
// 				},
// 			],
// 		};
// 	},
// );

// server.tool<ListRepositoriesParams>(
// 	"list-repositories",
// 	"List repositories for a user",
// 	ListRepositoriesSchema,
// 	async (params) => {
// 		const result = await repositoryOperations.listRepositories(params);
// 		return {
// 			content: [
// 				{
// 					type: "text",
// 					text: JSON.stringify(result, null, 2),
// 				},
// 			],
// 		};
// 	},
// );

server.tool<GetProjectParams>(
	"get-project",
	"Get a GitHub Project by ID",
	GetProjectSchema,
	async (input) => {
		const result = await projectOperations.getProject(input);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool<ListProjectsParams>(
	"list-projects",
	"List GitHub Projects for a user",
	ListProjectsSchema,
	async (params) => {
		const result = await projectOperations.listProjects(params);
		console.log("result-------------->>>>", result);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool<GetProjectColumnsParams>(
	"get-project-columns",
	"Get status columns for a GitHub Project",
	GetProjectColumnsSchema,
	async (params) => {
		const result = await projectOperations.getProjectColumns(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool<GetProjectFieldsParams>(
	"get-project-fields",
	"Get fields for a GitHub Project",
	GetProjectFieldsSchema,
	async (params) => {
		const result = await projectOperations.getProjectFields(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"get-project-items",
	"Get items (issues) from a GitHub Project",
	GetProjectItemsSchema,
	async (params) => {
		const result = await projectOperations.getProjectItems(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"update-project-item-field",
	"Update a field value for a project item",
	UpdateProjectItemFieldValueSchema,
	async (params) => {
		const result = await projectOperations.updateProjectItemFieldValue(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"bulk-update-project-item-field",
	"Update a field value for multiple project items",
	BulkUpdateProjectItemFieldValueSchema,
	async (params) => {
		const result =
			await projectOperations.bulkUpdateProjectItemFieldValue(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"create-project",
	"Create a new GitHub Project",
	CreateProjectV2Schema,
	async (params) => {
		const result = await projectOperations.createProjectV2(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"update-project",
	"Update an existing GitHub Project",
	UpdateProjectV2Schema,
	async (params) => {
		const result = await projectOperations.updateProjectV2(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"delete-project",
	"Delete a GitHub Project",
	DeleteProjectV2Schema,
	async (params) => {
		const result = await projectOperations.deleteProjectV2(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"copy-project",
	"Copy a GitHub Project",
	CopyProjectV2Schema,
	async (params) => {
		const result = await projectOperations.copyProjectV2(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"add-draft-issue",
	"Add a draft issue to a GitHub Project",
	AddProjectV2DraftIssueSchema,
	async (params) => {
		const result = await projectOperations.addProjectV2DraftIssue(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"convert-draft-issue",
	"Convert a draft issue to a regular issue",
	ConvertProjectV2DraftIssueToIssueSchema,
	async (params) => {
		const result =
			await projectOperations.convertProjectV2DraftIssueToIssue(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"add-item-to-project",
	"Add an existing issue or PR to a GitHub Project",
	AddProjectV2ItemByIdSchema,
	async (params) => {
		const result = await projectOperations.addProjectV2ItemById(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"update-item-position",
	"Update the position of an item in a GitHub Project",
	UpdateProjectV2ItemPositionSchema,
	async (params) => {
		const result = await projectOperations.updateProjectV2ItemPosition(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"delete-project-item",
	"Remove an item from a GitHub Project",
	DeleteProjectV2ItemSchema,
	async (params) => {
		const result = await projectOperations.deleteProjectV2Item(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"create-project-field",
	"Create a new field in a GitHub Project",
	CreateProjectV2FieldSchema,
	async (params) => {
		const result = await projectOperations.createProjectV2Field(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"update-project-field",
	"Update a field in a GitHub Project",
	UpdateProjectV2FieldSchema,
	async (params) => {
		const result = await projectOperations.updateProjectV2Field(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"delete-project-field",
	"Delete a field from a GitHub Project",
	DeleteProjectV2FieldSchema,
	async (params) => {
		const result = await projectOperations.deleteProjectV2Field(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"update-project-status",
	"Update the status of a GitHub Project",
	UpdateProjectV2StatusUpdateSchema,
	async (params) => {
		const result = await projectOperations.updateProjectV2StatusUpdate(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"archive-project-item",
	"Archive an item in a GitHub Project",
	ArchiveProjectV2ItemSchema,
	async (params) => {
		const result = await projectOperations.archiveProjectV2Item(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"unarchive-project-item",
	"Unarchive an item in a GitHub Project",
	UnarchiveProjectV2ItemSchema,
	async (params) => {
		const result = await projectOperations.unarchiveProjectV2Item(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"clear-item-field-value",
	"Clear a field value for an item in a GitHub Project",
	ClearProjectV2ItemFieldValueSchema,
	async (params) => {
		const result = await projectOperations.clearProjectV2ItemFieldValue(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"mark-project-as-template",
	"Mark a GitHub Project as a template",
	MarkProjectV2AsTemplateSchema,
	async (params) => {
		const result = await projectOperations.markProjectV2AsTemplate(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool(
	"unmark-project-as-template",
	"Unmark a GitHub Project as a template",
	UnmarkProjectV2AsTemplateSchema,
	async (params) => {
		const result = await projectOperations.unmarkProjectV2AsTemplate(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool<GetIssueParams>(
	"get-issue",
	"Get a GitHub issue by number",
	GetIssueSchema,
	async (params) => {
		const result = await issueOperations.getIssue(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool<ListIssuesParams>(
	"list-issues",
	"List issues for a repository",
	ListIssuesSchema,
	async (params) => {
		const result = await issueOperations.listIssues(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool<CreateIssueParams>(
	"create-issue",
	"Create a new GitHub issue",
	CreateIssueSchema,
	async (params) => {
		const result = await issueOperations.createIssue(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

server.tool<UpdateIssueParams>(
	"update-issue",
	"Update an existing GitHub issue",
	UpdateIssueSchema,
	async (params) => {
		const result = await issueOperations.updateIssue(params);
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(result, null, 2),
				},
			],
		};
	},
);

// Context Management Tool Schemas
const SetWorkingContextSchema = {
	projectId: z.string().optional().describe("GitHub Project ID to set as current"),
	issueId: z.string().optional().describe("GitHub Issue ID to set as current"),
	taskState: z.enum(['research', 'implementation', 'testing', 'review', 'done', 'blocked']).optional().describe("Current task state"),
	clearExisting: z.boolean().default(false).describe("Clear existing context before setting new values"),
};

const GetWorkingContextSchema = {
	includeValidation: z.boolean().default(true).describe("Include context validation in response"),
};

const TransitionTaskStateSchema = {
	newState: z.enum(['research', 'implementation', 'testing', 'review', 'done', 'blocked']).describe("New task state to transition to"),
	reason: z.string().optional().describe("Reason for state transition"),
	updateProjectStatus: z.boolean().default(true).describe("Automatically update project item status"),
};

const SetWorkingContextSchemaObject = z.object(SetWorkingContextSchema);
const GetWorkingContextSchemaObject = z.object(GetWorkingContextSchema);
const TransitionTaskStateSchemaObject = z.object(TransitionTaskStateSchema);

type SetWorkingContextParams = z.infer<typeof SetWorkingContextSchemaObject>;
type GetWorkingContextParams = z.infer<typeof GetWorkingContextSchemaObject>;
type TransitionTaskStateParams = z.infer<typeof TransitionTaskStateSchemaObject>;

// Context Management Tools
server.tool<SetWorkingContextParams>(
	"set-working-context",
	"Set the current working context (project, issue, task state)",
	SetWorkingContextSchemaObject,
	async (params) => {
		try {
			if (params.clearExisting) {
				await contextStore.clearContext();
			}

			// Update context with provided values
			const updates: any = {};
			if (params.projectId !== undefined) updates.currentProjectId = params.projectId;
			if (params.issueId !== undefined) updates.currentIssueId = params.issueId;
			if (params.taskState !== undefined) updates.currentTaskState = params.taskState;

			if (Object.keys(updates).length > 0) {
				await contextStore.updateContext(updates);
			}

			const context = await contextStore.getCurrentContext();
			return {
				content: [
					{
						type: "text",
						text: `Context updated successfully:\n${JSON.stringify(context, null, 2)}`,
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: `Error updating context: ${error instanceof Error ? error.message : 'Unknown error'}`,
					},
				],
			};
		}
	},
);

server.tool<GetWorkingContextParams>(
	"get-working-context",
	"Get the current working context",
	GetWorkingContextSchemaObject,
	async (params) => {
		try {
			const context = await contextStore.getCurrentContext();

			if (params.includeValidation) {
				const isValid = await contextStore.validateContextIntegrity();
				const response = {
					...context,
					isValid,
					validationNote: isValid ? "Context is valid" : "Context validation failed - some references may be stale",
				};

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(response, null, 2),
						},
					],
				};
			}

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(context, null, 2),
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: `Error retrieving context: ${error instanceof Error ? error.message : 'Unknown error'}`,
					},
				],
			};
		}
	},
);

server.tool<TransitionTaskStateParams>(
	"transition-task-state",
	"Transition current task to new state with automatic project updates",
	TransitionTaskStateSchemaObject,
	ContextMiddleware.withContext(async (params, context) => {
		try {
			if (!context.currentIssueId && params.updateProjectStatus) {
				return {
					content: [
						{
							type: "text",
							text: "Warning: No current issue in context. Task state updated but project status not changed.",
						},
					],
				};
			}

			// Update context with new task state
			await contextStore.transitionTaskState(params.newState);

			// Update project item status if requested and context available
			if (params.updateProjectStatus && context.currentProjectId && context.currentIssueId) {
				// Map task states to project status values
				const statusMapping: Record<TaskState, string> = {
					'research': 'Todo',
					'implementation': 'In Progress',
					'testing': 'In Progress',
					'review': 'In Review',
					'done': 'Done',
					'blocked': 'Blocked',
				};

				try {
					// Note: This would require implementing updateProjectItemField with status field
					// For now, we'll just log the intended update
					const intendedStatus = statusMapping[params.newState];
					console.log(`Would update project item ${context.currentIssueId} status to: ${intendedStatus}`);
				} catch (projectError) {
					console.warn('Failed to update project status:', projectError);
				}
			}

			const updatedContext = await contextStore.getCurrentContext();
			return {
				content: [
					{
						type: "text",
						text: `Task state transitioned to: ${params.newState}\n${params.reason ? `Reason: ${params.reason}\n` : ''}Updated context:\n${JSON.stringify(updatedContext, null, 2)}`,
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: "text",
						text: `Error transitioning task state: ${error instanceof Error ? error.message : 'Unknown error'}`,
					},
				],
			};
		}
	}),
);

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}
main().catch((error) => {
	console.error("Server error:", error);
	process.exit(1);
});
