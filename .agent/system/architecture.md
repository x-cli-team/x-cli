# 🏗️ Grok CLI Architecture

## Project Type
**CLI Application** - Conversational AI tool with terminal interface

## Technology Stack
- **Language**: TypeScript (ES Modules)
- **Runtime**: Node.js (Bun recommended)
- **UI**: Ink (React for terminal)
- **Build**: TypeScript compiler + tsup for dual builds
- **Package Manager**: Bun/NPM

## Core Architecture

### 🧠 Agent System (`src/agent/`)
- **GrokAgent**: Central orchestration with streaming, tool execution
- **Conversation Management**: Chat history and context handling
- **Model Integration**: X.AI Grok models via OpenAI-compatible API

### 🛠️ Tool System (`src/tools/`)
- **Modular Design**: Independent tools for specific operations
- **Core Tools**: File operations, bash execution, search
- **Advanced Tools**: Multi-file editing, code analysis, operation history
- **Documentation Tools**: NEW - Agent system generation and maintenance

### 🖥️ UI Components (`src/ui/`)
- **Chat Interface**: Streaming responses with tool execution display
- **Input Handling**: Enhanced terminal input with history and shortcuts
- **Component Library**: Reusable Ink components for consistent UX

### 🔌 MCP Integration (`src/mcp/`)
- **Model Context Protocol**: Extensible server integration
- **Supported Servers**: Linear, GitHub, custom servers
- **Transport Types**: stdio, HTTP, SSE

### ⚙️ Configuration (`src/utils/`)
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
✅ File operations (read, write, edit, multi-file)
✅ Bash command execution
✅ Code analysis and refactoring
✅ Search and replace operations
✅ MCP server integration
✅ Operation history and undo/redo
✅ Project-specific configuration

## Planned Enhancements
🔲 Documentation generation system
🔲 Subagent framework for context efficiency
🔲 Self-healing guardrails
🔲 Advanced code intelligence
🔲 CI/CD integration

*Updated: 2025-10-11*
