---
title: Tools Overview
---

# Tools Overview

X-CLI features a comprehensive tool system that provides powerful capabilities for file operations, code analysis, web integration, and workflow automation. The AI automatically selects and combines these tools to accomplish complex tasks through natural language interaction.

## Tool Categories

### Core Tools
Essential tools for basic file and system operations.

### Advanced Tools
Sophisticated capabilities for complex multi-step operations.

### IDE Integration Tools
Specialized tools for development environment integration.

---

## Core Tools

### Read
**Purpose**: File viewing and content inspection  
**Capabilities**:
- Read any file type including text, images, PDFs, and Jupyter notebooks
- Supports line offset and limit for large files
- Displays content with line numbers
- Handles binary files and provides visual representation for images

**Usage Examples**:
```bash
grok "Read the main.py file"
grok "Show me the first 50 lines of the log file"
grok "What's in this screenshot?"
```

### Write
**Purpose**: File creation and complete content replacement  
**Capabilities**:
- Create new files with specified content
- Completely overwrite existing files
- Supports all text-based file formats
- Automatic directory creation if needed

**Usage Examples**:
```bash
grok "Create a new README.md file"
grok "Write a Python script that processes CSV files"
```

### Edit
**Purpose**: Precise string replacement and file modification  
**Capabilities**:
- Exact string find-and-replace operations
- Preserves file formatting and indentation
- Supports regex patterns
- Replace single or all occurrences

**Usage Examples**:
```bash
grok "Change all instances of 'oldFunction' to 'newFunction'"
grok "Update the version number in package.json"
```

### Bash
**Purpose**: Shell command execution with output capture  
**Capabilities**:
- Execute any shell command
- Capture stdout and stderr
- Support for background processes
- Timeout management
- Environment variable handling

**Usage Examples**:
```bash
grok "Run the test suite"
grok "Install the dependencies"
grok "Check git status"
```

### Grep
**Purpose**: Content search using ripgrep with regex support  
**Capabilities**:
- Fast full-text search across files
- Regex pattern matching
- File type filtering
- Context lines (before/after matches)
- Case-insensitive search options

**Usage Examples**:
```bash
grok "Find all TODO comments in the codebase"
grok "Search for error handling patterns"
```

### Glob
**Purpose**: File pattern matching and discovery  
**Capabilities**:
- Fast file pattern matching
- Supports complex glob patterns
- Returns files sorted by modification time
- Works efficiently with large codebases

**Usage Examples**:
```bash
grok "Find all TypeScript files"
grok "List all configuration files"
```

### LS
**Purpose**: Directory listing and file system navigation  
**Capabilities**:
- List files and directories
- Support for glob pattern filtering
- Absolute path requirement for consistency
- Detailed file information

**Usage Examples**:
```bash
grok "What files are in the src directory?"
grok "Show me the project structure"
```

---

## Advanced Tools

### MultiEdit
**Purpose**: Atomic multi-file operations with transaction support  
**Capabilities**:
- Edit multiple files in a single atomic operation
- Transaction management with rollback support
- File operations: create, edit, delete, rename, move
- Ensures consistency across multiple files
- Preview changes before commit

**Usage Examples**:
```bash
grok "Refactor the User class across all files"
grok "Update import statements in the entire project"
```

### WebFetch
**Purpose**: Web content retrieval and processing  
**Capabilities**:
- HTTP requests with automatic content processing
- HTML to markdown conversion
- AI-powered content analysis and extraction
- Caching for improved performance
- Support for various content types

**Usage Examples**:
```bash
grok "Fetch the latest documentation from the API"
grok "Get information about this GitHub issue"
```

### WebSearch
**Purpose**: Real-time web search capabilities  
**Capabilities**:
- Access to current information beyond training data
- Domain filtering and result customization
- Integration with search providers
- Up-to-date information retrieval

**Usage Examples**:
```bash
grok "Search for the latest React best practices"
grok "Find current Node.js security advisories"
```

### Task
**Purpose**: Specialized agent delegation system  
**Capabilities**:
- Launch sub-agents for complex multi-step tasks
- Token-optimized processing with specialized capabilities
- Autonomous task completion with final reporting
- Handles complex research and analysis tasks

