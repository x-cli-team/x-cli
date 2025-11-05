# Common Workflows

Real-world usage patterns and workflows for getting the most from Grok One-Shot.

## Overview

This guide demonstrates practical workflows that combine Grok One-Shot's capabilities for common development tasks.

## Development Workflows

### 1. Feature Implementation

**Scenario:** Add a new feature with tests and documentation

**Workflow:**
```bash
# 1. Start session
x-cli

# 2. Research phase
> Analyze the current authentication system and identify where to add OAuth support

[AI explores codebase, reads relevant files]

# 3. Implementation
> Implement OAuth authentication with Google provider:
  - Add OAuth client configuration
  - Create OAuth routes and handlers
  - Add user linking logic
  - Update existing auth middleware

[AI creates/modifies multiple files]

# 4. Testing
> Generate unit tests for the new OAuth functionality

[AI creates test files]

# 5. Documentation
> Update the authentication documentation to include OAuth setup instructions

[AI updates docs]

# 6. Review
> Summarize the changes made and list any follow-up tasks

[AI provides summary and TODOs]
```

**Time saved:** 2-4 hours vs manual implementation

### 2. Bug Investigation and Fix

**Scenario:** Track down and fix a production bug

**Workflow:**
```bash
x-cli

# 1. Describe the bug
> Users report intermittent 500 errors on the /api/users endpoint.
  Search for the implementation and identify potential causes.

[AI searches codebase]

# 2. Analyze
> Read the users endpoint handler and trace through the error handling

[AI reads files, follows imports]

# 3. Identify root cause
> Check database query error handling and timeout configuration

[AI identifies uncaught promise rejection]

# 4. Fix
> Add proper error handling for the database query timeout scenario

[AI implements fix]

# 5. Verify
> Show me the before/after diff of the changes

[AI summarizes changes]
```

**Time saved:** 1-2 hours of debugging

### 3. Code Refactoring

**Scenario:** Refactor legacy code to modern standards

**Workflow:**
```bash
x-cli

> Refactor src/legacy/user-manager.js to TypeScript with:
  - Type-safe interfaces
  - Async/await instead of callbacks
  - Error handling with Result types
  - Extract business logic to separate functions

[AI performs coordinated refactoring]

> Run tests to ensure nothing broke
[AI verifies no regressions]

> Update imports in files that use UserManager
[AI updates dependent files]
```

**Time saved:** 3-5 hours of careful refactoring

### 4. Codebase Exploration

**Scenario:** Understand an unfamiliar codebase

**Workflow:**
```bash
x-cli

# 1. High-level overview
> Explain the overall architecture of this application

[AI analyzes structure, provides overview]

# 2. Specific feature
> How does the authentication system work?
  Trace the flow from login request to session creation.

[AI follows the flow, explains components]

# 3. Find patterns
> Find all API endpoints and their authentication requirements

[AI searches and catalogs endpoints]

# 4. Identify issues
> Are there any security concerns or anti-patterns in the auth code?

[AI analyzes and reports concerns]
```

**Time saved:** 4-8 hours of manual exploration

## Code Review Workflows

### 1. Pre-Commit Review

**Workflow:**
```bash
# Before committing
x-cli

> Review my uncommitted changes for:
  - Code quality issues
  - Potential bugs
  - Missing error handling
  - Documentation gaps

[AI analyzes git diff, provides feedback]

> Fix the error handling issue you identified
[AI makes corrections]

> Now show me the final diff
[AI summarizes clean changes]

# Commit with confidence
git add .
git commit -m "feat: add OAuth support"
```

**Time saved:** 30-60 minutes of self-review

### 2. Pull Request Review

**Workflow:**
```bash
x-cli

> Review PR #123 for code quality and potential issues

[AI analyzes PR changes via MCP or manual inspection]

> Check if the new authentication code follows our security best practices

[AI compares against project standards]

> Suggest improvements for the error handling

[AI provides specific recommendations]
```

**Time saved:** 45-90 minutes per PR

## Testing Workflows

### 1. Generate Test Suite

