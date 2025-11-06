# Quickstart Guide

Get up and running with Grok One-Shot in under 5 minutes.

## Prerequisites

- **Node.js 18+** or **Bun runtime** (recommended)
- **Grok API key** from xAI (get one at [x.ai](https://x.ai))
- **Terminal** with 256-color support

## Installation

### Option 1: npm (Recommended for Most Users)

```bash
# Install globally
npm install -g @xagent/one-shot

# Verify installation (requires API key - see next section)
# For now, check if command exists:
which x-cli
# Output: /usr/local/bin/x-cli (or similar path)
```

**Note**: The `--version` and `--help` flags currently require an API key. Set your API key first (next section), then you can run:
```bash
x-cli --version
# Output: 1.1.101 (or current version)
```

### Option 2: Bun (Fastest - 4x faster than npm)

```bash
# Install globally with Bun
bun install -g @xagent/one-shot

# Verify installation
x-cli --version
```

### Option 3: From Source (For Development)

```bash
# Clone repository
git clone https://github.com/x-cli-team/x-cli.git
cd x-cli

# Install dependencies
bun install  # or: npm install

# Build
bun run build  # or: npm run build

# Link globally
npm link

# Verify
x-cli --version
```

## First Run

### Step 1: Set Your API Key

You have two options:

**Option A: Environment Variable (Recommended)**

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export GROK_API_KEY="your-xai-api-key-here"

# Reload your shell or run:
source ~/.bashrc  # or ~/.zshrc
```

**Option B: Interactive Prompt**

```bash
# Run x-cli without API key
x-cli

# You'll be prompted to enter your API key
# It will be saved to ~/.x-cli/settings.json
```

### Step 2: Run Your First Command

```bash
# Start interactive mode
x-cli

# You'll see the welcome banner and prompt:
#
#   Welcome to X-CLI v1.1.101 ⚡
#
#   🚀 Claude Code-level intelligence in your terminal!
#
#   💬 Interactive Chat:
#
#   Ask me anything! Try:
#   • "What files are in this directory?"
#   • "Fix the bug in user-service.ts"
#   • "Add tests for the authentication module"
#
#   🛠️  Power Features:
#
#   • Auto-edit mode: Press Shift+Tab to toggle hands-free editing
#   • Project memory: Create .xcli/GROK.md to customize behavior
#   • Documentation: Run "/init-agent" for .agent docs system
#
#   Type /help for commands, /exit to quit
#
# >
```

### Step 3: Try Basic Commands

**Ask a simple question:**
```
> What files are in this directory?
```

**Request a code explanation:**
```
> Explain what package.json does
```

**Get coding help:**
```
> How do I read a file in TypeScript?
```

## Quick Examples

### Example 1: Code Analysis

```bash
x-cli "Analyze the main entry point and explain what it does"
```

The AI will:
1. Find and read the entry point file
2. Analyze the code structure
3. Explain functionality in clear terms

### Example 2: Multi-File Editing

```bash
x-cli
> Add error handling to all API calls in src/services/
```

The AI will:
1. Find all API-related files
2. Analyze current error handling
3. Suggest improvements
4. Request confirmation before changes
5. Apply changes consistently

### Example 3: Debugging

```bash
x-cli
> I'm getting a TypeError in user-service.ts, can you help debug it?
```

The AI will:
1. Read the problematic file
2. Analyze the error context
3. Suggest fixes
4. Optionally apply the fix for you

## Interactive Mode Basics

### Starting a Session

```bash
# Basic start
x-cli

# With initial message
x-cli "message here"

# Quiet mode (no banner)
x-cli -q "message here"

# Specific directory
x-cli -d /path/to/project
```

### Common Commands in Interactive Mode

**Slash Commands:**
- `/help` - Show available commands
- `/exit` or `/quit` - Exit the session
- Type any question or request at the prompt

**Keyboard Shortcuts:**
- `Ctrl+C` - Interrupt current operation or exit
- `Ctrl+D` - Exit session
- `Arrow Up/Down` - Navigate command history

### Approval System

When the AI wants to modify files or run commands, you'll see an interactive confirmation dialog:

```
┌─ Confirmation ────────────────────────────────┐
│                                               │
│ Operation: Edit file                          │
│ File: src/index.ts                           │
│                                               │
│ Options (use ↑/↓ or Tab to navigate):        │
│                                               │
│ > Yes                                         │
│   Yes, and don't ask again this session      │
│   No                                          │
│   No, with feedback                           │
│                                               │
│ Press Enter to confirm, Esc to cancel        │
└───────────────────────────────────────────────┘
```

**Navigation:**
- `↑/↓` or `Tab/Shift+Tab` - Navigate options
- `Enter` - Confirm selected option
- `Esc` - Cancel operation

**Options explained:**
- **Yes** - Approve this single operation
- **Yes, and don't ask again** - Approve all operations this session
- **No** - Reject this operation
- **No, with feedback** - Reject and provide explanation to the AI

**Disable confirmations globally:**
```bash
x-cli toggle-confirmations
```

## Headless Mode (Non-Interactive)

For automation, use the `-p` flag:

```bash
# Single-shot query
x-cli -p "List all TODO comments in the codebase"

# Multiple commands
x-cli -p "Run tests and report failures"

# In scripts
x-cli -p "Generate API documentation" > docs/api.md
```

Headless mode:
- Executes and exits immediately
- No interactive prompts
- Outputs to stdout
- Perfect for CI/CD pipelines

## Configuration

### View Current Settings

```bash
# Settings stored in ~/.x-cli/settings.json
cat ~/.x-cli/settings.json
```

### Set Your Name (For Personalization)

```bash
x-cli set-name "Your Name"

# The AI will address you by name in responses
```

### Configure Model

```bash
# Default model: grok-2-1212
# Set in environment or settings.json:
export GROK_MODEL="grok-beta"
```

### MCP Server Setup

```bash
# Add an MCP server
x-cli mcp add server-name "command to start server"

# List MCP servers
x-cli mcp list

# Remove MCP server
x-cli mcp remove server-name
```

## Common Workflows

### Workflow 1: Code Review

```bash
x-cli
> Review the changes in src/auth/ and suggest improvements
```

### Workflow 2: Feature Implementation

```bash
x-cli
> I need to add user authentication to this API.
> Can you help me plan the implementation?
```

The AI will enter research mode, analyze options, and present a plan for your approval.

### Workflow 3: Debugging

```bash
x-cli
> The app crashes when I click the submit button.
> Can you investigate the event handlers?
```

### Workflow 4: Documentation

```bash
x-cli -p "Generate README documentation for all exported functions in src/utils/"
```

## Session Management

### Where Sessions Are Saved

```bash
# View saved sessions
ls ~/.x-cli/sessions/

# Each session includes:
# - Full conversation history
# - Token usage tracking
# - Timestamps
# - Metadata
```

### Resuming Work

Currently, sessions auto-save but don't auto-resume. You can:
1. Reference past session files
2. Copy/paste relevant context into new sessions
3. Ask the AI to read past session files

## Troubleshooting

### "No API key found"

**Error message you'll see:**
```
❌ No API key found. Set GROK_API_KEY environment variable.
```

**Solutions:**

**Option 1: Environment Variable (Recommended)**
```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, or ~/.profile)
export GROK_API_KEY="xai-your-actual-api-key-here"

# Reload your shell
source ~/.bashrc  # or ~/.zshrc

# Verify it's set
echo $GROK_API_KEY
# Output: xai-your-actual-api-key-here
```

**Option 2: Pass via flag (temporary - for testing)**
```bash
GROK_API_KEY="xai-your-key" x-cli
```

**Get your API key:**
- Go to https://console.x.ai
- Create an account or sign in
- Navigate to API Keys section
- Generate a new API key
- Key format: `xai-` followed by alphanumeric characters

### "Error: X CLI requires an interactive terminal"

**Solution:**
```bash
# Use headless mode instead
x-cli -p "your message"

# Or ensure you're in a proper TTY
# (not redirected or in a non-interactive context)
```

### "Command not found: x-cli"

**Solution:**
```bash
# Reinstall globally
npm install -g @xagent/one-shot

# Or ensure npm global bin is in PATH
export PATH="$PATH:$(npm bin -g)"

# For Bun users
export PATH="$PATH:$HOME/.bun/bin"
```

### Slow Performance

**Solutions:**
1. **Use Bun instead of Node.js** (4x faster)
   ```bash
   # Install Bun
   curl -fsSL https://bun.sh/install | bash

   # Reinstall x-cli with Bun
   bun install -g @xagent/one-shot
   ```

2. **Check internet connection** (API calls require network)

3. **Reduce context** (fewer large files loaded)

### Debug Logging

Check the startup log:
```bash
# In your current directory
cat xcli-startup.log

# Enable debug mode
export GROK_DEBUG=true
x-cli
```

## What's Next?

Now that you're set up, explore:

1. **[Interactive Mode Guide](../reference/interactive-mode.md)** - Master the interactive experience
2. **[CLI Reference](../reference/cli-reference.md)** - Complete command documentation
3. **[Common Workflows](./common-workflows.md)** - Real-world usage examples
4. **[Configuration](../configuration/settings.md)** - Customize your setup

## Getting Help

- **In-app help**: Type `/help` in interactive mode
- **CLI help**: Run `x-cli --help`
- **Documentation**: See GROK.md in project root
- **Issues**: Report at GitHub repository
- **Updates**: Check `x-cli --version` regularly

---

**Ready to dive deeper?** Continue to [Interactive Mode Guide](../reference/interactive-mode.md) →
