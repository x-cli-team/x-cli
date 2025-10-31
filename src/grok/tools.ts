import { GrokTool } from "./client.js";
import { MCPManager, MCPTool } from "../mcp/client.js";
import { loadMCPConfig } from "../mcp/config.js";

const BASE_GROK_TOOLS: GrokTool[] = [
  {
    type: "function",
    function: {
      name: "view_file",
      description: "View file contents or list directories",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "File or directory path",
          },
          start_line: {
            type: "number",
            description: "Optional start line for partial view",
          },
          end_line: {
            type: "number",
            description: "Optional end line for partial view",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_file",
      description: "Create new file with content",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path where the file should be created",
          },
          content: {
            type: "string",
            description: "Content to write to the file",
          },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "str_replace_editor",
      description: "Replace text in file (single line edits)",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path to the file to edit",
          },
          old_str: {
            type: "string",
            description:
              "Text to replace (must match exactly, or will use fuzzy matching for multi-line strings)",
          },
          new_str: {
            type: "string",
            description: "Text to replace with",
          },
          replace_all: {
            type: "boolean",
            description:
              "Replace all occurrences (default: false, only replaces first occurrence)",
          },
        },
        required: ["path", "old_str", "new_str"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "bash",
      description: "Execute a bash command",
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "The bash command to execute",
          },
        },
        required: ["command"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search",
      description: "Search for text content or files",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Text to search for or file name/path pattern",
          },
          search_type: {
            type: "string",
            enum: ["text", "files", "both"],
            description:
              "Type of search: 'text' for content search, 'files' for file names, 'both' for both (default: 'both')",
          },
          include_pattern: {
            type: "string",
            description:
              "Glob pattern for files to include (e.g. '*.ts', '*.js')",
          },
          exclude_pattern: {
            type: "string",
            description:
              "Glob pattern for files to exclude (e.g. '*.log', 'node_modules')",
          },
          case_sensitive: {
            type: "boolean",
            description:
              "Whether search should be case sensitive (default: false)",
          },
          whole_word: {
            type: "boolean",
            description: "Whether to match whole words only (default: false)",
          },
          regex: {
            type: "boolean",
            description: "Whether query is a regex pattern (default: false)",
          },
          max_results: {
            type: "number",
            description: "Maximum number of results to return (default: 50)",
          },
          file_types: {
            type: "array",
            items: { type: "string" },
            description: "File types to search (e.g. ['js', 'ts', 'py'])",
          },
          include_hidden: {
            type: "boolean",
            description: "Whether to include hidden files (default: false)",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_todo_list",
      description: "Create a new todo list for planning and tracking tasks",
      parameters: {
        type: "object",
        properties: {
          todos: {
            type: "array",
            description: "Array of todo items",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Unique identifier for the todo item",
                },
                content: {
                  type: "string",
                  description: "Description of the todo item",
                },
                status: {
                  type: "string",
                  enum: ["pending", "in_progress", "completed"],
                  description: "Current status of the todo item",
                },
                priority: {
                  type: "string",
                  enum: ["high", "medium", "low"],
                  description: "Priority level of the todo item",
                },
              },
              required: ["id", "content", "status", "priority"],
            },
          },
        },
        required: ["todos"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_todo_list",
      description: "Update existing todos in the todo list",
      parameters: {
        type: "object",
        properties: {
          updates: {
            type: "array",
            description: "Array of todo updates",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "ID of the todo item to update",
                },
                status: {
                  type: "string",
                  enum: ["pending", "in_progress", "completed"],
                  description: "New status for the todo item",
                },
                content: {
                  type: "string",
                  description: "New content for the todo item",
                },
                priority: {
                  type: "string",
                  enum: ["high", "medium", "low"],
                  description: "New priority for the todo item",
                },
              },
              required: ["id"],
            },
          },
        },
        required: ["updates"],
      },
    },
  },
  // Intelligence tools
  {
    type: "function",
    function: {
      name: "ast_parser",
      description: "Parse source code to extract AST, symbols, imports, exports",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description: "Path to the source code file to parse"
          },
          includeSymbols: {
            type: "boolean",
            description: "Whether to extract symbols (functions, classes, variables, etc.)",
            default: true
          },
          includeImports: {
            type: "boolean", 
            description: "Whether to extract import/export information",
            default: true
          },
          includeTree: {
            type: "boolean",
            description: "Whether to include the full AST tree in response",
            default: false
          },
          symbolTypes: {
            type: "array",
            items: {
              type: "string",
              enum: ["function", "class", "variable", "interface", "enum", "type", "method", "property"]
            },
            description: "Types of symbols to extract",
            default: ["function", "class", "variable", "interface", "enum", "type"]
          },
          scope: {
            type: "string",
            enum: ["all", "global", "local"],
            description: "Scope of symbols to extract",
            default: "all"
          }
        },
        required: ["filePath"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "symbol_search",
      description: "Search for symbols across codebase with fuzzy matching",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for symbol names"
          },
          searchPath: {
            type: "string",
            description: "Root path to search in",
            default: "current working directory"
          },
          symbolTypes: {
            type: "array",
            items: {
              type: "string",
              enum: ["function", "class", "variable", "interface", "enum", "type", "method", "property"]
            },
            description: "Types of symbols to search for",
            default: ["function", "class", "variable", "interface", "enum", "type"]
          },
          includeUsages: {
            type: "boolean",
            description: "Whether to find usages of matched symbols",
            default: false
          },
          fuzzyMatch: {
            type: "boolean",
            description: "Use fuzzy matching for symbol names",
            default: true
          },
          caseSensitive: {
            type: "boolean", 
            description: "Case sensitive search",
            default: false
          },
          maxResults: {
            type: "integer",
            description: "Maximum number of results to return",
            default: 50,
            minimum: 1,
            maximum: 1000
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "dependency_analyzer",
      description: "Analyze dependencies, detect circular imports, generate graphs",
      parameters: {
        type: "object",
        properties: {
          rootPath: {
            type: "string",
            description: "Root path to analyze dependencies from",
            default: "current working directory"
          },
          filePatterns: {
            type: "array",
            items: { type: "string" },
            description: "Glob patterns for files to include",
            default: ["**/*.{ts,tsx,js,jsx}"]
          },
          excludePatterns: {
            type: "array",
            items: { type: "string" },
            description: "Glob patterns for files to exclude",
            default: ["**/node_modules/**", "**/dist/**", "**/.git/**"]
          },
          includeExternals: {
            type: "boolean",
            description: "Include external module dependencies",
            default: false
          },
          detectCircular: {
            type: "boolean",
            description: "Detect circular dependencies",
            default: true
          },
          findUnreachable: {
            type: "boolean",
            description: "Find unreachable files from entry points",
            default: true
          },
          generateGraph: {
            type: "boolean",
            description: "Generate serialized dependency graph",
            default: false
          }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "code_context",
      description: "Build code context, analyze relationships, semantic understanding",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description: "Path to the file to analyze for context"
          },
          rootPath: {
            type: "string",
            description: "Root path of the project",
            default: "current working directory"
          },
          includeRelationships: {
            type: "boolean",
            description: "Include code relationships analysis",
            default: true
          },
          includeMetrics: {
            type: "boolean",
            description: "Include code quality metrics",
            default: true
          },
          includeSemantics: {
            type: "boolean",
            description: "Include semantic analysis and patterns",
            default: true
          },
          maxRelatedFiles: {
            type: "integer",
            description: "Maximum number of related files to analyze",
            default: 10,
            minimum: 1,
            maximum: 50
          }
        },
        required: ["filePath"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "refactoring_assistant",
      description: "Perform safe refactoring: rename, extract, inline, move",
      parameters: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            enum: ["rename", "extract_function", "extract_variable", "inline_function", "inline_variable", "move_function", "move_class"],
            description: "Type of refactoring operation to perform"
          },
          symbolName: {
            type: "string",
            description: "Name of symbol to refactor (for rename, inline, move operations)"
          },
          newName: {
            type: "string",
            description: "New name for symbol (for rename operation)"
          },
          filePath: {
            type: "string",
            description: "Path to file containing the symbol"
          },
          scope: {
            type: "string",
            enum: ["file", "project", "global"],
            description: "Scope of refactoring operation",
            default: "project"
          },
          includeComments: {
            type: "boolean",
            description: "Include comments in rename operation",
            default: false
          },
          includeStrings: {
            type: "boolean",
            description: "Include string literals in rename operation",
            default: false
          },
          startLine: {
            type: "integer",
            description: "Start line for extract operations"
          },
          endLine: {
            type: "integer",
            description: "End line for extract operations"
          },
          functionName: {
            type: "string",
            description: "Name for extracted function"
          },
          variableName: {
            type: "string",
            description: "Name for extracted variable"
          }
        },
        required: ["operation"]
      }
    }
  }
];

