# X-CLI Workflow User Guide

## Introduction

X-CLI's "Research → Recommend → Execute → Auto-Doc" workflow transforms complex development tasks into safe, structured experiences. This guide explains how to use the workflow effectively.

## Quick Start

### Basic Usage

```bash
# Interactive workflow (recommended)
xcli "implement user authentication system"

# Headless mode for CI/CD
xcli --headless "add logging to API endpoints"

# Non-interactive fallback
xcli --noninteractive "old chat behavior"
```

## Workflow Phases

### Phase 1: Research 🤔

When you enter a task, X-CLI automatically:

1. **Loads Context**: Reads your `.agent/` documentation
2. **Analyzes Task**: Considers constraints, preferences, and project patterns
3. **Generates Analysis**: Creates structured Issues/Options/Recommendation/Plan

**What you see:**
```
🤖 Starting X CLI Conversational Assistant...
[x-cli] Context: loaded system docs, sop docs, 24 task docs (~280 KB)

🔍 Researching and analyzing...
```

### Phase 2: Recommend 💡

X-CLI presents a decision framework:

**Issues Section**: Facts, gaps, and risks identified
**Options Section**: 2-3 approaches with trade-offs
**Recommendation**: AI's preferred option with reasoning
**Plan Section**: Step-by-step execution plan

**Example Output:**
```
=== ISSUES ===
📊 FACT (medium): Current auth uses basic password checks
⚠️ GAP (high): No multi-factor authentication support
🚨 RISK (high): Password reset flow vulnerable to timing attacks

=== OPTIONS ===
1) Basic JWT: Add token-based auth (+ fast, - limited security)
2) Comprehensive OAuth: Full OAuth2 + MFA (+ secure, - complex)
3) Hybrid Approach: JWT with optional MFA (+ balanced, - custom implementation)

=== RECOMMENDATION ===
→ Option 2: Comprehensive OAuth (Confidence: high)
Reasoning: Security requirements outweigh implementation complexity

=== PLAN SUMMARY ===
Summary: Implement OAuth2 authentication with MFA support
Estimated Effort: 2-3 days

Approach:
1. Set up OAuth2 provider integration
2. Implement MFA flow
3. Add user session management
4. Update frontend authentication

TODO:
- [ ] Configure OAuth2 provider
- [ ] Implement MFA verification
- [ ] Add session management
- [ ] Update UI components

Proceed with recommendation? (Y/n) [R=revise]
```

### Decision Options

- **Y/Yes**: Approve and proceed to execution
- **N/No**: Reject the plan (workflow ends)
- **R/Revise**: Request changes to the plan

### Revision Process

If you choose "R", you can provide a brief correction:

```
Revision note (brief description of changes needed): focus on JWT only, skip MFA for now
```

X-CLI will re-analyze with your feedback and present an updated recommendation.

### Phase 3: Execute ⚡

Once approved, execution begins automatically:

**Progress Tracking:**
```
🚀 Starting execution of 4 tasks...

[x-cli] #1 Configuring OAuth2 provider...
✅ [x-cli] #1 Completed

[x-cli] #2 Implementing MFA verification...
✅ [x-cli] #2 Completed

[x-cli] #3 Adding session management...
✅ [x-cli] #3 Completed

[x-cli] #4 Updating UI components...
✅ [x-cli] #4 Completed

✅ Execution completed: 4/4 steps successful
📝 Completion documentation saved: .agent/tasks/2025-10-29-auth-implementation.md
```

**Safety Features:**
- **Real-time Diffs**: See exactly what changed in each step
- **Automatic Backups**: Original files saved as `.bak`
- **Patch Files**: Unified diffs saved to `~/.xcli/patches/`
- **Git Commits**: All changes committed with descriptive messages

### Phase 4: Adaptive Recovery 🔄

If execution encounters problems, X-CLI automatically:

