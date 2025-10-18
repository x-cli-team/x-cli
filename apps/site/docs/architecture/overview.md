---
title: Grok CLI Architecture
---# Grok CLI Architecture

## Project Type
**CLI Application** - Conversational AI tool with terminal interface

## Technology Stack
- **Language**: TypeScript (ES Modules)
- **Runtime**: Node.js (Bun recommended)
- **UI**: Ink (React for terminal)
- **Build**: TypeScript compiler + tsup for dual builds
- **Package Manager**: Bun/NPM

## Core Architecture

### Agent System (`src/agent/`)
- **GrokAgent**: Central orchestration with streaming, tool execution
- **Conversation Management**: Chat history and context handling
- **Model Integration**: X.AI Grok models via OpenAI-compatible API

### Tool System (`src/tools/`)
- **Modular Design**: Independent tools for specific operations
- **Core Tools**: Read, Write, Edit, Bash, Grep, Glob, LS
- **Advanced Tools**: MultiEdit, WebFetch, WebSearch, Task, TodoWrite
- **Documentation Tools**: NEW - Agent system generation and maintenance

### UI Components (`src/ui/`)
- **Chat Interface**: Streaming responses with tool execution display
- **Input Handling**: Enhanced terminal input with history and shortcuts
- **Component Library**: Reusable Ink components for consistent UX

### MCP Integration (`src/mcp/`)
- **Model Context Protocol**: Extensible server integration
- **Supported Servers**: Linear, GitHub, custom servers
- **Transport Types**: stdio, HTTP, SSE

### Configuration (`src/utils/`)
- **Settings Management**: User and project-level config
- **Model Configuration**: Support for multiple AI models
- **File Locations**: ~/.grok/ for user, .grok/ for project

## Build & Distribution
- **Development**: `bun run dev` for live reload
- **Production**: `npm run build` → dist/ directory
- **Installation**: NPM global package

## Extension Points
- **Tool System**: Add new tools in src/tools/
- **MCP Servers**: Configure external service integration
- **UI Components**: Extend terminal interface capabilities
- **Commands**: Add slash commands in input handler

## Current Capabilities
Core file operations (Read, Write, Edit, MultiEdit)
Shell integration (Bash, BashOutput, KillBash)
Search and discovery (Grep, Glob, LS)
Web capabilities (WebFetch, WebSearch)
Task management (Task, TodoWrite)
IDE integration (NotebookEdit, mcp__ide__)
MCP server ecosystem
Project-specific configuration

## Implemented Features (P1-P3 Complete)
**Documentation generation system** - Full .agent docs with 15+ commands
**Subagent framework** - Token-optimized processing
**Self-healing guardrails** - /heal command and incident tracking
**Advanced code intelligence** - CodeAwareEditor with syntax understanding
**CI/CD integration** - Automated NPM publishing workflow
**Multi-file operations** - Atomic editing with transaction support
**Operation history** - Comprehensive undo/redo system
**Advanced search** - Regex patterns with file filtering
**File tree operations** - Directory management and organization

## Automation Infrastructure
**GitHub Actions** - Combined release + publish workflow
**Version Management** - Auto-bump with README synchronization
**Protection System** - Safeguards against workflow breakage
**Error Recovery** - Self-healing with guardrails
**Documentation** - Comprehensive troubleshooting guides

## Future Roadmap (2025)
**Git Integration** - Advanced operations, PR management
**Testing Framework** - Jest/Pytest integration
**IDE Integration** - VS Code extension, Vim plugin
**Database Tools** - SQL/NoSQL operation assistance
**Cloud Integration** - AWS, Docker, Kubernetes support

*Updated: 2025-10-18*