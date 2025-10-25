---
title: Quickstart
---

# Quickstart

Get started with Grok CLI in under 5 minutes.

## Quick Start (No Installation)

```bash
# Run immediately with API key
GROK_API_KEY=your_api_key_here npx -y grok-cli-hurry-mode@latest
```

Or install globally:

```bash
npm install -g grok-cli-hurry-mode@latest
```

## Configuration

Set your API key (choose one method):

```bash
# Method 1: Environment variable
export GROK_API_KEY=your_api_key_here

# Method 2: Pass inline with npx
GROK_API_KEY=your_api_key_here npx -y grok-cli-hurry-mode@latest

# Method 3: Command flag (if installed globally)  
grok --api-key your_api_key_here
```

## First Command

```bash
grok "Help me understand this project"
```

## Interactive Mode Features

Once in interactive mode, these keyboard shortcuts enhance your workflow:

- **`Shift+Tab` (twice)** - **🎯 Enter Plan Mode** - Claude Code's signature read-only exploration
- **`Ctrl+I`** - Toggle context tooltip (workspace insights, git branch, project stats)
- **`Shift+Tab`** - Toggle auto-edit mode (hands-free file editing)
- **`Ctrl+C`** - Clear current input
- **`Esc`** - Interrupt current operation
- **`exit`** - Quit the application

## 🎯 Try Plan Mode

Experience Claude Code's signature feature:

```bash
# 1. Start Grok CLI
GROK_API_KEY=your_key npx -y grok-cli-hurry-mode@latest
# Or if installed globally: grok

# 2. Press Shift+Tab twice quickly
# 3. Ask for a complex feature
"Add user authentication to this project"

# 4. Watch Plan Mode analyze your codebase safely
# 5. Review the generated implementation plan
# 6. Approve to execute or refine as needed
```

Plan Mode provides safe, read-only exploration with AI-powered implementation planning.

## Professional UX Experience

Grok CLI provides Claude Code-level visual feedback:

- **Contextual Spinners**: 8 operation-specific animated indicators
- **Progress Indicators**: Real-time progress with ETA calculations
- **Context Awareness**: Instant workspace insights with `Ctrl+I`
- **Professional Design**: Unified color system with smooth animations

## Next Steps

- [Browse tools and capabilities](../architecture/overview)
- [View full installation guide](./installation)