// Morph Fast Apply tool (conditional)
const MORPH_EDIT_TOOL: GrokTool = {
  type: "function",
  function: {
    name: "edit_file",
    description: "Use this tool to make an edit to an existing file.\n\nThis will be read by a less intelligent model, which will quickly apply the edit. You should make it clear what the edit is, while also minimizing the unchanged code you write.\nWhen writing the edit, you should specify each edit in sequence, with the special comment // ... existing code ... to represent unchanged code in between edited lines.\n\nFor example:\n\n// ... existing code ...\nFIRST_EDIT\n// ... existing code ...\nSECOND_EDIT\n// ... existing code ...\nTHIRD_EDIT\n// ... existing code ...\n\nYou should still bias towards repeating as few lines of the original file as possible to convey the change.\nBut, each edit should contain sufficient context of unchanged lines around the code you're editing to resolve ambiguity.\nDO NOT omit spans of pre-existing code (or comments) without using the // ... existing code ... comment to indicate its absence. If you omit the existing code comment, the model may inadvertently delete these lines.\nIf you plan on deleting a section, you must provide context before and after to delete it. If the initial code is ```code \\n Block 1 \\n Block 2 \\n Block 3 \\n code```, and you want to remove Block 2, you would output ```// ... existing code ... \\n Block 1 \\n  Block 3 \\n // ... existing code ...```.\nMake sure it is clear what the edit should be, and where it should be applied.\nMake edits to a file in a single edit_file call instead of multiple edit_file calls to the same file. The apply model can handle many distinct edits at once.",
    parameters: {
      type: "object",
      properties: {
        target_file: {
          type: "string",
          description: "The target file to modify."
        },
        instructions: {
          type: "string",
          description: "A single sentence instruction describing what you are going to do for the sketched edit. This is used to assist the less intelligent model in applying the edit. Use the first person to describe what you are going to do. Use it to disambiguate uncertainty in the edit."
        },
        code_edit: {
          type: "string",
          description: "Specify ONLY the precise lines of code that you wish to edit. NEVER specify or write out unchanged code. Instead, represent all unchanged code using the comment of the language you're editing in - example: // ... existing code ..."
        }
      },
      required: ["target_file", "instructions", "code_edit"]
    }
  }
};

