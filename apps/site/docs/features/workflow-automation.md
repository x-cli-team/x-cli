---
title: Workflow Automation
---

# Workflow Automation

Automate repetitive development tasks with Grok One-Shot.

## Overview

Grok One-Shot excels at automating common development workflows, from code generation to testing to documentation. This guide covers patterns, techniques, and best practices for workflow automation.

## Automation Patterns

### 1. Headless Automation

**Single-shot queries:**

```bash
# No interaction needed
x-cli -p "list all TODO comments in the codebase"
x-cli -p "find functions without JSDoc comments"
x-cli -p "check for console.log statements"
```

**Benefits:**

- Fast execution
- No session overhead
- Scriptable
- CI/CD friendly

**Use cases:**

- Code quality checks
- Quick searches
- Status reports
- Simple transformations

### 2. Script-Based Automation

**Shell scripts:**

```bash
#!/bin/bash
# daily-checks.sh

echo "=== Security Scan ==="
x-cli -p "scan for potential security vulnerabilities"

echo "=== Code Quality ==="
x-cli -p "find code quality issues"

echo "=== Test Coverage ==="
x-cli -p "identify untested code paths"

echo "=== Documentation ==="
x-cli -p "find public functions without docs"
```

**Usage:**

```bash
chmod +x daily-checks.sh
./daily-checks.sh > daily-report.txt
```

### 3. CI/CD Integration

**GitHub Actions example:**

```yaml
name: AI Code Review

on: [pull_request]

jobs:
ai-review:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v3

- name: Install Grok One-Shot
run: npm install -g @xagent/one-shot

- name: AI Code Review
env:
GROK_API_KEY: ${{ secrets.GROK_API_KEY }}
run: |
x-cli -p "Review this PR for:
- Security vulnerabilities
- Code quality issues
- Performance concerns
- Missing tests" > review.txt

- name: Post Review
uses: actions/github-script@v6
with:
script: |
const fs = require('fs');
const review = fs.readFileSync('review.txt', 'utf8');
github.rest.issues.createComment({
issue_number: context.issue.number,
owner: context.repo.owner,
repo: context.repo.repo,
body: '## AI Code Review\n\n' + review
});
```

### 4. Git Hooks

**Pre-commit checks:**

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running AI pre-commit checks..."

# Check for console.log
if x-cli -p "check if staged files contain console.log" | grep -q "Found:"; then
echo " console.log statements found"
exit 1
fi

# Check for TODO without issue reference
if x-cli -p "check if staged files have TODO without issue numbers" | grep -q "Found:"; then
echo " TODO without issue reference found"
# Warning only, don't block
fi

echo " Pre-commit checks passed"
```

**Pre-push validation:**

```bash
#!/bin/bash
# .git/hooks/pre-push

echo "Running tests before push..."
x-cli -p "run tests and report results"

if [ $? -ne 0 ]; then
echo " Tests failed, push aborted"
exit 1
fi

echo " Tests passed, pushing..."
```

## Workflow Templates

### Template 1: Code Generation

**Generate boilerplate:**

```bash
# Interactive
x-cli

> Generate CRUD API for 'products' resource:
- Database model (Prisma)
- API routes (Express)
- Controllers with validation
- Unit tests
- Integration tests
- OpenAPI documentation

[AI generates complete feature]
```

**Headless:**

```bash
x-cli -p "Generate REST API endpoint for user registration with validation, error handling, and tests"
```

### Template 2: Refactoring

**Systematic refactoring:**

```bash
x-cli

