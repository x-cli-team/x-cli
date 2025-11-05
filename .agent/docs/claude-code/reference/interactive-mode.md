# Interactive Mode Guide

Master the interactive terminal experience in Grok One-Shot.

## Overview

Interactive mode is the primary way to use Grok One-Shot. It provides a conversational interface where you can ask questions, request code changes, and collaborate with the AI in real-time within your terminal.

## Starting Interactive Mode

### Basic Launch

```bash
# Start in current directory
x-cli

# Start with initial message
x-cli "explain what this project does"

# Start in specific directory
x-cli -d /path/to/project

# Quiet start (no banner)
x-cli -q
```

### What You'll See

```
╔═══════════════════════════════════════════╗
║         GROK ONE-SHOT v1.1.101            ║
║    AI-Powered Terminal Assistant          ║
╚═══════════════════════════════════════════╝

Context: /home/user/my-project │ Git: main │ Session: Auto-saved

>
```

The welcome banner shows:
- Version information
- Current working directory
- Git branch (if in repository)
- Session status

## Interface Elements

### The Prompt

```
>
```

The `>` symbol indicates Grok One-Shot is ready for input. Type your message or question and press Enter.

### Response Display

AI responses appear with:
- **Formatted text** - Markdown rendering in terminal
- **Code blocks** - Syntax highlighting
- **File references** - `file.ts:123` format for easy navigation
- **Progress indicators** - Spinners during processing

### Status Indicators

**Processing:**
```
🧠 Thinking...
```

**Streaming Response:**
```
🔍 Searching files...
📝 Writing suggestions...
```

**Completion:**
```
✅ Done
```

## Making Requests

### Natural Language

Grok One-Shot understands natural language. Be conversational:

**Good Examples:**
```
> Can you explain what the authentication module does?

> I need to add error handling to the API client.
  Can you help me with that?

> The app is crashing when I submit the form.
  Let's investigate the event handlers.

> Review the changes I made to user-service.ts
```

**Less Effective:**
```
> explain auth
> add error
> crash
```

**Tip:** Provide context and be specific about what you need.

### Code Operations

**Reading Code:**
```
> Show me the main entry point

> What does the UserController class do?

> Read the configuration file
```

**Editing Code:**
```
> Add TypeScript types to user-service.ts

> Refactor the authentication logic to use async/await

> Fix the linting errors in src/utils/
```

**Creating Code:**
```
> Create a new API endpoint for user registration

> Generate a test file for auth-service.ts

> Write a Dockerfile for this Node.js app
```

**Analyzing Code:**
```
> Find all TODO comments in the codebase

> What are the dependencies of the API module?

> Show me where the User model is used
```

### Multi-Turn Conversations

Grok One-Shot remembers context within a session:

```
> What does this function do?
[AI explains function]

> Can you optimize it?
[AI suggests optimizations]

> Apply those changes
[AI modifies the code]

> Now add unit tests
[AI creates tests]
```

## Confirmation System

### When Approvals Are Required

By default, you'll be prompted before:
- File modifications (edit, create, delete)
- Bash command execution
- Destructive operations

### Approval Prompts

```
🔧 The AI wants to:
   • Edit file: src/auth/user-service.ts
   • Create file: src/auth/__tests__/user-service.test.ts

Approve? (y/n/a)
```

**Options:**
- `y` - Approve this specific operation
- `n` - Reject this operation
- `a` - Approve all for remainder of session

### Session-Level Override

Press `Ctrl+Y` anytime to approve all operations for the current session. Confirmations will be skipped until you exit.

**Indicator:**
```
✅ Auto-approve enabled for this session
```

### Disabling Globally

```bash
# Toggle confirmations off
x-cli toggle-confirmations

# Now all sessions will skip confirmations
# (Use with caution!)
```

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Interrupt current operation or exit |
| `Ctrl+D` | Exit session |
| `Ctrl+Y` | Enable auto-approve for session |
| `Ctrl+I` | Toggle context tooltip |
| `Ctrl+M` | Open model selector |

### Input Navigation

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate command history |
| `Tab` | Accept command suggestion |
| `Enter` | Submit input |
| `Backspace` | Delete character |

### Slash Commands

| Command | Action |
|---------|--------|
| `/help` | Show available commands |
| `/exit` | Exit session |
| `/quit` | Exit session |

See [Slash Commands Reference](./slash-commands.md) for complete list.

## Session Features

### Auto-Save

Every session is automatically saved to:
```
~/.x-cli/sessions/session-YYYY-MM-DD-HH-MM.json
```

**Includes:**
- Full conversation history
- Token usage statistics
- Timestamps
- Metadata

### Token Tracking

The interface shows token usage:
```
🧠 1.2k/128.0k (1%) │ 📁 0 files │ 💬 15 msgs
```

**Indicators:**
- Current tokens / Max tokens (Percentage)
- Files read in session
- Messages exchanged

### Context Awareness

Grok One-Shot maintains awareness of:
- Current working directory
- Git repository state
- Files read in session
- Previous operations

