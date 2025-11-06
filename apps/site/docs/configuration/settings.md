---
title: Settings and Configuration
---

# Settings and Configuration

Configure Grok One-Shot to match your workflow and preferences.

## Configuration File

**Location:** `~/.x-cli/settings.json`

**Structure:**

```json
{
  "apiKey": "your-grok-api-key",
  "baseUrl": "https://api.x.ai/v1",
  "model": "grok-2-1212",
  "name": "Your Name",
  "confirmations": true,
  "mcpServers": {
    "server-name": {
      "command": "command-to-start-server",
      "args": ["arg1", "arg2"],
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```

## Core Settings

### API Configuration

**`apiKey`** - Your Grok API key (required)

```json
{
  "apiKey": "your-xai-api-key-here"
}
```

**Sources** (priority order):

1. `-k`/`--api-key` flag
2. `GROK_API_KEY` environment variable
3. `settings.json` file
4. Interactive prompt

**`baseUrl`** - API endpoint

```json
{
  "baseUrl": "https://api.x.ai/v1"
}
```

**Override:** `GROK_BASE_URL` environment variable

**`model`** - Default model to use

```json
{
  "model": "grok-2-1212"
}
```

**Options:**

- `grok-2-1212` (default) - Latest stable
- `grok-beta` - Beta features
- `grok-4-fast-non-reasoning` - Fast responses

**Override:** `GROK_MODEL` environment variable or `Ctrl+M` in session

### User Preferences

**`name`** - Your name for personalization

```json
{
  "name": "Alice"
}
```

**Set via:**

```bash
x-cli set-name "Your Name"
```

**Effect:** AI addresses you by name in responses

**`confirmations`** - Approval prompts for operations

```json
{
  "confirmations": true
}
```

**Toggle via:**

```bash
x-cli toggle-confirmations
```

**When enabled:** Prompts before file edits and bash commands
**When disabled:** Operations execute automatically (use with caution!)

## MCP Server Configuration

