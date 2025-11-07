# Tool System

Built-in tools that enable AI to interact with your development environment.

## Overview

Grok One-Shot's power comes from its comprehensive tool system. Tools allow the AI to read files, execute commands, search code, and modify files - all the actions a developer needs.

## Core Tool Categories

### 1. File Operations

**Read Tool**
- **Purpose:** Read file contents
- **Usage:** AI reads code, configs, documentation
- **Example:**
  ```
  > Explain how authentication works
  [AI uses Read tool on src/auth/middleware.ts]
  ```

**Write Tool**
- **Purpose:** Create new files
- **Usage:** Generate new code, configs, docs
- **Confirmation:** Required (unless disabled)
- **Example:**
  ```
  > Create a new authentication service
  [AI uses Write tool to create src/services/auth-service.ts]
  ```

**Edit Tool**
- **Purpose:** Modify existing files
- **Usage:** Code changes, refactoring, fixes
- **Confirmation:** Required (unless disabled)
- **How it works:** Exact string replacement
- **Example:**
  ```
  > Fix the error handling in user-service.ts
  [AI uses Edit tool to modify specific lines]
  ```

### 2. Code Search

**Glob Tool**
- **Purpose:** Find files by pattern
- **Usage:** Locate files matching glob patterns
- **Fast:** Optimized file system search
- **Example:**
  ```
  > Find all TypeScript test files
  [AI uses Glob with pattern "**/*.test.ts"]
  ```

**Grep Tool**
- **Purpose:** Search file contents
- **Usage:** Find code patterns, function calls, imports
- **Powerful:** Full regex support via ripgrep
- **Example:**
  ```
  > Find all TODO comments
  [AI uses Grep with pattern "TODO"]
  ```

### 3. Command Execution

**Bash Tool**
- **Purpose:** Execute shell commands
- **Usage:** Run builds, tests, git operations
- **Confirmation:** Required (unless disabled)
- **Security:** Runs with your user permissions
- **Example:**
  ```
  > Run the test suite
  [AI uses Bash to execute "npm test"]
  ```

### 4. Advanced Tools

**Task Tool (Subagents)**
- **Purpose:** Spawn autonomous AI workers
- **Usage:** Complex multi-step tasks
- **When:** AI determines task needs deep exploration
- **Example:**
  ```
  > Research the entire authentication flow and suggest improvements
  [AI spawns Explore subagent to autonomously research]
  ```

**WebFetch Tool**
- **Purpose:** Fetch and analyze web pages
- **Usage:** Research documentation, check examples
- **Example:**
  ```
  > Look up the latest Next.js routing docs
  [AI uses WebFetch to fetch and analyze docs]
  ```

**WebSearch Tool**
- **Purpose:** Search the web
- **Usage:** Find current information, libraries, solutions
- **Example:**
  ```
  > Find the most popular React state management libraries in 2025
  [AI uses WebSearch to get current info]
  ```

## Tool Workflow

### Typical AI Tool Usage

**Example session:**
```
User: "Fix the bug in user authentication"

AI thinks: Need to find the auth code

1. Glob("src/**/*auth*.ts")
   → Finds: src/auth/middleware.ts, src/services/auth-service.ts

2. Read(src/auth/middleware.ts)
   → Loads file content

3. Read(src/services/auth-service.ts)
   → Loads related file

4. Analyze code, identify bug

5. Edit(src/auth/middleware.ts)
   → Fixes the bug

6. Responds: "Fixed authentication bug in line 47..."
```

## Tool Coordination

### Multi-Tool Operations

**AI coordinates multiple tools automatically:**

```
User: "Add unit tests for the payment processor"

AI workflow:
1. Glob → Find payment processor files
2. Read → Load implementation
3. Read → Load existing test patterns
4. Write → Create new test file
5. Bash → Run tests
6. Edit → Fix any failures
7. Bash → Run tests again
8. Respond → Summary of tests created
```

**Benefits:**
- ✅ Seamless multi-step operations
- ✅ Error recovery and iteration
- ✅ No manual intervention needed

### Tool Call Limits

