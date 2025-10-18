---
title: Overview
---

# Grok CLI

Grok CLI is a conversational AI tool that brings Claude Code-level intelligence directly into your terminal. Built with X.AI's Grok models, it provides advanced file operations, code analysis, and workflow automation through natural language interaction.

## Key Features

**Advanced File Operations**
- Read, Write, Edit with atomic multi-file support
- Search and discovery with Grep, Glob, LS tools
- Transaction-based editing with rollback capabilities

**Code Intelligence**
- Syntax-aware editing with AST parsing
- Symbol search across codebases
- Dependency analysis and refactoring tools

**Web Integration**
- Real-time web search and content retrieval
- HTTP client capabilities for API testing
- External service integration via MCP protocol

**Workflow Automation**
- Task management and progress tracking
- Specialized agent delegation for complex operations
- IDE integration with VS Code and Jupyter

## Quick Start

Install globally via npm:

```bash
npm install -g grok-cli-hurry-mode@latest
```

Set your API key:

```bash
export GROK_API_KEY=your_api_key_here
```

Start the CLI:

```bash
grok
```

## Architecture

Grok CLI is built on a modular architecture with:

- **Agent System**: Central orchestration with streaming responses
- **Tool System**: Modular tools for specific operations
- **MCP Integration**: Extensible server integration
- **Configuration Management**: User and project-level settings

## Tool Categories

**Core Tools**
- Read, Write, Edit, Bash, Grep, Glob, LS

**Advanced Tools**
- MultiEdit, WebFetch, WebSearch, Task, TodoWrite

**IDE Integration**
- NotebookEdit, BashOutput, KillBash

## Getting Help

- [Installation Guide](getting-started/installation) - Complete setup instructions
- [Architecture Overview](architecture/overview) - Technical details
- [API Reference](api/schema) - Tool schemas and configurations

For support, visit our [GitHub repository](https://github.com/hinetapora/grok-cli-hurry-mode) or join the [xAI Community Discord](https://discord.com/channels/1315720379607679066/1315822328139223064).