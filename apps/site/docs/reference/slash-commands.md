---
title: Slash Commands Reference
---

# Slash Commands Reference

Complete reference for slash commands available in Grok One-Shot interactive mode.

## Overview

Slash commands are special commands that start with `/` and provide quick access to system functions within interactive sessions.

**Usage:**

```
> /command [arguments]
```

## Command List

### `/help`

Display available commands and shortcuts.

**Syntax:**

```
/help
```

**Output:**

```
Available Commands:
/help - Show this help message
/exit - Exit the session
/quit - Exit the session (alias)

Keyboard Shortcuts:
Ctrl+C - Interrupt or exit
Ctrl+D - Exit session
Ctrl+Y - Auto-approve all operations
Ctrl+I - Toggle context tooltip
Ctrl+M - Model selector

For complete documentation: See GROK.md
```

**Notes:**

- Available in all interactive sessions
- Shows current context-specific help
- No arguments required

---

### `/exit`

Exit the current session cleanly.

**Syntax:**

```
/exit
```

**Behavior:**

1. Saves session to `~/.x-cli/sessions/`
2. Displays token usage summary
3. Restores terminal state
4. Exits process

**Equivalent:**

- `Ctrl+D`
- `/quit` (alias)

**Example:**

```
> /exit
Session saved to: ~/.x-cli/sessions/session-2025-11-05-14-30.json
Token Usage: 45,234 tokens
Goodbye!
```

---

### `/quit`

Alias for `/exit`. Exits the session.

**Syntax:**

```
/quit
```

**Behavior:**
Identical to `/exit`.

---

## Keyboard Shortcuts

While not slash commands, these shortcuts provide similar quick-access functionality:

### `Ctrl+C`

Interrupt current operation or exit if idle.

**Behavior:**

- **During operation:** Interrupts and returns to prompt
- **At prompt:** Exits session (confirmation may be required)
- **Second press:** Forces immediate exit

**Use cases:**

- Stop long-running operations
- Cancel unwanted requests
- Emergency exit

---

### `Ctrl+D`

Exit session immediately (EOF signal).

**Behavior:**

- Clean exit, same as `/exit`
- Session auto-saved
- Token summary displayed

**Note:** Standard Unix EOF (End Of File) signal.

---

### `Ctrl+Y`

Enable auto-approve mode for current session.

**Behavior:**

- Skips all confirmation prompts for remainder of session
- Shows indicator: ` Auto-approve enabled`
- Applies to file edits and bash commands
- Resets on session exit

**Example:**

```
> [User presses Ctrl+Y]
Auto-approve enabled for this session

> Make some changes
[AI makes changes without prompting]
```

**Caution:** Use carefully - removes safety checks!

---

### `Ctrl+I`

Toggle context information tooltip.

**Shows:**

```
╔════════════════════════════════════╗
║ Project: my-app on main ║
║ Workspace: 247 files ║
║ Index: 3.2 MB ║
║ Session: 12 files ║
║ Tokens: 15,423 / 128,000 ║
║ Activity: Now ║
╚════════════════════════════════════╝
```

**Info includes:**

- Current project and Git branch
- Workspace file count and index size
- Session file count
- Token usage
- Recent activity

**Toggle:** Press `Ctrl+I` again to hide.

---

### `Ctrl+M`

Open interactive model selector.

**Interface:**

```
Select Model:
▸ grok-2-1212 (current)
grok-beta
grok-4-fast-non-reasoning

Use ↑↓ to navigate, Enter to select, Esc to cancel
```

**Available Models:**

- `grok-2-1212` - Latest stable (default)
- `grok-beta` - Beta features
- `grok-4-fast-non-reasoning` - Fastest responses

**Selection:**

- Arrow keys: Navigate
- Enter: Confirm selection
- Esc: Cancel and keep current

**Behavior:**

- Model changes apply immediately
- Saved to session settings
- Persists for current session only

---

## Command Suggestions

Type `/` at the prompt to see available commands with autocomplete:

```
> /
Available commands:
/help
/exit
/quit
```

**Navigation:**

- `↑` / `↓` - Navigate suggestions
- `Tab` - Accept highlighted suggestion
- `Enter` - Execute command
- `Esc` - Cancel

---

## Future Slash Commands

