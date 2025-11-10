---
title: Code Examples
sidebar_position: 3
---

# Code Examples

Practical code examples for building custom tools, MCP servers, and extensions for Grok One-Shot.

## Custom Tool Examples

### Simple Text Processing Tool

```typescript
import { Tool, ToolResult } from "../core/types";

export class TextProcessorTool implements Tool {
  name = "text-processor";
  description =
    "Process text with various transformations (uppercase, lowercase, reverse, etc.)";

  parameters = {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "Text to process",
      },
      operation: {
        type: "string",
        enum: ["uppercase", "lowercase", "reverse", "word-count", "char-count"],
        description: "Type of processing to apply",
      },
    },
    required: ["text", "operation"],
  };

  async execute(params: {
    text: string;
    operation: string;
  }): Promise<ToolResult> {
    try {
      let result: string;

      switch (params.operation) {
        case "uppercase":
          result = params.text.toUpperCase();
          break;
        case "lowercase":
          result = params.text.toLowerCase();
          break;
        case "reverse":
          result = params.text.split("").reverse().join("");
          break;
        case "word-count":
          result = `Word count: ${params.text.trim().split(/\s+/).length}`;
          break;
        case "char-count":
          result = `Character count: ${params.text.length}`;
          break;
        default:
          throw new Error(`Unknown operation: ${params.operation}`);
      }

      return {
        success: true,
        output: result,
        metadata: {
          originalLength: params.text.length,
          operation: params.operation,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Text processing failed: ${error.message}`,
      };
    }
  }
}
```

### File Analytics Tool

```typescript
import fs from "fs/promises";
import path from "path";
import { Tool, ToolResult } from "../core/types";

export class FileAnalyticsTool implements Tool {
  name = "file-analytics";
  description =
    "Analyze files and directories for size, type, and content statistics";

  parameters = {
    type: "object",
    properties: {
      targetPath: {
        type: "string",
        description: "Path to file or directory to analyze",
      },
      includeHidden: {
        type: "boolean",
        description: "Include hidden files in analysis",
        default: false,
      },
    },
    required: ["targetPath"],
  };

  async execute(params: {
    targetPath: string;
    includeHidden?: boolean;
  }): Promise<ToolResult> {
    try {
      const stats = await fs.stat(params.targetPath);

      if (stats.isFile()) {
        return await this.analyzeFile(params.targetPath);
      } else if (stats.isDirectory()) {
        return await this.analyzeDirectory(
          params.targetPath,
          params.includeHidden,
        );
      } else {
        return {
          success: false,
          error: "Path is neither a file nor a directory",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `File analysis failed: ${error.message}`,
      };
    }
  }

  private async analyzeFile(filePath: string): Promise<ToolResult> {
    const stats = await fs.stat(filePath);
    const content = await fs
      .readFile(filePath, "utf-8")
      .catch(() => "[Binary file]");
    const ext = path.extname(filePath);

    const analysis = {
      type: "file",
      size: stats.size,
      extension: ext,
      lines: content === "[Binary file]" ? 0 : content.split("\n").length,
      characters: content.length,
      words:
        content === "[Binary file]"
          ? 0
          : content.split(/\s+/).filter(Boolean).length,
      created: stats.birthtime,
      modified: stats.mtime,
      isBinary: content === "[Binary file]",
    };

    return {
      success: true,
      output: JSON.stringify(analysis, null, 2),
      metadata: analysis,
    };
  }

  private async analyzeDirectory(
    dirPath: string,
    includeHidden = false,
  ): Promise<ToolResult> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const analysis = {
      type: "directory",
      totalFiles: 0,
      totalDirectories: 0,
      totalSize: 0,
      fileTypes: {} as Record<string, number>,
      largestFile: { name: "", size: 0 },
      files: [] as any[],
    };

    for (const entry of entries) {
      if (!includeHidden && entry.name.startsWith(".")) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);

      if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        analysis.totalFiles++;
        analysis.totalSize += stats.size;

        const ext = path.extname(entry.name) || "no-extension";
        analysis.fileTypes[ext] = (analysis.fileTypes[ext] || 0) + 1;

        if (stats.size > analysis.largestFile.size) {
          analysis.largestFile = { name: entry.name, size: stats.size };
        }

        analysis.files.push({
          name: entry.name,
          size: stats.size,
          extension: ext,
          modified: stats.mtime,
        });
      } else if (entry.isDirectory()) {
        analysis.totalDirectories++;
      }
    }

    return {
      success: true,
      output: JSON.stringify(analysis, null, 2),
      metadata: analysis,
    };
  }
}
```

### API Client Tool

```typescript
import axios from "axios";
import { Tool, ToolResult } from "../core/types";