**Workflow:**
```bash
x-cli

> Generate comprehensive unit tests for src/services/payment-processor.ts including:
  - Happy path tests
  - Error scenarios
  - Edge cases (null, undefined, malformed input)
  - Mock external API calls

[AI creates test file]

> Run the tests and fix any failures
[AI iterates on test quality]
```

**Time saved:** 2-3 hours of test writing

### 2. Fix Failing Tests

**Workflow:**
```bash
# After test failures
x-cli

> Tests are failing with error "Expected 200 but got 404".
  Analyze the test file and the implementation to identify the mismatch.

[AI investigates]

> Fix the implementation to match the expected behavior
[AI corrects code]

> Run tests again to verify
[AI confirms success]
```

**Time saved:** 30-60 minutes of debugging

## Documentation Workflows

### 1. Generate Documentation

**Workflow:**
```bash
x-cli

> Generate comprehensive README.md for this project including:
  - Project overview
  - Installation instructions
  - Usage examples
  - API documentation
  - Contributing guidelines

[AI creates documentation]

> Add JSDoc comments to all public functions in src/api/
[AI documents code]
```

**Time saved:** 2-4 hours of writing

### 2. Update Stale Documentation

**Workflow:**
```bash
x-cli

> Compare DOCS.md with actual implementation and update outdated sections

[AI identifies discrepancies]

> Update the API endpoint documentation to match current routes
[AI fixes docs]
```

**Time saved:** 1-2 hours of manual comparison

## Maintenance Workflows

### 1. Dependency Updates

**Workflow:**
```bash
x-cli

> Update all dependencies in package.json to latest stable versions

[AI updates package.json]

> Check for breaking changes in the major updates
[AI reviews changelogs]

> Update code to fix compatibility issues
[AI makes necessary changes]

> Run tests to verify everything works
[AI validates updates]
```

**Time saved:** 2-3 hours of manual updates

### 2. Security Audit

**Workflow:**
```bash
x-cli

> Scan codebase for common security vulnerabilities:
  - SQL injection risks
  - XSS vulnerabilities
  - Authentication bypasses
  - Sensitive data exposure

[AI analyzes code]

> Fix the SQL injection vulnerability in user search
[AI implements parameterized queries]

> Add input validation to all API endpoints
[AI adds validation]
```

**Time saved:** 3-5 hours of security review

## Automation Workflows

### 1. Batch File Operations

**Scenario:** Update file headers across codebase

**Workflow:**
```bash
x-cli

> Add MIT license header to all TypeScript files in src/
  that don't already have one

[AI updates multiple files]

> Update copyright year to 2025 in all files
[AI batch updates]
```

**Time saved:** 1-2 hours of manual editing

### 2. Code Generation

**Scenario:** Generate boilerplate for new feature

**Workflow:**
```bash
x-cli

> Generate CRUD API for 'products' resource:
  - Database schema (Prisma)
  - API routes (Express)
  - Controllers with validation
  - Unit tests
  - Integration tests

[AI generates complete feature scaffold]
```

**Time saved:** 3-4 hours of boilerplate

## Team Collaboration Workflows

### 1. Onboarding Assistance

**Workflow for new team members:**
```bash
x-cli

> I'm new to this codebase. Explain:
  - Overall architecture
  - Key design patterns used
  - How to run locally
  - How to run tests
  - Common development tasks

[AI provides comprehensive onboarding]

> Where should I add validation for user input?
[AI explains validation architecture]
```

**Time saved:** 4-8 hours of ramping up

### 2. Code Style Enforcement

**Workflow:**
```bash
x-cli

> Ensure all files in src/ follow our coding standards:
  - TypeScript strict mode
  - Consistent naming (camelCase for variables)
  - Explicit return types
  - No 'any' types

[AI enforces standards]

> Generate ESLint config that enforces these rules
[AI creates config]
```

**Time saved:** 2-3 hours of manual enforcement

## Research Workflows

### 1. Technology Evaluation

**Workflow:**
```bash
x-cli

> Research if we should migrate from REST to GraphQL:
  - Analyze current API complexity
  - Identify pain points
  - Estimate migration effort
  - Provide recommendation

[AI researches and analyzes]
```

**Time saved:** 4-6 hours of research

