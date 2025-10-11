# Grok CLI - CLAUDE.md

This document provides context for Claude Code to help improve this Grok CLI application to be as feature-rich and capable as Claude Code itself.

## Project Overview

Grok CLI is a conversational AI CLI tool that brings Grok's capabilities directly into the terminal. It features an intelligent agent system with tool usage, file operations, and MCP (Model Context Protocol) integration.

## Current Architecture

### Core Components

- **Agent System** (`src/agent/grok-agent.ts`): Central orchestration with streaming, tool execution, and conversation management
- **Grok Client** (`src/grok/client.ts`): OpenAI-compatible API client for X.AI's Grok models
- **Tool System** (`src/tools/`): Modular tools for file operations, bash execution, search, and more
- **UI Components** (`src/ui/`): Ink-based terminal interface with chat history and input handling
- **MCP Integration** (`src/mcp/`): Model Context Protocol support for extending capabilities
- **Settings Management** (`src/utils/settings-manager.ts`): User and project-level configuration

### Available Tools

#### Core Tools
1. **TextEditorTool** - File viewing, creation, and string replacement editing
2. **MorphEditorTool** - High-speed editing with Morph API (4,500+ tokens/sec, 98% accuracy)
3. **BashTool** - Shell command execution with output capture
4. **SearchTool** - File and content search using ripgrep
5. **TodoTool** - Task management and progress tracking
6. **ConfirmationTool** - User confirmation for dangerous operations

#### Advanced Tools (NEW - P1 Complete!)
7. **MultiFileEditorTool** - Atomic multi-file operations with transaction support
   - Multi-file editing with rollback capabilities
   - File operations: create, edit, delete, rename, move
   - Transaction management with preview and commit/rollback
   - Atomic operations ensuring consistency across multiple files

8. **AdvancedSearchTool** - Enhanced search and replace with regex support
   - Regex pattern matching with case sensitivity options
   - File filtering with include/exclude patterns
   - Context-aware search results with line numbers
   - Bulk search and replace across multiple files
   - Preview mode for safe replacements

9. **FileTreeOperationsTool** - Comprehensive file system management
   - Visual directory tree generation with filtering
   - Bulk file operations (copy, move, delete, organize)
   - File organization by type, size, or date
   - Empty directory cleanup
   - Structure copying with selective file inclusion

10. **CodeAwareEditorTool** - Intelligent code editing with syntax understanding
    - Language-specific code analysis (JavaScript, TypeScript, Python, Java)
    - Function/class/variable detection and mapping
    - Smart refactoring: rename, extract function/variable, inline operations
    - Code-aware insertion with proper indentation and structure
    - Import management and missing symbol detection
    - Syntax-preserving formatting

11. **OperationHistoryTool** - Comprehensive undo/redo system
    - Full operation history with metadata tracking
    - Smart rollback with file snapshots
    - Transaction-aware undo/redo navigation
    - Persistent history across sessions
    - Dangerous operation confirmation
    - History point navigation and cleanup

### Key Features

- **Conversational Interface**: Natural language interaction with Grok models
- **Smart Tool Selection**: AI automatically chooses appropriate tools
- **MCP Server Support**: Extensible with Linear, GitHub, and other MCP servers
- **Project-Specific Instructions**: Custom behavior via `.grok/GROK.md`
- **Headless Mode**: Scriptable operation for CI/CD and automation
- **Model Flexibility**: Support for multiple Grok models and OpenAI-compatible APIs
- **Global/Local Settings**: User-level and project-level configuration management

## Build and Development Commands

```bash
# Development
bun run dev              # Start in development mode
npm run build            # Build TypeScript to dist/
npm run start            # Run built version
bun run lint             # ESLint checking
bun run typecheck        # TypeScript type checking

# Installation
bun add -g grok-cli-hurry-mode    # Global installation
npm install -g grok-cli-hurry-mode
```

## Areas for Improvement (Inspired by Claude Code)

### 1. Enhanced Tool Capabilities
- **File Operations**: More sophisticated file manipulation (multi-file edits, refactoring)
- **Code Analysis**: Syntax parsing, dependency analysis, code understanding
- **Git Integration**: Better version control operations and history management
- **Testing Tools**: Automated test running and result analysis
- **Debugging Tools**: Breakpoint management, variable inspection