export class APIClientTool implements Tool {
  name = "api-client";
  description =
    "Make HTTP requests to APIs with authentication and error handling";

  parameters = {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "API endpoint URL",
      },
      method: {
        type: "string",
        enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        description: "HTTP method",
        default: "GET",
      },
      headers: {
        type: "object",
        description: "Request headers",
        additionalProperties: { type: "string" },
      },
      body: {
        type: "object",
        description: "Request body (for POST/PUT/PATCH)",
      },
      timeout: {
        type: "number",
        description: "Request timeout in milliseconds",
        default: 10000,
      },
    },
    required: ["url"],
  };

  async execute(params: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
  }): Promise<ToolResult> {
    try {
      const response = await axios({
        url: params.url,
        method: (params.method || "GET") as any,
        headers: params.headers,
        data: params.body,
        timeout: params.timeout || 10000,
        validateStatus: () => true, // Don't throw on HTTP errors
      });

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      };

      return {
        success: response.status >= 200 && response.status < 300,
        output: JSON.stringify(result, null, 2),
        metadata: {
          url: params.url,
          method: params.method || "GET",
          status: response.status,
          responseTime: response.headers["x-response-time"] || "unknown",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `API request failed: ${error.message}`,
        metadata: {
          url: params.url,
          method: params.method || "GET",
        },
      };
    }
  }
}
```

## MCP Server Examples

### Simple Node.js MCP Server

```javascript
#!/usr/bin/env node

const { MCPServer } = require("@modelcontextprotocol/sdk");

class SimpleMCPServer extends MCPServer {
  constructor() {
    super("simple-server", "1.0.0");
    this.setupTools();
  }

  setupTools() {
    // Register a simple calculator tool
    this.addTool({
      name: "calculate",
      description: "Perform basic arithmetic calculations",
      inputSchema: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description:
              'Mathematical expression to evaluate (e.g., "2 + 3 * 4")',
          },
        },
        required: ["expression"],
      },
      handler: this.handleCalculation.bind(this),
    });

    // Register a UUID generator tool
    this.addTool({
      name: "generate-uuid",
      description: "Generate a random UUID",
      inputSchema: {
        type: "object",
        properties: {
          version: {
            type: "number",
            enum: [1, 4],
            description: "UUID version (1 or 4)",
            default: 4,
          },
        },
      },
      handler: this.handleUUIDGeneration.bind(this),
    });
  }

  async handleCalculation(params) {
    try {
      // Simple and safe expression evaluation
      const expression = params.expression.replace(/[^0-9+\-*/().\s]/g, "");
      const result = Function('"use strict"; return (' + expression + ")")();

      return {
        content: [
          {
            type: "text",
            text: `Result: ${result}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Invalid expression - ${error.message}`,
          },
        ],
      };
    }
  }

  async handleUUIDGeneration(params) {
    const { v1: uuidv1, v4: uuidv4 } = require("uuid");

    try {
      const uuid = params.version === 1 ? uuidv1() : uuidv4();

      return {
        content: [
          {
            type: "text",
            text: `Generated UUID: ${uuid}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating UUID: ${error.message}`,
          },
        ],
      };
    }
  }
}

// Start the server
if (require.main === module) {
  const server = new SimpleMCPServer();
  server.start().catch(console.error);
}

module.exports = SimpleMCPServer;
```

### Python MCP Server

```python
#!/usr/bin/env python3
import json
import sys
import asyncio
from typing import Dict, Any

