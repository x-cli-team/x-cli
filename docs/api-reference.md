# X-CLI Workflow API Reference

## Overview

This document provides technical details about X-CLI's workflow APIs, data structures, and integration points for developers and power users.

## Core Interfaces

### Research Types

#### `ResearchRequest`
```typescript
interface ResearchRequest {
  userTask: string;           // The user's task description
  context?: string;           // Additional context information
  constraints?: string[];     // Task constraints and limitations
  preferences?: string[];     // User preferences and priorities
}
```

#### `ResearchOutput`
```typescript
interface ResearchOutput {
  issues: ResearchIssue[];           // Identified problems and context
  options: ResearchOption[];         // Available approaches
  recommendation: ResearchRecommendation;  // AI's preferred choice
  plan: ResearchPlan;               // Execution plan details
}
```

#### `ResearchIssue`
```typescript
interface ResearchIssue {
  type: 'fact' | 'gap' | 'risk';  // Issue classification
  description: string;           // Detailed description
  severity?: 'low' | 'medium' | 'high';  // Impact severity
  impact?: string;               // Additional impact details
}
```

#### `ResearchOption`
```typescript
interface ResearchOption {
  id: number;                    // Option identifier
  title: string;                 // Short descriptive title
  description: string;           // Detailed explanation
  tradeoffs: {
    pros: string[];             // Advantages of this approach
    cons: string[];             // Disadvantages of this approach
  };
  effort: 'low' | 'medium' | 'high';    // Implementation effort
  risk: 'low' | 'medium' | 'high';      // Associated risk level
}
```

#### `ResearchRecommendation`
```typescript
interface ResearchRecommendation {
  optionId: number;             // ID of recommended option
  reasoning: string;            // Why this option was chosen
  justification: string;        // Detailed justification
  confidence: 'low' | 'medium' | 'high';  // AI confidence level
}
```

#### `ResearchPlan`
```typescript
interface ResearchPlan {
  summary: string;              // Brief plan summary
  approach: string[];           // High-level approach steps
  todo: string[];              // Specific actionable TODO items
  estimatedEffort: string;      // Time estimate (e.g., "2-3 days")
  keyConsiderations: string[];  // Important considerations
}
```

### Execution Types

#### `ExecutionPlan`
```typescript
interface ExecutionPlan {
  steps: ExecutionStep[];       // Individual execution steps
  totalSteps: number;           // Total number of steps
  completedSteps: number;       // Successfully completed steps
  failedSteps: number;          // Failed steps
  startTime: Date;              // Execution start timestamp
  endTime?: Date;               // Execution end timestamp
  gitCommitHash?: string;       // Git commit hash if created
  summary: string;              // Execution summary
}
```

#### `ExecutionStep`
```typescript
interface ExecutionStep {
  id: number;                   // Step sequence number
  description: string;          // Step description
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;             // Step start time
  endTime?: Date;               // Step completion time
  error?: string;               // Error message if failed
  changes?: FileChange[];       // Files changed by this step
  patchFile?: string;           // Path to generated patch file
}
```

#### `FileChange`
```typescript
interface FileChange {
  filePath: string;             // Path to changed file
  changeType: 'created' | 'modified' | 'deleted';
  diff?: string;               // Unified diff content
  backupPath?: string;         // Path to backup file
}
```

#### `ExecutionOptions`
```typescript
interface ExecutionOptions {
  createPatches: boolean;       // Generate patch files
  createBackups: boolean;       // Create .bak backup files
  gitCommit: boolean;           // Create git commits
  timeout: number;              // Step timeout in milliseconds
  maxConcurrentSteps: number;   // Maximum concurrent operations
}
```

### Error Recovery Types

#### `ErrorContext`
```typescript
interface ErrorContext {
  stepId: number;               // Step where error occurred
  errorType: 'test_failure' | 'build_failure' | 'lint_failure' | 'runtime_error' | 'unknown';
  errorMessage: string;         // Error message text
  stackTrace?: string;          // Stack trace if available
  affectedFiles: string[];      // Files related to the error
  contextData: Record<string, any>;  // Additional error context
}
```

#### `RecoveryRequest`
```typescript
interface RecoveryRequest {
  originalRequest: ResearchRequest;  // Original task request
  errorContext: ErrorContext;        // Error details
  executionState: {
    completedSteps: ExecutionStep[]; // Successfully completed steps
    failedStep: ExecutionStep;       // The step that failed
    remainingSteps: ExecutionStep[]; // Steps not yet executed
  };
}
```