The following commands are planned for future releases:

### `/history` (TBD)

View conversation history.

```
/history [count]
```

Show last N messages from current session.

---

### `/clear` (TBD)

Clear visible terminal output while maintaining session.

```
/clear
```

---

### `/save` (TBD)

Save session to specific file.

```
/save <filename>
```

---

### `/load` (TBD)

Load previous session.

```
/load <session-file>
```

---

### `/model` (TBD)

Switch model via command.

```
/model <model-name>
```

Alternative to `Ctrl+M`.

---

### `/settings` (TBD)

View/edit session settings.

```
/settings [key] [value]
```

---

### `/stats` (TBD)

Show detailed session statistics.

```
/stats
```

Display:

- Token usage breakdown
- Files accessed
- Operations performed
- Time elapsed

---

### `/export` (TBD)

Export conversation to markdown.

```
/export <filename>
```

---

## Best Practices

### Using Slash Commands

**Do:**

- Use `/help` when exploring features
- Use `/exit` for clean shutdowns
- Press `Ctrl+I` to check token usage
- Use `Ctrl+M` to optimize model selection

**Don't:**

- Force exit with `Ctrl+C` unless necessary
- Overuse `Ctrl+Y` auto-approve (reduces safety)
- Forget `/exit` saves your session properly

### Keyboard Shortcuts

**Efficiency tips:**

1. **`Ctrl+I` frequently** - Monitor token usage
2. **`Ctrl+M` for speed** - Switch to fast model when appropriate
3. **`Ctrl+Y` carefully** - Only when you trust the operations
4. **`Ctrl+C` sparingly** - May interrupt ongoing work

### Command vs Shortcuts

**When to use slash commands:**

- Explicit, clear intent
- Discoverable via `/help`
- Scriptable (if automation added later)

**When to use shortcuts:**

- Faster access
- Standard Unix conventions (Ctrl+D, Ctrl+C)
- Muscle memory from other tools

---

## Examples

### Example 1: Quick Help Check

```
> /help
[Shows available commands]

> I need to exit
> /exit
[Clean exit with session save]
```

### Example 2: Model Switching Workflow

```
> [User presses Ctrl+M]
[Model selector appears]

> [Select grok-4-fast-non-reasoning]
Model changed to: grok-4-fast-non-reasoning

> Quick question: what's the syntax for async/await?
[Fast response received]

> [User presses Ctrl+M again]
> [Switch back to grok-2-1212]
```

### Example 3: Monitoring Token Usage

```
> [User presses Ctrl+I]
[Context tooltip shows: 85k/128k tokens]

> I need to analyze the entire codebase
Warning: High token usage (85k/128k)

> [User exits and starts new session]
> /exit
```

### Example 4: Bulk Operations

```
> I need to refactor 20 files

The AI wants to modify multiple files...
Approve? (y/n/a)

> [User presses Ctrl+Y]
Auto-approve enabled for this session

[AI proceeds with all changes without additional prompts]

> /exit
[Session ends, auto-approve disabled for next session]
```

---

## Troubleshooting

### Command Not Recognized

```
> /invalid-command
Unknown command: /invalid-command
Type /help for available commands
```

**Solution:** Check spelling or use `/help` to see available commands.

---

### Exit Not Working

```
> /exit
[Nothing happens]
```

**Solutions:**

1. Press Enter after typing `/exit`
2. Try `Ctrl+D` instead
3. Force exit with `Ctrl+C` (twice)

---

### Shortcuts Not Working

**Mac Users:**

- Some shortcuts may conflict with terminal emulator
- Check terminal preferences for key binding conflicts
- Alternative: Use slash commands instead

**Windows Users:**

- Use Windows Terminal for best experience
- Some older terminals may not support all shortcuts

**Linux Users:**

- Should work in most terminals
- Check for `tmux` or `screen` key binding conflicts

---

## See Also

- [Interactive Mode Guide](./interactive-mode.md) - Master interactive features
- [CLI Reference](./cli-reference.md) - Command-line options
- [Configuration](../configuration/settings.md) - Customize settings
- [Common Workflows](../getting-started/common-workflows.md) - Usage examples

---

**Want to learn common workflows?** Continue to [Common Workflows](../getting-started/common-workflows.md) →