class PythonMCPServer:
    def __init__(self):
        self.tools = {
            'text-analysis': {
                'description': 'Analyze text for readability, sentiment, and statistics',
                'input_schema': {
                    'type': 'object',
                    'properties': {
                        'text': {'type': 'string', 'description': 'Text to analyze'},
                        'analysis_type': {
                            'type': 'string',
                            'enum': ['readability', 'sentiment', 'statistics', 'all'],
                            'default': 'all'
                        }
                    },
                    'required': ['text']
                }
            },
            'hash-text': {
                'description': 'Generate various hashes of input text',
                'input_schema': {
                    'type': 'object',
                    'properties': {
                        'text': {'type': 'string', 'description': 'Text to hash'},
                        'algorithm': {
                            'type': 'string',
                            'enum': ['md5', 'sha1', 'sha256', 'sha512'],
                            'default': 'sha256'
                        }
                    },
                    'required': ['text']
                }
            }
        }

    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        method = request.get('method')

        if method == 'tools/list':
            return {
                'tools': [
                    {'name': name, **tool_info}
                    for name, tool_info in self.tools.items()
                ]
            }

        elif method == 'tools/call':
            tool_name = request['params']['name']
            arguments = request['params']['arguments']

            if tool_name == 'text-analysis':
                return await self.analyze_text(arguments)
            elif tool_name == 'hash-text':
                return await self.hash_text(arguments)
            else:
                return {'error': f'Unknown tool: {tool_name}'}

        return {'error': f'Unknown method: {method}'}

    async def analyze_text(self, params: Dict[str, Any]) -> Dict[str, Any]:
        text = params['text']
        analysis_type = params.get('analysis_type', 'all')

        results = {}

        if analysis_type in ['statistics', 'all']:
            words = text.split()
            sentences = text.split('.')

            results['statistics'] = {
                'characters': len(text),
                'characters_no_spaces': len(text.replace(' ', '')),
                'words': len(words),
                'sentences': len([s for s in sentences if s.strip()]),
                'paragraphs': len(text.split('\n\n')),
                'avg_words_per_sentence': len(words) / max(len(sentences), 1)
            }

        if analysis_type in ['readability', 'all']:
            # Simple readability metrics
            words = text.split()
            sentences = text.split('.')
            syllables = sum(self.count_syllables(word) for word in words)

            # Flesch Reading Ease (simplified)
            if len(sentences) > 0 and len(words) > 0:
                avg_sentence_length = len(words) / len(sentences)
                avg_syllables_per_word = syllables / len(words)
                flesch_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)

                results['readability'] = {
                    'flesch_reading_ease': round(flesch_score, 2),
                    'avg_sentence_length': round(avg_sentence_length, 2),
                    'avg_syllables_per_word': round(avg_syllables_per_word, 2)
                }

        return {
            'content': [{
                'type': 'text',
                'text': json.dumps(results, indent=2)
            }]
        }

    async def hash_text(self, params: Dict[str, Any]) -> Dict[str, Any]:
        import hashlib

        text = params['text']
        algorithm = params.get('algorithm', 'sha256')

        hash_func = getattr(hashlib, algorithm)()
        hash_func.update(text.encode('utf-8'))
        hash_value = hash_func.hexdigest()

        return {
            'content': [{
                'type': 'text',
                'text': f'{algorithm.upper()} hash: {hash_value}'
            }]
        }

    def count_syllables(self, word: str) -> int:
        """Simple syllable counting algorithm"""
        word = word.lower()
        vowels = 'aeiouy'
        syllables = 0
        prev_was_vowel = False

        for char in word:
            if char in vowels:
                if not prev_was_vowel:
                    syllables += 1
                prev_was_vowel = True
            else:
                prev_was_vowel = False

        # Handle silent 'e'
        if word.endswith('e'):
            syllables -= 1

        return max(syllables, 1)

    async def start(self):
        """Start the MCP server"""
        for line in sys.stdin:
            try:
                request = json.loads(line.strip())
                response = await self.handle_request(request)
                print(json.dumps(response))
                sys.stdout.flush()
            except json.JSONDecodeError:
                print(json.dumps({'error': 'Invalid JSON'}))
                sys.stdout.flush()
            except Exception as e:
                print(json.dumps({'error': str(e)}))
                sys.stdout.flush()