#### `RecoveryResult`
```typescript
interface RecoveryResult {
  approved: boolean;            // Whether recovery was approved
  recoveryPlan?: ResearchOutput; // New plan for recovery
  maxRetriesExceeded?: boolean;  // Whether retry limit was reached
}
```

### Context Types

#### `ContextPack`
```typescript
interface ContextPack {
  system: string;               // Concatenated system documentation
  sop: string;                  // Concatenated SOP documentation
  tasks: TaskDoc[];             // Prioritized task documentation
  totalSize: number;            // Total context size in bytes
  warnings: string[];           // Context loading warnings
}
```

#### `TaskDoc`
```typescript
interface TaskDoc {
  filename: string;             // Original filename
  content: string;              // Document content (full or summarized)
  isSummarized: boolean;        // Whether content was summarized
  date: Date;                   // Document date
  size: number;                 // Content size in bytes
}
```

### Approval Types

#### `ApprovalResponse`
```typescript
interface ApprovalResponse {
  approved: boolean;            // Whether plan was approved
  revised?: boolean;            // Whether revision was requested
  revisionNote?: string;        // Revision feedback if provided
}
```

## Service Classes

### `ResearchRecommendService`

Main service for the research and recommendation phases.

#### Constructor
```typescript
constructor(
  agent: GrokAgent,
  config?: Partial<ResearchConfig>
)
```

#### Methods

##### `researchAndRecommend(request, contextPack?)`
Performs research and generates structured output.
```typescript
async researchAndRecommend(
  request: ResearchRequest,
  contextPack?: ContextPack
): Promise<ResearchOutput>
```

##### `renderToConsole(output)`
Displays research output in formatted console output.
```typescript
renderToConsole(output: ResearchOutput): void
```

##### `promptForApproval(output)`
Prompts user for approval with Y/n/R options.
```typescript
async promptForApproval(output: ResearchOutput): Promise<ApprovalResponse>
```

##### `researchAndGetApproval(request, contextPack?, maxRevisions?)`
Complete research → approval workflow with revision support.
```typescript
async researchAndGetApproval(
  request: ResearchRequest,
  contextPack?: ContextPack,
  maxRevisions?: number
): Promise<{ output: ResearchOutput; approval: ApprovalResponse; revisions: number }>
```

##### `researchRecommendExecute(request, contextPack?, maxRevisions?)`
Complete end-to-end workflow: Research → Recommend → Execute → Auto-Doc.
```typescript
async researchRecommendExecute(
  request: ResearchRequest,
  contextPack?: ContextPack,
  maxRevisions?: number
): Promise<{
  output: ResearchOutput;
  approval: ApprovalResponse;
  revisions: number;
  execution?: ExecutionResult;
}>
```

### `ExecutionOrchestrator`

Handles the execution phase with safety guarantees and error recovery.

#### Constructor
```typescript
constructor(
  agent: GrokAgent,
  options?: Partial<ExecutionOptions>
)
```

#### Methods

##### `executePlan(plan)`
Executes a research plan's TODO items.
```typescript
async executePlan(plan: ResearchPlan): Promise<ExecutionResult>
```

##### `executeWithRecovery(plan, researchService, originalRequest)`
Executes with adaptive error recovery.
```typescript
async executeWithRecovery(
  plan: ResearchPlan,
  researchService: ResearchRecommendService,
  originalRequest: ResearchRequest
): Promise<ExecutionResult>
```

### `AutoDocGenerator`

Handles automatic documentation generation and lesson learning.

#### Constructor
```typescript
constructor(options?: Partial<AutoDocOptions>)
```

#### Methods

##### `documentCompletion(metadata)`
Complete auto-documentation workflow.
```typescript
async documentCompletion(metadata: CompletionMetadata): Promise<string>
```

##### `analyzeLessons(metadata)`
Extract lessons learned from execution.
```typescript
analyzeLessons(metadata: CompletionMetadata): string[]
```

##### `detectSOPCandidates(metadata)`
Identify potential SOP updates.
```typescript
detectSOPCandidates(metadata: CompletionMetadata): string[]
```

### `ContextLoader`

Manages intelligent loading of project context.

#### Methods

##### `loadContext(agentDir?)`
Loads context from .agent/ directory.
```typescript
function loadContext(agentDir?: string): ContextPack
```