### 2. Advanced AI Features
- **Code Context**: Better understanding of project structure and relationships
- **Semantic Search**: Content-aware search beyond text matching
- **Code Generation**: Template-based code scaffolding
- **Refactoring Assistant**: Automated code improvements and optimizations
- **Documentation Generation**: Automatic README, API docs, and code comments

### 3. User Experience Enhancements
- **Autocomplete**: Command and file path completion
- **Syntax Highlighting**: Better code display in terminal
- **Progress Indicators**: Better feedback for long-running operations
- **Undo/Redo**: Operation history and rollback capabilities
- **Session Management**: Persistent conversations and context

### 4. Integration Improvements
- **IDE Integration**: VS Code extension, Vim plugin support
- **CI/CD Hooks**: GitHub Actions, pre-commit hooks
- **Cloud Services**: AWS, GCP, Azure integration via MCP
- **Database Tools**: SQL execution, schema management
- **API Testing**: HTTP client capabilities

### 5. Performance Optimizations
- **Streaming UI**: Real-time response rendering
- **Caching**: Intelligent caching of API responses and file operations
- **Parallel Execution**: Concurrent tool execution
- **Memory Management**: Efficient handling of large files and responses

### 6. Security and Reliability
- **Sandboxing**: Safe execution of untrusted code
- **Permission System**: Granular control over tool capabilities
- **Audit Logging**: Track all operations for security
- **Error Recovery**: Graceful handling of failures and retries

## Configuration Files

### User Settings (`~/.grok/user-settings.json`)
```json
{
  "apiKey": "your_api_key",
  "baseURL": "https://api.x.ai/v1",
  "defaultModel": "grok-code-fast-1",
  "models": ["grok-code-fast-1", "grok-4-latest"]
}
```

### Project Settings (`.grok/settings.json`)
```json
{
  "model": "grok-3-fast",
  "mcpServers": {
    "linear": {
      "transport": "stdio",
      "command": "npx",
      "args": ["@linear/mcp-server"]
    }
  }
}
```

### Custom Instructions (`.grok/GROK.md`)
Project-specific behavior customization loaded automatically.

## Development Priorities

1. **Tool System Enhancement**: Add more powerful file manipulation and code analysis tools
2. **UI/UX Improvements**: Better terminal experience with syntax highlighting and autocomplete
3. **MCP Ecosystem**: Expand integration with more MCP servers and services
4. **Performance**: Optimize for faster response times and better resource usage
5. **Testing**: Comprehensive test suite and CI/CD pipeline
6. **Documentation**: Better onboarding and feature documentation

## Technical Debt

- **Error Handling**: Improve error messages and recovery mechanisms
- **Type Safety**: Strengthen TypeScript usage throughout codebase
- **Code Organization**: Refactor large files and improve module boundaries
- **Dependency Management**: Optimize bundle size and update dependencies
- **Logging**: Add structured logging for debugging and monitoring

## Claude Code Feature Parity Goals

The ultimate goal is to match Claude Code's capabilities in:
- **Code Understanding**: Deep semantic analysis of codebases
- **Multi-file Operations**: Complex refactoring across multiple files
- **Context Awareness**: Maintaining understanding of project structure
- **Tool Integration**: Seamless integration with development tools
- **User Experience**: Intuitive and efficient interaction patterns

This CLI aims to bring the power of Claude Code to terminal-based workflows while maintaining the flexibility and extensibility that makes it unique.

## 📚 Documentation System Workflow

### Before Planning Features:
1. **Read `.agent/README.md`** for project overview
2. **Check `.agent/system/`** for architecture context
3. **Review `.agent/tasks/`** for related work
4. **Scan `.agent/sop/`** for established patterns

### During Implementation:
- Store PRDs in `.agent/tasks/` before coding
- Reference architecture docs for consistency
- Follow established patterns from SOPs
- Use cross-references between .agent docs

### After Implementation:
- Run `/update-agent-docs` to capture changes
- Update `.agent/system/` if architecture changed
- Add new SOPs for repeatable processes
- Link related tasks and documents

### Documentation Rules:
- Keep system docs as single source of truth
- Use relative links between .agent documents  
- Maintain concise, actionable content
- Update cross-references when adding new docs

### Token Optimization:
- Read .agent docs hierarchically (README → critical-state → relevant docs)
- Expect ~600 tokens for full context vs 3000+ without system
- Use .agent structure to avoid redundant codebase scanning
- Reference existing documentation rather than recreating context

---
*This section was added by the Grok CLI documentation system*