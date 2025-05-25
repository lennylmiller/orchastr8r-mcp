import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { ProjectOperations } from '../../src/operations/projects';
import { MockGitHubClient, fixtures } from '../setup';
import type { CreateProjectV2FieldMutation } from '../../src/types/github-api-types';

// Mock the GraphQL imports to prevent actual file loading
mock.module('../../src/graphql/projects', () => ({
  getProject: 'query GetProject($id: ID!) { node(id: $id) { ... } }',
  createProjectV2Field: 'mutation CreateProjectV2Field($input: CreateProjectV2FieldInput!) { ... }',
  updateProjectV2ItemFieldValue: 'mutation UpdateProjectItemFieldValue { ... }'
}));

describe('ProjectOperations', () => {
  let mockClient: MockGitHubClient;
  let projectOps: ProjectOperations;

  beforeEach(() => {
    mockClient = new MockGitHubClient();
    projectOps = new ProjectOperations(mockClient as any);
  });

  describe('getProject', () => {
    test('should fetch project by ID', async () => {
      // Arrange
      const projectId = 'PVT_test123';
      mockClient.setMockResponse('query GetProject($id: ID!) {', {
        node: fixtures.project
      });

      // Act
      const result = await projectOps.getProject(projectId);

      // Assert
      expect(result.node).toEqual(fixtures.project);
      expect(mockClient.wasCalledWith('GetProject')).toBe(true);
      expect(mockClient.graphqlCalls[0].variables).toEqual({ id: projectId });
    });

    test('should handle null project response', async () => {
      // Arrange
      mockClient.setMockResponse('query GetProject($id: ID!) {', {
        node: null
      });

      // Act
      const result = await projectOps.getProject('invalid-id');

      // Assert
      expect(result.node).toBeNull();
    });
  });

  describe('createProjectV2Field', () => {
    test('should create a single-select field with options', async () => {
      // Arrange
      const input = {
        projectId: 'PVT_test123',
        dataType: 'SINGLE_SELECT' as const,
        name: 'Priority',
        singleSelectOptions: [
          { name: 'High', description: 'High priority', color: 'RED' as const },
          { name: 'Low', description: 'Low priority', color: 'GREEN' as const }
        ]
      };

      const expectedResponse: CreateProjectV2FieldMutation = {
        createProjectV2Field: {
          projectV2Field: {
            ...fixtures.projectField,
            options: input.singleSelectOptions
          }
        }
      };

      mockClient.setMockResponse('mutation CreateProjectV2Field', expectedResponse);

      // Act
      const result = await projectOps.createProjectV2Field(input);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockClient.wasCalledWith('CreateProjectV2Field')).toBe(true);
      
      const call = mockClient.graphqlCalls[0];
      expect(call.variables.input.singleSelectOptions).toHaveLength(2);
      expect(call.variables.input.name).toBe('Priority');
    });

    test('should handle empty singleSelectOptions array', async () => {
      // Arrange
      const input = {
        projectId: 'PVT_test123',
        dataType: 'TEXT' as const,
        name: 'Description',
        singleSelectOptions: undefined
      };

      mockClient.setMockResponse('mutation CreateProjectV2Field', {
        createProjectV2Field: { projectV2Field: { id: 'PVTF_new', name: 'Description' } }
      });

      // Act
      await projectOps.createProjectV2Field(input);

      // Assert
      const call = mockClient.graphqlCalls[0];
      expect(call.variables.input.singleSelectOptions).toEqual([]);
    });
  });

  describe('updateProjectItemFieldValue', () => {
    test('should update a single-select field value', async () => {
      // Arrange
      const params = {
        projectId: 'PVT_test123',
        itemId: 'PVTI_test789',
        fieldId: 'PVTF_priority',
        value: { singleSelectOptionId: 'opt_high' }
      };

      mockClient.setMockResponse('mutation UpdateProjectItemFieldValue', {
        updateProjectV2ItemFieldValue: {
          projectV2Item: {
            id: params.itemId,
            fieldValueByName: {
              name: 'Priority',
              value: 'High'
            }
          }
        }
      });

      // Act
      const result = await projectOps.updateProjectItemFieldValue(params);

      // Assert
      expect(result.projectV2Item.id).toBe(params.itemId);
      expect(mockClient.wasCalledWith('UpdateProjectItemFieldValue')).toBe(true);
    });

    test('should update a number field value', async () => {
      // Arrange
      const params = {
        projectId: 'PVT_test123',
        itemId: 'PVTI_test789',
        fieldId: 'PVTF_points',
        value: { number: 5 }
      };

      mockClient.setMockResponse('mutation UpdateProjectItemFieldValue', {
        updateProjectV2ItemFieldValue: {
          projectV2Item: {
            id: params.itemId,
            fieldValueByName: {
              name: 'Story Points',
              value: 5
            }
          }
        }
      });

      // Act
      const result = await projectOps.updateProjectItemFieldValue(params);

      // Assert
      const call = mockClient.graphqlCalls[0];
      expect(call.variables.value.number).toBe(5);
      expect(call.variables.value.singleSelectOptionId).toBeUndefined();
    });
  });

  describe('error handling', () => {
    test('should propagate GraphQL errors', async () => {
      // Arrange
      mockClient.graphql = async () => {
        throw new Error('GraphQL Error: Field not found');
      };

      // Act & Assert
      expect(async () => {
        await projectOps.getProject('PVT_test123');
      }).toThrow('GraphQL Error: Field not found');
    });
  });
});