---
title: Developer Quick Start
sidebar_position: 1
---

# Developer Quick Start

Get up and running with Grok One-Shot development in minutes. This guide covers everything you need to start building extensions, integrations, and custom tools.

## Development Environment Setup

### Prerequisites

```bash
# Check your versions
node --version  # 16+ required
npm --version   # or bun --version
git --version
```

### Clone and Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/x-cli.git
cd x-cli

# Install dependencies
npm install  # or bun install

# Build the project
npm run build

# Test the build
./dist/index.js --version
```

### Development Workflow

```bash
# Start development mode with auto-rebuild
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

## Project Structure

```
x-cli/
├── src/                    # Source code
│   ├── commands/          # CLI command implementations
│   ├── core/              # Core functionality
│   ├── tools/             # Built-in tools
│   ├── utils/             # Utility functions
│   └── index.ts           # Main entry point
├── docs/                  # Documentation source
├── tests/                 # Test suites
├── scripts/               # Build and utility scripts
└── packages/              # Packages and components
```

## Key Architecture Concepts

### Tool System

Grok One-Shot is built around a powerful tool system:

```typescript
// Example tool interface
interface Tool {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute(params: any): Promise<ToolResult>;
}

// Built-in tools include:
// - Bash: Execute shell commands
// - Edit: Modify files
// - Read: Read file contents
// - Write: Create/overwrite files
// - Glob: Pattern-based file finding
// - Grep: Search file contents
```

### Agent System

The core agent handles conversation flow and tool coordination:

```typescript
// Simplified agent flow
class Agent {
  async processMessage(input: string): Promise<Response> {
    // 1. Parse user intent
    // 2. Plan tool usage
    // 3. Execute tools
    // 4. Generate response
    // 5. Update context
  }
}
```

### MCP Integration

Model Context Protocol enables external tool integration:

```typescript
// MCP server configuration
interface MCPServer {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}
```

## Quick Development Tasks

### Add a New Built-in Tool

1. **Create the tool class:**

```typescript
// src/tools/my-tool.ts
export class MyTool implements Tool {
  name = "my-tool";
  description = "Description of what the tool does";

  parameters = {
    type: "object",
    properties: {
      input: { type: "string", description: "Tool input" },
    },
    required: ["input"],
  };

  async execute(params: { input: string }): Promise<ToolResult> {
    // Your tool logic here
    return {
      success: true,
      output: `Processed: ${params.input}`,
    };
  }
}
```

2. **Register the tool:**

```typescript
// src/tools/index.ts
import { MyTool } from "./my-tool";

export const builtInTools = [
  // ...existing tools,
  new MyTool(),
];
```

### Add a CLI Command

1. **Create the command:**

```typescript
// src/commands/my-command.ts
export const myCommand = {
  command: "my-command",
  description: "Description of the command",

  builder: (yargs) => {
    return yargs.option("option", {
      type: "string",
      description: "Command option",
    });
  },

  handler: async (argv) => {
    // Command implementation
    console.log("Command executed with:", argv.option);
  },
};
```

2. **Register the command:**

```typescript
// src/index.ts
import { myCommand } from "./commands/my-command";

yargs
  .command(myCommand)
  // ...other commands
  .parse();
```

### Extend MCP Support

1. **Add MCP server helper:**

```typescript
// src/mcp/my-server.ts
export class MyMCPServer {
  static getConfig(apiKey: string): MCPServerConfig {
    return {
      name: "my-service",
      command: "npx",
      args: ["-y", "@my-org/mcp-server"],
      env: {
        API_KEY: apiKey,
      },
    };
  }
}
```

2. **Add configuration helper:**

```typescript
// src/config/mcp-servers.ts
export const popularMCPServers = {
  "my-service": {
    description: "Integration with My Service",
    setup: MyMCPServer.getConfig,
    requiredEnv: ["MY_SERVICE_API_KEY"],
  },
};
```

## Testing Your Changes

### Unit Tests

```bash
# Run specific test file
npm test -- --grep "MyTool"

# Run with coverage
npm run test:coverage
```

### Integration Tests

```bash
# Test CLI commands
./dist/index.js my-command --option "test"

# Test with actual API
export GROK_API_KEY="your-key"
./dist/index.js "test prompt"
```

### Manual Testing

```bash
# Build and test locally
npm run build
npm link

# Test globally installed version
grok "test your changes"

# Unlink when done
npm unlink
```

## Debugging Tips

### Enable Debug Mode

```bash
export GROK_DEBUG=true
export GROK_UX_DEBUG=true
npm run dev
```

### Common Debug Scenarios

```bash
# Debug tool execution
export DEBUG="tool:*"

# Debug MCP server communication
export DEBUG="mcp:*"

# Debug API calls
export DEBUG="api:*"

# Debug everything
export DEBUG="*"
```

### VS Code Setup

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Grok One-Shot",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "args": ["your", "test", "args"],
      "env": {
        "GROK_DEBUG": "true",
        "GROK_API_KEY": "your-key"
      },
      "runtimeArgs": ["-r", "ts-node/register"]
    }
  ]
}
```

## Next Steps

1. **[Architecture Overview](/docs/architecture/overview)** - Understand the system design
2. **[MCP Integration](/docs/build-with-claude-code/mcp)** - Connect external tools
3. **[Custom Tools](/docs/features/custom-tools)** - Build specialized tools
4. **[Contributing Guide](/docs/community/contributing)** - Submit your improvements

## Need Help?

- **[Discord](https://discord.com/channels/1315720379607679066/1315822328139223064)** - Real-time developer chat
- **[GitHub Discussions](https://github.com/x-cli-team/x-cli/discussions)** - Technical questions
- **[GitHub Issues](https://github.com/x-cli-team/x-cli/issues)** - Bug reports and feature requests

Ready to build amazing AI-powered terminal tools? Let's code! 🚀
