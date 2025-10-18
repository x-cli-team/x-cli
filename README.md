## 1.0.87 – Stability Release

This release includes latest updates and automated publishing via GitHub Actions.
- Fixes all Read/Update tool reliability issues
- Ensures consistent FS imports (`node:` namespace)
- Adds proper Node shebang for global installs
- Temporarily removes experimental features (e.g. compress)

---

# Grok CLI

[![NPM Version](https://img.shields.io/npm/v/grok-cli-hurry-mode?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/grok-cli-hurry-mode)
[![GitHub Release](https://img.shields.io/github/v/release/hinetapora/grok-cli-hurry-mode?style=for-the-badge&logo=github&color=181717)](https://github.com/hinetapora/grok-cli-hurry-mode/releases)
[![Downloads](https://img.shields.io/npm/dm/grok-cli-hurry-mode?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/grok-cli-hurry-mode)
[![License](https://img.shields.io/github/license/hinetapora/grok-cli-hurry-mode?style=for-the-badge&color=green)](https://github.com/hinetapora/grok-cli-hurry-mode/blob/main/LICENSE)
[![Discord](https://img.shields.io/badge/Discord-xAI_Community-5865F2?style=for-the-badge&logo=discord)](https://discord.com/channels/1315720379607679066/1315822328139223064)

A conversational AI CLI tool powered by Grok with **Claude Code-level intelligence** and advanced tool capabilities.

```
                     @@@@@#                          %@@@@@
                     @@@@@#                          %@@@@@
                     @@@@@#                          %@@@@@
                           @@@@@                @@@@@
                           @@@@@                @@@@@
                           @@@@@                @@@@@
                     @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                     @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                     @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                     @@@@@@     @@@@@@@@@@@@@@@@     @@@@@@
               @@@@@@@@@@@#      @@@@@@@@@@@@@@      #@@@@@@@@@@@
               @@@@@@@@@@@#      @@@@@@@@@@@@@@      #@@@@@@@@@@@
               @@@@@@@@@@@@      @@@@@@@@@@@@@@      @@@@@@@@@@@@
          @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
          @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
          @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
          @@@@@      @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@      @@@@@
          @@@@@      @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@      @@@@@
          @@@@@      @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@      @@@@@
          @@@@@      @@@@@@                          @@@@@@      @@@@@+
          @@@@@      @@@@@@                          @@@@@@      @@@@@+
          @@@@@      @@@@@@                          @@@@@@      @@@@@+
          @@@@@      @@@@@#                          #@@@@@      @@@@@+

                           @@@@@@@@@        @@@@@@@@@
                           @@@@@@@@@        @@@@@@@@@
                           @@@@@@@@          @@@@@@@@
                     @@@@@#                          #@@@@@
                     @@@@@#                          %@@@@@
                     @@@@@#                          %@@@@@
```

## 🔗 Quick Links

- **📦 [NPM Package](https://www.npmjs.com/package/grok-cli-hurry-mode)** - Install globally with `npm install -g grok-cli-hurry-mode`
- **🐙 [GitHub Repository](https://github.com/hinetapora/grok-cli-hurry-mode)** - Source code, issues, and contributions
- **💬 [xAI Community Discord](https://discord.com/channels/1315720379607679066/1315822328139223064)** - Official xAI API community support
- **📚 [Releases](https://github.com/hinetapora/grok-cli-hurry-mode/releases)** - Version history and changelogs

## 🆕 What's New in v1.0+

### 🧠 **P2: Code Intelligence Tools** (Latest)
- **🔍 AST Parser**: Language-specific syntax tree analysis for TypeScript, JavaScript, Python
- **🔎 Symbol Search**: Fuzzy search across codebases with cross-references and usage analysis
- **📊 Dependency Analyzer**: Circular dependency detection and dependency graph generation
- **🎯 Code Context**: Semantic analysis with quality metrics and design pattern detection
- **🔧 Refactoring Assistant**: Safe rename, extract, inline operations with preview and rollback

### 🚀 **P1: Enhanced File Operations** 
- **⚡ Multi-File Editor**: Atomic operations with transaction support and rollback
- **🔍 Advanced Search Tool**: Regex patterns with bulk replace and context-aware results
- **🌳 File Tree Operations**: Visual trees, bulk operations, and intelligent file organization
- **🧠 Code-Aware Editor**: Syntax-aware editing with smart refactoring capabilities
- **📚 Operation History**: Comprehensive undo/redo system with persistent history

**🎯 Result**: **Claude Code-level capabilities** in your terminal!

### 🛠️ **P3: Reliability & Workflow Enhancements** (Latest)
- **🤖 .agent System**: AI-powered task management and documentation system for efficient workflows
- **🔧 Healer Script**: Automated issue detection and resolution for tool reliability
- **⚡ FsPort Abstraction**: Improved file system operations with Node built-ins externalization
- **📦 Automated Installer**: Enhanced installation UX with one-click setup options
- **🛡️ Tool Reliability Fixes**: Standardized imports, syntax error resolution, and fallback mechanisms

## ✨ Features

### 🧠 **Claude Code-Level Intelligence**
- **🔍 AST Code Analysis**: Parse TypeScript, JavaScript, Python files to extract symbols, imports, and structure
- **🔎 Symbol Search**: Fuzzy search for functions, classes, variables across entire codebases
- **📊 Dependency Analysis**: Detect circular dependencies and generate dependency graphs
- **🎯 Code Context**: Intelligent relationship mapping with semantic analysis and quality metrics
- **🔧 Safe Refactoring**: Rename, extract, inline operations with preview and rollback support

### 🚀 **Advanced File Operations** 
- **⚡ Multi-File Editing**: Atomic operations across multiple files with transaction support
- **🔍 Advanced Search**: Regex patterns with bulk replace and context-aware results
- **🌳 File Tree Operations**: Visual directory trees, bulk operations, and file organization
- **📚 Operation History**: Comprehensive undo/redo with persistent history and snapshots
- **🚀 Morph Fast Apply**: Optional high-speed code editing at 4,500+ tokens/sec with 98% accuracy

### 🤖 **Core AI Capabilities**
- **💬 Conversational Interface**: Natural language powered by Grok models
- **🔧 Intelligent Tool Selection**: AI automatically chooses the right tools for your requests
- **⚡ Bash Integration**: Execute shell commands through natural conversation
- **🔌 MCP Extension**: Extend capabilities with Model Context Protocol servers (Linear, GitHub, etc.)
- **💻 Beautiful Terminal UI**: Interactive interface built with Ink and Claude Code-style animations

### 📚 **Documentation System**
- **🏗️ Agent Documentation**: Complete `.agent/` system for AI context optimization
- **📖 Interactive Commands**: `/docs` menu, `/readme` generation, `/api-docs`, `/changelog`
- **🔄 Smart Updates**: `/update-agent-docs` with configurable auto-triggers
- **🤖 Subagent Framework**: Token-optimized processing with specialized agents
- **🛡️ Self-Healing**: `/heal` command captures incidents and generates guardrails
- **📝 Code Comments**: `/comments` command for automatic code documentation

### 🌍 **Installation & Setup**
- **📦 Global Installation**: Install anywhere with `npm install -g grok-cli-hurry-mode`
- **⚙️ Flexible Configuration**: Environment variables, user settings, or project-specific configs
- **🔄 CI/CD Ready**: Headless mode perfect for automation and scripting

## Installation

### Prerequisites
- Node.js 18+ (Node.js 20+ recommended)

### 🚀 Quick Install

**Option 1: Latest version with npm (Recommended)**
```bash
npm install -g grok-cli-hurry-mode@latest
```

**Option 2: Try without installing (using npx)**
```bash
npx grok-cli-hurry-mode@latest
```

**Option 3: Alternative package managers**
```bash
# Using Yarn
yarn global add grok-cli-hurry-mode@latest

# Using pnpm  
pnpm add -g grok-cli-hurry-mode@latest

# Using bun
bun add -g grok-cli-hurry-mode@latest
```

### 🛠️ PATH Setup (If `grok` command not found)

After installation, if you get "command not found", add npm's global bin to your PATH:

**macOS/Linux:**
```bash
# Add to ~/.zshrc (macOS) or ~/.bashrc (Linux)
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Or for bash users:
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Windows:**
```bash
# PowerShell
$npmPath = npm config get prefix
$env:PATH += ";$npmPath"
```

**Verify installation:**
```bash
grok --version  # Should show current version
which grok      # Should show installation path
```

### ⚡ Quick Start (One-liner)
```bash
npm install -g grok-cli-hurry-mode@latest && \
echo 'export GROK_API_KEY=your_api_key_here' >> ~/.zshrc && \
source ~/.zshrc && \
grok --help
```

### Local Development
```bash
git clone <repository>
cd grok-cli
npm install
npm run build
npm link
```

## Setup

1. Get your Grok API key from [X.AI](https://x.ai)

2. Set up your API key (choose one method):

**Method 1: Environment Variable**
```bash
export GROK_API_KEY=your_api_key_here
```

**Method 2: .env File**
```bash
cp .env.example .env
# Edit .env and add your API key
```

**Method 3: Command Line Flag**
```bash
grok --api-key your_api_key_here
```

**Method 4: User Settings File**
Create `~/.grok/user-settings.json`:
```json
{
  "apiKey": "your_api_key_here"
}
```

3. (Optional, Recommended) Get your Morph API key from [Morph Dashboard](https://morphllm.com/dashboard/api-keys)

4. Set up your Morph API key for Fast Apply editing (choose one method):

**Method 1: Environment Variable**
```bash
export MORPH_API_KEY=your_morph_api_key_here
```

**Method 2: .env File**
```bash
# Add to your .env file
MORPH_API_KEY=your_morph_api_key_here
```

### Custom Base URL (Optional)

By default, the CLI uses `https://api.x.ai/v1` as the Grok API endpoint. You can configure a custom endpoint if needed (choose one method):

**Method 1: Environment Variable**
```bash
export GROK_BASE_URL=https://your-custom-endpoint.com/v1
```

**Method 2: Command Line Flag**
```bash
grok --api-key your_api_key_here --base-url https://your-custom-endpoint.com/v1
```

**Method 3: User Settings File**
Add to `~/.grok/user-settings.json`:
```json
{
  "apiKey": "your_api_key_here",
  "baseURL": "https://your-custom-endpoint.com/v1"
}
```

## Configuration Files

Grok CLI uses two types of configuration files to manage settings:

### User-Level Settings (`~/.grok/user-settings.json`)

This file stores **global settings** that apply across all projects. These settings rarely change and include:

- **API Key**: Your Grok API key
- **Base URL**: Custom API endpoint (if needed)
- **Default Model**: Your preferred model (e.g., `grok-code-fast-1`)
- **Available Models**: List of models you can use

**Example:**
```json
{
  "apiKey": "your_api_key_here",
  "baseURL": "https://api.x.ai/v1",
  "defaultModel": "grok-code-fast-1",
  "models": [
    "grok-code-fast-1",
    "grok-4-latest",
    "grok-3-latest",
    "grok-3-fast",
    "grok-3-mini-fast"
  ]
}
```

### Project-Level Settings (`.grok/settings.json`)

This file stores **project-specific settings** in your current working directory. It includes:

- **Current Model**: The model currently in use for this project
- **MCP Servers**: Model Context Protocol server configurations

**Example:**
```json
{
  "model": "grok-3-fast",
  "mcpServers": {
    "linear": {
      "name": "linear",
      "transport": "stdio",
      "command": "npx",
      "args": ["@linear/mcp-server"]
    }
  }
}
```

### How It Works

1. **Global Defaults**: User-level settings provide your default preferences
2. **Project Override**: Project-level settings override defaults for specific projects
3. **Directory-Specific**: When you change directories, project settings are loaded automatically
4. **Fallback Logic**: Project model → User default model → System default (`grok-code-fast-1`)

This means you can have different models for different projects while maintaining consistent global settings like your API key.

### Using Other API Providers

**Important**: Grok CLI uses **OpenAI-compatible APIs**. You can use any provider that implements the OpenAI chat completions standard.

**Popular Providers**:
- **X.AI (Grok)**: `https://api.x.ai/v1` (default)
- **OpenAI**: `https://api.openai.com/v1`
- **OpenRouter**: `https://openrouter.ai/api/v1`
- **Groq**: `https://api.groq.com/openai/v1`

**Example with OpenRouter**:
```json
{
  "apiKey": "your_openrouter_key",
  "baseURL": "https://openrouter.ai/api/v1",
  "defaultModel": "anthropic/claude-3.5-sonnet",
  "models": [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o",
    "meta-llama/llama-3.1-70b-instruct"
  ]
}
```

## Usage

### Interactive Mode

Start the conversational AI assistant:
```bash
grok
```

Or specify a working directory:
```bash
grok -d /path/to/project
```

### Headless Mode

Process a single prompt and exit (useful for scripting and automation):
```bash
grok --prompt "show me the package.json file"
grok -p "create a new file called example.js with a hello world function"
grok --prompt "run bun test and show me the results" --directory /path/to/project
grok --prompt "complex task" --max-tool-rounds 50  # Limit tool usage for faster execution
```

This mode is particularly useful for:
- **CI/CD pipelines**: Automate code analysis and file operations
- **Scripting**: Integrate AI assistance into shell scripts
- **Terminal benchmarks**: Perfect for tools like Terminal Bench that need non-interactive execution
- **Batch processing**: Process multiple prompts programmatically

### Tool Execution Control

By default, Grok CLI allows up to 400 tool execution rounds to handle complex multi-step tasks. You can control this behavior:

```bash
# Limit tool rounds for faster execution on simple tasks
grok --max-tool-rounds 10 --prompt "show me the current directory"

# Increase limit for very complex tasks (use with caution)
grok --max-tool-rounds 1000 --prompt "comprehensive code refactoring"

# Works with all modes
grok --max-tool-rounds 20  # Interactive mode
grok git commit-and-push --max-tool-rounds 30  # Git commands
```

**Use Cases**:
- **Fast responses**: Lower limits (10-50) for simple queries
- **Complex automation**: Higher limits (500+) for comprehensive tasks
- **Resource control**: Prevent runaway executions in automated environments

### Model Selection

You can specify which AI model to use with the `--model` parameter or `GROK_MODEL` environment variable:

**Method 1: Command Line Flag**
```bash
# Use Grok models
grok --model grok-code-fast-1
grok --model grok-4-latest
grok --model grok-3-latest
grok --model grok-3-fast

# Use other models (with appropriate API endpoint)
grok --model gemini-2.5-pro --base-url https://api-endpoint.com/v1
grok --model claude-sonnet-4-20250514 --base-url https://api-endpoint.com/v1
```

**Method 2: Environment Variable**
```bash
export GROK_MODEL=grok-code-fast-1
grok
```

**Method 3: User Settings File**
Add to `~/.grok/user-settings.json`:
```json
{
  "apiKey": "your_api_key_here",
  "defaultModel": "grok-code-fast-1"
}
```

**Model Priority**: `--model` flag > `GROK_MODEL` environment variable > user default model > system default (grok-code-fast-1)

### Command Line Options

```bash
grok [options]

Options:
  -V, --version          output the version number
  -d, --directory <dir>  set working directory
  -k, --api-key <key>    Grok API key (or set GROK_API_KEY env var)
  -u, --base-url <url>   Grok API base URL (or set GROK_BASE_URL env var)
  -m, --model <model>    AI model to use (e.g., grok-code-fast-1, grok-4-latest) (or set GROK_MODEL env var)
  -p, --prompt <prompt>  process a single prompt and exit (headless mode)
  --max-tool-rounds <rounds>  maximum number of tool execution rounds (default: 400)
  -h, --help             display help for command
```

### Custom Instructions

You can provide custom instructions to tailor Grok's behavior to your project by creating a `.grok/GROK.md` file in your project directory:

```bash
mkdir .grok
```

Create `.grok/GROK.md` with your custom instructions:
```markdown
# Custom Instructions for Grok CLI

Always use TypeScript for any new code files.
When creating React components, use functional components with hooks.
Prefer const assertions and explicit typing over inference where it improves clarity.
Always add JSDoc comments for public functions and interfaces.
Follow the existing code style and patterns in this project.
```

Grok will automatically load and follow these instructions when working in your project directory. The custom instructions are added to Grok's system prompt and take priority over default behavior.

## Morph Fast Apply (Optional)

Grok CLI supports Morph's Fast Apply model for high-speed code editing at **4,500+ tokens/sec with 98% accuracy**. This is an optional feature that provides lightning-fast file editing capabilities.

**Setup**: Configure your Morph API key following the [setup instructions](#setup) above.

### How It Works

When `MORPH_API_KEY` is configured:
- **`edit_file` tool becomes available** alongside the standard `str_replace_editor`
- **Optimized for complex edits**: Use for multi-line changes, refactoring, and large modifications
- **Intelligent editing**: Uses abbreviated edit format with `// ... existing code ...` comments
- **Fallback support**: Standard tools remain available if Morph is unavailable

**When to use each tool:**
- **`edit_file`** (Morph): Complex edits, refactoring, multi-line changes
- **`str_replace_editor`**: Simple text replacements, single-line edits

### Example Usage

With Morph Fast Apply configured, you can request complex code changes:

```bash
grok --prompt "refactor this function to use async/await and add error handling"
grok -p "convert this class to TypeScript and add proper type annotations"
```

The AI will automatically choose between `edit_file` (Morph) for complex changes or `str_replace_editor` for simple replacements.

## MCP Tools

Grok CLI supports MCP (Model Context Protocol) servers, allowing you to extend the AI assistant with additional tools and capabilities.

### Adding MCP Tools

#### Add a custom MCP server:
```bash
# Add an stdio-based MCP server
grok mcp add my-server --transport stdio --command "bun" --args server.js

# Add an HTTP-based MCP server
grok mcp add my-server --transport http --url "http://localhost:3000"

# Add with environment variables
grok mcp add my-server --transport stdio --command "python" --args "-m" "my_mcp_server" --env "API_KEY=your_key"
```

#### Add from JSON configuration:
```bash
grok mcp add-json my-server '{"command": "bun", "args": ["server.js"], "env": {"API_KEY": "your_key"}}'
```

### Linear Integration Example

To add Linear MCP tools for project management:

```bash
# Add Linear MCP server
grok mcp add linear --transport sse --url "https://mcp.linear.app/sse"
```

This enables Linear tools like:
- Create and manage Linear issues
- Search and filter issues
- Update issue status and assignees
- Access team and project information

### Managing MCP Servers

```bash
# List all configured servers
grok mcp list

# Test server connection
grok mcp test server-name

# Remove a server
grok mcp remove server-name
```

### Available Transport Types

- **stdio**: Run MCP server as a subprocess (most common)
- **http**: Connect to HTTP-based MCP server
- **sse**: Connect via Server-Sent Events

## Development

```bash
# Install dependencies
npm install

# Development mode
bun run dev

# Build project
npm run build

# Run linter
bun run lint

# Type check
bun run typecheck
```

### Pre-commit Hooks

This project uses [Husky](https://typicode.github.com/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to run automated checks before commits:

- **ESLint**: Automatically fixes linting issues and checks for errors
- **TypeScript**: Runs type checking to prevent compilation errors
- **Staged files only**: Only checks files that are staged for commit

The pre-commit hook runs `npx lint-staged`, which processes `*.{ts,tsx}` files with:
1. `eslint --fix` - Auto-fix linting issues where possible
2. `tsc --noEmit` - Type check without emitting files

If checks fail, the commit is blocked until issues are resolved.

## 🤖 Automated Release System

**Status**: ✅ **FULLY AUTOMATED** (as of 2025-10-17)

### How It Works

Every push to the `main` branch automatically:

1. **🔄 Bumps version** (patch increment: 1.0.X → 1.0.X+1)
2. **📝 Updates README** with new version number
3. **🏗️ Builds the project** with fresh dependencies
4. **📦 Publishes to NPM** at https://www.npmjs.com/package/grok-cli-hurry-mode
5. **🏷️ Creates git tag** (e.g., `v1.0.87`)

**⏱️ Timeline**: ~3-5 minutes from push to NPM availability

### What You Need to Do

**Nothing!** Just push your changes to main:

```bash
git add .
git commit -m "your feature/fix"
git push origin main
# ✨ Automation handles the rest!
```

### 🚨 Critical Dependencies

**⚠️ DO NOT MODIFY without understanding the full impact:**

#### GitHub Secrets (Required)
- **`PAT_TOKEN`**: Personal Access Token with repo permissions (for git operations)
- **`NPM_TOKEN`**: NPM Automation token from `grok_cli` account (for publishing)

#### Package Configuration (Sacred Settings)
```json
{
  "name": "grok-cli-hurry-mode",  // ⚠️ NEVER change - breaks publishing
  "publishConfig": {
    "access": "public"            // ⚠️ Must NOT include registry override
  }
}
```

#### Workflow File (`.github/workflows/release.yml`)
**⚠️ This took multiple attempts to get working - modify with extreme caution!**

### 🔧 Manual Release (Emergency Only)

If automation fails and you need to publish immediately:

```bash
# 1. Bump version locally
npm version patch  # or minor/major

# 2. Test build
npm run build
npm run local  # Test CLI locally

# 3. Manual publish
npm publish --access public

# 4. Push changes
git push origin main --follow-tags

# 5. Fix automation before next release!
```

### 📊 Monitoring

- **GitHub Actions**: https://github.com/hinetapora/grok-cli-hurry-mode/actions
- **NPM Package**: https://www.npmjs.com/package/grok-cli-hurry-mode
- **Release History**: Check git tags or NPM version history

### 🛠️ Troubleshooting

If automation fails:

1. **Check GitHub Actions logs** for specific errors
2. **Verify secrets** (`PAT_TOKEN`, `NPM_TOKEN`) haven't expired
3. **Confirm package.json** name hasn't been modified
4. **See documentation**: `.agent/sop/npm-publishing-troubleshooting.md`

**Common Issues**:
- **Build fails**: Usually Rollup dependency cache (auto-fixed with clean install)
- **Publish fails**: Check NPM token is valid and from correct account
- **Git push fails**: Verify PAT_TOKEN has repo permissions

### 📚 Related Documentation

- **📋 Release Management**: `.agent/sop/release-management.md`
- **🚨 Incident History**: `.agent/incidents/incident-npm-publish-failure.md`  
- **🔧 Troubleshooting**: `.agent/sop/npm-publishing-troubleshooting.md`

---

## Architecture

- **Agent**: Core command processing and execution logic
- **Tools**: Text editor and bash tool implementations
- **UI**: Ink-based terminal interface components
- **Types**: TypeScript definitions for the entire system

## License

MIT

## Credits

This project is based on [grok-cli](https://github.com/superagent-ai/grok-cli) by [@pelaseyed](https://x.com/pelaseyed).

## Troubleshooting

### Installation Issues

**🚨 "Command not found: grok"**
```bash
# Check if grok is installed
npm list -g grok-cli-hurry-mode

# If installed but not in PATH, add npm global bin to PATH:
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify it works
grok --version
```

**🚨 "Permission denied" during installation**
```bash
# Option 1: Use npx (no installation needed)
npx grok-cli-hurry-mode@latest

# Option 2: Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Option 3: Configure npm to use different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

**🚨 "Cannot find module" errors**
```bash
# Clear npm cache and reinstall
npm cache clean --force
npm uninstall -g grok-cli-hurry-mode
npm install -g grok-cli-hurry-mode@latest
```

**🚨 Outdated version**
```bash
# Check current version
grok --version
npm view grok-cli-hurry-mode version

# Update to latest
npm update -g grok-cli-hurry-mode@latest
```

### Tool Execution Errors

If you encounter errors like `fs.readFile is not a function` or `fs.stat is not a function` when using file operations:

1. **This is a known issue** with the tool infrastructure
2. **Automatic fallback**: The CLI will automatically fall back to bash commands for file operations
3. **Warning messages**: You may see console warnings like "str_replace_editor tool failed, falling back to bash"
4. **Functionality**: Despite the warnings, operations should still work via bash fallbacks

This issue is being tracked and the fallbacks ensure the CLI remains functional.

### Runtime Issues

**🚨 API Key errors**
```bash
# Set your API key (replace with your actual key)
export GROK_API_KEY=your_actual_api_key_here

# Or add to your shell profile permanently
echo 'export GROK_API_KEY=your_actual_api_key_here' >> ~/.zshrc
source ~/.zshrc

# Verify it's set
echo $GROK_API_KEY
```

**🚨 Network/connectivity issues**
```bash
# Test with verbose output
grok --verbose "test message"

# Check API endpoint connectivity
curl -I https://api.x.ai/v1/models
```

### Common Issues

- **File operations fail**: Check that the file path exists and is accessible
- **Bash commands fail**: Ensure you have the necessary permissions
- **Tool timeouts**: Complex operations may take time; the spinner indicates progress
- **Slow responses**: Try a different model with `grok --model grok-code-fast-1`