### 2. Performance Investigation

**Workflow:**
```bash
x-cli

> Analyze database queries for N+1 problems and suggest optimizations

[AI identifies issues]

> Implement eager loading for user relationships
[AI optimizes queries]

> Compare performance before and after
[AI shows improvements]
```

**Time saved:** 2-4 hours of profiling

## Headless Mode Workflows

### Automation Scripts

**Quick queries without interaction:**

```bash
# Find technical debt markers
x-cli -p "list all files with TODO, FIXME, or HACK comments"

# Check code quality
x-cli -p "find functions longer than 50 lines"

# Security check
x-cli -p "find all places where user input is used in SQL queries"

# Documentation status
x-cli -p "list all exported functions without JSDoc comments"
```

**Chaining for complex automation:**
```bash
#!/bin/bash
# daily-audit.sh

echo "=== Security Scan ==="
x-cli -p "scan for security vulnerabilities"

echo "=== Code Quality ==="
x-cli -p "find code quality issues"

echo "=== Test Coverage ==="
x-cli -p "identify untested code paths"
```

**Time saved:** 1-2 hours per day of manual checks

## CI/CD Integration

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for console.log statements
x-cli -p "check if any staged files contain console.log statements" > /tmp/console-check.txt

if grep -q "Found:" /tmp/console-check.txt; then
  echo "❌ Found console.log statements. Please remove them."
  exit 1
fi

echo "✅ Pre-commit checks passed"
```

### PR Description Generator

```bash
# In CI pipeline
x-cli -p "Generate PR description for these changes: $(git diff main...HEAD)"
```

**Time saved:** 15-30 minutes per PR

## Best Practices

### Session Management

**DO:**
- ✅ Start fresh session for unrelated tasks
- ✅ Use descriptive initial messages
- ✅ Save important session files
- ✅ Review token usage (Ctrl+I)

**DON'T:**
- ❌ Cram multiple unrelated tasks in one session
- ❌ Let sessions grow to 100k+ tokens unnecessarily
- ❌ Forget to review changes before approving

### Prompt Engineering

**Effective prompts:**
```
✅ "Refactor UserService to use dependency injection and add error handling"
✅ "Generate integration tests for the payment flow with mock Stripe API"
✅ "Analyze authentication flow and identify security vulnerabilities"
```

**Ineffective prompts:**
```
❌ "Fix the code"
❌ "Make it better"
❌ "Check everything"
```

**Tips:**
- Be specific about what you want
- Mention file/function names when known
- Specify desired patterns or approaches
- Include acceptance criteria

### Confirmation Management

**When to use confirmations:**
- ✅ Multi-file refactoring
- ✅ Destructive operations
- ✅ Production codebases
- ✅ Learning the tool

**When to disable:**
```bash
# For trusted automation
x-cli toggle-confirmations  # Disable

# Run automation
x-cli -p "update all file headers"

# Re-enable for manual work
x-cli toggle-confirmations  # Enable
```

## Workflow Templates

### Template: New Feature

```bash
x-cli
> Implement [FEATURE NAME]:
  1. Research current implementation of related features
  2. Design the solution following existing patterns
  3. Implement with error handling and validation
  4. Generate unit tests
  5. Update documentation
  6. Summarize changes and next steps
```

### Template: Bug Fix

```bash
x-cli
> Fix bug: [BUG DESCRIPTION]
  1. Locate the relevant code
  2. Identify root cause
  3. Implement fix with tests
  4. Verify no regressions
  5. Document the fix
```

### Template: Refactor

```bash
x-cli
> Refactor [COMPONENT]:
  From: [CURRENT STATE]
  To: [DESIRED STATE]
  While: Maintaining backward compatibility
  And: Ensuring all tests pass
```

## See Also

- [Quickstart Guide](./quickstart.md) - Getting started
- [Interactive Mode](../reference/interactive-mode.md) - Session features
- [CLI Reference](../reference/cli-reference.md) - Command options
- [Troubleshooting](../build-with-claude-code/troubleshooting.md) - Common issues

---

Master these workflows to maximize productivity and code quality with Grok One-Shot.
