---
title: Subagents
---

# Subagents

Learn how Grok One-Shot uses specialized subagents for complex multi-step tasks.

## Overview

Subagents are autonomous AI workers that handle complex, multi-step tasks independently. When you request something that requires exploration, planning, or multiple operations, Grok One-Shot can launch a subagent to work autonomously and report back.

## When Subagents Are Used

### Automatic Activation

Subagents launch automatically for:

- **Complex research tasks** - "Find all places we handle user authentication"
- **Multi-file operations** - "Refactor all API endpoints to use async/await"
- **Codebase exploration** - "How does the payment processing system work?"
- **Implementation planning** - "Plan how to add rate limiting to the API"

### Agent Types

**`general-purpose`** - Default agent for most tasks

- Researching complex questions
- Searching for code patterns
- Multi-step implementation tasks
- Has access to all tools (Read, Write, Edit, Glob, Grep, Bash, etc.)

**`Explore`** - Specialized for fast codebase exploration

- Finding files by patterns
- Searching code for keywords
- Understanding code architecture
- Optimized for speed with limited tool set (Glob, Grep, Read, Bash)

## How Subagents Work

### Workflow

```
1. Task Submitted
└─> "Implement user authentication"

2. Main Agent Analyzes
└─> Determines complexity requires subagent

3. Subagent Launched
└─> Autonomous worker created with specific task

4. Subagent Executes
├─> Explores codebase
├─> Reads relevant files
├─> Plans implementation
└─> Generates recommendations

5. Results Returned
└─> Subagent reports findings to main agent

6. Presentation
└─> Main agent presents results to you
```

### Example Session

```
> Find all places in the codebase where we make API calls

Launching exploration subagent...
Subagent is exploring the codebase...

[Subagent works autonomously]

Subagent completed analysis

Found 23 API call locations:
• src/services/api-client.ts (12 calls)
• src/utils/fetch-wrapper.ts (5 calls)
• src/components/DataLoader.tsx (6 calls)

Recommendation: Consolidate into centralized API service
```

## Subagent Capabilities

### Research & Exploration

Subagents can:

- Search entire codebase for patterns
- Analyze file relationships
- Track dependencies
- Find usage examples
- Identify architectural patterns

**Example:**

```
> Explore how error handling works in this project
```

### Planning & Recommendations

Subagents provide:

- Implementation plans
- Pros/cons analysis
- Risk assessment
- Effort estimates
- Alternative approaches

**Example:**

```
> Plan how to add TypeScript to this JavaScript project
```

### Multi-Step Execution

Subagents can:

- Execute complex workflows
- Coordinate multiple file changes
- Run tests and verify results
- Rollback on failures
- Document completion

**Example:**

```
> Migrate all class components to functional components
```

## Configuration

### Thoroughness Levels

When launching subagents manually (advanced), specify thoroughness:

```typescript
// In code or via API
Task({
  subagent_type: "Explore",
  thoroughness: "medium", // "quick", "medium", or "very thorough"
  prompt: "Find all React hooks usage",
});
```

**Levels:**

- `quick` - Fast, surface-level analysis
- `medium` - Balanced depth and speed (default)
- `very thorough` - Comprehensive, multi-location search

### Parallelization

Multiple subagents can run concurrently:

```
> Analyze the frontend architecture, backend API, and database schema
```

This launches 3 subagents in parallel, dramatically speeding up analysis.

## Best Practices

### Effective Subagent Usage

**Good examples:**

```
> Survey the entire codebase for security vulnerabilities

> Find all places where we need to update the API version

> Analyze the test coverage across the project

> Explore how state management is implemented
```

**Less effective:**

```
> What's in main.ts? [Too simple - no subagent needed]

> Fix the bug [Too vague - needs more context]
```

### When to Use Explore vs General-Purpose

**Use `Explore` for:**

- Quick file searches
- Pattern matching
- Code location finding
- Lightweight analysis

**Use `general-purpose` for:**

- Complex research
- Implementation planning
- Multi-file modifications
- Tasks requiring all tools

## Monitoring Subagents

### Progress Indicators

```
Launching subagent: general-purpose
Subagent is researching...
Found 45 relevant files...
Analyzing patterns...
Subagent completed in 12.3s
```

### Token Usage

Subagents consume tokens from your session budget. Monitor with `Ctrl+I`:

```
Token Usage: 15.2k/128k
Main: 3.4k
Subagents: 11.8k
```

## Limitations

### Current Limitations

**Subagents cannot:**

- Interact with you directly (they report to main agent only)
- Launch other subagents (no nesting)
- Access external APIs (unless via MCP)
- Modify their own configuration mid-task

**Technical limits:**

- Maximum task duration: ~10 minutes
- Token budget shared with main session
- Cannot exceed `MAX_TOOL_ROUNDS` environment variable

### Timeouts

If a subagent takes too long:

```
⏱ Subagent timeout after 10 minutes
Partial results available
```

**Solutions:**

- Break task into smaller subtasks
- Increase `MAX_TOOL_ROUNDS` if needed
- Be more specific in your request

## Troubleshooting

### Subagent Not Launching

**Symptoms:** Task executes without subagent

**Causes:**

- Task is simple enough for main agent
- Task doesn't match subagent criteria

**Solution:** Subagents launch automatically when needed. If you want deeper analysis, be more explicit:

```
> Thoroughly explore the entire authentication system
```

### Subagent Stuck

**Symptoms:** Progress indicator doesn't update

**Solutions:**

1. Wait - complex tasks take time
2. Press `Ctrl+C` to interrupt
3. Restart with more specific request

### Incomplete Results

**Symptoms:** Subagent returns partial findings

**Causes:**

- Token limit reached
- Timeout occurred
- Search space too large

**Solutions:**

```
> Focus on just the src/api/ directory

> Break into smaller tasks

> Continue from where the subagent left off
```

## Advanced Usage

### Custom Subagent Prompts

For advanced users, structure requests to guide subagent behavior:

```
> As a subagent task: Explore all database query patterns,
categorize by type (SELECT, INSERT, UPDATE, DELETE),
and identify optimization opportunities.
Be very thorough and check all subdirectories.
```

### Parallel Subagent Workflows

Launch multiple independent analyses:

```
> I need three analyses in parallel:
1. Security review of authentication
2. Performance analysis of API endpoints
3. Test coverage assessment

Launch subagents for each and report back.
```

### Subagent + MCP

Subagents can use MCP tools if configured:

```
> Use the filesystem MCP server to analyze
the project structure across all directories
```

## See Also

- [Troubleshooting](./troubleshooting.md) - Common issues
- [MCP Integration](./mcp.md) - Extend with custom tools
- [Common Workflows](../getting-started/common-workflows.md) - Usage examples
- [Configuration](../configuration/settings.md) - Advanced settings

---

Subagents enable Grok One-Shot to tackle complex, multi-step tasks autonomously while keeping you in control through approval gates and progress visibility.
