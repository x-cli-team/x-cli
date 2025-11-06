# CLI Reference

Complete reference for all Grok One-Shot command-line options and subcommands.

## Table of Contents

- [Main Command](#main-command)
- [Global Options](#global-options)
- [Subcommands](#subcommands)
- [Environment Variables](#environment-variables)
- [Exit Codes](#exit-codes)

## Main Command

### `x-cli [message] [options]`

Launch Grok One-Shot in interactive or headless mode.

**Syntax:**
```bash
x-cli [message] [options]
```

**Examples:**
```bash
# Interactive mode (no message)
x-cli

# Interactive with initial message
x-cli "explain what this code does"

# Headless mode
x-cli -p "list all TODO comments"

# Specific directory
x-cli -d /path/to/project

# Quiet mode (no banner)
x-cli -q "generate README"
```

## Global Options

### `-k, --api-key <key>`

Provide Grok API key directly via command line.

```bash
x-cli -k "your-api-key-here"
```

**Notes:**
- Overrides `GROK_API_KEY` environment variable
- Saved to `~/.x-cli/settings.json` on first use
- **Not recommended** for security (use environment variable instead)

---

### `-d, --directory <path>`

Set working directory for the session.

```bash
x-cli -d /path/to/project
x-cli --directory ~/my-app
```

**Default:** Current working directory

**Notes:**
- Path must exist
- All file operations relative to this directory
- Useful for multi-project workflows

---

### `-m, --model <model>`

Specify which Grok model to use.

```bash
x-cli -m grok-beta
x-cli --model grok-2-1212
```

**Available Models:**
- `grok-2-1212` (default) - Latest stable model
- `grok-beta` - Beta features and improvements
- `grok-4-fast-non-reasoning` - Fast responses

**Default:** `grok-2-1212`

**Notes:**
- Can also set via `GROK_MODEL` environment variable
- Saved to settings for future sessions
- Different models have different capabilities and speeds

---

### `-u, --base-url <url>`

Specify custom Grok API base URL.

```bash
x-cli -u https://api.x.ai/v1
x-cli --base-url https://custom-endpoint.com/v1
```

**Default:** `https://api.x.ai/v1`

**Notes:**
- For custom deployments or proxies
- Saved to settings on first use
- Can also set via `GROK_BASE_URL` environment variable
- Useful for enterprise deployments

---

### `--max-tool-rounds <number>`

Set maximum number of tool execution rounds.

```bash
x-cli --max-tool-rounds 500
x-cli --max-tool-rounds 100  # For simple tasks
```

**Default:** `400`

**Notes:**
- Prevents infinite loops in tool execution
- Higher values allow more complex operations
- Lower values save API costs for simple tasks
- Can also set via `MAX_TOOL_ROUNDS` environment variable

---

### `-p, --prompt <message>`

Run in headless (non-interactive) mode with a single prompt.

```bash
x-cli -p "list all files"
x-cli --prompt "analyze main.ts"
```

**Notes:**
- Executes and exits immediately
- No interactive prompts or confirmations
- Output goes to stdout
- Perfect for scripting and CI/CD
- **Requires:** Message must be provided

**Exit codes:**
- `0` - Success
- `1` - Error occurred

---

### `-q, --quiet`

Suppress welcome banner and non-essential output.

```bash
x-cli -q
x-cli --quiet "generate docs"
```

**Notes:**
- Still shows AI responses and errors
- Useful for cleaner output in scripts
- Terminal clearing disabled

---

### `-h, --help`

Display help information and exit.

```bash
x-cli --help
x-cli -h
```

**Output includes:**
- Usage syntax
- Available options
- Subcommands
- Examples

---

### `-v, --version`

Display version information and exit.

```bash
x-cli --version
x-cli -v
```

**Output format:**
```
@xagent/one-shot v1.1.101
```

## Subcommands

### `x-cli mcp`

Manage Model Context Protocol (MCP) servers.

**Usage:**
```bash
x-cli mcp <action> [args]
```

#### `mcp add <name> <command>`

Add a new MCP server.

```bash
x-cli mcp add filesystem "npx -y @modelcontextprotocol/server-filesystem"
x-cli mcp add github "node github-mcp-server/dist/index.js"
```

**Arguments:**
- `<name>` - Unique identifier for the server
- `<command>` - Command to start the server

**Notes:**
- Server configuration saved to `~/.x-cli/settings.json`
- Command should start an MCP-compatible server
- Server must implement MCP protocol

---

#### `mcp list`

List all configured MCP servers.

```bash
x-cli mcp list
```

**Output:**
```
Configured MCP servers:
  • filesystem: npx -y @modelcontextprotocol/server-filesystem
  • github: node github-mcp-server/dist/index.js
```

---

#### `mcp remove <name>`

Remove an MCP server by name.

```bash
x-cli mcp remove filesystem
```

**Arguments:**
- `<name>` - Name of the server to remove

**Notes:**
- Removes from settings permanently
- Does not affect running servers (they're started per-session)

---

### `x-cli set-name <name>`

Set your name for personalized AI responses.

```bash
x-cli set-name "Alice"
x-cli set-name "Bob Smith"
```

**Arguments:**
- `<name>` - Your preferred name

**Notes:**
- Saved to `~/.x-cli/settings.json`
- AI will use this name in responses
- Can include spaces (use quotes)

**Example:**
```bash
$ x-cli set-name "Alice"
✅ Name set to: Alice

$ x-cli
> help me debug this
Alice, I'd be happy to help you debug...
```

---

### `x-cli toggle-confirmations`

Enable or disable confirmation prompts.

```bash
x-cli toggle-confirmations
```

**Behavior:**
- **Enabled (default):** AI requests approval for file edits and bash commands
- **Disabled:** AI executes operations without confirmation

**Current status shown after toggle:**
```bash
$ x-cli toggle-confirmations
✅ Confirmations are now: disabled

$ x-cli toggle-confirmations
✅ Confirmations are now: enabled
```

**Notes:**
- Saved to `~/.x-cli/settings.json`
- Can also override per-session with `Ctrl+Y` (approve all)
- **Caution:** Disabling removes safety guardrails

## Environment Variables

### `GROK_API_KEY`

Your xAI Grok API key (required).

```bash
export GROK_API_KEY="your-api-key-here"
```

**Priority:**
1. `-k/--api-key` flag (highest)
2. `GROK_API_KEY` environment variable
3. Saved in `~/.x-cli/settings.json`
4. Interactive prompt (lowest)

---

### `GROK_MODEL`

Default model to use for API calls.

```bash
export GROK_MODEL="grok-beta"
```

**Default:** `grok-2-1212`

**Available:**
- `grok-2-1212` - Latest stable
- `grok-beta` - Beta features
- `grok-4-fast-non-reasoning` - Fast mode

---

### `GROK_BASE_URL`

Custom API endpoint (advanced).

```bash
export GROK_BASE_URL="https://custom-endpoint.example.com"
```

**Default:** `https://api.x.ai/v1`

**Use cases:**
- Proxy servers
- Testing environments
- Custom xAI deployments

---

### `MAX_TOOL_ROUNDS`

Maximum number of tool execution rounds per request.

```bash
export MAX_TOOL_ROUNDS=500
```

**Default:** 400

**Notes:**
- Prevents infinite loops
- Higher values allow more complex operations
- Lower values save tokens but may truncate complex tasks

---

### `GROK_DEBUG`

Enable debug logging.

```bash
export GROK_DEBUG=true
```

**Output:**
- Additional console logging
- Request/response details
- Token usage tracking
- Tool execution details

---

### `GROK_TEXT_COLOR`

Force specific text color for terminal output.

```bash
export GROK_TEXT_COLOR=black  # For light terminals
export GROK_TEXT_COLOR=white  # For dark terminals
```

**Default:** Auto-detected based on terminal theme

---

### `TERM_BACKGROUND`

Hint about terminal background color.

```bash
export TERM_BACKGROUND=light
export TERM_BACKGROUND=dark
```

**Used for:** Adaptive text color selection

---

### `GROK_UX_ENHANCED`

Enable/disable UX enhancements.

```bash
export GROK_UX_ENHANCED=false
```

**Default:** `true`

**Disables:**
- Spinners
- Progress bars
- Background activity indicators

---

### `GROK_UX_DEBUG`

Debug UX component rendering.

```bash
export GROK_UX_DEBUG=true
```

**Output:**
- Component lifecycle logs
- State changes
- Event handling details

## Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `0` | Success | Command completed successfully |
| `1` | Error | General error occurred |
| `2` | Invalid arguments | Command-line arguments invalid |
| `130` | Interrupted | User interrupted with Ctrl+C |

**Usage in scripts:**
```bash
#!/bin/bash

# Run headless command
x-cli -p "check code quality"

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ Success"
else
    echo "❌ Failed"
    exit 1
fi
```

## Configuration Files

### `~/.x-cli/settings.json`

Main configuration file.

**Location:** `$HOME/.x-cli/settings.json`

**Structure:**
```json
{
  "apiKey": "your-api-key",
  "baseUrl": "https://api.x.ai/v1",
  "model": "grok-2-1212",
  "name": "Your Name",
  "confirmations": true,
  "mcpServers": {
    "server-name": {
      "command": "command to start server"
    }
  }
}
```

**Editing:**
```bash
# View settings
cat ~/.x-cli/settings.json

# Edit with your preferred editor
vim ~/.x-cli/settings.json
nano ~/.x-cli/settings.json
```

---

### `~/.x-cli/sessions/`

Session history directory.

**Location:** `$HOME/.x-cli/sessions/`

**Contents:**
- One JSON file per session
- Includes full conversation history
- Token usage tracking
- Timestamps and metadata

**Management:**
```bash
# List sessions
ls ~/.x-cli/sessions/

# View a session
cat ~/.x-cli/sessions/session-2025-11-05-14-30.json

# Clean old sessions
find ~/.x-cli/sessions/ -mtime +30 -delete
```

## Advanced Usage

### Combining Options

```bash
# Headless + quiet + specific directory
x-cli -p "analyze code" -q -d ~/project

# Custom model + API key + initial message
x-cli -m grok-beta -k "key" "help me debug"
```

### Scripting Examples

**Example 1: CI/CD Integration**
```bash
#!/bin/bash
# run-ai-review.sh

set -e

echo "Running AI code review..."
x-cli -p "Review all changes in src/ and report issues" -q

if [ $? -eq 0 ]; then
    echo "✅ AI review passed"
else
    echo "❌ AI review found issues"
    exit 1
fi
```

**Example 2: Batch Documentation**
```bash
#!/bin/bash
# generate-docs.sh

for file in src/**/*.ts; do
    echo "Documenting $file..."
    x-cli -p "Generate JSDoc comments for $file" -q
done
```

**Example 3: Daily Code Analysis**
```bash
#!/bin/bash
# daily-analysis.sh

REPORT="daily-report-$(date +%Y-%m-%d).md"

x-cli -p "Analyze codebase health and generate report" -q > "$REPORT"

echo "Report saved to: $REPORT"
```

## See Also

- [Interactive Mode Guide](./interactive-mode.md) - Learn interactive features
- [Slash Commands](./slash-commands.md) - In-session commands
- [Configuration Guide](../configuration/settings.md) - Detailed configuration
- [Troubleshooting](../build-with-claude-code/troubleshooting.md) - Common issues

---

**Need help?** Type `x-cli --help` or `/help` in interactive mode.
