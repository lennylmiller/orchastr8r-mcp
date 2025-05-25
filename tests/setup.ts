import { beforeEach, afterEach } from 'bun:test';
import type { GitHubClient } from '../src/operations/github-client';

// Mock GitHub Client
export class MockGitHubClient implements Partial<GitHubClient> {
  public graphqlCalls: Array<{ query: string; variables?: any }> = [];
  public graphqlResponses: Map<string, any> = new Map();

  async graphql<T = any>(query: string, variables?: any): Promise<T> {
    this.graphqlCalls.push({ query, variables });
    
    // Check if we have a mock response for this query
    const queryKey = query.split('\n')[0].trim(); // First line as key
    if (this.graphqlResponses.has(queryKey)) {
      return this.graphqlResponses.get(queryKey) as T;
    }
    
    // Default empty response
    return {} as T;
  }

  // Helper to set mock responses
  setMockResponse(queryKey: string, response: any) {
    this.graphqlResponses.set(queryKey, response);
  }

  // Helper to verify calls
  wasCalledWith(queryPart: string): boolean {
    return this.graphqlCalls.some(call => 
      call.query.includes(queryPart)
    );
  }

  reset() {
    this.graphqlCalls = [];
    this.graphqlResponses.clear();
  }
}

// Test fixtures
export const fixtures = {
  project: {
    id: 'PVT_test123',
    title: 'Test Project',
    shortDescription: 'A test project',
    url: 'https://github.com/users/test/projects/1',
    number: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    closed: false
  },
  
  projectField: {
    id: 'PVTF_test456',
    name: 'Test Field',
    dataType: 'SINGLE_SELECT',
    options: [
      { id: 'opt1', name: 'Option 1', color: 'RED' },
      { id: 'opt2', name: 'Option 2', color: 'GREEN' }
    ]
  },
  
  projectItem: {
    id: 'PVTI_test789',
    type: 'ISSUE',
    fieldValues: {
      nodes: [
        {
          __typename: 'ProjectV2ItemFieldTextValue',
          text: 'Test Issue',
          field: { name: 'Title', id: 'PVTF_title' }
        }
      ]
    },
    content: {
      __typename: 'Issue',
      number: 123,
      title: 'Test Issue'
    }
  }
};

// Global test setup
beforeEach(() => {
  // Reset any global state if needed
});

afterEach(() => {
  // Clean up after tests
});