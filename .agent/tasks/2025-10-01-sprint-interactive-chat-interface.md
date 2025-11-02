# Sprint: Implement Interactive Chat Interface with Research-Confirm-Proceed Flow

## Overview
Transform the chat interface from a direct command-response model to an interactive research-confirm-proceed workflow. When users make requests, the agent first explains its research plan, presents findings with options and recommendations, then waits for user confirmation before executing. Include an interactivity dial to control the depth of this workflow, creating a hybrid between conversational chat and structured REPL-style interaction.

## Motivation
Current chat interactions are immediate and direct, which works well for simple tasks but can feel overwhelming for complex operations. Users need more control and transparency during multi-step processes. This feature bridges the gap between casual conversation ("just do it") and formal workflows ("analyze → plan → confirm → execute"), giving users granular control over the interaction style.

## Requirements
- Implement `/interactivity` command with levels: `chat`, `balanced`, `repl`
  - `chat`: Current behavior - immediate responses with minimal interruption
  - `balanced`: Research phase with brief options, then proceed with confirmation
  - `repl`: Full research-confirm-proceed cycle for every operation
- Add research planning phase where agent explains investigation approach
- Create findings presentation with multiple options and clear recommendations
- Implement confirmation workflow with ability to modify or reject plans
- Add persistent configuration storage (~/.xcli/config.json) for interactivity preferences
- Ensure backward compatibility (default to `chat` mode)
- Support keyboard shortcuts for quick confirmations/rejections

## Tasks
- [ ] Analyze current chat flow and identify interruption points
- [ ] Design research-confirm-proceed state machine
- [ ] Implement `/interactivity` command parsing and state management
- [ ] Add research planning phase with progress indicators
- [ ] Create findings presentation component with options grid
- [ ] Implement confirmation workflow with keyboard shortcuts
- [ ] Add configuration persistence for interactivity settings
- [ ] Update help documentation with new commands and shortcuts
- [ ] Create visual feedback for different interactivity modes
- [ ] Test all interactivity levels across various operation types
- [ ] Add telemetry to measure user preference patterns

## Progress Summary
- **Status**: Planned 📋
- **Start Date**: [TBD - Ready for implementation]
- **Progress**: 0% (design phase)
- **Effort Estimate**: Large (4-5 days for core implementation)
- **Key Goals**:
  - Research phase: Agent explains investigation approach
  - Findings phase: Options grid with recommendations
  - Confirmation phase: User approval with modification options
  - Interactivity dial: Chat ↔ REPL continuum control
  - Keyboard workflow: Efficient confirmation shortcuts

## Acceptance Criteria
- `/interactivity chat` maintains current immediate response behavior
- `/interactivity balanced` shows research plan, brief options, requires confirmation for complex operations
- `/interactivity repl` implements full research-confirm-proceed cycle for all operations
- Research phase includes clear explanation of investigation approach
- Findings presentation shows multiple viable options with pros/cons
- Confirmation workflow allows plan modification before execution
- Keyboard shortcuts (y/n/modify/cancel) for efficient interaction
- Configuration persists across sessions
- Visual indicators show current interactivity mode

## Additional Enhancements (Optional)
- **Smart Mode Detection**: Auto-adjust interactivity based on operation complexity
- **Plan Templates**: Save and reuse successful investigation approaches
- **Collaborative Mode**: Allow multiple confirmation rounds for team decisions
- **Progress Bookmarks**: Save partial research for later resumption
- **Context Preservation**: Maintain research context across related operations
- **Feedback Learning**: Adapt recommendations based on user preferences
- **Batch Operations**: Group related tasks with single confirmation
- **Undo/Redo**: Allow stepping back through research-confirm phases

## Risks / Mitigations
- **Risk**: Increased cognitive load for simple operations → **Mitigation**: Smart defaults and easy mode switching
- **Risk**: User frustration with confirmation delays → **Mitigation**: Keyboard shortcuts and skip options
- **Risk**: Complex UI state management → **Mitigation**: Clear state machine design with error recovery
- **Risk**: Performance impact from research phases → **Mitigation**: Lazy loading and caching of research data
- **Risk**: User preference confusion → **Mitigation**: Clear help text and progressive disclosure

## Deliverable Demos
- **Mode Switching Demo**: Show how `/interactivity chat|balanced|repl` changes behavior
- **Research Phase Demo**: Complex task showing investigation planning and progress
- **Findings Presentation**: Options grid with recommendations and reasoning
- **Confirmation Workflow**: Keyboard-driven confirmation with modification options
- **Keyboard Shortcuts**: Efficient y/n/modify/cancel workflow demonstration

## Estimated Effort
Large (4-5 days for core implementation, +2-3 days for enhancements)

## Priority
High - Improves user control and reduces errors in complex operations

## Technical Architecture
- **State Machine**: Research → Findings → Confirmation → Execution phases
- **Component Design**: ResearchPlanner, FindingsGrid, ConfirmationDialog
- **Configuration**: ~/.xcli/config.json with interactivity settings
- **Keyboard Handling**: Enhanced input handler with shortcut processing
- **Persistence**: Research state preservation across interruptions