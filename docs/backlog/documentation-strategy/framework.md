# Documentation Framework

## Recommended Approach

For an MCP server project with both CLI and web interfaces, we recommend a **hybrid framework** combining:

- **Diátaxis** as the primary framework for user-facing documentation
- **C4 Model** for architectural documentation
- **ADR (Architecture Decision Records)** for development decisions

## Framework Components

### Diátaxis Framework

The [Diátaxis framework](https://diataxis.fr/) provides a systematic approach to documentation by dividing it into four distinct types:

1. **Tutorials** - Learning-oriented content that helps new users get started
2. **How-to Guides** - Task-oriented content that shows how to solve specific problems
3. **Explanation** - Understanding-oriented content that provides background and context
4. **Reference** - Information-oriented content that provides detailed technical information

This separation helps users find the right information based on their current needs and learning stage.

### C4 Model

The [C4 Model](https://c4model.com/) provides a way to create software architecture diagrams at four levels of abstraction:

1. **Context** - The system in its environment
2. **Containers** - The high-level technology decisions
3. **Components** - The logical components within each container
4. **Code** - The implementation details

This hierarchical approach allows both high-level overviews and detailed technical documentation.

### Architecture Decision Records (ADRs)

[ADRs](https://adr.github.io/) document important architectural decisions made during the development of a system. Each ADR includes:

- The context and problem being addressed
- The decision that was made
- The consequences of that decision
- Alternatives that were considered

## Why This Hybrid Approach Works for MCP Projects

MCP-based projects have unique documentation needs due to their:

1. **Dual interfaces** (CLI and web) requiring different types of user guidance
2. **Complex architecture** with multiple components and integration points
3. **Evolving design** as the project grows and adapts

The hybrid framework addresses these needs by:

- Providing clear paths for different user types (Diátaxis)
- Documenting the system architecture at multiple levels (C4)
- Tracking architectural evolution over time (ADRs)

## Implementation Considerations

When implementing this framework:

1. **Start with structure** - Set up the basic directory structure following Diátaxis
2. **Add architecture diagrams** - Implement C4 diagrams for key system components
3. **Document decisions** - Begin using ADRs for new architectural decisions
4. **Cross-reference** - Link between the different documentation types to create a cohesive whole

## Evaluation Criteria

The effectiveness of this documentation framework should be evaluated based on:

1. **User feedback** - Are users finding what they need?
2. **Maintenance effort** - Is the documentation easy to maintain?
3. **Completeness** - Does the documentation cover all aspects of the system?
4. **Accuracy** - Is the documentation up-to-date with the current system?