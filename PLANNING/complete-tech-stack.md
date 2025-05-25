# Comprehensive Technology Stack Documentation

This document provides a comprehensive overview of the technology stack used in the project, compiled from various documentation sources across the repository.

## Core Technology Stack Overview

### Key Technology Choices

| Category | Technology | Details |
|----------|------------|---------|
| Core Language | TypeScript | Used throughout all parts of the codebase |
| Web UI | Lit components | Lightweight (5KB), standards-based web components |
| State Management | @lit-app/state | Reactive state management designed specifically for Lit |
| CLI Framework | Oclif | Enterprise-grade CLI with TypeScript support |
| Build System | Vite | Fast development and build times with TypeScript integration |
| Storage | Chunked JSON | With metadata indexes for efficient document handling |
| Version Control | isomorphic-git | Cross-platform Git operations |
| GitHub Integration | GraphQL API | Direct API integration with GitHub Projects |

## Current Implementation

The project is currently in early stages with these implemented components:
- Basic Express server with EJS templates
- Documentation generator using Anthropic Claude AI
- JSON parameterizer for template variables
- Configuration loading and validation

## Web Front-End Stack

### Core Web Components
- **Framework**: Lit v3.x (formerly lit-element)
- **Language**: TypeScript throughout
- **State Management**: @lit-app/state (reactive state designed for Lit)
- **Routing**: @lit-labs/router
- **Component Architecture**: Layered architecture with domain, application, and interface layers

### Styling Approach
- CSS Custom Properties with Shadow DOM
- No additional CSS frameworks (like Tailwind)
- Component encapsulation through Shadow DOM
- Themable through CSS variables

### Key Dependencies
```json
{
  "dependencies": {
    "lit": "^3.1.0",
    "@lit-app/state": "^2.0.0",
    "@lit-labs/router": "^1.0.0",
    "@lit-labs/context": "^1.0.0",
    "@lit-labs/task": "^3.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-dts": "^3.0.0",
    "@web/dev-server": "^0.4.0",
    "@web/test-runner": "^0.18.0",
    "@open-wc/testing": "^4.0.0"
  }
}
```

## CLI Technology Stack

### Framework Selection
- **Oclif** (replacing Commander.js)
- Reasons for selecting Oclif:
  - Native TypeScript support
  - Web UI integration capabilities
  - Plugin architecture
  - Active development and maintenance
  - Comprehensive documentation

### Terminal UI Libraries
- **chalk**: For formatted terminal output
- **cli-table3**: For tabular data display
- **ora**: For progress indicators

### Command Structure
- Modular command pattern
- Support for command chaining
- Shared core business logic with web UI

### CLI Framework Comparison

| Framework | TypeScript Support | GitHub Stars | Downloads/Week | Key Strengths | Main Weakness |
|-----------|-------------------|--------------|----------------|---------------|---------------|
| **Oclif** | Native TypeScript | 9,150+ | 149,140 | Plugin system, hooks, structured commands | Larger bundle size |
| **Yargs** | Strong (via @types) | 11,260+ | 114.6M | Command composition, popularity | Less elegant API |
| **Cliffy** | Built for TypeScript | 1,000+ | N/A (Deno) | Type inference, output formatting | Primarily for Deno |
| **CAC** | Good | 2,700 | 11M | Lightweight, simple API | Limited maintenance |
| **Clipanion** | Excellent | 1,100 | 2M | Powers Yarn, no dependencies | Verbose class-based approach |

## Backend and Shared Services

### Document Storage
- Chunked JSON with metadata indexes
- File-based storage with potential for database integration

### GitHub Integration
- GraphQL API client (graphql-request)
- GitHub Projects integration for planning
- isomorphic-git for cross-platform Git operations

### Build System
- Vite for development and building
- Library mode support for component packaging
- vite-plugin-dts for TypeScript definitions

## Component Architecture

The system uses a layered architecture to maximize code reuse between web UI and CLI interfaces:

```
┌─────────────────────────────────────┐
│                                     │
│           Domain Layer              │
│   (Shared Business Logic & State)   │
│                                     │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│                                     │
│         Application Layer           │
│ (Interface-Agnostic Services & Use Cases) │
│                                     │
└────────┬──────────────────┬─────────┘
         │                  │
         ▼                  ▼
┌────────────────┐  ┌────────────────┐
│                │  │                │
│   Web UI       │  │   CLI          │
│   Interface    │  │   Interface    │
│                │  │                │
└────────────────┘  └────────────────┘
```

