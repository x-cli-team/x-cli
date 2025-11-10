---
title: API Reference
sidebar_position: 2
---

# API Reference

Complete reference for Grok One-Shot's internal APIs, interfaces, and extension points for developers building custom tools and integrations.

## Core Interfaces

### Tool Interface

The foundation for all tools in Grok One-Shot:

```typescript
interface Tool {
  /** Unique tool identifier */
  name: string;

  /** Human-readable description for the AI */
  description: string;

  /** JSON Schema defining tool parameters */
  parameters: JSONSchema7;

  /** Execute the tool with given parameters */
  execute(params: unknown): Promise<ToolResult>;

  /** Optional: Validate parameters before execution */
  validate?(params: unknown): ValidationResult;

  /** Optional: Tool-specific configuration */
  config?: ToolConfig;
}
```

### Tool Result

Standardized response format for all tools:

```typescript
interface ToolResult {
  /** Whether the tool executed successfully */
  success: boolean;

  /** Tool output content */
  output?: string;

  /** Error message if execution failed */
  error?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;

  /** Files created/modified by the tool */
  files?: FileOperation[];
}
```

### Agent Interface

Core agent system for processing user interactions:

```typescript
interface Agent {
  /** Process user input and return AI response */
  processMessage(input: string, context?: AgentContext): Promise<AgentResponse>;

  /** Get available tools for current context */
  getAvailableTools(): Tool[];

  /** Execute a specific tool */
  executeTool(name: string, params: unknown): Promise<ToolResult>;

  /** Manage conversation context */
  updateContext(context: Partial<AgentContext>): void;
}
```

## Configuration APIs

### Settings Management

Access and modify user settings:

```typescript
interface SettingsManager {
  /** Get current settings */
  getSettings(): Promise<Settings>;

  /** Update settings */
  updateSettings(partial: Partial<Settings>): Promise<void>;

  /** Reset to defaults */
  resetSettings(): Promise<void>;

  /** Validate settings */
  validateSettings(settings: Settings): ValidationResult;
}

interface Settings {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  name?: string;
  confirmations?: boolean;
  mcpServers?: Record<string, MCPServerConfig>;
}
```

### MCP Server Configuration

Define and manage MCP server connections:

```typescript
interface MCPServerConfig {
  /** Execution command */
  command: string;

  /** Command arguments */
  args: string[];

  /** Environment variables */
  env?: Record<string, string>;

  /** Server type (stdio, http, etc.) */
  type?: "stdio" | "http";

  /** HTTP server URL (for http type) */
  url?: string;

  /** Timeout in milliseconds */
  timeout?: number;
}

interface MCPManager {
  /** Add MCP server */
  addServer(name: string, config: MCPServerConfig): Promise<void>;

  /** Remove MCP server */
  removeServer(name: string): Promise<void>;

  /** List configured servers */
  listServers(): Promise<Record<string, MCPServerConfig>>;

  /** Test server connection */
  testServer(name: string): Promise<boolean>;
}
```

## Built-in Tool APIs

### File System Tools

Core file manipulation tools:

```typescript
// Read tool
interface ReadParams {
  filePath: string;
  offset?: number;
  limit?: number;
}

// Write tool
interface WriteParams {
  filePath: string;
  content: string;
}

// Edit tool
interface EditParams {
  filePath: string;
  oldString: string;
  newString: string;
  replaceAll?: boolean;
}

// Glob tool
interface GlobParams {
  pattern: string;
  path?: string;
}
```

### Execution Tools

Tools for running commands and code:

```typescript
// Bash tool
interface BashParams {
  command: string;
  description?: string;
  timeout?: number;
  runInBackground?: boolean;
}

// WebFetch tool
interface WebFetchParams {
  url: string;
  prompt: string;
  timeout?: number;
}
```

### Search Tools

Tools for finding content:

```typescript
// Grep tool
interface GrepParams {
  pattern: string;
  path?: string;
  glob?: string;
  type?: string;
  outputMode?: "content" | "files_with_matches" | "count";
  caseSensitive?: boolean;
  multiline?: boolean;
}
```

## Extension Points

### Custom Tool Development

Create custom tools by implementing the Tool interface:

```typescript
class MyCustomTool implements Tool {
  name = "my-tool";
  description = "My custom tool description";

  parameters = {
    type: "object",
    properties: {
      input: {
        type: "string",
        description: "Input parameter",
      },
    },
    required: ["input"],
  };

  async execute(params: { input: string }): Promise<ToolResult> {
    try {
      const result = await this.processInput(params.input);
      return {
        success: true,
        output: result,
        metadata: { timestamp: Date.now() },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async processInput(input: string): Promise<string> {
    // Your custom logic here
    return `Processed: ${input}`;
  }
}
```

### Tool Registration

