# X-CLI Workflow Architecture

## Overview

X-CLI implements a revolutionary "Research → Recommend → Execute → Auto-Doc" workflow that transforms complex development tasks into structured, operator-in-the-loop experiences with full safety guarantees and knowledge accumulation.

## Core Principles

### Safety First
- **Zero Data Loss**: All operations create patches and backups
- **Version Control Integration**: Automatic git commits for all changes
- **Rollback Capabilities**: .bak files and patch files enable easy reversal
- **Error Boundaries**: Execution halts safely when problems are detected

### Operator-in-the-Loop
- **Single Approval Point**: One Y/n decision controls complex multi-step operations
- **Full Transparency**: Complete visibility into planned actions and their trade-offs
- **Revision Capability**: R=revise allows quick corrections to plans
- **Human Judgment**: AI provides recommendations, humans make final decisions

### Context Intelligence
- **Automatic Context Loading**: .agent/ documentation provides project context
- **Knowledge Preservation**: Past executions inform future recommendations
- **Adaptive Learning**: System improves through lesson learning and SOP updates
- **Project Memory**: Complete audit trail of all executed workflows

## Workflow Phases

### Phase 1: Research 🤔
**Purpose**: Gather comprehensive information and analyze the task
**Inputs**: User request, project context, historical data
**Outputs**: Structured Issues/Options/Recommendation/Plan JSON

#### Process:
1. **Context Loading**: Load .agent/system/, .agent/sop/, recent .agent/tasks/
2. **Research Prompt**: AI analyzes task with full project context
3. **Structured Analysis**: Generate Issues (facts/gaps/risks), Options (with trade-offs), Recommendation, Action Plan
4. **Console Display**: Present analysis in clear, actionable format

#### Data Structures:
```typescript
interface ResearchOutput {
  issues: ResearchIssue[];      // Facts, gaps, risks with severity
  options: ResearchOption[];    // 2-3 approaches with pros/cons
  recommendation: ResearchRecommendation;  // Chosen option + justification
  plan: ResearchPlan;          // Summary, approach, TODOs, estimates
}
```

### Phase 2: Recommend 💡
**Purpose**: Present decision framework and get user approval
**Inputs**: Research output from Phase 1
**Outputs**: User approval (Y/n/R) with optional revisions

#### Process:
1. **Console Rendering**: Display Issues, Options, Recommendation, Plan sections
2. **Trade-off Analysis**: Show effort/risk levels, pros/cons for each option
3. **Approval Prompt**: "Proceed with recommendation? (Y/n) [R=revise]"
4. **Revision Handling**: Allow short corrections and re-research if needed
5. **Final Decision**: User approves or rejects the recommended plan

#### User Experience:
```
=== ISSUES ===
📊 FACT (medium): Current validation lacks error messages
⚠️ GAP (high): No automated testing for config changes

=== OPTIONS ===
1) Basic validation: Add checks only (+ fast, - limited)
2) Comprehensive: Full validation + tests (+ robust, - complex)

=== RECOMMENDATION ===
→ Option 2: Comprehensive validation (Confidence: high)
Reasoning: Long-term maintainability outweighs initial effort

=== PLAN SUMMARY ===
Summary: Implement comprehensive config validation
TODO:
- [ ] Add validation schema
- [ ] Implement unit tests
- [ ] Update error handling

Proceed with recommendation? (Y/n) [R=revise]
```

### Phase 3: Execute ⚡
**Purpose**: Safely execute approved TODO items with full monitoring
**Inputs**: Approved plan from Phase 2
**Outputs**: Execution results, patches, backups, git commits

#### Process:
1. **Sequential Execution**: Process TODO items one by one
2. **Real-time Monitoring**: Show progress with "[x-cli] #1 Reading config.ts …"
3. **Change Detection**: Compare file states before/after each step
4. **Safety Measures**: Create patches, backups, and git commits
5. **Error Handling**: Detect failures and trigger recovery (Phase 4)

#### Safety Features:
- **Patch Generation**: Unified diffs saved to `~/.xcli/patches/`
- **Backup Creation**: Original files saved as `.bak`
- **Git Integration**: Automatic commits with descriptive messages
- **Progress Tracking**: Real-time completion percentages

### Phase 4: Adaptive Recovery 🔄
**Purpose**: Handle execution failures gracefully with recovery planning
**Inputs**: Execution errors, current state, original context
**Outputs**: Recovery plan or continued execution

#### Process:
1. **Error Detection**: Identify test failures, build errors, runtime issues
2. **Context Preservation**: Maintain completed steps and current progress
3. **Recovery Research**: Re-enter research phase with error context
4. **Plan Adjustment**: Generate recovery steps to fix the issue
5. **Seamless Resumption**: Continue execution with recovery steps integrated

#### Error Categories:
- **Test Failures**: Unit test, integration test failures
- **Build Errors**: Compilation, linting, packaging failures
- **Runtime Errors**: Exceptions, crashes during execution
- **Validation Failures**: Schema validation, type checking errors

### Phase 5: Auto-Doc 📝
**Purpose**: Document completion and learn from the experience
**Inputs**: Full execution metadata, results, outcomes
**Outputs**: Documentation files, lesson learning, SOP updates

#### Process:
1. **Completion Documentation**: Generate detailed .agent/tasks/ files
2. **Metadata Collection**: Duration, success rates, file changes, git commits
3. **Lesson Extraction**: Analyze patterns and outcomes for future improvement
4. **SOP Candidates**: Identify repeatable processes worthy of documentation
5. **Knowledge Preservation**: Build institutional memory for future tasks

## Integration Points

