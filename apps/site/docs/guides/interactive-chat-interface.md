---
sidebar_label: Interactive Chat Interface
---

# Interactive Chat Interface

The Interactive Chat Interface provides three modes of interaction to balance speed and quality based on task complexity:

- **Chat Mode** (`/interactivity chat`): Immediate responses for all queries
- **Balanced Mode** (`/interactivity balanced`): Research phase + options + confirmation for complex tasks (now default)
- **REPL Mode** (`/interactivity repl`): Full research-confirm-proceed cycle for all operations

## Default Behavior

Balanced mode is now the default for new installations. It automatically detects request complexity:

- **Simple requests**: Immediate responses (maintains current speed)
- **Complex requests**: Interactive workflow with research, options, and confirmation

## Workflow

### Research Phase

- Agent explains investigation approach with progress indicators
- User sees what will be researched and how

### Findings Presentation

- Options grid with recommendations and reasoning
- Clear explanations of each option's pros/cons

### Confirmation Workflow

- Keyboard shortcuts: `y` (yes), `n` (no), `m` (modify), `c` (cancel)
- State persistence across steps
- Easy abort capability

## Commands

- `/interactivity chat`: Switch to immediate mode
- `/interactivity balanced`: Switch to balanced mode (default)
- `/interactivity repl`: Switch to full interactive mode

## Configuration

Settings are saved to `~/.xcli/config.json` and persist across sessions.

## Backward Compatibility

- Simple queries remain fast
- Easy opt-out with `/interactivity chat`
- First-run notice informs users of the change

## Benefits

- Better quality for complex operations
- User control prevents unintended actions
- Learning opportunity to see AI reasoning
- Foundation for sophisticated interactions

## Migration

Existing users: Opt-in initially, then gradual rollout.
New users: Enabled by default with easy switching.
