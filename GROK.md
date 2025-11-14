# Grok One-Shot - AI-Powered CLI Assistant

**Version**: 1.2.0
**Built with**: Grok API (xAI), TypeScript, React/Ink
**Purpose**: Terminal-based AI assistant for software development

## Overview

Grok One-Shot is an interactive CLI tool that brings AI-powered assistance directly to your terminal. Built as a clone of Claude Code adapted for the Grok API, it provides intelligent code editing, research, and development workflow automation.

## Core Capabilities

- **Interactive Terminal UI**: React/Ink-based interface with rich text formatting
- **Intelligent Code Operations**: Multi-file editing, refactoring, analysis
- **Research & Planning**: Automated research workflows with approval gates
- **Context-Aware**: Loads project documentation on-demand
- **MCP Integration**: Model Context Protocol for enhanced capabilities
- **Session Management**: Auto-saves conversations with token tracking

## Quick Start

```bash
# Set API key
export GROK_API_KEY="your-key-here"

# Run interactively
grok-one-shot

# Run with initial message
grok-one-shot "analyze the authentication flow"

# Headless mode
grok-one-shot -p "list all TODO comments"
```

## Architecture

### Key Components

- **GrokAgent** (`src/agent/grok-agent.ts`): Core AI agent with streaming support
- **Chat Interface** (`src/ui/components/`): React-based terminal UI
- **Hooks System** (`src/hooks/`): React hooks for state management
- **MCP Integration** (`src/mcp/`): Model Context Protocol client
- **Context System**: On-demand documentation loading (GROK.md + docs-index.md)
- **Codebase Intelligence** (`src/services/`): Advanced indexing and semantic search
- **Plan Mode** (`src/services/`): Read-only exploration with comprehensive tooling

### Context Loading Strategy

Grok One-Shot uses an efficient on-demand context loading approach:

- **Startup**: Loads only GROK.md + docs-index.md (~700 tokens)
- **Runtime**: AI agent reads specific docs via Read tool as needed
- **Savings**: 93-96% reduction vs old auto-read system (65k-85k → 700 tokens)

## Configuration

### Environment Variables

```bash
GROK_API_KEY        # Required: xAI API key
GROK_MODEL          # Optional: Model selection (default: grok-4-fast-non-reasoning)
GROK_BASE_URL       # Optional: Custom API endpoint
MAX_TOOL_ROUNDS     # Optional: Max tool iterations (default: 400)
```

### Settings

Settings stored in `~/.grok/settings.json`:

- API key and base URL
- Model preferences
- Confirmation settings
- MCP server configurations

## Documentation Structure

All detailed documentation lives in `.agent/docs/`:

- **Architecture**: System design, data flow, module structure
- **Development**: Setup, contribution guidelines, testing
- **Features**: Detailed capability documentation
- **Operations**: Deployment, monitoring, troubleshooting
- **SOP**: Standard operating procedures and workflows
- **Tasks**: Current sprints and implementation plans

See `docs-index.md` for complete documentation map.

## Development Workflow

### Build & Run

```bash
# Install dependencies
bun install

# Development mode
bun run dev

# Build for production
bun run build

# Run tests
bun test
```

### Code Structure

```
src/
├── agent/              # GrokAgent core logic
├── commands/           # CLI subcommands (mcp, set-name, etc.)
├── hooks/              # React hooks for state management
├── mcp/                # Model Context Protocol integration
├── services/           # Business logic (codebase intelligence, Plan Mode, workflows)
├── ui/                 # Terminal UI components (React/Ink)
├── utils/              # Utilities (settings, confirmation, etc.)
└── index.ts            # Entry point

.agent/
├── docs/               # Comprehensive documentation
│   ├── architecture/   # System architecture docs
│   ├── development/    # Developer guides
│   ├── features/       # Feature documentation
│   └── operations/     # Ops and deployment
├── sop/                # Standard operating procedures
├── system/             # System configuration
└── tasks/              # Sprint plans and tasks
```

## Key Features

### 1. Advanced Codebase Intelligence ⭐ **NEW**

- **Deep Code Understanding**: Million-line codebase indexing with symbol extraction
- **Semantic Search**: Natural language code discovery ("find authentication logic")
- **Architectural Analysis**: Feature mapping and cross-cutting concern detection
- **Flow Tracing**: Execution path analysis with complexity metrics
- **Symbol Intelligence**: Complete relationship mapping and usage tracking

### 2. Plan Mode - Claude Code Parity ⭐ **COMPLETE**

- **Read-Only Exploration**: Safe codebase analysis with tool simulation
- **Strategy Formulation**: AI-powered planning with approval workflows
- **Phased Activation**: Rich visual feedback (3800+ lines of architecture)
- **Keyboard Activation**: Shift+Tab twice for instant Plan Mode

### 3. Intelligent Code Editing

- Multi-file edits with context awareness
- Refactoring with impact analysis
- Syntax-aware modifications

### 4. Research Workflows

- Automated research with approval gates
- Codebase exploration and analysis
- Recommendation generation

### 3. MCP Integration

- Extensible via Model Context Protocol
- Custom tools and capabilities
- Server management via CLI

### 4. Session Management

- Auto-saves to `~/.grok/sessions/`
- Token usage tracking
- Session replay capability

### 5. Confirmation System

- Configurable approval gates
- Operation-level control
- Session-level overrides

## Common Commands

```bash
# Interactive mode
grok-one-shot

# With initial message
grok-one-shot "analyze authentication flow"

# Headless (non-interactive)
grok-one-shot -p "list all TODOs"

# Change directory
grok-one-shot -d /path/to/project

# Model selection
grok-one-shot -m grok-4-fast-non-reasoning

# MCP server management
grok-one-shot mcp add <server-name> <command>
grok-one-shot mcp list
grok-one-shot mcp remove <server-name>

# Configuration
grok-one-shot set-name "Your Name"
grok-one-shot toggle-confirmations
```

## Best Practices

1. **Context Management**: Let AI load docs on-demand; don't pre-load everything
2. **Token Efficiency**: Use headless mode for simple queries
3. **MCP Extensions**: Add custom tools via MCP for domain-specific needs
4. **Session Review**: Check `~/.grok/sessions/` for session history
5. **Documentation**: Keep `.agent/docs/` updated via Husky pre-commit hooks

## Integration with CI/CD

Pre-commit hooks automatically:

- Sync `.agent/docs/` to `apps/site/docs/` (Docusaurus)
- Validate documentation structure
- Update doc indexes

## Troubleshooting

### Common Issues

**"No API key found"**

- Set `GROK_API_KEY` environment variable
- Or use `-k` flag: `grok-one-shot -k your-key`

**"Error: X CLI requires an interactive terminal"**

- Use `-p` flag for headless mode
- Or run in proper TTY environment

**"Too many tool rounds"**

- Increase `MAX_TOOL_ROUNDS` environment variable
- Default is 400; adjust based on task complexity

### Debug Logging

Check `xcli-startup.log` in current directory for startup diagnostics.

## Contributing

See `.agent/docs/development/contributing.md` for detailed contribution guidelines.

## License

MIT License - see LICENSE file

## Support

- Issues: File in GitHub repository
- Documentation: See `.agent/docs/` directory
- Updates: Check `grok-one-shot --version` for latest version

---

**For detailed documentation, see `docs-index.md` and `.agent/docs/` directory.**