**MAX_TOOL_ROUNDS protection:**
```bash
export MAX_TOOL_ROUNDS=400  # Default

# Prevents infinite loops
# Stops runaway tool usage
# Configurable per environment
```

**What happens at limit:**
```
AI: "I've reached the maximum number of tool calls (400).
     Here's what I've completed so far..."
```

## Tool Capabilities

### ✅ Fully Implemented

**File operations:**
- ✅ Read files (any size with pagination)
- ✅ Write new files
- ✅ Edit existing files (exact string replacement)
- ✅ Glob search (fast pattern matching)
- ✅ Grep search (powerful regex via ripgrep)

**Command execution:**
- ✅ Run shell commands
- ✅ Capture stdout/stderr
- ✅ Handle timeouts
- ✅ Background execution
- ✅ Stream output

**Research:**
- ✅ Spawn subagents for exploration
- ✅ Web fetch with content analysis
- ✅ Web search integration

**Session management:**
- ✅ Save conversations
- ✅ Track tool usage
- ✅ Token accounting

### 🚧 Partially Implemented

**Multi-file operations:**
- ✅ Sequential file edits
- ⚠️ No atomic transactions (rollback if one fails)
- ⚠️ No change preview before execution

**Code intelligence:**
- ⚠️ Basic text search (Glob/Grep)
- ⚠️ No AST-based refactoring
- ⚠️ No symbol resolution

**Dependency tracking:**
- ⚠️ AI manually follows imports
- ⚠️ No automatic dependency graph
- ⚠️ No impact analysis

### 🔮 Planned Features

**Advanced file operations:**
- Multi-edit with atomic rollback
- Change preview and approval
- Undo/redo system

**Code intelligence:**
- AST parsing and manipulation
- Symbol resolution and renaming
- Automated refactoring (extract function, inline, etc.)

**Codebase understanding:**
- Automatic dependency graphs
- Impact analysis for changes
- Architecture detection

**Plan mode:**
- Read-only exploration phase
- Plan generation and approval
- Plan-to-execution bridge

## Tool Configuration

### Confirmation System

**Control tool execution:**
```bash
# Enable confirmations (default)
grok toggle-confirmations
# Status: Confirmations enabled

# Disable for automation
grok toggle-confirmations
# Status: Confirmations disabled
```

**Per-tool behavior:**
- **Read, Glob, Grep:** No confirmation (read-only)
- **Write, Edit:** Confirmation required (unless disabled)
- **Bash:** Confirmation required (unless disabled)
- **Task:** No confirmation (spawns autonomous agent)

**Example with confirmations:**
```
AI: I'll edit src/auth/middleware.ts to fix the bug.

Approve this action? [y/n/v (view)]
y → Proceed
n → Cancel
v → View details before deciding
```

### Tool Timeouts

**Prevent hanging operations:**
```bash
# Bash tool timeout (default: 2 minutes)
# Can be extended for long operations
```

**Background execution:**
```typescript
// AI can run commands in background
Bash({
  command: "npm run build",
  run_in_background: true
});
// AI continues while build runs
```

### Tool Permissions

**Security model:**
- Tools run with **your user permissions**
- No privilege escalation
- Same access as running commands yourself

**File access:**
- Can access files you can access
- Respects file system permissions
- No special filesystem access

**Command execution:**
- Runs in your shell environment
- Has your PATH and environment variables
- Same capabilities as your terminal

## Best Practices

### Effective Tool Usage

**DO:**
- ✅ Let AI choose appropriate tools
- ✅ Trust AI's tool coordination
- ✅ Review confirmations before approving
- ✅ Monitor for unexpected tool usage

**DON'T:**
- ❌ Micro-manage tool selection
- ❌ Approve without reading (when confirmations enabled)
- ❌ Disable confirmations unless you trust the task
- ❌ Run with elevated privileges unnecessarily

### Error Handling