##### `formatContextStatus(pack)`
Formats context loading status for display.
```typescript
function formatContextStatus(pack: ContextPack): string
```

## Configuration

### CLI Configuration

#### Environment Variables
```bash
# API Configuration
X_API_KEY=your_api_key
GROK_BASE_URL=https://api.x.ai/v1

# Workflow Configuration
XCLI_PATCH_DIR=/custom/patch/directory
XCLI_CONTEXT_BUDGET=500
XCLI_NO_CONTEXT=1

# Execution Configuration
XCLI_MAX_RECOVERY_ATTEMPTS=5
XCLI_EXECUTION_TIMEOUT=600000
```

#### Configuration Files

##### User Configuration (`~/.xcli/config.json`)
```json
{
  "apiKey": "your_api_key",
  "baseURL": "https://api.x.ai/v1",
  "workflow": {
    "autoApproveHighConfidence": false,
    "maxRecoveryAttempts": 3,
    "patchDirectory": "~/.xcli/patches",
    "documentationFormat": "markdown"
  },
  "context": {
    "budgetKB": 280,
    "excludePatterns": ["*.log", "node_modules"],
    "summarizationThreshold": 2000
  },
  "execution": {
    "createBackups": true,
    "gitCommit": true,
    "timeoutMs": 300000
  }
}
```

##### Project Configuration (`.xcli/project.json`)
```json
{
  "workflow": {
    "preferredApproaches": ["test-driven", "incremental"],
    "riskTolerance": "medium",
    "documentationLevel": "detailed"
  },
  "context": {
    "includePatterns": ["src/**/*.ts", "docs/**/*.md"],
    "excludePatterns": ["dist", "*.test.ts"]
  }
}
```

## Integration Examples

### Programmatic Usage

#### Basic Research and Approval
```typescript
import { ResearchRecommendService } from '@xagent/x-cli';
import { GrokAgent } from '@xagent/x-cli';

const agent = new GrokAgent(apiKey);
const researchService = new ResearchRecommendService(agent);

const request = {
  userTask: "implement user authentication",
  constraints: ["must use JWT", "no external services"],
  preferences: ["prefer TypeScript", "include tests"]
};

const { output, approval, revisions } = await researchService.researchAndGetApproval(request);

if (approval.approved) {
  console.log('Plan approved for execution');
} else if (approval.revised) {
  console.log(`Revision requested: ${approval.revisionNote}`);
}
```

#### End-to-End Workflow
```typescript
import { ResearchRecommendService } from '@xagent/x-cli';
import { loadContext } from '@xagent/x-cli';

const agent = new GrokAgent(apiKey);
const researchService = new ResearchRecommendService(agent);
const contextPack = loadContext();

const request = {
  userTask: "refactor database layer",
  context: "Current system uses MongoDB with Mongoose ODM"
};

const result = await researchService.researchRecommendExecute(request, contextPack);

if (result.execution?.success) {
  console.log('Workflow completed successfully');
  console.log(`Documentation saved to: ${result.execution.executionPlan.gitCommitHash}`);
}
```

### CI/CD Integration

#### GitHub Actions Example
```yaml
name: AI-Assisted Development
on: [pull_request]

jobs:
  implement-feature:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install X-CLI
        run: npm install -g @xagent/x-cli
      - name: Implement Feature
        run: xcli --headless "add error handling to user API"
        env:
          X_API_KEY: ${{ secrets.X_API_KEY }}
          XCLI_PATCH_DIR: ./patches
      - name: Commit Changes
        run: |
          git config --global user.name 'X-CLI'
          git config --global user.email 'x-cli@github.com'
          git add .
          git commit -m "feat: add error handling to user API

Auto-generated by X-CLI workflow" || echo "No changes to commit"
```

### Custom Tool Integration

#### Extending with Custom Tools
```typescript
import { GrokAgent, TextEditorTool, BashTool } from '@xagent/x-cli';

// Create agent with custom tools
const agent = new GrokAgent(apiKey, baseURL, model);
agent.addTool(new MyCustomTool());

// Use in workflow
const researchService = new ResearchRecommendService(agent);
const result = await researchService.researchRecommendExecute(request);
```

## Error Handling

### Common Error Types

#### `ResearchError`
Thrown when research phase fails.
```typescript
try {
  const output = await researchService.researchAndRecommend(request);
} catch (error) {
  if (error instanceof ResearchError) {
    console.log('Research failed:', error.message);
  }
}
```