> Refactor [COMPONENT]:
From: callback-based async
To: async/await
Files: src/services/*.js
Maintain: backward compatibility
Ensure: all tests pass
Add: error handling

[AI performs coordinated refactoring]
```

### Template 3: Documentation Generation

**Generate docs:**

```bash
x-cli -p "Generate comprehensive API documentation for all endpoints in src/api/"

x-cli -p "Add JSDoc comments to all public functions in src/services/"

x-cli -p "Create README.md with installation, usage, and examples"
```

### Template 4: Testing

**Generate tests:**

```bash
x-cli

> Generate comprehensive test suite for src/services/payment-processor.ts:
- Unit tests for each method
- Edge cases (null, undefined, malformed)
- Error scenarios
- Mock external dependencies (Stripe API)
- Integration tests
- Achieve >90% coverage

[AI generates complete test suite]
```

### Template 5: Code Quality

**Quality enforcement:**

```bash
#!/bin/bash
# enforce-quality.sh

# Find and fix linting issues
x-cli -p "run eslint and fix auto-fixable issues"

# Remove unused imports
x-cli -p "remove unused imports from all TypeScript files"

# Standardize formatting
x-cli -p "run prettier on all source files"

# Generate quality report
x-cli -p "analyze code quality and generate report"
```

## Automation Workflows

### Implemented

**Headless execution:**

- Single-shot queries via `-p` flag
- Non-interactive mode
- Scriptable commands

**Multi-tool coordination:**

- AI chains tools automatically
- Error recovery
- Context awareness

**File operations:**

- Batch file reading
- Multi-file editing
- Pattern-based operations

**Command execution:**

- Run tests
- Run builds
- Run linters
- Git operations

### Partially Implemented

**Workflow composition:**

- Manual chaining of commands
- No built-in workflow DSL
- No workflow templates

**State management:**

- No workflow state persistence
- No checkpoint/resume
- No rollback on failure

**Scheduling:**

- External cron/scheduler needed
- No built-in scheduling
- No recurring workflows

### Planned Features

**Workflow DSL:**

```yaml
# .x-cli/workflows/code-review.yml
name: Code Review Workflow
trigger: pr_opened
steps:
- name: Security Scan
command: scan for security issues
- name: Quality Check
command: check code quality
- name: Test Coverage
command: verify test coverage >80%
- name: Post Results
command: comment on PR
```

**Workflow templates:**

```bash
x-cli workflow run code-review
x-cli workflow run deploy-to-staging
x-cli workflow list
```

**Advanced automation:**

- Conditional execution
- Parallel steps
- Error handling and retry
- Notifications on completion

## Real-World Automation Examples

### Example 1: Daily Code Quality Report

```bash
#!/bin/bash
# daily-quality-report.sh

DATE=$(date +%Y-%m-%d)
REPORT="reports/quality-$DATE.md"

mkdir -p reports

{
echo "# Code Quality Report - $DATE"
echo ""

echo "## Security"
x-cli -p "scan for security vulnerabilities"
echo ""

echo "## Code Quality"
x-cli -p "analyze code quality and list top issues"
echo ""

echo "## Test Coverage"
x-cli -p "analyze test coverage and identify gaps"
echo ""

echo "## Technical Debt"
x-cli -p "find TODO, FIXME, and HACK comments"
echo ""

echo "## Performance"
x-cli -p "identify potential performance issues"
} > "$REPORT"

echo "Report generated: $REPORT"

# Email report (optional)
# mail -s "Daily Code Quality Report" team@example.com < "$REPORT"
```

**Schedule with cron:**

```bash
# Run daily at 9 AM
0 9 * * * cd /path/to/project && ./daily-quality-report.sh
```

### Example 2: PR Preparation

```bash
#!/bin/bash
# prepare-pr.sh

echo "Preparing pull request..."

# 1. Run tests
echo "Running tests..."
x-cli -p "run test suite and report results"

if [ $? -ne 0 ]; then
echo " Tests failed"
exit 1
fi

# 2. Check code quality
echo "Checking code quality..."
x-cli -p "lint code and fix auto-fixable issues"

# 3. Update documentation
echo "Checking documentation..."
x-cli -p "ensure all public APIs are documented"

# 4. Generate changelog entry
echo "Generating changelog..."
x-cli -p "analyze recent commits and draft changelog entry" > changelog-draft.md

# 5. Review changes
echo "Reviewing changes..."
x-cli -p "review uncommitted changes for issues"

echo " PR preparation complete"
echo "Review changelog-draft.md and commit changes"
```

### Example 3: Migration Assistant

```bash
#!/bin/bash
# migrate-to-typescript.sh

echo "Migrating JavaScript files to TypeScript..."

# Get list of JS files
FILES=$(find src -name "*.js" -not -path "*/node_modules/*")

for file in $FILES; do
echo "Migrating $file..."

# Convert to TypeScript
x-cli -p "convert $file to TypeScript with proper types"

# Rename .js to .ts
# (handled by AI or manually)

done

echo "Migration complete, running type check..."
x-cli -p "run tsc --noEmit to check for type errors"
```

### Example 4: Automated Documentation

```bash
#!/bin/bash
# generate-docs.sh

echo "Generating documentation..."

# API documentation
x-cli -p "generate OpenAPI spec from Express routes in src/api/"

# Code documentation
x-cli -p "add JSDoc comments to all public functions in src/"

# User documentation
x-cli -p "generate user guide with examples for main features"

# Developer documentation
x-cli -p "generate CONTRIBUTING.md with setup and workflow instructions"

# Generate site
npm run docs:build

echo " Documentation generated"
```

### Example 5: Release Preparation

```bash
#!/bin/bash
# prepare-release.sh

VERSION=$1

if [ -z "$VERSION" ]; then
echo "Usage: ./prepare-release.sh <version>"
exit 1
fi

echo "Preparing release $VERSION..."

# 1. Update version
x-cli -p "update version to $VERSION in package.json"

# 2. Generate changelog
x-cli -p "generate CHANGELOG.md entry for version $VERSION from git commits"

# 3. Update documentation
x-cli -p "update version references in documentation to $VERSION"

# 4. Run tests
x-cli -p "run full test suite including integration tests"

# 5. Build
x-cli -p "run production build"

# 6. Create git tag
git add .
git commit -m "chore: prepare release $VERSION"
git tag -a "v$VERSION" -m "Release $VERSION"

echo " Release $VERSION prepared"
echo "Review changes, then: git push && git push --tags"
```

## Automation Best Practices

### DO

** Use headless mode for automation:**

```bash
x-cli -p "query" # Not interactive x-cli
```

** Disable confirmations for trusted automation:**

```bash
x-cli toggle-confirmations # Disable
./automation-script.sh
x-cli toggle-confirmations # Re-enable
```

** Use specific prompts:**

```bash
# Good
x-cli -p "find console.log in src/ excluding test files"

# Bad
x-cli -p "check the code"
```

** Capture and log output:**

```bash
x-cli -p "query" > output.txt 2>&1
```

** Handle errors:**

```bash
if ! x-cli -p "run tests"; then
echo "Tests failed"
exit 1
fi
```

### DON'T

** Run in interactive mode from scripts:**

```bash
# Bad
echo "query" | x-cli

# Good
x-cli -p "query"
```

** Leave confirmations disabled globally:**

```bash
# Dangerous - disables safety for manual use too
```

** Ignore exit codes:**

```bash
# Bad
x-cli -p "important task"
# continues even if failed

# Good
x-cli -p "important task" || exit 1
```

** Hardcode sensitive data:**

```bash
# Bad
x-cli -p "deploy with key abc123"

# Good
x-cli -p "deploy with key from $DEPLOY_KEY"
```

## Performance Optimization

### Parallel Execution

**Run independent tasks concurrently:**

```bash
# Sequential (slow)
x-cli -p "task 1"
x-cli -p "task 2"
x-cli -p "task 3"

# Parallel (fast)
x-cli -p "task 1" &
x-cli -p "task 2" &
x-cli -p "task 3" &
wait
```

### Model Selection

**Use fast model for simple tasks:**

```bash
# Fast model for simple queries
GROK_MODEL=grok-4-fast-non-reasoning x-cli -p "find TODO comments"

# Default model for complex tasks
GROK_MODEL=grok-2-1212 x-cli -p "refactor authentication system"
```

### Caching

**Cache expensive operations:**

```bash
# Cache file listing
if [ ! -f .cache/files.txt ]; then
x-cli -p "list all source files" > .cache/files.txt
fi

# Use cache
cat .cache/files.txt
```

## Troubleshooting Automation

### Automation Failures

**Debug failed automation:**

```bash
# Enable debug output
export GROK_DEBUG=true
./automation-script.sh 2>&1 | tee debug.log

# Review logs
less debug.log
```

**Common issues:**

- API rate limits (add delays)
- Timeout on long operations (increase timeout)
- Context limits (use headless mode)
- Network issues (add retry logic)

### Retry Logic

**Add retry for reliability:**

```bash
retry() {
local max_attempts=3
local attempt=1

while [ $attempt -le $max_attempts ]; do
echo "Attempt $attempt of $max_attempts..."

if "$@"; then
return 0
fi

echo "Failed, waiting 5s before retry..."
sleep 5
((attempt++))
done

echo "All attempts failed"
return 1
}

# Usage
retry x-cli -p "run tests"
```

## See Also

- [Common Workflows](../getting-started/common-workflows.md) - Interactive workflows
- [Deployment](../deployment/overview.md) - CI/CD integration
- [CLI Reference](../reference/cli-reference.md) - Command options
- [Tool System](./tool-system.md) - Available tools

---

**Status:** Headless automation implemented, Advanced workflow features in development, Workflow DSL and templates planned

Workflow automation enables reliable, repeatable development processes with AI assistance.
