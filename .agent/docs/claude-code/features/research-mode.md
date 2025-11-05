# Research Mode

Deep codebase exploration and analysis capabilities.

## Overview

Research mode enables Grok One-Shot to autonomously explore codebases, analyze architectures, and provide comprehensive insights. It leverages subagents for deep, systematic investigation.

## What is Research Mode?

### Automatic Activation

**AI determines when research is needed:**
```
User: "How does the authentication system work across the entire application?"

AI thinks: This requires exploring multiple files and tracing flows.
→ Activates research via Explore subagent
```

**Indicators that trigger research mode:**
- Questions about "overall architecture"
- Requests to "find all occurrences" of something
- "How does X work?" when X spans multiple files
- "Analyze the system" type requests
- Complex codebase queries

### vs. Simple Queries

**Simple query (no subagent needed):**
```
User: "Read src/auth/middleware.ts and explain it"

AI:
1. Read file
2. Analyze
3. Respond
```

**Complex research (subagent activated):**
```
User: "Analyze the entire authentication flow from login to session management"

AI:
1. Spawns Explore subagent
2. Subagent autonomously:
   - Searches for auth-related files
   - Reads relevant code
   - Traces execution flows
   - Identifies patterns
   - Documents findings
3. Returns comprehensive analysis
```

## Research Capabilities

### ✅ Implemented

**Autonomous exploration:**
- ✅ Explore subagent for codebase research
- ✅ Automatic file discovery
- ✅ Pattern matching and search
- ✅ Multi-file analysis

**Analysis types:**
- ✅ Architecture overview
- ✅ Feature tracing
- ✅ Dependency analysis
- ✅ Pattern identification

**Tool usage:**
- ✅ Glob for file discovery
- ✅ Grep for content search
- ✅ Read for file analysis
- ✅ WebFetch for external docs

### 🚧 Partially Implemented

**Structured output:**
- ✅ Comprehensive analysis
- ⚠️ No standardized report format
- ⚠️ No visual diagrams
- ⚠️ No export formats

**Codebase understanding:**
- ✅ Manual dependency tracing
- ⚠️ No automatic dependency graph
- ⚠️ No AST-based analysis
- ⚠️ No symbol resolution

### 🔮 Planned Features

**Advanced analysis:**
- AST parsing for precise code understanding
- Dependency graph generation
- Architecture diagram creation
- Metrics and statistics

**Plan mode:**
- Dedicated read-only research phase
- Plan approval before execution
- Visual plan representation
- Plan modification

**Report generation:**
- Structured markdown reports
- Architecture diagrams
- Code flow visualizations
- Exportable formats

## Research Workflows

### Example 1: Architecture Analysis

**User request:**
```
> Explain the overall architecture of this application
```

**AI workflow:**
```
1. Spawns Explore subagent
2. Subagent explores:
   - Project structure (tree view)
   - Package.json dependencies
   - Entry points (index.ts, server.ts)
   - Core modules and services
   - Configuration files
   - Documentation

3. Analyzes patterns:
   - Module organization
   - Architectural style (MVC, microservices, etc.)
   - Communication patterns
   - Data flow

4. Generates overview
```

**Output example:**
```
Architecture Overview:

1. Structure: Layered architecture with separation of concerns
   - Presentation: src/ui/ (React/Ink components)
   - Business Logic: src/services/
   - Data Access: src/agent/
   - Utilities: src/utils/

2. Key Components:
   - GrokAgent: Core AI agent with streaming support
   - Chat Interface: Terminal UI using React/Ink
   - MCP Integration: Extensibility via Model Context Protocol
   - Tool System: Read, Write, Edit, Bash, Glob, Grep tools

3. Communication:
   - UI ← EventEmitter → Agent
   - Agent ← HTTPS → X.AI API
   - Agent ← stdin/stdout → MCP Servers

4. State Management:
   - Session state in ~/.x-cli/sessions/
   - Configuration in ~/.x-cli/settings.json
   - No persistent database

5. Dependencies:
   - Main: @anthropic-ai/sdk, ink, react
   - Build: typescript, tsup, bun
   - Testing: (to be added)
```

### Example 2: Feature Investigation

**User request:**
```
> How does the authentication middleware work? Trace the entire flow.
```