### Key Architectural Principles

1. **Shared Business Logic**: Core document handling, GitHub integration, and version control logic is shared between interfaces
2. **Interface Adapters**: Separate adapters for web UI and CLI that translate business operations to interface-specific implementations
3. **Command Registry**: Unified command system where each operation is available through both interfaces
4. **Component Mapping**: CLI commands map directly to web UI components through a registry pattern

## Testing Strategy

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| Unit Testing | Vitest | Faster alternative to Jest with excellent Vite integration |
| Component Testing | @web/test-runner with plugin | Real browser testing with Vite configuration reuse |
| E2E Testing | Playwright | Comprehensive cross-browser testing solution |

## Development Tools

| Tool | Purpose |
|------|---------|
| VSCode + lit-plugin | IDE support for Lit templates |
| Web Test Runner | Component testing in real browsers |
| Storybook | Component development and documentation |
| Vitest | Fast unit testing |
| ESLint + TypeScript ESLint | Code quality and standards |
| Prettier | Code formatting |

## Project Structure

```
/src
  /core          # Shared business logic
    /models      # Data models and interfaces
    /services    # Core functionality
      /github    # GitHub Projects integration
      /storage   # Document storage and retrieval
      /search    # Search implementation
      /git       # Git operations interface
  /cli           # CLI implementation
    /commands    # Command implementations
    /utils       # CLI-specific utilities
    /formatters  # Output formatters
  /web           # Lit-based web UI
    /components  # Lit components
      /core      # Core structural components
      /content   # Content display components
      /github    # GitHub integration components
    /stores      # State stores
    /styles      # Global styles and themes
  /shared        # Shared utilities
```

## Implementation Strategy

The recommended implementation follows a phased approach:

### Phase 1: Foundation and Core Services
1. Set up project structure and build pipeline
2. Implement core data models and interfaces
3. Develop GitHub Projects API integration
4. Create document storage and retrieval services

### Phase 2: Interface Frameworks
1. Set up basic Oclif command structure
2. Implement core Lit components and theme
3. Create state management foundation
4. Establish component-to-command mapping

### Phase 3: Feature Implementation
1. Implement GitHub Projects functionality
2. Develop documentation creation and editing
3. Build search capabilities
4. Add version control features

### Phase 4: Refinement and Extensions
1. Implement advanced features
2. Optimize performance
3. Add comprehensive documentation
4. Build demo applications

## Editor Requirements

- The project needs a document editor ASAP
- Planning documents suggest implementing a custom editor using Lit components
- Editor will need to handle markdown content with AI assistance
- Needs integration with the document generator system

## Implementation Roadmap

The planned transition pathway is:
1. Migrate existing Express server to use Lit components
2. Implement CLI interface with Oclif
3. Create shared business logic layer between interfaces
4. Add GitHub Projects integration

## References and Resources

### Lit and Web Components
- [Lit Official Documentation](https://lit.dev/docs/)
- [Web Components Introduction](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Lit-specific State Management Options](https://open-wc.org/guides/knowledge/state-management/)

### State Management
- [@lit-app/state Documentation](https://github.com/lit-app/state)
- [Vaadin State Management Guide](https://vaadin.com/docs/latest/hilla/lit/guides/state-management)

### CLI Development
- [Oclif Documentation](https://oclif.io/)
- [Building CLIs with Node.js](https://github.com/lirantal/nodejs-cli-apps-best-practices)

### Build Tools
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/)

### Design Systems with Web Components
- [Open Props](https://open-props.style/)
- [Shoelace Components](https://shoelace.style/)
- [Lion Web Components](https://lion-web.netlify.app/)

## Conclusion

This tech stack provides a solid foundation for building a dual-interface documentation system that is maintainable, performant, and adheres to modern web development best practices. By leveraging Lit components, @lit-app/state for state management, CSS Custom Properties for styling, and Oclif for CLI development, the system will be lightweight and standards-based while providing an excellent developer experience.

The combination of a web UI and CLI interface sharing core business logic will allow users to interact with the documentation system in the way that best suits their workflow, while maintaining consistent behavior across interfaces.