Register custom tools with the system:

```typescript
interface ToolRegistry {
  /** Register a new tool */
  registerTool(tool: Tool): void;

  /** Unregister a tool */
  unregisterTool(name: string): void;

  /** Get tool by name */
  getTool(name: string): Tool | undefined;

  /** List all registered tools */
  listTools(): Tool[];
}

// Usage
const registry = getToolRegistry();
registry.registerTool(new MyCustomTool());
```

### Hook System

Extend functionality with hooks:

```typescript
interface Hook {
  /** Hook name/identifier */
  name: string;

  /** When the hook should trigger */
  trigger: HookTrigger;

  /** Command to execute */
  command: string;

  /** Working directory */
  cwd?: string;

  /** Environment variables */
  env?: Record<string, string>;
}

type HookTrigger =
  | "before-tool-call"
  | "after-tool-call"
  | "before-message"
  | "after-message";

interface HookManager {
  /** Register a hook */
  registerHook(hook: Hook): void;

  /** Execute hooks for a trigger */
  executeHooks(trigger: HookTrigger, context: HookContext): Promise<void>;
}
```

## Event System

### Event Types

Subscribe to system events:

```typescript
type EventType =
  | "tool-executed"
  | "settings-changed"
  | "mcp-server-connected"
  | "mcp-server-disconnected"
  | "session-started"
  | "session-ended";

interface EventData {
  type: EventType;
  timestamp: number;
  data: unknown;
}

interface EventEmitter {
  /** Subscribe to events */
  on(event: EventType, handler: (data: EventData) => void): void;

  /** Unsubscribe from events */
  off(event: EventType, handler: (data: EventData) => void): void;

  /** Emit an event */
  emit(event: EventType, data: unknown): void;
}
```

## Utility APIs

### Context Management

Manage conversation and execution context:

```typescript
interface ContextManager {
  /** Get current context */
  getContext(): AgentContext;

  /** Update context */
  updateContext(updates: Partial<AgentContext>): void;

  /** Clear context */
  clearContext(): void;

  /** Save context to disk */
  saveContext(): Promise<void>;

  /** Load context from disk */
  loadContext(): Promise<AgentContext>;
}

interface AgentContext {
  sessionId: string;
  workingDirectory: string;
  conversationHistory: Message[];
  availableTools: string[];
  mcpServers: string[];
  lastActivity: number;
}
```

### Session Management

Handle session lifecycle:

```typescript
interface SessionManager {
  /** Create new session */
  createSession(): Promise<Session>;

  /** Get session by ID */
  getSession(id: string): Promise<Session | null>;

  /** List all sessions */
  listSessions(): Promise<Session[]>;

  /** Delete session */
  deleteSession(id: string): Promise<void>;

  /** Export session */
  exportSession(id: string): Promise<SessionExport>;
}
```

## Error Handling

### Error Types

Standardized error types:

```typescript
class ToolError extends Error {
  constructor(
    public toolName: string,
    message: string,
    public cause?: Error,
  ) {
    super(message);
  }
}

class MCPError extends Error {
  constructor(
    public serverName: string,
    message: string,
    public cause?: Error,
  ) {
    super(message);
  }
}

class ConfigurationError extends Error {
  constructor(
    public setting: string,
    message: string,
  ) {
    super(message);
  }
}
```

### Error Handling Patterns

```typescript
// Tool execution with error handling
try {
  const result = await tool.execute(params);
  if (!result.success) {
    throw new ToolError(tool.name, result.error || "Tool execution failed");
  }
  return result;
} catch (error) {
  logger.error("Tool execution failed", { tool: tool.name, error });
  throw error;
}
```

## Testing APIs

### Test Utilities

Helper functions for testing custom tools and extensions:

```typescript
interface TestUtils {
  /** Create mock tool result */
  createMockResult(success: boolean, output?: string): ToolResult;

  /** Create test agent context */
  createTestContext(overrides?: Partial<AgentContext>): AgentContext;

  /** Mock MCP server */
  createMockMCPServer(name: string, tools: Tool[]): MockMCPServer;

  /** Simulate user input */
  simulateUserInput(
    input: string,
    context?: AgentContext,
  ): Promise<AgentResponse>;
}
```

## CLI Integration

### Command Registration

Add custom CLI commands:

```typescript
interface CLICommand {
  command: string;
  description: string;
  builder: (yargs: Argv) => Argv;
  handler: (argv: Arguments) => Promise<void>;
}

interface CLIManager {
  /** Register CLI command */
  registerCommand(command: CLICommand): void;

  /** Get command help */
  getCommandHelp(command: string): string;
}
```

This API reference provides the foundation for building powerful extensions and integrations with Grok One-Shot. For working examples and implementation details, see the [Developer Getting Started](/docs/developers/getting-started) guide.