### Context Loading (Stage 1)
- **Automatic Discovery**: Scans .agent/ directory on startup
- **Smart Prioritization**: System > SOP > Recent Tasks > Summarized History
- **Token Management**: 280KB budget with intelligent summarization
- **Startup Display**: Shows loaded context statistics

### Tool Execution Infrastructure
- **GrokAgent Integration**: Uses existing AI agent for all phases
- **Tool Compatibility**: Works with all existing X-CLI tools
- **Fallback Mechanisms**: Graceful degradation when tools fail
- **Performance Optimization**: Efficient context passing and caching

### Error Recovery System
- **Pattern Recognition**: Detects common failure modes automatically
- **Context Preservation**: Maintains execution state across recovery attempts
- **Re-entry Points**: Seamless return to research phase with problem context
- **Attempt Limits**: Prevents infinite recovery loops

### Documentation System
- **Auto-Generation**: Creates comprehensive completion records
- **Lesson Learning**: Extracts insights for future improvements
- **SOP Evolution**: Updates standard procedures based on successful patterns
- **Search Integration**: Makes past executions discoverable

## Configuration Options

### CLI Flags
```bash
# Headless mode (CI/CD)
xcli --headless "implement feature"

# Non-interactive fallback
xcli --noninteractive "legacy behavior"

# Custom patch directory
XCLI_PATCH_DIR=/custom/path xcli "task"
```

### Environment Variables
- `XCLI_PATCH_DIR`: Override default patch storage location
- Context budget and summarization settings
- Recovery attempt limits and timeouts

### User Preferences
- Auto-approval settings for trusted operations
- Documentation preferences and formats
- Context loading exclusions and priorities

## Safety & Reliability

### Data Protection
- **Atomic Operations**: Changes are either complete or rolled back
- **Backup Strategy**: Original files preserved as .bak
- **Patch Files**: Unified diffs enable precise reconstruction
- **Git Integration**: All changes committed with proper history

### Error Handling
- **Graceful Degradation**: System continues functioning despite individual failures
- **Recovery Transparency**: Users always understand what happened and why
- **State Preservation**: Progress maintained across interruptions
- **Audit Trail**: Complete record of all decisions and actions

### Performance Considerations
- **Lazy Loading**: Context loaded only when needed
- **Caching**: Previous analyses reused when appropriate
- **Timeout Management**: Prevents runaway operations
- **Resource Limits**: Memory and disk usage bounds enforced

## Implementation Details

### Key Files & Services

#### **Phase 1: Context Loading**
- **Main File**: `src/utils/context-loader.ts`
  - Loads .agent/ system.md, sop.md with prioritization
  - Handles task file summarization when context budget exceeded (280KB)
  - Implements intelligent file selection and content preparation

#### **Phase 2: Research → Recommend**
- **Main Service**: `src/services/research-recommend.ts`
  - Generates structured JSON output (Issues/Options/Recommendation/Plan)
  - Implements Y/n/R approval workflow with revision capability
  - Handles research prompt engineering and response parsing
- **Types**: `src/types/research-recommend.ts`
  - Defines ResearchIssue, ResearchOption, ResearchRecommendation, ResearchPlan interfaces

#### **Phase 3: Execute**
- **Main Service**: `src/services/execution-orchestrator.ts`
  - Orchestrates sequential TODO execution with rich logging
  - Provides diff display, patch generation, and safety features
  - Creates git commits and .bak backups automatically
- **Types**: `src/types/execution.ts`
  - Defines ExecutionStep, ExecutionResult, FileChange interfaces

#### **Phase 4: Adaptive Recovery**
- **Integrated in**: `src/services/execution-orchestrator.ts`
  - Handles execution failures by continuing with remaining steps
  - Provides error context for potential re-planning
  - Maintains execution state across failures

#### **Phase 5: Auto-Doc**
- **Main Service**: `src/services/auto-doc-generator.ts`
  - Generates completion documentation in .agent/tasks/YYYY-MM-DD-slug.md
  - Creates detailed execution summaries with metadata
  - Handles optional SOP updates for learned patterns

#### **Workflow Orchestration**
- **Main Agent**: `src/agent/grok-agent.ts`
  - Coordinates all workflow services and phases
  - Manages the overall Research → Recommend → Execute → Auto-Doc flow
  - Imports ResearchRecommendService and ExecutionOrchestrator

### Architecture Notes
- **Modular Design**: Each phase implemented as independent services
- **Type Safety**: Comprehensive TypeScript interfaces for all data structures
- **Error Handling**: Robust error boundaries and recovery mechanisms
- **Safety First**: All operations create patches and backups by default
- **Operator-in-the-Loop**: Single approval point with full transparency

## Future Extensions

### Advanced Features
- **Parallel Execution**: Multi-step operations running concurrently
- **Dependency Resolution**: Automatic task ordering and prerequisite handling
- **Template System**: Reusable workflow patterns for common tasks
- **Team Collaboration**: Shared context and approval workflows

### Integration Points
- **CI/CD Integration**: Headless mode for automated pipelines
- **IDE Integration**: Workflow triggers from development environments
- **Project Management**: Integration with issue tracking and planning tools
- **Analytics**: Usage patterns and success metrics collection

### Learning & Adaptation
- **Pattern Recognition**: Automatic identification of successful approaches
- **Context Evolution**: Dynamic adjustment of context loading based on project maturity
- **Performance Tuning**: Self-optimization based on execution metrics
- **User Preferences**: Adaptive behavior based on individual usage patterns

---

*This architecture represents a complete rethinking of how AI can assist with complex development workflows while maintaining human control, safety, and knowledge accumulation.*