**View context details:**
Press `Ctrl+I` to show:
```
📁 Project: my-app on main
📊 Workspace: 247 files    💾 Index: 3.2 MB
📝 Session: 12 files       🔤 Tokens: 15,423
⚡ Activity: Now
```

## Advanced Features

### Model Selection

Press `Ctrl+M` to open model selector:
```
Select Model:
  ▸ grok-2-1212 (current)
    grok-beta
    grok-4-fast-non-reasoning

Use ↑↓ to navigate, Enter to select
```

**Models:**
- `grok-2-1212` - Latest stable, best quality
- `grok-beta` - Beta features, experimental
- `grok-4-fast-non-reasoning` - Fastest responses

### Command Suggestions

Type `/` to see available slash commands:
```
> /
Available commands:
  /help - Show this help
  /exit - Exit session
  /quit - Exit session
```

Arrow keys navigate, Tab or Enter to select.

### Research Mode

For complex tasks, Grok One-Shot enters research mode:

```
> Implement user authentication with JWT tokens
```

**Flow:**
1. **Research Phase** - AI explores codebase, analyzes options
2. **Recommendation** - Presents plan with pros/cons
3. **Approval Gate** - You review and approve/reject
4. **Execution** - AI implements approved plan
5. **Documentation** - Auto-generates completion notes

**Example Output:**
```
🔍 Researching implementation options...

📋 Recommendation:
I recommend implementing JWT authentication with the following approach:

Options Analyzed:
  1. Passport.js + jsonwebtoken ✅ (Recommended)
  2. Custom JWT implementation ⚠️
  3. Auth0 integration 💰

Plan:
  1. Install dependencies (passport, jsonwebtoken)
  2. Create auth middleware
  3. Add login/logout endpoints
  4. Update existing routes with protection
  5. Add token refresh logic

Estimated Effort: 2-3 hours
Risk Level: Low

Approve this plan? (y/n)
```

### Multi-File Operations

When editing multiple files, changes are coordinated:

```
> Add input validation to all API endpoints
```

**Process:**
1. AI identifies all affected files
2. Analyzes dependencies
3. Shows complete change plan
4. Requests single approval
5. Applies changes atomically

**Safety:**
- All-or-nothing updates
- Automatic rollback on errors
- Git-friendly (one commit)

## Best Practices

### Effective Prompting

**Do:**
- ✅ Be specific about what you need
- ✅ Provide context and constraints
- ✅ Reference specific files or functions
- ✅ Ask follow-up questions
- ✅ Request explanations if unclear

**Don't:**
- ❌ Use single-word requests
- ❌ Assume the AI knows your full project
- ❌ Skip error details when debugging
- ❌ Give contradictory instructions

### Working with Large Codebases

**Strategies:**
1. **Start specific:** Reference exact files/functions
2. **Build context:** Let AI read relevant files first
3. **Confirm understanding:** Ask AI to explain before changing
4. **Incremental changes:** Break large tasks into steps

### Managing Token Usage

**Efficient practices:**
- Start new sessions for unrelated tasks
- Reference specific files instead of "everything"
- Use headless mode for simple queries
- Clear context with `/exit` and restart

**Token budget visible:**
```
🧠 45.2k/128.0k (35%) │ 📁 23 files │ 💬 67 msgs
```

When approaching limits, consider:
- Starting fresh session
- Focusing on specific areas
- Using more targeted requests

## Troubleshooting

### AI Isn't Responding

**Solutions:**
1. Check internet connection
2. Verify API key is valid: `cat ~/.x-cli/settings.json`
3. Check for errors in `xcli-startup.log`
4. Try pressing Enter again

### Responses Are Incomplete

**Causes:**
- Network interruption
- Token limit reached
- API timeout

**Solutions:**
```
> Continue from where you left off
```

Or restart the request:
```
> Let's try that again, but focus on [specific part]
```

### Unwanted File Changes

**Prevention:**
- Review changes before approving
- Use `n` to reject individual operations
- Keep confirmations enabled

**Recovery:**
```bash
# Git repositories
git diff        # Review changes
git checkout -- <file>  # Revert specific file
git reset --hard HEAD   # Revert everything

# Without Git
# Restore from backups or session history
```

### Session Is Slow

**Causes:**
- Large number of files read
- Complex operations
- Network latency

**Solutions:**
1. Start new session to clear context
2. Be more specific in requests
3. Use faster model: `Ctrl+M` → select `grok-4-fast-non-reasoning`
4. Check internet speed

## Exiting

### Clean Exit

```
> /exit
```

Or press `Ctrl+D`.

**On exit:**
- Session auto-saved to `~/.x-cli/sessions/`
- Token usage summary displayed
- Clean terminal state restored

### Force Exit

Press `Ctrl+C` twice to force exit.

**Note:** May interrupt ongoing operations.

## See Also

- [CLI Reference](./cli-reference.md) - Command-line options
- [Slash Commands](./slash-commands.md) - In-session commands
- [Common Workflows](../getting-started/common-workflows.md) - Usage examples
- [Troubleshooting](../build-with-claude-code/troubleshooting.md) - Common issues

---

**Ready to explore slash commands?** Continue to [Slash Commands Reference](./slash-commands.md) →
