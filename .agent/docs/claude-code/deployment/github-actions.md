# Grok One-Shot GitHub Actions

> Learn about integrating Grok One-Shot into your development workflow with GitHub Actions

## Parity Gap: No Official Grok GitHub Actions

**Current Status**: Unlike Claude Code, Grok One-Shot does not currently have official GitHub Actions support from xAI.

**What This Means**:
- No official `@grok` mention support in GitHub issues/PRs
- No pre-built GitHub App for instant integration
- No `/install-github-app` command equivalent
- No dedicated GitHub Actions workflow templates

**Alternative Approaches**:
1. **Custom Docker-based Actions**: Build custom GitHub Actions that execute Grok One-Shot in containers
2. **Workflow Scripts**: Use GitHub Actions workflows to run Grok One-Shot via headless mode
3. **API Integration**: Create custom GitHub App that calls Grok API directly
4. **Manual CLI Usage**: Run Grok One-Shot locally and push changes manually

This document describes what Claude Code GitHub Actions provides as reference for building custom Grok One-Shot integrations.

---

## What Claude Code GitHub Actions Provides (Reference)

Claude Code GitHub Actions brings AI-powered automation to GitHub workflows. With a simple `@claude` mention in any PR or issue, Claude can analyze code, create pull requests, implement features, and fix bugs - all while following project standards.