1. **Detects Errors**: Identifies test failures, build errors, etc.
2. **Preserves Context**: Maintains execution state and progress
3. **Generates Recovery Plan**: Creates steps to fix the issue
4. **Seeks Approval**: Presents recovery plan for your confirmation

**Example Error Recovery:**
```
🚨 ISSUE ENCOUNTERED
[x-cli] Issue encountered: test suite failing in auth module (3 tests)

🔄 Initiating adaptive recovery...

=== ISSUES ===
🚨 RISK (high): Authentication tests failing after OAuth2 integration

=== OPTIONS ===
1) Fix test mocks: Update test configuration
2) Revert changes: Rollback OAuth2 and retry simpler approach
3) Debug integration: Add logging and investigate root cause

=== RECOMMENDATION ===
→ Option 1: Fix test mocks (Confidence: medium)

Proceed with recovery plan? (Y/n) [R=revise]
```

### Phase 5: Auto-Doc 📝

After completion, X-CLI automatically:

1. **Generates Documentation**: Creates detailed `.agent/tasks/` file
2. **Extracts Lessons**: Analyzes what worked and what didn't
3. **Updates Knowledge Base**: Builds institutional memory

**Generated Documentation Includes:**
- Original request and constraints
- Research analysis (issues, options, recommendation)
- Execution results and step-by-step outcomes
- File changes and git commits
- Lessons learned and future recommendations

## Advanced Usage

### CLI Flags

#### Headless Mode
```bash
xcli --headless "add error handling to user API"
```

**Use Cases:**
- CI/CD pipelines
- Automated scripts
- Batch processing
- Integration with other tools

**Behavior:**
- Auto-approves recommendations (assumes high confidence)
- Suppresses interactive prompts
- Returns structured output for automation

#### Non-Interactive Mode
```bash
xcli --noninteractive "debug the login issue"
```

**Use Cases:**
- Quick queries
- Fallback when workflow fails
- Simple tasks that don't need planning

**Behavior:**
- Falls back to original chat interface
- No structured workflow
- Standard conversational AI

### Environment Variables

#### Custom Patch Directory
```bash
XCLI_PATCH_DIR=/my/custom/patches xcli "refactor database layer"
```

#### Context Configuration
```bash
# Disable context loading
XCLI_NO_CONTEXT=1 xcli "simple task"

# Custom context budget (KB)
XCLI_CONTEXT_BUDGET=500 xcli "complex analysis"
```

### Configuration Files

#### User Preferences
Create `~/.xcli/config.json`:

```json
{
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

#### Project-Specific Settings
Create `.xcli/project.json` in your project:

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

## Best Practices

### Task Formulation

#### Good Examples
```bash
# Specific and actionable
xcli "add input validation to the user registration form"

# Includes context
xcli "implement REST API for product catalog with error handling"

# Specifies constraints
xcli "optimize database queries but keep existing API contracts"
```

#### Avoid
```bash
# Too vague
xcli "make it better"

# Multiple unrelated tasks
xcli "fix bugs and add features and refactor code"

# Implementation-specific
xcli "use React hooks to rewrite the component"
```

### Decision Making

#### When to Approve
- High confidence recommendations
- Well-understood trade-offs
- Critical path tasks
- Well-tested approaches

#### When to Revise
- Missing important constraints
- Better approach available
- Risk tolerance mismatch
- Scope too broad/narrow

#### When to Reject
- Doesn't align with project goals
- Unacceptable risks
- Better to handle manually
- Insufficient analysis

### Error Recovery

#### Trust the Recovery
- X-CLI's recovery plans are informed by error context
- Recovery maintains execution state and progress
- Multiple recovery attempts available

#### Manual Intervention
- Use "N" to reject problematic recovery plans
- Fall back to manual fixes when needed
- Document manual interventions for future learning

### Documentation Review

#### After Execution
```bash
# Review what was accomplished
cat .agent/tasks/$(date +%Y-%m-%d)-*

# Check generated patches
ls ~/.xcli/patches/