**AI workflow:**
```
1. Spawns Explore subagent
2. Subagent investigates:
   - Find auth middleware: Glob("**/*auth*middleware*")
   - Read middleware file
   - Find usages: Grep("import.*auth.*middleware")
   - Trace dependencies
   - Identify authentication logic

3. Builds flow diagram
4. Documents findings
```

**Output example:**
```
Authentication Flow:

1. Request Entry:
   src/api/server.ts:45
   app.use('/api', authMiddleware, apiRoutes)

2. Middleware Execution:
   src/middleware/auth-middleware.ts:23
   - Extract token from Authorization header
   - Verify token using JWT library
   - Check token expiration
   - Attach user to request: req.user = decoded

3. Error Handling:
   - Missing token → 401 Unauthorized
   - Invalid token → 401 Unauthorized
   - Expired token → 401 Unauthorized
   - Valid token → Continue to route handler

4. Route Handler:
   src/api/user-routes.ts:67
   - Access authenticated user: req.user
   - Perform authorized action
   - Return response

Dependencies:
- jsonwebtoken: Token verification
- bcrypt: Password hashing (in auth service)

Security Considerations:
✅ Token expiration checked
✅ HTTPS enforced
⚠️ No refresh token mechanism
⚠️ No rate limiting on auth endpoints
```

### Example 3: Dependency Analysis

**User request:**
```
> Find all places that depend on the user service and analyze potential impact of changes
```

**AI workflow:**
```
1. Spawns Explore subagent
2. Subagent searches:
   - Find user service: Glob("**/user-service*")
   - Find imports: Grep("import.*user.*service")
   - Read dependent files
   - Analyze usage patterns

3. Impact analysis:
   - Direct dependencies
   - Transitive dependencies
   - Potential breaking changes
```

**Output example:**
```
User Service Dependencies:

Direct Dependencies (7 files):
1. src/api/user-routes.ts
   - Uses: getUserById, createUser, updateUser
   - Impact: High (API endpoints)

2. src/middleware/auth-middleware.ts
   - Uses: getUserById
   - Impact: Critical (authentication)

3. src/services/order-service.ts
   - Uses: getUserById
   - Impact: Medium (order processing)

[... 4 more files]

Transitive Dependencies (12 files):
- Files that depend on the above 7 files
- Lower impact, changes may propagate

Recommended Changes:
1. If modifying getUserById signature:
   → Update 5 direct call sites
   → Test authentication flow
   → Test order processing

2. If deprecating methods:
   → Provide migration path
   → Update 7 dependent files

3. Mitigation:
   → Add integration tests
   → Use TypeScript for type safety
   → Document breaking changes
```

### Example 4: Security Audit

**User request:**
```
> Perform a security audit of the codebase
```

**AI workflow:**
```
1. Spawns Explore subagent (or general-purpose)
2. Subagent analyzes:
   - Authentication/authorization
   - Input validation
   - SQL injection risks
   - XSS vulnerabilities
   - Secrets management
   - Dependency vulnerabilities

3. Generates security report
```

**Output example:**
```
Security Audit Report:

High Priority Issues:
❌ SQL Injection Risk
   - File: src/services/user-service.ts:142
   - Issue: String concatenation in SQL query
   - Recommendation: Use parameterized queries

❌ Missing Input Validation
   - File: src/api/user-routes.ts:89
   - Issue: User input not validated
   - Recommendation: Add validation middleware

Medium Priority:
⚠️ No Rate Limiting
   - Endpoints vulnerable to brute force
   - Recommendation: Add rate limiting middleware

⚠️ Secrets in Environment Variables
   - API keys in .env file (not gitignored)
   - Recommendation: Use secrets manager

Low Priority:
⚡ Outdated Dependencies
   - 3 dependencies with known CVEs
   - Recommendation: Update dependencies

Good Practices Found:
✅ HTTPS enforced
✅ Password hashing with bcrypt
✅ JWT token expiration
✅ CORS configured

Action Items:
1. Fix SQL injection (High)
2. Add input validation (High)
3. Implement rate limiting (Medium)
4. Migrate secrets management (Medium)
5. Update dependencies (Low)
```

## Research Best Practices

### Effective Research Prompts

**DO:**
```
✅ "Analyze the entire authentication system and document the flow"
✅ "Find all database queries and check for SQL injection risks"
✅ "Explain the architecture of the payment processing module"
✅ "Trace how user data flows from API to database"
```

