# Overview

Welcome to **Grok One-Shot**, a powerful terminal-native AI coding assistant built on the Grok API (xAI). This documentation provides comprehensive guidance for using Grok One-Shot effectively in your development workflow.

## What is Grok One-Shot?

Grok One-Shot is a command-line interface (CLI) tool that brings AI-powered coding assistance directly to your terminal. Built as an adaptation of Claude Code optimized for the Grok API, it provides intelligent code editing, research capabilities, and development workflow automation.

### Key Capabilities

**Code Operations**
- Multi-file editing with context awareness
- Intelligent refactoring with impact analysis
- Code analysis and explanation
- Bug detection and fixing

**Research & Planning**
- Automated research workflows with approval gates
- Codebase exploration and understanding
- Implementation planning with user review
- Recommendation generation

**Terminal Integration**
- React/Ink-based rich terminal UI
- Session management with auto-save
- MCP (Model Context Protocol) integration
- Customizable confirmation system

**Context Management**
- On-demand documentation loading
- Project-aware context building
- Token-efficient operations (~3.5k tokens at startup)
- Intelligent Read tool for specific docs

## Why Grok One-Shot?

### Terminal-Native Experience
Unlike web-based or IDE-specific tools, Grok One-Shot lives in your terminal, integrating seamlessly with your existing command-line workflow.

### Grok API Advantages
- Powered by xAI's Grok models
- Fast response times
- Cost-effective token usage
- Optimized for coding tasks

### Open & Extensible
- Model Context Protocol (MCP) support
- Configurable hooks and workflows
- Open source (MIT license)
- Active development community

## Getting Started

### Quick Start Path

1. **Installation** → [Quickstart Guide](./quickstart.md)
2. **Basic Usage** → [Interactive Mode](../reference/interactive-mode.md)
3. **Commands** → [CLI Reference](../reference/cli-reference.md)
4. **Advanced** → [Common Workflows](./common-workflows.md)

### Core Concepts

**Interactive Mode**
The primary way to use Grok One-Shot. Start a session, ask questions, request code changes, and collaborate with the AI in real-time.

**Headless Mode**
Non-interactive execution for automation and scripting. Use `-p` flag for single-shot queries.

**Sessions**
Conversations are automatically saved to `~/.x-cli/sessions/` with token tracking and replay capability.

**Confirmations**
File operations and bash commands require user approval by default. Configure via `toggle-confirmations` command.

**MCP Integration**
Extend capabilities through Model Context Protocol servers for custom tools and data sources.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Terminal (Your CLI)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Grok One-Shot (React/Ink UI)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Chat UI    │  │  Input       │  │  Confirmations│     │
│  │  Interface   │  │  Handler     │  │  System      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    GrokAgent (Core Logic)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Message     │  │  Tool        │  │  Context     │     │
│  │  Management  │  │  Execution   │  │  Management  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Grok API (xAI)                           │
│              grok-2-1212 / grok-beta                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Input** → Terminal UI captures commands/questions
2. **Processing** → GrokAgent processes request, loads context
3. **Tool Execution** → File operations, bash commands, searches
4. **AI Response** → Grok API generates intelligent responses
5. **Display** → Results rendered in terminal with formatting
6. **Session Save** → Conversation saved to `~/.x-cli/sessions/`

## Feature Highlights

### 1. Intelligent Code Editing
Edit multiple files with awareness of dependencies and relationships. The AI understands your project structure and suggests consistent changes.

### 2. Research Workflows
Automated research mode explores your codebase, analyzes options, and presents recommendations for your approval before execution.

### 3. MCP Protocol Support
Integrate custom tools, data sources, and capabilities through the Model Context Protocol standard.

### 4. Session Management
Every conversation is saved with metadata, token counts, and timestamps. Resume or review past sessions anytime.

### 5. Token Efficiency
Optimized to use ~3.5k tokens at startup (94.6-95.8% reduction vs traditional approaches). Documentation loaded on-demand via intelligent Read tool.

## Use Cases

### Daily Development
- Code reviews and refactoring
- Bug investigation and fixes
- API integration assistance
- Documentation generation

### Learning & Exploration
- Understanding unfamiliar codebases
- Learning new frameworks
- Exploring best practices
- Architecture analysis

### Automation
- Headless mode for CI/CD
- Automated code generation
- Batch operations
- Scripting workflows

## System Requirements

**Minimum**:
- Node.js 18+ or Bun runtime
- Terminal with 256-color support
- 100MB disk space
- Grok API key (xAI)

**Recommended**:
- Bun runtime (4x faster than Node.js)
- Modern terminal (iTerm2, Windows Terminal, etc.)
- Git installed for repository operations
- 200MB disk space for sessions

## Getting Help

**Documentation**:
- Quickstart: [Getting Started Guide](./quickstart.md)
- Commands: [CLI Reference](../reference/cli-reference.md)
- Configuration: [Settings](../configuration/settings.md)

**Troubleshooting**:
- Common Issues: [Troubleshooting Guide](../build-with-claude-code/troubleshooting.md)
- Debug Logging: Check `xcli-startup.log` in current directory

**Community**:
- Issues: File in GitHub repository
- Updates: Check `x-cli --version` for latest version
- Documentation: See GROK.md and docs-index.md in project root

## Next Steps

1. **Install**: Follow the [Quickstart Guide](./quickstart.md) to get started
2. **Learn**: Review [Interactive Mode](../reference/interactive-mode.md) basics
3. **Explore**: Try [Common Workflows](./common-workflows.md) examples
4. **Customize**: Configure [Settings](../configuration/settings.md) to your preferences

---

**Ready to get started?** Continue to the [Quickstart Guide](./quickstart.md) →
