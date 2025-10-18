---
title: Current System State
---# Current System State

## Architecture Overview
- **Type**: CLI application with React/Ink UI
- **Language**: TypeScript (ESM modules)
- **Build**: TypeScript compiler + tsup dual build (CJS/ESM)
- **Package**: NPM global installation
- **Runtime**: Node.js (Bun recommended)

## Core Components
- **Commands**: Slash-based in src/commands/ (limited - only MCP command currently)
- **Tools**: Modular tools in src/tools/ (extensive tool system)
- **UI**: Ink components in src/ui/
- **Settings**: File-based .grok/settings.json + ~/.grok/user-settings.json
- **Input**: Enhanced terminal input with history in src/hooks/

## Command System
- **Slash Commands**: Handled in useInputHandler.ts
- **Current Commands**: /help, /clear, /models, /commit-and-push, /exit, /init-agent, /docs, /readme, /api-docs, /changelog, /comments, /update-agent-docs, /compact, /heal, /guardrails
- **Command Registration**: Direct implementation in input handler
- **Extension Pattern**: Add to handleDirectCommand function
- **Documentation Commands**: Full suite with /init-agent, /docs menu, /readme generation, /api-docs, /changelog, /comments, /update-agent-docs, /compact (subagent), /heal (self-healing), /guardrails

## Authentication & Storage
- **Auth**: Environment variable GROK_API_KEY or user settings
- **Storage**: Local file system only
- **Database**: None (settings via JSON files)
- **MCP**: Optional server integration

## Current Capabilities
- File operations (read, write, edit, multi-file)
- Bash command execution with output capture
- Code analysis (AST parsing, refactoring)
- Search functionality (ripgrep-based)
- Operation history and undo/redo
- MCP server integration
- Todo management system
- Complete documentation generation system (15+ commands)
- Subagent framework for token optimization
- Self-healing system with incident tracking
- Smart auto-update system with configurable triggers
- No cloud storage integration
- No built-in authentication system

## Build Configuration
- **TypeScript**: ESM modules with dual CJS/ESM output
- **Dependencies**: Ink, React, commander, chalk, ripgrep
- **Scripts**: dev, build, start, lint, typecheck

## Recent Changes
- ** NPM Automation Fixed (2025-10-17)**: Fully automated NPM publishing workflow operational
- ** Protection System (2025-10-17)**: Comprehensive safeguards against workflow breakage
- ** P1-P3 Advanced Tools (2025-10-16)**: MultiFileEditor, AdvancedSearch, FileTreeOps, CodeAwareEditor, OperationHistory
- ** Tool Reliability (2025-10-16)**: Fixed all Read/Update tool issues, standardized FS imports
- ** Performance Fixes (2025-10-16)**: Resolved repaint storm, CPU spikes, memory optimization
- ** Enhanced Welcome (2025-10-18)**: Improved user experience with actionable tips
- ** Documentation Overhaul (2025-10-17)**: Complete .agent docs system with troubleshooting guides
- Implemented complete documentation generation system with 15+ commands
- Added subagent framework for token-optimized processing
- Implemented self-healing system with incident tracking and guardrails

## Current Tool Inventory (P1-P3 Complete)
### Core Tools
- **TextEditorTool** - File viewing, creation, string replacement
- **BashTool** - Shell command execution with output capture
- **SearchTool** - Basic file and content search

### P1 Advanced Tools ( Complete)
- **MorphEditorTool** - High-speed editing (4,500+ tokens/sec, 98% accuracy)
- **MultiFileEditorTool** - Atomic multi-file operations with transaction support
- **AdvancedSearchTool** - Enhanced search and replace with regex support
- **FileTreeOperationsTool** - Comprehensive file system management

### P2 Code Intelligence ( Complete)
- **CodeAwareEditorTool** - Intelligent code editing with syntax understanding
- **OperationHistoryTool** - Comprehensive undo/redo system

### P3 Reliability & Workflow ( Complete)
- **TodoTool** - Task management and progress tracking
- **ConfirmationTool** - User confirmation for dangerous operations

## Automation Status
- ** NPM Publishing**: Fully automated on every push to main
- ** Version Management**: Auto-bump patch versions with README sync
- ** GitHub Actions**: Combined release workflow with proper authentication
- ** Protection System**: Comprehensive safeguards and documentation