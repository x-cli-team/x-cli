---
title: Quickstart
---

# Quickstart Guide

Get up and running with Grok CLI in under 5 minutes. This guide will walk you through your first interactions and essential commands.

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- An X.AI API key from [x.ai](https://x.ai)

## Installation

```bash
npm install -g grok-cli-hurry-mode@latest
```

## Configuration

Set your API key (choose one method):

```bash
# Environment variable (recommended)
export GROK_API_KEY=your_api_key_here

# Or add to your shell profile
echo 'export GROK_API_KEY=your_api_key_here' >> ~/.zshrc
source ~/.zshrc
```

## Your First Command

Start Grok CLI:

```bash
grok
```

You should see the welcome message and prompt. Try these example commands:

### Basic File Operations

```bash
# List files in current directory
"show me all files in this directory"

# Read a specific file
"show me the contents of package.json"

# Create a new file
"create a new file called hello.js with a simple hello world function"
```

### Code Operations

```bash
# Search for code patterns
"find all functions that contain 'async' in this project"

# Analyze code structure
"show me the main entry points of this application"

# Get project overview
"give me an overview of this codebase structure"
```

### Advanced Operations

```bash
# Multi-file operations
"update all TypeScript files to use strict mode"

# Web integration
"search for the latest documentation on React hooks"

# Task management
"help me plan the implementation of a user authentication system"
```

## Essential Commands

### Help and Information
- `help` - Show available commands
- `status` - Check system status
- `settings` - View current configuration

### File Operations
- Natural language for any file operation
- Supports read, write, edit, search, and organization
- Handles multiple files atomically

### Project Navigation
- Automatic project context detection
- Respects `.gitignore` and project structure
- Custom instructions via `.grok/GROK.md`

## Headless Mode

For scripting and automation:

```bash
# Single command execution
grok --prompt "show me all TODO comments in the codebase"

# With specific directory
grok --directory /path/to/project --prompt "analyze the test coverage"

# Limit tool rounds for faster execution
grok --max-tool-rounds 10 --prompt "quick project overview"
```

## Configuration Options

### Project-Specific Settings

Create `.grok/settings.json` in your project:

```json
{
  "model": "grok-code-fast-1",
  "mcpServers": {
    "linear": {
      "transport": "stdio",
      "command": "npx",
      "args": ["@linear/mcp-server"]
    }
  }
}
```

### Custom Instructions

Create `.grok/GROK.md` for project-specific behavior:

```markdown
# Custom Instructions for This Project

- Always use TypeScript for new files
- Follow the existing code style and patterns
- Add JSDoc comments for public functions
- Prefer functional components with hooks for React
```

## Tips for Success

**Be Specific**
- "Update the user authentication logic" → "Add password validation to the login function in auth.js"

**Use Context**
- Grok CLI understands your project structure and previous conversations

**Combine Operations**
- "Create a new React component, add it to the main app, and update the routing"

**Ask for Explanations**
- "Explain what this function does and suggest improvements"

## Next Steps

Now that you're up and running:

- Explore [Tool Operations](../tools/overview) to understand available capabilities
- Learn about [MCP Integration](../tools/mcp-integration) for extending functionality
- Check out [Workflow Automation](../guides/workflow-automation) for advanced usage

## Getting Help

- Type `help` in Grok CLI for immediate assistance
- Visit our [GitHub repository](https://github.com/hinetapora/grok-cli-hurry-mode) for documentation
- Join the [xAI Community Discord](https://discord.com/channels/1315720379607679066/1315822328139223064) for support

Happy coding! 🎉