# Contributing to orchestr8r-mcp

Thank you for your interest in contributing to orchestr8r-mcp! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct: be respectful, inclusive, and professional.

## How to Contribute

### Reporting Issues

1. **Check existing issues** first to avoid duplicates
2. **Use issue templates** when available
3. **Provide reproduction steps** for bugs
4. **Include environment details** (OS, Node version, etc.)

### Suggesting Features

1. **Open a discussion** first for major features
2. **Explain the use case** not just the solution
3. **Consider the scope** - does it fit orchestr8r-mcp's vision?

### Submitting Pull Requests

1. **Fork the repository** and create a feature branch
2. **Follow the setup instructions** below
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Submit a PR** with a clear description

## Development Setup

### Prerequisites

- Node.js >= 18.0.0 (recommend using asdf or nvm)
- Bun >= 1.0.0
- GitHub Personal Access Token with appropriate permissions
- VS Code (recommended) or your preferred editor

### Local Development

1. Clone your fork:
   ```bash
   git clone git@github.com:YOUR_USERNAME/orchestr8r-mcp.git
   cd orchestr8r-mcp
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment:
   ```bash
   cp .env.example .env
   # Edit .env with your GitHub token
   ```

4. Build the project:
   ```bash
   bun run build
   ```

5. Run tests:
   ```bash
   bun test
   ```

### Testing with Claude Desktop

1. Build the project:
   ```bash
   bun run build
   ```

2. Configure Claude Desktop:
   ```json
   {
     "mcpServers": {
       "orchestr8r-dev": {
         "command": "node",
         "args": ["/path/to/your/orchestr8r-mcp/build/index.js"],
         "env": {
           "GITHUB_TOKEN": "your_token",
           "GITHUB_OWNER": "your_username"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop to load changes

## Code Standards

### TypeScript

- Use TypeScript strict mode
- Provide explicit types (avoid `any`)
- Use interfaces for object shapes
- Document complex types

### Code Style

- Use 2-space indentation
- Use semicolons
- Use single quotes for strings
- Keep lines under 100 characters
- Use meaningful variable names

### Commits

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

Example:
```
feat(projects): add bulk update operation for field values

- Implement bulkUpdateProjectItemField mutation
- Add tests for bulk operations
- Update documentation
```

### Testing

- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Test error cases, not just happy paths

Example:
```typescript
describe('ProjectOperations', () => {
  test('should create project with required fields', async () => {
    // Test implementation
  });
  
  test('should handle invalid project ID gracefully', async () => {
    // Test error handling
  });
});
```

## Project Structure

```
orchestr8r-mcp/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── operations/       # Business logic
│   ├── graphql/         # GraphQL queries/mutations
│   ├── types/           # TypeScript types
│   └── common/          # Shared utilities
├── tests/               # Test files
├── docs/               # Documentation
└── PLANNING/           # Architecture and planning docs
```

## Making Changes

### Adding a New Tool

1. Create GraphQL query/mutation in `src/graphql/`
2. Add operation in `src/operations/`
3. Define Zod schema for validation
4. Register tool in `src/index.ts`
5. Add tests
6. Document in `docs/reference/tools/`

### Modifying Existing Tools

1. Update GraphQL if needed
2. Modify operation logic
3. Update schema if parameters change
4. Update tests
5. Update documentation

## Pull Request Process

1. **Update your fork** with latest main branch
2. **Run all tests** locally
3. **Update documentation** if needed
4. **Submit PR** with clear description
5. **Address review feedback** promptly

### PR Checklist

- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No sensitive data committed
- [ ] Breaking changes noted (if any)

## Release Process

1. Maintainers merge PRs to main
2. Version bumped according to semver
3. Changelog updated
4. GitHub release created
5. npm package published (if applicable)

## Getting Help

- **Discord**: [Join our community](#)
- **Discussions**: Use GitHub Discussions
- **Issues**: For bugs and features

## Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Special thanks in documentation

Thank you for contributing to orchestr8r-mcp! 🎉