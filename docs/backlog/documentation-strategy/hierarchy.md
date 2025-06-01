# Documentation Hierarchy

This document outlines the recommended directory structure for MCP project documentation, showing how different sections relate to each other and support the user's mental model of the system.

## Complete Directory Structure

```
docs/
├── getting-started/           # Diátaxis: Tutorials
│   ├── installation.md        # First-time setup
│   ├── configuration.md       # Environment and settings
│   └── first-project.md       # Initial usage walkthrough
│
├── guides/                    # Diátaxis: How-to guides
│   ├── cli-workflows.md       # CLI-specific workflows
│   ├── web-workflows.md       # Web UI-specific workflows
│   ├── integration-guides.md  # Integration with other systems
│   └── troubleshooting.md     # Common issues and solutions
│
├── concepts/                  # Diátaxis: Explanation
│   ├── architecture.md        # High-level architecture
│   ├── mcp-protocol.md        # MCP protocol explanation
│   ├── mental-models.md       # Conceptual frameworks
│   └── design-principles.md   # Core design decisions
│
├── reference/                 # Diátaxis: Reference
│   ├── tools/                 # MCP tools documentation
│   ├── prompts/               # AI prompt templates
│   ├── api/                   # API endpoints
│   ├── cli/                   # CLI command reference
│   └── configuration/         # Configuration options
│
├── development/               # Developer documentation
│   ├── architecture/          # C4 model documentation
│   │   ├── context.md         # System context diagram
│   │   ├── containers.md      # Container diagram
│   │   ├── components.md      # Component diagrams
│   │   └── code.md            # Code-level diagrams
│   ├── contributing.md        # Contribution guidelines
│   ├── testing.md             # Testing approach
│   └── roadmap.md             # Future development plans
│
├── planning/                  # Planning documentation
│   ├── adr/                   # Architecture Decision Records
│   ├── roadmap/               # Detailed roadmap documents
│   ├── sprints/               # Sprint planning documents
│   └── features/              # Feature planning documents
│
└── examples/                  # Example implementations
    ├── basic-workflows/       # Simple workflow examples
    ├── advanced-scenarios/    # Complex implementation examples
    └── integration-examples/  # Examples with other systems
```

## Hierarchy Relationships

The documentation hierarchy is designed to support different user journeys:

### New User Journey
1. **Getting Started** - First entry point for new users
2. **Concepts** - Building understanding of the system
3. **Guides** - Solving specific problems
4. **Examples** - Seeing real-world applications
5. **Reference** - Looking up specific details

### Developer Journey
1. **Getting Started** - Initial setup
2. **Development** - Understanding the codebase
3. **Reference** - Technical details
4. **Planning** - Project direction and decisions
5. **Examples** - Implementation patterns

### Administrator Journey
1. **Getting Started** - Installation and configuration
2. **Concepts** - System architecture understanding
3. **Reference** - Configuration options
4. **Troubleshooting** - Solving issues

## Mental Model Support

The hierarchy supports building a mental model of the system by:

1. **Progressive disclosure** - Starting with simple concepts and building to more complex ones
2. **Consistent organization** - Using the same patterns across different sections
3. **Clear separation of concerns** - Distinguishing between different types of information
4. **Multiple entry points** - Supporting different user needs and knowledge levels

## Navigation Strategy

To help users navigate this hierarchy:

1. **Cross-linking** - Link related content across sections
2. **Breadcrumbs** - Show the current location in the hierarchy
3. **Table of contents** - Provide an overview of each section
4. **Search** - Enable finding content regardless of location
5. **Index** - List key terms and concepts with links

## Implementation Notes

When implementing this hierarchy:

1. Start with the top-level directories
2. Add README.md files to each directory explaining its purpose
3. Implement the most critical documents first (installation, key concepts, main reference)
4. Expand progressively based on user needs and feedback