# MCP Integration

Extend Grok One-Shot with custom tools and data sources using the Model Context Protocol.

## Overview

Model Context Protocol (MCP) is an open protocol that allows Grok One-Shot to connect to external tools, APIs, and data sources. Think of MCP servers as "plugins" that give the AI new capabilities beyond its built-in tools.

## What is MCP?

MCP provides a standardized way for AI applications to:
- **Access external data** - Databases, filesystems, APIs
- **Execute custom tools** - Domain-specific operations
- **Integrate services** - Third-party platforms
- **Extend capabilities** - Add new features without modifying core code

**Architecture:**
```
┌──────────────────┐
│  Grok One-Shot   │
│   (MCP Client)   │
└────────┬─────────┘
         │
         │ MCP Protocol
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐ ┌──▼────┐
│ File  │ │GitHub │ │Custom │
│System │ │ MCP   │ │  MCP  │
│ MCP   │ │Server │ │Server │
└───────┘ └───────┘ └───────┘
```

## Managing MCP Servers

### Adding a Server

```bash
x-cli mcp add <name> "<command>"
```

**Examples:**
```bash
# Filesystem access
x-cli mcp add filesystem "npx -y @modelcontextprotocol/server-filesystem"

# GitHub integration
x-cli mcp add github "node github-mcp-server/dist/index.js"

# Custom server
x-cli mcp add myserver "python /path/to/my-mcp-server.py"
```

### Listing Servers

```bash
x-cli mcp list
```

**Output:**
```
Configured MCP servers:
  • filesystem: npx -y @modelcontextprotocol/server-filesystem
  • github: node github-mcp-server/dist/index.js
  • myserver: python /path/to/my-mcp-server.py
```

### Removing a Server

```bash
x-cli mcp remove <name>
```

**Example:**
```bash
x-cli mcp remove filesystem
✅ Removed MCP server: filesystem
```

## Using MCP Servers

### Automatic Tool Discovery

Once configured, MCP servers are automatically:
1. **Started** when you launch Grok One-Shot
2. **Connected** via the MCP protocol
3. **Queried** for available tools
4. **Made available** to the AI

**You don't need to do anything special** - the AI knows how to use MCP tools automatically.

### Example Usage

With filesystem MCP server configured:

```
> List all TypeScript files in the project

[AI automatically uses filesystem MCP tool]

Found 47 TypeScript files:
• src/index.ts
• src/agent/grok-agent.ts
• src/ui/components/chat-interface.tsx
...
```

With GitHub MCP server configured:

```
> Show me recent issues in this repository

[AI uses GitHub MCP tool]

Recent Issues:
#123: Add authentication support (open)
#122: Fix mobile layout (closed)
#121: Performance optimization (open)
```

## Official MCP Servers

### Filesystem Server

Access local filesystem with permissions.

**Installation:**
```bash
x-cli mcp add filesystem "npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/directory"
```

**Capabilities:**
- Read/write files
- List directories
- Search files
- Create/delete files (with permissions)

**Configuration:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
    }
  }
}
```

### Database Servers

Connect to databases (PostgreSQL, MySQL, SQLite).

**Example (PostgreSQL):**
```bash
x-cli mcp add postgres "npx -y @modelcontextprotocol/server-postgres postgres://localhost/mydb"
```

**Capabilities:**
- Execute SQL queries
- Schema inspection
- Data analysis
- Query optimization suggestions

### GitHub Server

Interact with GitHub repositories.

**Installation:**
```bash
# Requires GitHub MCP server setup first
x-cli mcp add github "node github-mcp-server/dist/index.js"
```

**Capabilities:**
- List issues/PRs
- Create/update issues
- Read repository data
- Manage labels and milestones

## Building Custom MCP Servers

### Quick Start

Create a simple MCP server in Python:

```python
#!/usr/bin/env python3
# my-mcp-server.py

import json
import sys

def handle_request(request):
    method = request.get("method")

    if method == "tools/list":
        return {
            "tools": [
                {
                    "name": "greet",
                    "description": "Say hello",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"}
                        }
                    }
                }
            ]
        }

    elif method == "tools/call":
        tool = request["params"]["name"]
        args = request["params"]["arguments"]

        if tool == "greet":
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Hello, {args['name']}!"
                    }
                ]
            }

    return {"error": "Unknown method"}

# MCP protocol: read from stdin, write to stdout
for line in sys.stdin:
    request = json.loads(line)
    response = handle_request(request)
    print(json.dumps(response))
    sys.stdout.flush()