<Note>
  Claude Code GitHub Actions is built on top of the [Claude Code
  SDK](https://docs.claude.com/en/api/agent-sdk), which enables programmatic integration of
  Claude Code into applications. You can use similar approaches to build custom
  automation workflows for Grok One-Shot.
</Note>

## Why Use AI-Powered GitHub Actions?

* **Instant PR creation**: Describe what you need, and AI creates a complete PR with all necessary changes
* **Automated code implementation**: Turn issues into working code with a single command
* **Follows your standards**: AI respects your `GROK.md` guidelines and existing code patterns
* **Simple setup**: Get started with API key and workflow configuration
* **Secure by default**: Your code stays on GitHub's runners

## Building Custom Grok One-Shot Workflows

### Approach 1: Headless Mode in GitHub Actions

Create a custom workflow that runs Grok One-Shot in headless mode:

```yaml
name: Grok One-Shot Automation
on:
  workflow_dispatch:
    inputs:
      task:
        description: 'Task for Grok One-Shot'
        required: true

jobs:
  grok-task:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install x-cli
        run: |
          npm install -g x-cli

      - name: Run Grok One-Shot
        env:
          GROK_API_KEY: ${{ secrets.GROK_API_KEY }}
        run: |
          x-cli -p "${{ github.event.inputs.task }}"

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: "AI: ${{ github.event.inputs.task }}"
          title: "AI: ${{ github.event.inputs.task }}"
          body: |
            Automated changes by Grok One-Shot

            Task: ${{ github.event.inputs.task }}
```

### Approach 2: Docker-based Custom Action

Build a reusable Docker action:

**action.yml**:
```yaml
name: 'Grok One-Shot Action'
description: 'Run Grok One-Shot tasks in GitHub Actions'
inputs:
  task:
    description: 'Task prompt for Grok One-Shot'
    required: true
  grok_api_key:
    description: 'Grok API key'
    required: true

runs:
  using: 'docker'
  image: 'Dockerfile'
  env:
    GROK_API_KEY: ${{ inputs.grok_api_key }}
  args:
    - ${{ inputs.task }}
```

**Dockerfile**:
```dockerfile
FROM oven/bun:latest

WORKDIR /app

RUN bun install -g x-cli

ENTRYPOINT ["x-cli", "-p"]
```

### Approach 3: Custom GitHub App Integration

For organizations wanting `@grok` mention support, you would need to:

1. **Create GitHub App** with permissions:
   - Contents: Read & write
   - Issues: Read & write
   - Pull requests: Read & write

2. **Build webhook handler** that:
   - Listens for issue/PR comments
   - Detects `@grok` mentions
   - Calls Grok API via your backend
   - Creates commits and PRs via GitHub API

3. **Deploy backend service** that:
   - Authenticates as GitHub App
   - Manages Grok API calls
   - Handles rate limiting
   - Creates PRs with results

This approach requires significant development but provides the closest experience to Claude Code GitHub Actions.

## Claude Code GitHub Actions Reference

The following sections describe Claude Code's GitHub Actions capabilities for reference when building custom Grok One-Shot solutions.

### Claude Code Action

The official Claude Code GitHub Action allows running Claude Code within GitHub Actions workflows.

[View repository →](https://github.com/anthropics/claude-code-action)

### Setup (Claude Code - Reference)

#### Quick setup

Claude Code provides `/install-github-app` command for easy setup.

<Note>
  Grok One-Shot does not have an equivalent quick setup command. You must configure GitHub Actions workflows manually.
</Note>

#### Manual setup

For Claude Code:

1. **Install the Claude GitHub app**: [https://github.com/apps/claude](https://github.com/apps/claude)
2. **Add ANTHROPIC_API_KEY** to repository secrets
3. **Copy workflow file** from examples

For Grok One-Shot, you would need to:

1. **Add GROK_API_KEY** to repository secrets
2. **Create custom workflow** (see examples above)
3. **Configure appropriate triggers** and permissions

## Example Use Cases

### Basic Automation Workflow (Custom Implementation)

```yaml
name: Grok One-Shot Helper
on:
  issue_comment:
    types: [created]

jobs:
  check-grok-mention:
    if: contains(github.event.comment.body, '@grok')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Extract task
        id: task
        run: |
          TASK=$(echo "${{ github.event.comment.body }}" | sed 's/@grok //g')
          echo "task=$TASK" >> $GITHUB_OUTPUT

      - name: Setup and run Grok One-Shot
        env:
          GROK_API_KEY: ${{ secrets.GROK_API_KEY }}
        run: |
          npm install -g x-cli
          x-cli -p "${{ steps.task.outputs.task }}"

      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          title: "Grok: ${{ steps.task.outputs.task }}"
```

### Scheduled Code Review

```yaml
name: Daily Code Review
on:
  schedule:
    - cron: "0 9 * * *"

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Grok One-Shot
        run: npm install -g x-cli

      - name: Generate Report
        env:
          GROK_API_KEY: ${{ secrets.GROK_API_KEY }}
        run: |
          x-cli -p "Generate a summary of yesterday's commits and open issues"
```

## Best Practices

### GROK.md Configuration

Create a `GROK.md` file in your repository root to define code style guidelines, review criteria, project-specific rules, and preferred patterns. This guides AI understanding of your project standards.

### Security Considerations

<Warning>Never commit API keys directly to your repository!</Warning>

Always use GitHub Secrets for API keys:

* Add your API key as a repository secret named `GROK_API_KEY`
* Reference it in workflows: `${{ secrets.GROK_API_KEY }}`
* Limit action permissions to only what's necessary
* Review AI suggestions before merging

### Optimizing Performance

Use issue templates to provide context, keep your `GROK.md` concise and focused, and configure appropriate timeouts for your workflows.

### CI Costs

When using custom Grok One-Shot GitHub Actions:

**GitHub Actions costs:**

* Workflows run on GitHub-hosted runners, consuming GitHub Actions minutes
* See [GitHub's billing documentation](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions) for pricing

**API costs:**

* Each Grok interaction consumes API tokens based on prompt and response length
* Token usage varies by task complexity and codebase size
* See [xAI pricing](https://x.ai/api) for current rates

**Cost optimization tips:**

* Use specific commands to reduce unnecessary API calls
* Configure appropriate max-turns limits
* Set workflow-level timeouts to avoid runaway jobs
* Use GitHub's concurrency controls to limit parallel runs

## Configuration Examples

### Basic Headless Workflow

```yaml
- name: Run Grok One-Shot
  env:
    GROK_API_KEY: ${{ secrets.GROK_API_KEY }}
  run: |
    x-cli -p "Your instructions here"
```

### With Custom Model Selection

```yaml
- name: Run Grok One-Shot
  env:
    GROK_API_KEY: ${{ secrets.GROK_API_KEY }}
    GROK_MODEL: grok-4-fast-non-reasoning
  run: |
    x-cli -m grok-4-fast-non-reasoning -p "Your task"
```

### With Max Tool Rounds

```yaml
- name: Run Grok One-Shot
  env:
    GROK_API_KEY: ${{ secrets.GROK_API_KEY }}
    MAX_TOOL_ROUNDS: "20"
  run: |
    x-cli -p "Complex task requiring multiple iterations"
```

## Using with Alternative Providers

Unlike Claude Code which supports AWS Bedrock and Google Vertex AI, Grok One-Shot currently only supports the xAI Grok API directly.

## Troubleshooting

### Grok not responding

Verify:
- GROK_API_KEY is set correctly in repository secrets
- Workflow is enabled
- API key has sufficient permissions
- xAI API service is operational

### Authentication errors

Confirm:
- API key is valid
- API key has not expired
- Secrets are named correctly in workflows
- Environment variables are passed correctly

### Installation issues

If x-cli installation fails:
- Use specific version: `npm install -g x-cli@1.1.101`
- Verify npm/bun is installed correctly
- Check network connectivity

## Advanced Configuration

### Custom Docker Image

Build optimized Docker image with x-cli pre-installed:

```dockerfile
FROM oven/bun:latest

# Install x-cli
RUN bun install -g x-cli

# Pre-cache common dependencies
RUN mkdir -p /workspace
WORKDIR /workspace

# Set up environment
ENV GROK_API_KEY=""
ENV MAX_TOOL_ROUNDS="400"

ENTRYPOINT ["x-cli"]
```

### Reusable Workflow

Create `.github/workflows/grok-reusable.yml`:

```yaml
name: Reusable Grok Workflow

on:
  workflow_call:
    inputs:
      task:
        required: true
        type: string
      model:
        required: false
        type: string
        default: 'grok-4-fast-non-reasoning'
    secrets:
      grok_api_key:
        required: true

jobs:
  run-grok:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup x-cli
        run: npm install -g x-cli

      - name: Run task
        env:
          GROK_API_KEY: ${{ secrets.grok_api_key }}
          GROK_MODEL: ${{ inputs.model }}
        run: |
          x-cli -p "${{ inputs.task }}"
```

Use in other workflows:

```yaml
jobs:
  my-task:
    uses: ./.github/workflows/grok-reusable.yml
    with:
      task: "Fix linting errors"
      model: "grok-4-fast-non-reasoning"
    secrets:
      grok_api_key: ${{ secrets.GROK_API_KEY }}
```

## Related Resources

* [Grok API Documentation](https://x.ai/api)
* [GitHub Actions Documentation](https://docs.github.com/en/actions)
* [Creating GitHub Apps](https://docs.github.com/en/apps/creating-github-apps)
* [Docker Actions](https://docs.github.com/en/actions/creating-actions/creating-a-docker-container-action)

## Future Possibilities

As xAI develops their ecosystem, potential future enhancements could include:

- Official xAI GitHub Actions integration
- Pre-built GitHub App for Grok One-Shot
- Native webhook handlers for issue/PR comments
- Managed cloud runners optimized for Grok API
- Official SDK for building custom integrations

Until then, the custom approaches outlined in this document provide paths to integrate Grok One-Shot into GitHub workflows.