// Function to build tools array conditionally
function buildGrokTools(): GrokTool[] {
  const tools = [...BASE_GROK_TOOLS];
  
  // Add Morph Fast Apply tool if API key is available
  if (process.env.MORPH_API_KEY) {
    tools.splice(3, 0, MORPH_EDIT_TOOL); // Insert after str_replace_editor
  }
  
  return tools;
}

// Export dynamic tools array
export const GROK_TOOLS: GrokTool[] = buildGrokTools();

// Global MCP manager instance
let mcpManager: MCPManager | null = null;

export function getMCPManager(): MCPManager {
  if (!mcpManager) {
    mcpManager = new MCPManager();
  }
  return mcpManager;
}

export async function initializeMCPServers(): Promise<void> {
  const manager = getMCPManager();
  const config = loadMCPConfig();
  
  // Store original stderr.write
  const originalStderrWrite = process.stderr.write;
  
  // Temporarily suppress stderr to hide verbose MCP connection logs
  process.stderr.write = function(chunk: any, encoding?: any, callback?: any): boolean {
    // Filter out mcp-remote verbose logs
    const chunkStr = chunk.toString();
    if (chunkStr.includes('[') && (
        chunkStr.includes('Using existing client port') ||
        chunkStr.includes('Connecting to remote server') ||
        chunkStr.includes('Using transport strategy') ||
        chunkStr.includes('Connected to remote server') ||
        chunkStr.includes('Local STDIO server running') ||
        chunkStr.includes('Proxy established successfully') ||
        chunkStr.includes('Local→Remote') ||
        chunkStr.includes('Remote→Local')
      )) {
      // Suppress these verbose logs
      if (callback) callback();
      return true;
    }
    
    // Allow other stderr output
    return originalStderrWrite.call(this, chunk, encoding, callback);
  };
  
  try {
    for (const serverConfig of config.servers) {
      try {
        await manager.addServer(serverConfig);
      } catch (error) {
        console.warn(`Failed to initialize MCP server ${serverConfig.name}:`, error);
      }
    }
  } finally {
    // Restore original stderr.write
    process.stderr.write = originalStderrWrite;
  }
}

export function convertMCPToolToGrokTool(mcpTool: MCPTool): GrokTool {
  return {
    type: "function",
    function: {
      name: mcpTool.name,
      description: mcpTool.description,
      parameters: mcpTool.inputSchema || {
        type: "object",
        properties: {},
        required: []
      }
    }
  };
}

export function addMCPToolsToGrokTools(baseTools: GrokTool[]): GrokTool[] {
  if (!mcpManager) {
    return baseTools;
  }
  
  const mcpTools = mcpManager.getTools();
  const grokMCPTools = mcpTools.map(convertMCPToolToGrokTool);
  
  return [...baseTools, ...grokMCPTools];
}

export async function getAllGrokTools(): Promise<GrokTool[]> {
  const manager = getMCPManager();
  // Try to initialize servers if not already done, but don't block
  manager.ensureServersInitialized().catch(() => {
    // Ignore initialization errors to avoid blocking
  });
  return addMCPToolsToGrokTools(GROK_TOOLS);
}