```

**Add to Grok One-Shot:**
```bash
chmod +x my-mcp-server.py
x-cli mcp add myserver "./my-mcp-server.py"
```

### MCP Protocol Basics

**Communication:** JSON-RPC over stdin/stdout

**Key methods:**
- `initialize` - Server handshake
- `tools/list` - List available tools
- `tools/call` - Execute a tool
- `resources/list` - List available resources (optional)
- `resources/read` - Read a resource (optional)

**Tool Schema:**
```json
{
  "name": "tool_name",
  "description": "What this tool does",
  "inputSchema": {
    "type": "object",
    "properties": {
      "param1": {"type": "string", "description": "Parameter description"}
    },
    "required": ["param1"]
  }
}
```

### Complete Example

See the [MCP Specification](https://modelcontextprotocol.io) for complete documentation and examples.

## Best Practices

### Server Configuration

**Do:**
- ✅ Use specific allowed directories for filesystem access
- ✅ Configure minimal required permissions
- ✅ Use environment variables for secrets
- ✅ Test servers independently before adding to Grok One-Shot

**Don't:**
- ❌ Grant root filesystem access
- ❌ Hardcode API keys in commands
- ❌ Run untrusted MCP servers
- ❌ Skip input validation in custom servers

### Performance

**Tips:**
- MCP servers start on demand (first tool use)
- Servers stay running for session duration
- Multiple MCP tools can be used in single request
- Failed servers don't block other operations

### Security

**Important:**
- MCP servers run with **your user permissions**
- Filesystem server can only access explicitly allowed directories
- Database servers need connection credentials
- Custom servers inherit your shell environment

**Recommendation:** Only use trusted MCP servers or thoroughly audit custom ones.

## Troubleshooting

### Server Won't Start

**Symptoms:**
```
❌ Failed to start MCP server: filesystem
```

**Solutions:**
1. Verify command works independently:
   ```bash
   npx -y @modelcontextprotocol/server-filesystem /path/to/dir
   ```
2. Check file permissions
3. Verify dependencies installed
4. Check server logs

### Tools Not Available

**Symptoms:** AI doesn't use MCP tools

**Causes:**
- Server started but failed tool discovery
- Tool schema invalid
- Server crashed after startup

**Solution:**
```bash
# Check configured servers
x-cli mcp list

# Remove and re-add server
x-cli mcp remove problematic-server
x-cli mcp add problematic-server "command"

# Test in new session
x-cli
> Use the filesystem tool to list files
```

### Slow Performance

**Causes:**
- Server processing takes time
- Network latency (for remote servers)
- Large data transfers

**Solutions:**
- Use more specific requests
- Implement caching in custom servers
- Optimize server queries
- Consider local vs remote servers

## Advanced Configuration

### Settings File

MCP servers stored in `~/.x-cli/settings.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/home/user/projects"
      ],
      "env": {
        "DEBUG": "mcp:*"
      }
    }
  }
}
```

**Manual editing:**
```bash
vim ~/.x-cli/settings.json
```

### Environment Variables

Pass environment variables to MCP servers:

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["github-mcp-server/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}",
        "DEBUG": "true"
      }
    }
  }
}
```

## Real-World Examples

### Example 1: Enhanced File Operations

```bash
# Add filesystem MCP
x-cli mcp add filesystem "npx -y @modelcontextprotocol/server-filesystem $(pwd)"

# Use in session
x-cli
> Find all files modified in the last 24 hours and analyze their changes
```

### Example 2: Database Analysis

```bash
# Add PostgreSQL MCP
x-cli mcp add db "npx -y @modelcontextprotocol/server-postgres postgresql://localhost/mydb"

# Use in session
x-cli
> Analyze database schema and suggest optimizations for slow queries
```

### Example 3: GitHub Workflow

```bash
# Add GitHub MCP
x-cli mcp add github "node github-mcp-server/dist/index.js"

# Use in session
x-cli
> Create a new issue for implementing user authentication,
  add labels "enhancement" and "priority:high",
  and assign it to the current milestone
```

## See Also

- [Subagents](./subagents.md) - Autonomous task execution
- [Troubleshooting](./troubleshooting.md) - Common issues
- [Configuration](../configuration/settings.md) - Advanced settings
- [MCP Specification](https://modelcontextprotocol.io) - Official documentation

---

MCP enables infinite extensibility - connect Grok One-Shot to any tool, API, or data source you need.
