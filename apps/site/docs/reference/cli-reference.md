---
title: CLI Reference
---

# CLI Reference

Complete reference for Grok CLI commands, options, and usage patterns.

## Basic Usage

```bash
grok [options] <message>
grok [command] [options]
```

## Commands

### Conversation
```bash
# Start a conversation
grok "help me understand this code"

# Interactive mode
grok

# Continue previous conversation
grok --continue "follow up question"
```

### Configuration
```bash
# Set configuration
grok config set <key> <value>
grok config get <key>
grok config list
grok config reset

# Initialize project config
grok config init

# Test configuration
grok config test
```

### Models
```bash
# List available models
grok models list

# Get model information
grok models info <model-name>

# Set default model
grok config set defaultModel <model-name>
```

### Project Management
```bash
# Initialize Grok in project
grok init

# Add custom instructions
grok instructions edit

# View project status
grok status
```

## Global Options

### API Configuration
```bash
--api-key <key>          # X.AI API key
--base-url <url>         # API base URL (default: https://api.x.ai/v1)
--model <model>          # Model to use
--timeout <ms>           # Request timeout in milliseconds
```

### Behavior Options
```bash
--max-tokens <n>         # Maximum tokens in response
--temperature <n>        # Response creativity (0.0-1.0)
--streaming              # Enable response streaming
--no-streaming           # Disable response streaming
--fast                   # Use fastest available model
```

### Context Options
```bash
--include <pattern>      # Include files matching pattern
--exclude <pattern>      # Exclude files matching pattern
--max-files <n>          # Maximum files to include in context
--no-context            # Don't include file context
--context-size <size>    # Maximum context size (e.g., "10MB")
```

### Output Options
```bash
--json                   # Output as JSON
--verbose, -v            # Verbose output
--quiet, -q              # Minimal output
--debug                  # Debug mode with detailed logging
--no-color              # Disable colored output
```

### File Operations
```bash
--dry-run               # Show what would be changed without applying
--backup                # Create backup before modifying files
--force                 # Skip confirmation prompts
--interactive, -i       # Interactive mode for confirmations
```

## Examples

### Basic Operations
```bash
# Simple question
grok "what does this function do?"

# Analyze specific file
grok "analyze src/components/Button.tsx"

# Multi-file operation
grok "refactor all React components to use hooks"
```

### Code Analysis
```bash
# Project overview
grok "give me an overview of this codebase structure"

# Find issues
grok "find potential bugs or performance issues"

# Dependency analysis
grok "analyze the import dependencies in this project"
```

### File Operations
```bash
# Create files
grok "create a new React component called UserProfile"

# Modify files  
grok "add error handling to all API calls"

# Refactor code
grok "convert this class component to functional component"
```

### Advanced Usage
```bash
# Use specific model
grok --model grok-4-latest "complex analysis task"

# Limit context
grok --max-files 10 --include "src/**/*.ts" "analyze TypeScript files"

# Debug mode
grok --debug --verbose "troubleshoot this error"

# Dry run
grok --dry-run "refactor this function"
```

## Interactive Mode

Enter interactive mode by running `grok` without arguments:

```bash
$ grok
🤖 Grok CLI v1.0.96 - Type /help for commands

> /help
Available commands:
  /help          Show this help
  /exit, /quit   Exit Grok CLI  
  /clear         Clear conversation history
  /context       Show current context files
  /model         Change model
  /config        Show configuration
  /reset         Reset conversation

> your question here
```

### Interactive Commands
```bash
/help                    # Show available commands
/exit, /quit, /q        # Exit interactive mode
/clear                  # Clear conversation history
/reset                  # Reset conversation context
/context                # Show files in current context
/context add <pattern>  # Add files to context
/context remove <file>  # Remove file from context
/model <model-name>     # Switch model
/config                 # Show current configuration
/debug                  # Toggle debug mode
/streaming              # Toggle streaming mode
```

## Environment Variables

### API Configuration
```bash
GROK_API_KEY            # X.AI API key
GROK_BASE_URL           # API base URL
GROK_MODEL              # Default model
```

### Behavior
```bash
GROK_MAX_TOKENS         # Default max tokens
GROK_TEMPERATURE        # Default temperature
GROK_TIMEOUT            # Default timeout
GROK_STREAMING          # Enable streaming (true/false)
```

### Features
```bash
GROK_DEBUG              # Enable debug mode (true/false)
GROK_NO_COLOR           # Disable colors (true/false)
GROK_CONFIG_PATH        # Custom config file path
```

## Exit Codes

```bash
0    # Success
1    # General error
2    # Invalid arguments
3    # Configuration error
4    # API error
5    # File operation error
130  # Interrupted by user (Ctrl+C)
```

## Configuration Files

### Global Config
```bash
~/.grok/user-settings.json    # Global user settings
~/.grok/cache/               # Response cache
~/.grok/logs/               # Log files
```

### Project Config
```bash
.grok/settings.json         # Project settings
.grok/GROK.md              # Custom instructions
.grok/context.json         # Context configuration
```

## Logging

### Log Levels
```bash
--log-level error          # Only errors
--log-level warn           # Warnings and errors  
--log-level info           # Info, warnings, errors (default)
--log-level debug          # All messages
```

### Log Files
```bash
# View logs
grok logs

# Follow logs in real-time
grok logs --follow

# Filter logs
grok logs --level error --since "1 hour ago"
```

## Shell Integration

### Bash Completion
```bash
# Add to ~/.bashrc
eval "$(grok completion bash)"
```

### Zsh Completion
```bash
# Add to ~/.zshrc
eval "$(grok completion zsh)"
```

### Fish Completion
```bash
# Add to ~/.config/fish/config.fish
grok completion fish | source
```

## Aliases and Shortcuts

### Common Aliases
```bash
# Add to shell config
alias g='grok'
alias gi='grok --interactive'
alias gf='grok --fast'
alias gd='grok --debug'
```

### Shell Functions
```bash
# Quick file analysis
grok_file() {
  grok "analyze this file: $1"
}

# Project overview  
grok_overview() {
  grok "give me an overview of this project"
}
```

## See Also

- [Getting Started](../getting-started/quickstart)
- [Configuration](../config/settings)
- [Interactive Mode](./interactive-mode)
- [Troubleshooting](../build/troubleshooting)