**`mcpServers`** - Configured MCP servers

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/home/user/projects"
      ]
    },
    "github": {
      "command": "node",
      "args": ["github-mcp-server/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**Manage via:**

```bash
x-cli mcp add \<name\> "\<command\>"
x-cli mcp list
x-cli mcp remove \<name\>
```

## Environment Variables

Environment variables override settings file values.

### Core Variables

`GROK_API_KEY` - API authentication

```bash
export GROK_API_KEY="your-key"
```

`GROK_MODEL` - Model selection

```bash
export GROK_MODEL="grok-beta"
```

`GROK_BASE_URL` - API endpoint

```bash
export GROK_BASE_URL="https://custom-endpoint.example.com"
```

`MAX_TOOL_ROUNDS` - Tool execution limit

```bash
export MAX_TOOL_ROUNDS=500
```

### UX Variables

`GROK_TEXT_COLOR` - Force text color

```bash
export GROK_TEXT_COLOR=black # For light terminals
export GROK_TEXT_COLOR=white # For dark terminals
```

`TERM_BACKGROUND` - Terminal theme hint

```bash
export TERM_BACKGROUND=light
export TERM_BACKGROUND=dark
```

`GROK_UX_ENHANCED` - Enable/disable enhancements

```bash
export GROK_UX_ENHANCED=false # Disable spinners, progress bars
```

`GROK_UX_MINIMAL` - Minimal UI mode

```bash
export GROK_UX_MINIMAL=true # Minimal resource usage
```

`GROK_UX_DEBUG` - UX debug logging

```bash
export GROK_UX_DEBUG=true
```

### Debug Variables

`GROK_DEBUG` - Enable debug output

```bash
export GROK_DEBUG=true
```

`GROK_DEBUG_COLORS` - Debug color detection

```bash
export GROK_DEBUG_COLORS=1
```

## Editing Settings

### Via Commands

```bash
# API key
x-cli -k "new-key"

# Name
x-cli set-name "Your Name"

# Confirmations
x-cli toggle-confirmations

# MCP servers
x-cli mcp add servername "command"
```

### Manual Editing

```bash
# View current settings
cat ~/.x-cli/settings.json

# Edit with your preferred editor
vim ~/.x-cli/settings.json
nano ~/.x-cli/settings.json
code ~/.x-cli/settings.json
```

**Important:** Valid JSON required. Invalid JSON will cause errors.

### Reset Settings

```bash
# Backup current settings
cp ~/.x-cli/settings.json ~/.x-cli/settings.json.backup

# Delete settings (will be recreated on next run)
rm ~/.x-cli/settings.json

# Or reset to defaults
cat > ~/.x-cli/settings.json << 'EOF'
{
"confirmations": true
}
EOF
```

## Session Storage

**Location:** `~/.x-cli/sessions/`

**Contents:**

- One JSON file per session
- Full conversation history
- Token usage tracking
- Timestamps and metadata

**Management:**

```bash
# View sessions
ls -la ~/.x-cli/sessions/

# View specific session
cat ~/.x-cli/sessions/session-2025-11-05-14-30.json

# Clean old sessions (older than 30 days)
find ~/.x-cli/sessions/ -name "*.json" -mtime +30 -delete

# Archive sessions
mkdir ~/session-archives
mv ~/.x-cli/sessions/*.json ~/session-archives/
```

## Shell Profile Configuration

Add to `~/.bashrc`, `~/.zshrc`, or equivalent:

```bash
# Grok One-Shot Configuration
export GROK_API_KEY="your-api-key-here"
export GROK_MODEL="grok-2-1212"
export MAX_TOOL_ROUNDS=400

# Optional: Terminal theme
export TERM_BACKGROUND=dark

# Optional: Debug mode
# export GROK_DEBUG=true

# Path (if needed)
export PATH="$PATH:$(npm bin -g)" # or Bun path
```

**Apply changes:**

```bash
source ~/.bashrc # or ~/.zshrc
```

## Advanced Configuration

### Custom API Endpoint

For proxy or custom deployments:

```bash
export GROK_BASE_URL="https://my-proxy.example.com/api/v1"
```

### Multiple Environments

Use shell aliases for different configurations:

```bash
# ~/.bashrc
alias grok-prod='GROK_MODEL=grok-2-1212 x-cli'
alias grok-beta='GROK_MODEL=grok-beta x-cli'
alias grok-fast='GROK_MODEL=grok-4-fast-non-reasoning x-cli'
```

Usage:

```bash
grok-prod "analyze code"
grok-beta "try new features"
grok-fast "quick question"
```

### Per-Project Settings

Use environment files:

```bash
# project/.env
GROK_MODEL=grok-beta
MAX_TOOL_ROUNDS=500
```

Load before running:

```bash
source .env && x-cli
```

### MCP Server Environment Variables

Pass secrets securely:

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["server.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}",
        "DEBUG": "true"
      }
    }
  }
}
```

Then set in shell:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

## Troubleshooting

### Settings Not Applied

**Check:**

1. File exists: `ls ~/.x-cli/settings.json`
2. Valid JSON: `python -m json.tool ~/.x-cli/settings.json`
3. Correct permissions: `chmod 644 ~/.x-cli/settings.json`

### Environment Variables Not Working

**Solutions:**

```bash
# Verify environment
printenv | grep GROK

# Check shell profile loaded
echo $GROK_API_KEY

# Reload profile
source ~/.bashrc # or ~/.zshrc
```

### MCP Servers Not Starting

**Check:**

1. Command is correct
2. Dependencies installed
3. Paths are absolute
4. Environment variables set

**Debug:**

```bash
# Test command independently
\<command from settings.json\>

# Check logs
export GROK_DEBUG=true
x-cli
```

## Best Practices

### Security

**Do:**

- Use environment variables for API keys
- Restrict file permissions: `chmod 600 ~/.x-cli/settings.json`
- Never commit settings.json to git
- Use ${VAR} references for secrets in MCP config

**Don't:**

- Share settings.json publicly
- Hardcode API keys in commands
- Give MCP servers unnecessary permissions

### Organization

**Recommendations:**

- Keep settings.json minimal
- Use environment variables for temporary changes
- Document custom configurations
- Backup settings before major changes

### Performance

**Optimize:**

- Remove unused MCP servers
- Use appropriate model for task (fast vs quality)
- Clean old sessions periodically
- Use headless mode for simple queries

## See Also

- [CLI Reference](../reference/cli-reference.md) - Command-line options
- [Terminal Configuration](./terminal-configuration.md) - Terminal setup
- [Model Configuration](./model-configuration.md) - Model settings
- [MCP Integration](../build-with-claude-code/mcp.md) - MCP servers

---

Proper configuration ensures Grok One-Shot works seamlessly with your workflow.