# Review git history
git log --oneline -5
```

## Troubleshooting

### Workflow Issues

#### "No context loaded"
- Ensure `.agent/` directory exists
- Check that system.md and sop.md are present
- Verify file permissions

#### "Research failed"
- Check API key configuration
- Verify network connectivity
- Try simpler task description

#### "Execution stuck"
- Check for long-running commands
- Verify tool timeouts
- Use Ctrl+C to interrupt

### Recovery Issues

#### "Recovery loop detected"
- Too many revision attempts
- Simplify task description
- Use manual intervention

#### "No recovery options found"
- Error type not recognized
- Provide more context in revision note
- Fall back to manual fixes

### Documentation Issues

#### "Documentation not generated"
- Check write permissions to `.agent/tasks/`
- Verify disk space availability
- Check for file system errors

#### "Lessons not extracted"
- Ensure execution completed (not interrupted)
- Check for analysis errors in logs
- Verify file change detection worked

## Examples

### Simple Task
```bash
$ xcli "add a new API endpoint for user profiles"

🔍 Researching and analyzing...
[... research output ...]
Proceed with recommendation? (Y/n) [R=revise] Y

🚀 Starting execution...
✅ Execution completed: 3/3 steps successful
📝 Documentation saved to .agent/tasks/
```

### Complex Task with Recovery
```bash
$ xcli "implement payment processing system"

🔍 Researching and analyzing...
[... complex analysis ...]
Proceed with recommendation? (Y/n) [R=revise] Y

🚀 Starting execution...
🚨 ISSUE ENCOUNTERED
[x-cli] Issue encountered: test failures in payment validation

🔄 Initiating adaptive recovery...
[... recovery analysis ...]
Proceed with recovery plan? (Y/n) [R=revise] Y

✅ Recovery completed. Resuming execution...
✅ Execution completed: 8/8 steps successful
```

### CI/CD Integration
```bash
# In GitHub Actions
- name: Implement Feature
  run: |
    npx @xagent/x-cli@latest --headless "add error logging to payment service"
  env:
    X_API_KEY: ${{ secrets.X_API_KEY }}
    XCLI_PATCH_DIR: ./patches
```

## Integration Examples

### With Development Workflow
```bash
# Feature development
xcli "implement dark mode toggle"
git add .
git commit -m "feat: add dark mode toggle"

# Bug fixes
xcli "fix memory leak in data processing"
git add .
git commit -m "fix: memory leak in data processing"

# Refactoring
xcli "extract common validation logic"
git add .
git commit -m "refactor: extract validation utilities"
```

### With Project Management
```bash
# Story implementation
xcli "implement user story: password reset flow"
# Automatically generates documentation for review

# Technical debt
xcli "refactor authentication module for better testability"
# Includes testing improvements in plan

# Infrastructure
xcli "set up CI/CD pipeline for the project"
# Provides deployment and monitoring steps
```

## Performance Tips

### Context Optimization
- Keep `.agent/` documentation focused and up-to-date
- Use meaningful file names for better context loading
- Archive old task files to reduce context budget usage

### Execution Speed
- Break large tasks into smaller, focused ones
- Use specific constraints to reduce analysis scope
- Prefer high-confidence recommendations to avoid revisions

### Resource Management
- Monitor patch directory size
- Clean up old .bak files periodically
- Review git commit history for workflow patterns

## Support

### Getting Help
- Check generated documentation in `.agent/tasks/`
- Review execution logs for error details
- Use `--help` flag for CLI options

### Common Patterns
- **Stuck?** Try simpler task descriptions
- **Wrong approach?** Use revision to provide more context
- **Errors?** Check patch files and git history for rollback options

### Community Resources
- GitHub Issues for bug reports
- Discord community for usage questions
- Documentation updates via pull requests

---

*This workflow represents a fundamental shift in how AI can collaborate with developers on complex tasks while maintaining safety, transparency, and knowledge accumulation.*