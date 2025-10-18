---
title: Settings
---

# Settings

Configure Grok CLI to match your development workflow and preferences.

## Configuration Levels

Grok CLI supports configuration at multiple levels:

1. **Global settings** - Apply to all projects (`~/.grok/user-settings.json`)
2. **Project settings** - Override global settings (`.grok/settings.json`) 
3. **Environment variables** - Override file settings
4. **Command line flags** - Override all other settings

## Global Configuration

### Location
```bash
# View global config path
grok config path

# Typical locations:
# macOS: ~/.grok/user-settings.json
# Linux: ~/.grok/user-settings.json  
# Windows: %USERPROFILE%\.grok\user-settings.json
```

### Basic Setup
```bash
# Set API key
grok config set apiKey "your-xai-api-key"

# Set default model
grok config set defaultModel "grok-code-fast-1"

# Set base URL (if using different endpoint)
grok config set baseURL "https://api.x.ai/v1"
```

### Example Global Config
```json
{
  "apiKey": "your-api-key-here",
  "baseURL": "https://api.x.ai/v1", 
  "defaultModel": "grok-code-fast-1",
  "models": [
    "grok-code-fast-1",
    "grok-4-latest",
    "grok-3-fast"
  ],
  "maxTokens": 4096,
  "temperature": 0.1,
  "timeout": 30000
}
```

## Project Configuration

### Setup
Create `.grok/settings.json` in your project root:

```bash
mkdir -p .grok
grok config init
```

### Example Project Config
```json
{
  "model": "grok-4-latest",
  "maxContextFiles": 50,
  "excludePatterns": [
    "node_modules/**",
    "dist/**", 
    "*.log",
    ".git/**"
  ],
  "includePatterns": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "*.md"
  ],
  "customInstructions": "This is a React TypeScript project. Always prefer functional components and hooks.",
  "mcpServers": {
    "linear": {
      "transport": "stdio",
      "command": "npx",
      "args": ["@linear/mcp-server"]
    }
  }
}
```

## Environment Variables

Override settings with environment variables:

```bash
# API Configuration
export GROK_API_KEY="your-api-key"
export GROK_BASE_URL="https://api.x.ai/v1"
export GROK_MODEL="grok-code-fast-1"

# Behavior
export GROK_MAX_TOKENS=8192
export GROK_TEMPERATURE=0.1
export GROK_TIMEOUT=60000

# Features
export GROK_DEBUG=true
export GROK_STREAMING=true
```

## Command Line Overrides

Override any setting via command line:

```bash
# Use different model for this request
grok --model grok-4-latest "analyze this code"

# Increase context limit
grok --max-tokens 8192 "complex analysis task"

# Enable debug mode
grok --debug "troubleshoot this issue"

# Use different temperature
grok --temperature 0.5 "creative writing task"
```

## Advanced Settings

### Context Management
```json
{
  "contextStrategy": "smart",
  "maxContextFiles": 100,
  "maxContextSize": "50MB",
  "prioritizeRecentFiles": true,
  "includeGitHistory": false
}
```

### Performance Tuning
```json
{
  "parallelRequests": 3,
  "cacheDuration": "1h",
  "streamingEnabled": true,
  "compressionEnabled": true
}
```

### Security Settings  
```json
{
  "allowRemoteExecution": false,
  "sandboxMode": true,
  "logSensitiveData": false,
  "requireConfirmation": ["delete", "modify"]
}
```

## Model Configuration

### Available Models
```bash
# List available models
grok models list

# Get model details
grok models info grok-code-fast-1
```

### Model Selection Strategy
```json
{
  "modelSelection": {
    "default": "grok-code-fast-1",
    "forCodeAnalysis": "grok-4-latest", 
    "forQuickQuestions": "grok-3-fast",
    "forComplexTasks": "grok-4-latest"
  }
}
```

## Custom Instructions

### Global Instructions
Add to global config:

```json
{
  "globalInstructions": "Always explain your reasoning. Prefer TypeScript over JavaScript. Use modern ES6+ syntax."
}
```

### Project Instructions
Create `.grok/GROK.md` in your project:

```markdown
# Project Instructions

This is a Next.js project using:
- TypeScript
- Tailwind CSS  
- Prisma ORM
- tRPC

## Coding Standards
- Use functional components
- Prefer server components when possible
- Always include error handling
- Write comprehensive tests
```

## Validation

### Validate Configuration
```bash
# Check current config
grok config validate

# Test API connection
grok config test

# Show effective configuration (all overrides applied)
grok config show
```

### Configuration Schema
Grok CLI validates settings against a schema:

```bash
# View schema
grok config schema

# Validate specific file
grok config validate .grok/settings.json
```

## Backup and Restore

### Backup Settings
```bash
# Backup global config
grok config backup ~/.grok-backup.json

# Backup project config  
grok config backup --project ./grok-project-backup.json
```

### Restore Settings
```bash
# Restore from backup
grok config restore ~/.grok-backup.json

# Reset to defaults
grok config reset
```

## Troubleshooting

### Common Issues

**Settings not applying:**
- Check file permissions
- Verify JSON syntax with `grok config validate`
- Ensure proper inheritance order

**API key not working:**
- Verify key at [console.x.ai](https://console.x.ai/)
- Check for trailing spaces or quotes
- Test with `grok config test`

**Performance issues:**
- Reduce `maxContextFiles`
- Enable `streamingEnabled`
- Increase `timeout` for large operations

## See Also

- [Installation](../getting-started/installation)
- [CLI Reference](../reference/cli-reference)
- [Troubleshooting](../build/troubleshooting)