**Usage Examples**:
```bash
grok "Research and implement a caching strategy"
grok "Analyze the codebase architecture and suggest improvements"
```

### TodoWrite
**Purpose**: Comprehensive task management  
**Capabilities**:
- Progress tracking with status management
- Multi-step task breakdown and organization
- Persistent task history and completion tracking
- Real-time status updates

**Usage Examples**:
```bash
grok "Plan and implement the new user authentication feature"
grok "Break down this complex refactoring task"
```

---

## IDE Integration Tools

### NotebookEdit
**Purpose**: Jupyter notebook cell editing and management  
**Capabilities**:
- Edit individual notebook cells
- Support for code and markdown cells
- Cell insertion and deletion
- Maintains notebook structure and metadata

**Usage Examples**:
```bash
grok "Add a new analysis cell to the notebook"
grok "Update the data visualization code"
```

### BashOutput
**Purpose**: Background process monitoring and output streaming  
**Capabilities**:
- Monitor long-running background processes
- Stream output in real-time
- Regex filtering of output
- Process status tracking

**Usage Examples**:
```bash
grok "Monitor the build process"
grok "Check the test runner output"
```

### KillBash
**Purpose**: Process termination and cleanup  
**Capabilities**:
- Terminate running background processes
- Clean process cleanup
- Process ID management
- Error handling for failed terminations

**Usage Examples**:
```bash
grok "Stop the development server"
grok "Cancel the long-running test"
```

---

## Tool Selection and Orchestration

### Automatic Tool Selection
X-CLI's AI automatically selects the most appropriate tools for each task:

- **Single operations**: Uses individual tools directly
- **Complex tasks**: Combines multiple tools in sequence
- **Research tasks**: Delegates to specialized Task agents
- **File operations**: Chooses between Edit, MultiEdit, or Write based on scope

### Tool Combinations
Common tool combinations for complex operations:

- **Code refactoring**: Grep → Read → MultiEdit → Bash (test)
- **Documentation creation**: WebSearch → WebFetch → Write
- **Bug investigation**: Grep → Read → Bash → Edit
- **Project analysis**: Glob → Read → Task (analysis) → TodoWrite

### Best Practices

1. **Be specific**: Detailed requests help the AI choose optimal tools
2. **Trust the system**: The AI selects tools based on the task requirements
3. **Review changes**: Check outputs before confirming destructive operations
4. **Use natural language**: Describe what you want to achieve, not how

### Error Handling

All tools include comprehensive error handling:
- **File not found**: Clear error messages with suggestions
- **Permission errors**: Actionable guidance for resolution
- **Network failures**: Automatic retries with fallback options
- **Syntax errors**: Detailed error reporting with line numbers

---

## Tool Configuration

### Global Settings
Configure tool behavior in `~/.grok/user-settings.json`:

```json
{
  "tools": {
    "bash": {
      "defaultTimeout": 120000,
      "allowBackground": true
    },
    "webFetch": {
      "timeout": 30000,
      "maxRetries": 3
    }
  }
}
```

### Project Settings
Override settings per project in `.grok/settings.json`:

```json
{
  "tools": {
    "grep": {
      "excludePatterns": ["node_modules", ".git", "dist"]
    }
  }
}
```

---

## Advanced Features

### Parallel Execution
Tools can be executed in parallel for improved performance:
- Multiple file reads
- Concurrent searches
- Parallel network requests

### Caching
Intelligent caching improves performance:
- **WebFetch**: 15-minute content cache
- **File operations**: Metadata caching
- **Search results**: Query result caching

### Security
All tools implement security best practices:
- **Sandboxed execution**: Safe command execution
- **Permission validation**: Explicit permission checks
- **Secret handling**: No secret exposure in logs
- **Input validation**: Comprehensive input sanitization

---

## Getting Help

For tool-specific help and examples:

```bash
grok "How do I use the MultiEdit tool?"
grok "Show me examples of the Grep tool"
grok "What can the Task tool do?"
```

The AI will provide detailed explanations and examples for any tool or capability.