**DON'T:**
```
❌ "Look at everything"
❌ "Check the code"
❌ "Find stuff"
```

### Managing Research Scope

**Focused research:**
```
> Analyze authentication in src/auth/ directory only

[Limits scope, faster results]
```

**Broad research:**
```
> Analyze how authentication integrates across the entire application

[Wider scope, more comprehensive, takes longer]
```

### Iterative Research

**Progressive refinement:**
```
Step 1: "Give me an overview of the authentication system"
[AI provides high-level summary]

Step 2: "Explain the token verification process in detail"
[AI deep-dives into specific component]

Step 3: "Are there security issues in the token verification?"
[AI focuses on security analysis]
```

**Benefits:**
- ✅ Build understanding progressively
- ✅ Control depth of analysis
- ✅ Manage context usage

## Research Limitations

### Current Limitations

**No plan mode yet:**
- ⚠️ Research executes immediately
- ⚠️ No read-only exploration phase
- ⚠️ No plan approval step

**Limited visualization:**
- ⚠️ Text-only output
- ⚠️ No diagrams or graphs
- ⚠️ No interactive exploration

**Manual dependency tracking:**
- ⚠️ AI manually follows imports
- ⚠️ No automatic dependency graph
- ⚠️ No impact analysis tool

**Context limits:**
- ⚠️ Large codebases may hit token limits
- ⚠️ Deep exploration accumulates context
- ⚠️ May need multiple sessions

### Workarounds

**For large codebases:**
```
# Break into multiple research sessions
Session 1: "Analyze frontend architecture"
Session 2: "Analyze backend architecture"
Session 3: "Analyze database layer"
```

**For deep exploration:**
```
# Use headless mode for specific queries
x-cli -p "list all authentication-related files"
x-cli -p "analyze src/auth/middleware.ts specifically"
```

## Advanced Research Techniques

### Research with Web Access

**Leverage WebFetch and WebSearch:**
```
> Research best practices for implementing OAuth 2.0 and check if our implementation follows them

AI:
1. WebSearch("OAuth 2.0 best practices 2025")
2. WebFetch(relevant documentation URLs)
3. Analyze codebase implementation
4. Compare against best practices
5. Provide recommendations
```

### Multi-Phase Research

**Complex investigations:**
```
Phase 1: Discovery
> What are all the API endpoints and their authentication requirements?

Phase 2: Analysis
> For each endpoint, analyze the security implementation

Phase 3: Recommendations
> Suggest improvements based on industry best practices
```

### Research Documentation

**Generate research reports:**
```
> Research the payment processing system and create a comprehensive markdown report

AI generates:
- Architecture overview
- Component diagram (textual)
- Data flow description
- Security analysis
- Recommendations
- Action items

Saved as: docs/research/payment-system-analysis.md
```

## Troubleshooting Research

### Research Takes Too Long

**Causes:**
- Scope too broad
- Too many files to analyze
- Deep nested dependencies

**Solutions:**
```
# Limit scope
> Analyze authentication in src/auth/ only (not entire codebase)

# Or use faster model
GROK_MODEL=grok-4-fast-non-reasoning x-cli

# Or break into smaller queries
```

### Incomplete Research

**Causes:**
- Hit token limit
- Hit tool round limit
- Network timeout

**Solutions:**
```
# Increase limits
export MAX_TOOL_ROUNDS=500

# Or continue research
> Continue analysis from where you stopped

# Or break into phases
```

### Context Overload

**Symptoms:** Research session grows to 80k+ tokens

**Solution:**
```
# Start new session with summary
> Summarize findings so far
[Copy summary]

/exit
x-cli

> Continuing from previous research:
  [Paste summary]
  Now analyze [next phase]
```

## See Also

- [Subagents](../build-with-claude-code/subagents.md) - Explore agent details
- [Tool System](./tool-system.md) - Research tools
- [Context Management](./context-management.md) - Managing research context
- [Common Workflows](../getting-started/common-workflows.md) - Research examples

---

**Status:** ✅ Core research via Explore subagent implemented, 🚧 Structured output and visualization in development, 🔮 Plan mode and advanced analysis planned

Research mode enables deep codebase understanding and comprehensive analysis with autonomous AI exploration.