if __name__ == '__main__':
    server = PythonMCPServer()
    asyncio.run(server.start())
```

## Hook Examples

### Pre-commit Hook

```bash
#!/bin/bash
# pre-commit-hook.sh
# Automatically format code before tool execution

echo "🔍 Running pre-commit checks..."

# Check if we're in a git repository
if [ -d ".git" ]; then
    # Run linter if package.json exists
    if [ -f "package.json" ]; then
        echo "📝 Running ESLint..."
        npm run lint --silent 2>/dev/null || echo "⚠️ No lint script found"

        echo "🎨 Running Prettier..."
        npx prettier --write . 2>/dev/null || echo "⚠️ Prettier not available"
    fi

    # Check for Python files
    if find . -name "*.py" -type f | head -1 | grep -q .; then
        echo "🐍 Running Black formatter..."
        python -m black . 2>/dev/null || echo "⚠️ Black not available"

        echo "📊 Running flake8..."
        python -m flake8 . 2>/dev/null || echo "⚠️ flake8 not available"
    fi

    echo "✅ Pre-commit checks complete"
else
    echo "📁 Not in a git repository, skipping checks"
fi
```

### Post-tool Hook

```bash
#!/bin/bash
# post-tool-hook.sh
# Run after tool execution to clean up and notify

TOOL_NAME="$1"
TOOL_SUCCESS="$2"

echo "🔧 Post-tool cleanup for: $TOOL_NAME"

# Clean temporary files
find /tmp -name "grok-*" -mtime +1 -delete 2>/dev/null || true

# If a file was modified, add to git (if in git repo)
if [ "$TOOL_SUCCESS" = "true" ] && [ -d ".git" ]; then
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        echo "📝 Detected file changes, staging for commit..."
        git add -A

        # Optional: Auto-commit with tool information
        # git commit -m "feat: changes made by $TOOL_NAME tool"
    fi
fi

# Send notification (macOS example)
if command -v osascript >/dev/null 2>&1; then
    if [ "$TOOL_SUCCESS" = "true" ]; then
        osascript -e 'display notification "Tool execution completed successfully" with title "Grok One-Shot"'
    else
        osascript -e 'display notification "Tool execution failed" with title "Grok One-Shot"'
    fi
fi

echo "🏁 Post-tool cleanup complete"
```

## Configuration Examples

### Advanced Settings Configuration

```json
{
  "apiKey": "${GROK_API_KEY}",
  "model": "grok-2-1212",
  "name": "Developer",
  "confirmations": false,
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/dev/projects"
      ],
      "env": {
        "PATH": "/usr/local/bin:/usr/bin:/bin"
      }
    },
    "github": {
      "command": "node",
      "args": ["/usr/local/lib/node_modules/github-mcp-server/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}",
        "GITHUB_ORG": "my-org"
      }
    },
    "database": {
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--dsn", "${DATABASE_URL}"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    },
    "custom-analytics": {
      "command": "python3",
      "args": ["/path/to/my-mcp-server.py"],
      "env": {
        "API_KEY": "${ANALYTICS_API_KEY}",
        "DEBUG": "false"
      }
    }
  },
  "hooks": [
    {
      "name": "pre-commit",
      "trigger": "before-tool-call",
      "command": "./scripts/pre-commit-hook.sh",
      "cwd": "."
    },
    {
      "name": "post-tool",
      "trigger": "after-tool-call",
      "command": "./scripts/post-tool-hook.sh",
      "env": {
        "NOTIFICATION_WEBHOOK": "${SLACK_WEBHOOK}"
      }
    }
  ]
}
```

These examples provide practical starting points for extending Grok One-Shot with custom functionality. For more detailed implementation guides, see the [Developer Getting Started](/docs/developers/getting-started) and [API Reference](/docs/developers/api-reference) pages.