#### `ExecutionError`
Thrown when execution phase fails.
```typescript
try {
  const result = await orchestrator.executePlan(plan);
} catch (error) {
  if (error instanceof ExecutionError) {
    console.log('Execution failed:', error.message);
    console.log('Failed step:', error.stepId);
  }
}
```

#### `RecoveryError`
Thrown when error recovery fails.
```typescript
try {
  const result = await orchestrator.executeWithRecovery(plan, researchService, request);
} catch (error) {
  if (error instanceof RecoveryError) {
    console.log('Recovery failed:', error.message);
    console.log('Recovery attempts:', error.attempts);
  }
}
```

### Error Recovery Patterns

#### Automatic Recovery
```typescript
// Enable automatic recovery
const orchestrator = new ExecutionOrchestrator(agent, {
  maxRecoveryAttempts: 3,
  recoveryEnabled: true
});

const result = await orchestrator.executeWithRecovery(plan, researchService, request);
```

#### Manual Recovery Handling
```typescript
try {
  const result = await orchestrator.executePlan(plan);
} catch (error) {
  if (error.recoverable) {
    // Attempt manual recovery
    const recoveryResult = await orchestrator.handleRecovery(
      originalRequest,
      error.context,
      result.executionPlan,
      researchService
    );

    if (recoveryResult.approved) {
      // Resume execution
      const finalResult = await orchestrator.resumeExecution(
        result.executionPlan,
        recoveryResult.recoveryPlan
      );
    }
  }
}
```

## Performance Optimization

### Context Loading Optimization
```typescript
// Pre-load context for multiple operations
const contextPack = loadContext();

// Reuse context across multiple research operations
const results = await Promise.all([
  researchService.researchAndRecommend(request1, contextPack),
  researchService.researchAndRecommend(request2, contextPack),
  researchService.researchAndRecommend(request3, contextPack)
]);
```

### Execution Optimization
```typescript
// Configure for faster execution
const orchestrator = new ExecutionOrchestrator(agent, {
  createPatches: false,  // Skip patch generation for speed
  createBackups: false, // Skip backups for trusted operations
  timeout: 60000,       // Shorter timeouts
  maxConcurrentSteps: 3  // Allow some parallelism
});
```

### Memory Management
```typescript
// Configure context budget
const contextPack = loadContextWithOptions({
  budgetKB: 100,        // Smaller budget for memory-constrained environments
  excludePatterns: ['*.log', 'node_modules/**/*']
});

// Clean up after execution
researchService.cleanup();
orchestrator.cleanup();
```

## Monitoring and Observability

### Logging Configuration
```typescript
// Enable detailed logging
const researchService = new ResearchRecommendService(agent, {
  logLevel: 'debug',
  logFile: './xcli-workflow.log'
});

const orchestrator = new ExecutionOrchestrator(agent, {
  enableProgressLogging: true,
  logExecutionSteps: true
});
```

### Metrics Collection
```typescript
// Collect workflow metrics
const metrics = {
  researchTime: 0,
  executionTime: 0,
  revisionsCount: 0,
  recoveryAttempts: 0,
  success: false
};

// Track research phase
const researchStart = Date.now();
const { output, approval, revisions } = await researchService.researchAndGetApproval(request);
metrics.researchTime = Date.now() - researchStart;
metrics.revisionsCount = revisions;

// Track execution phase
if (approval.approved) {
  const executionStart = Date.now();
  const result = await orchestrator.executeWithRecovery(output.plan, researchService, request);
  metrics.executionTime = Date.now() - executionStart;
  metrics.success = result.success;
  metrics.recoveryAttempts = result.executionPlan.steps.filter(s =>
    s.description.includes('[RECOVERY]')
  ).length;
}

// Log metrics
console.log('Workflow Metrics:', JSON.stringify(metrics, null, 2));
```

### Health Checks
```typescript
// Verify system readiness
const healthCheck = await researchService.healthCheck();
if (!healthCheck.ready) {
  console.error('System not ready:', healthCheck.errors);
  process.exit(1);
}

// Check context loading
const contextPack = loadContext();
if (contextPack.warnings.length > 0) {
  console.warn('Context loading warnings:', contextPack.warnings);
}
```

---

*This API reference provides comprehensive technical details for integrating with X-CLI's workflow system. For usage examples and best practices, see the User Guide.*