**AI handles tool errors:**
```
User: "Fix the bug in auth.ts"

AI:
1. Edit(auth.ts) → Error: File not found
2. Glob("**/*auth*.ts") → Find correct file
3. Read(src/auth/middleware.ts) → Success
4. Edit(src/auth/middleware.ts) → Success

Response: "Found the file at src/auth/middleware.ts and fixed the bug."
```

**Benefits:**
- ✅ Automatic error recovery
- ✅ Adapts to environment
- ✅ Continues despite failures

## Tool Examples

### Example 1: Code Search and Analysis

```
User: "Find all places where we connect to the database"

AI workflow:
1. Grep(pattern="database.*connect", output_mode="files_with_matches")
   → Results: 5 files

2. For each file:
   Read(file)
   → Analyze connection code

3. Respond:
   "Database connections found in:
    - src/db/connection.ts (main connection pool)
    - src/services/user-service.ts (direct query)
    - tests/integration/db-test.ts (test connection)
    - scripts/migrate.ts (migration connection)
    - scripts/seed.ts (seeding connection)

    Recommendation: Consolidate to use connection pool from connection.ts"
```

### Example 2: Multi-File Refactoring

```
User: "Rename getUserById to findUserById across the codebase"

AI workflow:
1. Grep(pattern="getUserById")
   → Found in 8 files

2. For each file:
   Read(file)
   Edit(file, old_string="getUserById", new_string="findUserById")

3. Grep(pattern="getUserById")
   → Verify no remaining occurrences

4. Respond:
   "Renamed getUserById to findUserById in 8 files:
    - src/services/user-service.ts (definition)
    - src/api/user-routes.ts (3 usages)
    - src/middleware/auth.ts (1 usage)
    - tests/user-service.test.ts (12 usages)
    - ... (4 more files)

    All references updated successfully."
```

### Example 3: Research and Implementation

```
User: "Research how to implement rate limiting and add it to our API"

AI workflow:
1. Task(subagent_type="general-purpose")
   → Spawns research agent

   Subagent:
   - WebSearch("API rate limiting best practices 2025")
   - WebFetch("https://example.com/rate-limiting-guide")
   - Analyzes approaches
   - Returns recommendation

2. Main agent receives research
3. Read(src/api/server.ts)
4. Write(src/middleware/rate-limiter.ts)
   → New rate limiting middleware

5. Edit(src/api/server.ts)
   → Integrate middleware

6. Write(tests/rate-limiter.test.ts)
   → Add tests

7. Bash("npm test")
   → Verify tests pass

8. Respond:
   "Implemented rate limiting middleware using token bucket algorithm.
    - 100 requests per minute per IP
    - Configurable limits via environment
    - Tests passing ✅
    - Ready to deploy"
```

## Troubleshooting

### Tool Failures

**Symptoms:** AI says "Tool call failed"

**Common causes:**
- File doesn't exist (Read/Edit)
- Permission denied (Write/Edit/Bash)
- Syntax error (Edit with invalid old_string)
- Timeout (Bash for long operations)

**AI recovery:**
- Tries alternative approach
- Reports error to user
- Suggests manual action if necessary

### Unexpected Behavior

**Symptoms:** AI uses tools unexpectedly

**Possible causes:**
- Ambiguous prompt
- AI misunderstood intent
- Overly broad request

**Solutions:**
```
✅ Be more specific
✅ Use confirmations to catch unexpected actions
✅ Review AI's plan before execution
```

### Rate Limiting

**Symptoms:** "Too many tool rounds"

**Cause:** Hit MAX_TOOL_ROUNDS limit

**Solutions:**
```bash
# Increase limit
export MAX_TOOL_ROUNDS=500

# Or break task into smaller pieces
```

## See Also

- [Subagents](../build-with-claude-code/subagents.md) - Autonomous agents
- [MCP Integration](../build-with-claude-code/mcp.md) - Extended tools
- [Interactive Mode](../reference/interactive-mode.md) - Using tools in sessions
- [Common Workflows](../getting-started/common-workflows.md) - Real-world examples

---

**Status:** ✅ Core tools implemented, 🚧 Advanced features in development, 🔮 Future enhancements planned

The tool system is the foundation of Grok One-Shot's AI-powered development capabilities.
