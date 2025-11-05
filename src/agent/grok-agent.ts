import { GrokClient, GrokMessage, GrokToolCall } from "../grok/client.js";
import fs from "fs";
import path from "path";
import {
  getAllGrokTools,
  getMCPManager,
  initializeMCPServers,
} from "../grok/tools.js";
import { loadMCPConfig } from "../mcp/config.js";
import {
  TextEditorTool,
  MorphEditorTool,
  BashTool,
  TodoTool,
  ConfirmationTool,
  SearchTool,
  MultiFileEditorTool,
  AdvancedSearchTool,
  FileTreeOperationsTool,
  CodeAwareEditorTool,
  OperationHistoryTool,
  ASTParserTool,
  SymbolSearchTool,
  DependencyAnalyzerTool,
  CodeContextTool,
  RefactoringAssistantTool,
  VectorSearchTool,
  AutonomousTaskTool,
} from "../tools/index.js";
import { ToolResult } from "../types/index.js";
import { EventEmitter } from "events";
import { createTokenCounter, TokenCounter } from "../utils/token-counter.js";
import { loadCustomInstructions } from "../utils/custom-instructions.js";
import { getSettingsManager } from "../utils/settings-manager.js";
import { ContextPack } from "../utils/context-loader.js";
import { ResearchRecommendService } from "../services/research-recommend.js";
import { ExecutionOrchestrator } from "../services/execution-orchestrator.js";

export interface ChatEntry {
  type: "user" | "assistant" | "tool_result" | "tool_call";
  content: string;
  timestamp: Date;
  toolCalls?: GrokToolCall[] | null;
  toolCall?: GrokToolCall;
  toolResult?: { success: boolean; output?: string; error?: string };
  isStreaming?: boolean;
  // Paste summary support
  originalContent?: string; // Store full content when summarized
  displayContent?: string;  // What to show in UI (summary or full content)
  isPasteSummary?: boolean; // Flag for styling
  pasteMetadata?: {
    pasteNumber: number;
    lineCount: number;
    charCount: number;
  };
}

export interface StreamingChunk {
  type: "content" | "tool_calls" | "tool_result" | "done" | "token_count";
  content?: string;
  toolCalls?: GrokToolCall[];
  toolCall?: GrokToolCall;
  toolResult?: ToolResult;
  tokenCount?: number;
}

export class GrokAgent extends EventEmitter {
  private grokClient: GrokClient;
  private textEditor: TextEditorTool;
  private morphEditor: MorphEditorTool | null;
  private bash: BashTool;
  private todoTool: TodoTool;
  private confirmationTool: ConfirmationTool;
  private search: SearchTool;
  // Advanced tools
  private multiFileEditor: MultiFileEditorTool;
  private advancedSearch: AdvancedSearchTool;
  private fileTreeOps: FileTreeOperationsTool;
  private codeAwareEditor: CodeAwareEditorTool;
  private operationHistory: OperationHistoryTool;
  // Intelligence tools
  private astParser: ASTParserTool;
  private symbolSearch: SymbolSearchTool;
  private dependencyAnalyzer: DependencyAnalyzerTool;
  private codeContext: CodeContextTool;
  private refactoringAssistant: RefactoringAssistantTool;
  private vectorSearch: VectorSearchTool;
  private autonomousTask: AutonomousTaskTool;
  private chatHistory: ChatEntry[] = [];
  private messages: GrokMessage[] = [];
  private tokenCounter: TokenCounter;
  private abortController: AbortController | null = null;
  private mcpInitialized: boolean = false;
  private maxToolRounds: number;
  private lastToolExecutionTime: number = 0;
  private activeToolCalls: number = 0;
  private readonly maxConcurrentToolCalls: number = 2;
  private readonly minRequestInterval: number = 500; // ms
  private lastRequestTime: number = 0;
  private sessionLogPath: string;

  constructor(
    apiKey: string,
    baseURL?: string,
    model?: string,
    maxToolRounds?: number,
    contextPack?: ContextPack
  ) {
    super();
    const manager = getSettingsManager();
    const savedModel = manager.getCurrentModel();
    const modelToUse = model || savedModel || "grok-code-fast-1";
    this.maxToolRounds = maxToolRounds || 400;
    this.sessionLogPath = process.env.GROK_SESSION_LOG || `${process.env.HOME}/.grok/session.log`;
    this.grokClient = new GrokClient(apiKey, modelToUse, baseURL);
    this.textEditor = new TextEditorTool();
    this.morphEditor = process.env.MORPH_API_KEY ? new MorphEditorTool() : null;
    this.bash = new BashTool();
    this.todoTool = new TodoTool();
    this.confirmationTool = new ConfirmationTool();
    this.search = new SearchTool();
    // Initialize advanced tools
    this.multiFileEditor = new MultiFileEditorTool();
    this.advancedSearch = new AdvancedSearchTool();
    this.fileTreeOps = new FileTreeOperationsTool();
    this.codeAwareEditor = new CodeAwareEditorTool();
    this.operationHistory = new OperationHistoryTool();
    // Initialize intelligence tools
    this.astParser = new ASTParserTool();
    this.symbolSearch = new SymbolSearchTool();
    this.dependencyAnalyzer = new DependencyAnalyzerTool();
    this.codeContext = new CodeContextTool();
    this.refactoringAssistant = new RefactoringAssistantTool();
    this.vectorSearch = new VectorSearchTool();
    this.autonomousTask = new AutonomousTaskTool();
    this.tokenCounter = createTokenCounter(modelToUse);

    // Initialize MCP servers if configured
    this.initializeMCP();

    // Load custom instructions
    const customInstructions = loadCustomInstructions();
    const customInstructionsSection = customInstructions
      ? `\n\nCUSTOM INSTRUCTIONS:\n${customInstructions}\n\nThe above custom instructions should be followed alongside the standard instructions below.`
      : "";

    // Load .agent context if provided
    const contextSection = contextPack ? `\n\nPROJECT CONTEXT:\n${contextPack.system}\n\nSOP:\n${contextPack.sop}\n\nTASKS:\n${contextPack.tasks.map(t => `- ${t.filename}: ${t.content}`).join('\n')}\n\nThe above project context should inform your responses and decision making.` : "";

    // Initialize with system message
    this.messages.push({
      role: "system",
      content: `You are X-CLI, an AI assistant that helps with file editing, coding tasks, and system operations.${customInstructionsSection}${contextSection}

You have access to these tools:

CORE TOOLS:
- view_file: View file contents or directory listings
- create_file: Create new files with content (ONLY use this for files that don't exist yet)
- str_replace_editor: Replace text in existing files (ALWAYS use this to edit or update existing files)${
        this.morphEditor
          ? "\n- edit_file: High-speed file editing with Morph Fast Apply (4,500+ tokens/sec with 98% accuracy)"
          : ""
      }
- bash: Execute bash commands (use for searching, file discovery, navigation, and system operations)
- search: Unified search tool for finding text content or files (similar to Cursor's search functionality)
- create_todo_list: Create a visual todo list for planning and tracking tasks
- update_todo_list: Update existing todos in your todo list

ADVANCED TOOLS:
- multi_file_edit: Perform atomic operations across multiple files with transaction support
- advanced_search: Enhanced search with regex patterns, context, and bulk replace capabilities
- file_tree_ops: Generate directory trees, bulk operations, and file organization
- code_analysis: Analyze code structure, perform refactoring, and smart code operations
- operation_history: Track, undo, and redo operations with comprehensive history management

REAL-TIME INFORMATION:
You have access to real-time web search and X (Twitter) data. When users ask for current information, latest news, or recent events, you automatically have access to up-to-date information from the web and social media.

IMPORTANT TOOL USAGE RULES:
- NEVER use create_file on files that already exist - this will overwrite them completely
- ALWAYS use str_replace_editor to modify existing files, even for small changes
- Before editing a file, use view_file to see its current contents
- Use create_file ONLY when creating entirely new files that don't exist

SEARCHING AND EXPLORATION:
- Use search for fast, powerful text search across files or finding files by name (unified search tool)
- Examples: search for text content like "import.*react", search for files like "component.tsx"
- Use bash with commands like 'find', 'grep', 'rg', 'ls' for complex file operations and navigation
- view_file is best for reading specific files you already know exist

When a user asks you to edit, update, modify, or change an existing file:
1. First use view_file to see the current contents
2. Then use str_replace_editor to make the specific changes
3. Never use create_file for existing files

When a user asks you to create a new file that doesn't exist:
1. Use create_file with the full content

TASK PLANNING WITH TODO LISTS:
- For complex requests with multiple steps, ALWAYS create a todo list first to plan your approach
- Use create_todo_list to break down tasks into manageable items with priorities
- Mark tasks as 'in_progress' when you start working on them (only one at a time)
- Mark tasks as 'completed' immediately when finished
- Use update_todo_list to track your progress throughout the task
- Todo lists provide visual feedback with colors: ✅ Green (completed), 🔄 Cyan (in progress), ⏳ Yellow (pending)
- Always create todos with priorities: 'high' (🔴), 'medium' (🟡), 'low' (🟢)

USER CONFIRMATION SYSTEM:
File operations (create_file, str_replace_editor) and bash commands will automatically request user confirmation before execution. The confirmation system will show users the actual content or command before they decide. Users can choose to approve individual operations or approve all operations of that type for the session.

If a user rejects an operation, the tool will return an error and you should not proceed with that specific operation.

Be helpful, direct, and efficient. Always explain what you're doing and show the results.

IMPORTANT RESPONSE GUIDELINES:
- After using tools, do NOT respond with pleasantries like "Thanks for..." or "Great!"
- Only provide necessary explanations or next steps if relevant to the task
- Keep responses concise and focused on the actual work being done
- If a tool execution completes the user's request, you can remain silent or give a brief confirmation

Current working directory: ${process.cwd()}`,
    });
  }

  private async initializeMCP(): Promise<void> {
    // Initialize MCP in the background without blocking
    Promise.resolve().then(async () => {
      try {
        const config = loadMCPConfig();
        if (config.servers.length > 0) {
          await initializeMCPServers();
        }
      } catch (error) {
        console.warn("MCP initialization failed:", error);
      } finally {
        this.mcpInitialized = true;
      }
    });
  }

  private isGrokModel(): boolean {
    const currentModel = this.grokClient.getCurrentModel();
    return currentModel.toLowerCase().includes("grok");
  }

  // Heuristic: enable web search only when likely needed
  private shouldUseSearchFor(message: string): boolean {
    const q = message.toLowerCase();
    const keywords = [
      "today",
      "latest",
      "news",
      "trending",
      "breaking",
      "current",
      "now",
      "recent",
      "x.com",
      "twitter",
      "tweet",
      "what happened",
      "as of",
      "update on",
      "release notes",
      "changelog",
      "price",
    ];
    if (keywords.some((k) => q.includes(k))) return true;
    // crude date pattern (e.g., 2024/2025) may imply recency
    if (/(20\d{2})/.test(q)) return true;
    return false;
  }

  // Detect if message should use the Research → Recommend → Execute workflow
  private shouldUseWorkflow(message: string): boolean {
    const q = message.toLowerCase();

    // Complexity indicators that suggest workflow usage
    const complexityIndicators = [
      // Action verbs indicating multi-step tasks
      /\b(implement|build|create|refactor|optimize|add|update|modify|develop|design)\b/.test(q),
      /\b(system|feature|component|module|service|api|database)\b/.test(q),

      // Multi-step indicators
      /\b(and|then|after|finally|also|additionally)\b/.test(q),
      /\b(step|phase|stage|part|component)\b/.test(q),

      // Size/complexity indicators
      q.length > 150, // Long requests
      (q.match(/\b(and|or|but|however|therefore|consequently)\b/g) || []).length >= 2, // Complex logic

      // Technical complexity
      /\b(authentication|authorization|security|validation|testing|deployment|ci.cd|docker|kubernetes)\b/.test(q),
      /\b(multiple|several|various|different|complex|advanced)\b/.test(q),
    ];

    // Use workflow if 2+ complexity indicators are present
    const indicatorCount = complexityIndicators.filter(Boolean).length;
    return indicatorCount >= 2;
  }

  async processUserMessage(message: string): Promise<ChatEntry[]> {
    // Check if this should use the Research → Recommend → Execute workflow
    if (this.shouldUseWorkflow(message)) {
      return this.processWithWorkflow(message);
    }

    // Fall back to standard processing for simple queries
    return this.processStandard(message);
  }

  /**
   * Process complex tasks using the Research → Recommend → Execute workflow
   */
  private async processWithWorkflow(message: string): Promise<ChatEntry[]> {
    const userEntry: ChatEntry = {
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    this.chatHistory.push(userEntry);
    this.logEntry(userEntry);
    this.messages.push({ role: "user", content: message });

    try {
      // Initialize workflow services
      const workflowService = new ResearchRecommendService(this);

      const request = {
        userTask: message
      };

      console.log('🔍 Researching and analyzing...');

      // Phase 1: Research and get approval
      const { output, approval, revisions } = await workflowService.researchAndGetApproval(request, contextPack);

      if (!approval.approved) {
        // User rejected the plan
        const rejectionEntry: ChatEntry = {
          type: "assistant",
          content: approval.revised
            ? `Plan revised ${revisions} time(s) but ultimately rejected by user.`
            : "Plan rejected by user.",
          timestamp: new Date(),
        };
        this.chatHistory.push(rejectionEntry);
        return [userEntry, rejectionEntry];
      }

      console.log('✅ Plan approved. Executing...');

      // Phase 2: Execute the approved plan
      const orchestrator = new ExecutionOrchestrator(this);
      const executionResult = await orchestrator.executeWithRecovery(output.plan, workflowService, request);

      // Convert execution results to chat entries
      return this.workflowResultToChatEntries(userEntry, output, approval, executionResult);

    } catch (error: any) {
      console.error('[Workflow] Failed:', error);
      const errorEntry: ChatEntry = {
        type: "assistant",
        content: `Workflow failed: ${error.message}`,
        timestamp: new Date(),
      };
      this.chatHistory.push(errorEntry);
      return [userEntry, errorEntry];
    }
  }

  /**
   * Standard processing for simple queries
   */
  private async processStandard(message: string): Promise<ChatEntry[]> {
    // Add user message to conversation
    const userEntry: ChatEntry = {
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    this.chatHistory.push(userEntry);
    this.logEntry(userEntry);
    this.messages.push({ role: "user", content: message });

    const newEntries: ChatEntry[] = [userEntry];
    const maxToolRounds = this.maxToolRounds; // Prevent infinite loops
    let toolRounds = 0;

    try {
      const tools = await getAllGrokTools();
      let currentResponse = await this.grokClient.chat(
        this.messages,
        tools,
        undefined,
        this.isGrokModel() && this.shouldUseSearchFor(message)
          ? { search_parameters: { mode: "auto" } }
          : { search_parameters: { mode: "off" } }
      );

      // Agent loop - continue until no more tool calls or max rounds reached
      while (toolRounds < maxToolRounds) {
        const assistantMessage = currentResponse.choices[0]?.message;

        if (!assistantMessage) {
          throw new Error("No response from Grok");
        }

        // Handle tool calls
        if (
          assistantMessage.tool_calls &&
          assistantMessage.tool_calls.length > 0
        ) {
          toolRounds++;

          // Add assistant message with tool calls
          const assistantEntry: ChatEntry = {
            type: "assistant",
            content: assistantMessage.content || "Using tools to help you...",
            timestamp: new Date(),
            toolCalls: assistantMessage.tool_calls,
          };
          this.chatHistory.push(assistantEntry);
          this.logEntry(assistantEntry);
          newEntries.push(assistantEntry);

          // Add assistant message to conversation
          this.messages.push({
            role: "assistant",
            content: assistantMessage.content || "",
            tool_calls: assistantMessage.tool_calls,
          } as any);

          // Create initial tool call entries to show tools are being executed
          assistantMessage.tool_calls.forEach((toolCall) => {
            const toolCallEntry: ChatEntry = {
              type: "tool_call",
              content: "Executing...",
              timestamp: new Date(),
              toolCall: toolCall,
            };
            this.chatHistory.push(toolCallEntry);
            newEntries.push(toolCallEntry);
          });

          // Execute tool calls and update the entries
          for (const toolCall of assistantMessage.tool_calls) {
            const result = await this.executeTool(toolCall);

            // Update the existing tool_call entry with the result
            const entryIndex = this.chatHistory.findIndex(
              (entry) =>
                entry.type === "tool_call" && entry.toolCall?.id === toolCall.id
            );

            if (entryIndex !== -1) {
              const updatedEntry: ChatEntry = {
                ...this.chatHistory[entryIndex],
                type: "tool_result",
                content: result.success
                  ? result.output || "Success"
                  : result.error || "Error occurred",
                toolResult: result,
              };
              this.chatHistory[entryIndex] = updatedEntry;

              // Also update in newEntries for return value
              const newEntryIndex = newEntries.findIndex(
                (entry) =>
                  entry.type === "tool_call" &&
                  entry.toolCall?.id === toolCall.id
              );
              if (newEntryIndex !== -1) {
                newEntries[newEntryIndex] = updatedEntry;
              }
            }

            // Add tool result to messages with proper format (needed for AI context)
            this.messages.push({
              role: "tool",
              content: result.success
                ? result.output || "Success"
                : result.error || "Error",
              tool_call_id: toolCall.id,
            });
          }

          // Get next response - this might contain more tool calls
          currentResponse = await this.grokClient.chat(
            this.messages,
            tools,
            undefined,
            this.isGrokModel() && this.shouldUseSearchFor(message)
              ? { search_parameters: { mode: "auto" } }
              : { search_parameters: { mode: "off" } }
          );
        } else {
          // No more tool calls, add final response
          const finalEntry: ChatEntry = {
            type: "assistant",
            content:
              assistantMessage.content ||
              "I understand, but I don't have a specific response.",
            timestamp: new Date(),
          };
          this.chatHistory.push(finalEntry);
          this.messages.push({
            role: "assistant",
            content: assistantMessage.content || "",
          });
          newEntries.push(finalEntry);
          break; // Exit the loop
        }
      }

      if (toolRounds >= maxToolRounds) {
        const warningEntry: ChatEntry = {
          type: "assistant",
          content:
            "Maximum tool execution rounds reached. Stopping to prevent infinite loops.",
          timestamp: new Date(),
        };
        this.chatHistory.push(warningEntry);
        newEntries.push(warningEntry);
      }

      return newEntries;
    } catch (error: any) {
      const errorEntry: ChatEntry = {
        type: "assistant",
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
      };
      this.chatHistory.push(errorEntry);
      return [userEntry, errorEntry];
    }
  }

  private messageReducer(previous: any, item: any): any {
    const reduce = (acc: any, delta: any) => {
      acc = { ...acc };
      for (const [key, value] of Object.entries(delta)) {
        if (acc[key] === undefined || acc[key] === null) {
          acc[key] = value;
          // Clean up index properties from tool calls
          if (Array.isArray(acc[key])) {
            for (const arr of acc[key]) {
              delete arr.index;
            }
          }
        } else if (typeof acc[key] === "string" && typeof value === "string") {
          (acc[key] as string) += value;
        } else if (Array.isArray(acc[key]) && Array.isArray(value)) {
          const accArray = acc[key] as any[];
          for (let i = 0; i < value.length; i++) {
            if (!accArray[i]) accArray[i] = {};
            accArray[i] = reduce(accArray[i], value[i]);
          }
        } else if (typeof acc[key] === "object" && typeof value === "object") {
          acc[key] = reduce(acc[key], value);
        }
      }
      return acc;
    };

    return reduce(previous, item.choices[0]?.delta || {});
  }

  async *processUserMessageStream(
    message: string
  ): AsyncGenerator<StreamingChunk, void, unknown> {
    // Create new abort controller for this request
    this.abortController = new AbortController();

    // Add user message to conversation
    const userEntry: ChatEntry = {
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    this.chatHistory.push(userEntry);
    this.messages.push({ role: "user", content: message });

    // Calculate input tokens
    let inputTokens = this.tokenCounter.countMessageTokens(
      this.messages as any
    );
    yield {
      type: "token_count",
      tokenCount: inputTokens,
    };

    const maxToolRounds = this.maxToolRounds; // Prevent infinite loops
    let toolRounds = 0;
    let totalOutputTokens = 0;
    let lastTokenUpdate = 0;

    try {
      // Agent loop - continue until no more tool calls or max rounds reached
      while (toolRounds < maxToolRounds) {
        // Check if operation was cancelled
        if (this.abortController?.signal.aborted) {
          yield {
            type: "content",
            content: "\n\n[Operation cancelled by user]",
          };
          yield { type: "done" };
          return;
        }

        // Enforce global rate limit
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
          const delay = this.minRequestInterval - timeSinceLastRequest;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        this.lastRequestTime = Date.now();

        // Stream response and accumulate
        const tools = await getAllGrokTools();
        const stream = this.grokClient.chatStream(
          this.messages,
          tools,
          undefined,
          this.isGrokModel() && this.shouldUseSearchFor(message)
            ? { search_parameters: { mode: "auto" } }
            : { search_parameters: { mode: "off" } },
          this.abortController?.signal
        );
        let accumulatedMessage: any = {};
        let accumulatedContent = "";
        let toolCallsYielded = false;

        for await (const chunk of stream) {
          // Check for cancellation in the streaming loop
          if (this.abortController?.signal.aborted) {
            yield {
              type: "content",
              content: "\n\n[Operation cancelled by user]",
            };
            yield { type: "done" };
            return;
          }

          if (!chunk.choices?.[0]) continue;

          // Accumulate the message using reducer
          accumulatedMessage = this.messageReducer(accumulatedMessage, chunk);

          // Check for tool calls - yield when we have complete tool calls with function names
          if (!toolCallsYielded && accumulatedMessage.tool_calls?.length > 0) {
            // Check if we have at least one complete tool call with a function name
            const hasCompleteTool = accumulatedMessage.tool_calls.some(
              (tc: any) => tc.function?.name
            );
            if (hasCompleteTool) {
              yield {
                type: "tool_calls",
                toolCalls: accumulatedMessage.tool_calls,
              };
              toolCallsYielded = true;
            }
          }

          // Stream content as it comes
          if (chunk.choices[0].delta?.content) {
            accumulatedContent += chunk.choices[0].delta.content;
            

            // Update token count in real-time including accumulated content and any tool calls
            const currentOutputTokens =
              this.tokenCounter.estimateStreamingTokens(accumulatedContent) +
              (accumulatedMessage.tool_calls
                ? this.tokenCounter.countTokens(
                    JSON.stringify(accumulatedMessage.tool_calls)
                  )
                : 0);
            totalOutputTokens = currentOutputTokens;

            yield {
              type: "content",
              content: chunk.choices[0].delta.content,
            };

            // Emit token count update
            const now = Date.now();
            if (now - lastTokenUpdate > 250) {
              lastTokenUpdate = now;
              yield {
                type: "token_count",
                tokenCount: inputTokens + totalOutputTokens,
              };
            }
          }

          // Check for stream completion
          if (chunk.choices[0].finish_reason) {
            break;
          }
        }

        // Add assistant entry to history
        const assistantEntry: ChatEntry = {
          type: "assistant",
          content: accumulatedMessage.content || "Using tools to help you...",
          timestamp: new Date(),
          toolCalls: accumulatedMessage.tool_calls || undefined,
        };
        this.chatHistory.push(assistantEntry);

        // Add accumulated message to conversation
        this.messages.push({
          role: "assistant",
          content: accumulatedMessage.content || "",
          tool_calls: accumulatedMessage.tool_calls,
        } as any);

        // Handle tool calls if present
        if (accumulatedMessage.tool_calls?.length > 0) {
          toolRounds++;

          // Only yield tool_calls if we haven't already yielded them during streaming
          if (!toolCallsYielded) {
            yield {
              type: "tool_calls",
              toolCalls: accumulatedMessage.tool_calls,
            };
          }

          // Execute tools with concurrency limit
          const toolCalls = accumulatedMessage.tool_calls;
          for (let i = 0; i < toolCalls.length; i += this.maxConcurrentToolCalls) {
            // Enforce minimum request interval between tool batches
            const now = Date.now();
            const timeSinceLastExecution = now - this.lastToolExecutionTime;
            if (timeSinceLastExecution < this.minRequestInterval) {
              const delay = this.minRequestInterval - timeSinceLastExecution;
              await new Promise(resolve => setTimeout(resolve, delay));
            }

            const batch = toolCalls.slice(i, i + this.maxConcurrentToolCalls);
            const batchPromises = batch.map(async (toolCall: GrokToolCall) => {
              // Check for cancellation before executing each tool
              if (this.abortController?.signal.aborted) {
                return null;
              }

              const result = await this.executeTool(toolCall);

              const toolResultEntry: ChatEntry = {
                type: "tool_result",
                content: result.success
                  ? result.output || "Success"
                  : result.error || "Error occurred",
                timestamp: new Date(),
                toolCall: toolCall,
                toolResult: result,
              };
              this.chatHistory.push(toolResultEntry);

              // Add tool result with proper format (needed for AI context)
              this.messages.push({
                role: "tool",
                content: result.success
                  ? result.output || "Success"
                  : result.error || "Error",
                tool_call_id: toolCall.id,
              });

              return { toolCall, result, entry: toolResultEntry };
            });

            const batchResults = await Promise.all(batchPromises);
            this.lastToolExecutionTime = Date.now();
            if (batchResults.includes(null)) {
              // Cancelled
              yield {
                type: "content",
                content: "\n\n[Operation cancelled by user]",
              };
              yield { type: "done" };
              return;
            }

            // Yield results after batch completes
            for (const { toolCall, result } of batchResults) {
              yield {
                type: "tool_result",
                toolCall,
                toolResult: result,
              };
            }
          }

          // Update token count after processing all tool calls to include tool results
          inputTokens = this.tokenCounter.countMessageTokens(
            this.messages as any
          );
          // Final token update after tools processed
          yield {
            type: "token_count",
            tokenCount: inputTokens + totalOutputTokens,
          };

          // Continue the loop to get the next response (which might have more tool calls)
        } else {
          // No tool calls, we're done
          break;
        }
      }

      if (toolRounds >= maxToolRounds) {
        yield {
          type: "content",
          content:
            "\n\nMaximum tool execution rounds reached. Stopping to prevent infinite loops.",
        };
      }

      yield { type: "done" };
    } catch (error: any) {
      // Check if this was a cancellation
      if (this.abortController?.signal.aborted) {
        yield {
          type: "content",
          content: "\n\n[Operation cancelled by user]",
        };
        yield { type: "done" };
        return;
      }

      const errorEntry: ChatEntry = {
        type: "assistant",
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
      };
      this.chatHistory.push(errorEntry);
      yield {
        type: "content",
        content: errorEntry.content,
      };
      yield { type: "done" };
    } finally {
      // Clean up abort controller
      this.abortController = null;
    }
  }

  private async executeTool(toolCall: GrokToolCall): Promise<ToolResult> {
    try {
      const args = JSON.parse(toolCall.function.arguments);

      // Check if confirmation is required for file operations and bash commands
      const settingsManager = getSettingsManager();
      const requireConfirmation = settingsManager.getUserSetting('requireConfirmation') ?? true;

      if (requireConfirmation) {
        const needsConfirmation = ['create_file', 'str_replace_editor', 'bash'].includes(toolCall.function.name);
        if (needsConfirmation) {
          const confirmationResult = await this.confirmationTool.requestConfirmation({
            operation: toolCall.function.name,
            filename: args.path || args.command || 'unknown',
            description: `Execute ${toolCall.function.name} operation`,
          });
          if (!confirmationResult.success) {
            return {
              success: false,
              error: confirmationResult.error || 'Operation cancelled by user',
            };
          }
        }
      }

      switch (toolCall.function.name) {
        case "view_file":
          try {
            const range: [number, number] | undefined =
              args.start_line && args.end_line
                ? [args.start_line, args.end_line]
                : undefined;
            return await this.textEditor.view(args.path, range);
          } catch (error: any) {
            console.warn(`view_file tool failed, falling back to bash: ${error.message}`);
            // Fallback to bash cat/head/tail
            const path = args.path;
            let command = `cat "${path}"`;
            if (args.start_line && args.end_line) {
              command = `sed -n '${args.start_line},${args.end_line}p' "${path}"`;
            }
            return await this.bash.execute(command);
          }

        case "create_file":
          try {
            return await this.textEditor.create(args.path, args.content);
          } catch (error: any) {
            console.warn(`create_file tool failed, falling back to bash: ${error.message}`);
            // Fallback to bash echo/redirect
            const command = `cat > "${args.path}" << 'EOF'\n${args.content}\nEOF`;
            return await this.bash.execute(command);
          }

        case "str_replace_editor":
          try {
            return await this.textEditor.strReplace(
              args.path,
              args.old_str,
              args.new_str,
              args.replace_all
            );
          } catch (error: any) {
            console.warn(`str_replace_editor tool failed, falling back to bash: ${error.message}`);
            // Fallback to bash sed for replacement
            const escapedOld = args.old_str.replace(/[\/&]/g, '\\$&');
            const escapedNew = args.new_str.replace(/[\/&]/g, '\\$&');
            const sedCommand = args.replace_all
              ? `sed -i 's/${escapedOld}/${escapedNew}/g' "${args.path}"`
              : `sed -i '0,/${escapedOld}/s/${escapedOld}/${escapedNew}/' "${args.path}"`;
            return await this.bash.execute(sedCommand);
          }

        case "edit_file":
          if (!this.morphEditor) {
            return {
              success: false,
              error:
                "Morph Fast Apply not available. Please set MORPH_API_KEY environment variable to use this feature.",
            };
          }
          return await this.morphEditor.editFile(
            args.target_file,
            args.instructions,
            args.code_edit
          );

        case "bash":
          return await this.bash.execute(args.command);

        case "create_todo_list":
          return await this.todoTool.createTodoList(args.todos);

        case "update_todo_list":
          return await this.todoTool.updateTodoList(args.updates);

        case "search":
          try {
            return await this.search.search(args.query, {
              searchType: args.search_type,
              includePattern: args.include_pattern,
              excludePattern: args.exclude_pattern,
              caseSensitive: args.case_sensitive,
              wholeWord: args.whole_word,
              regex: args.regex,
              maxResults: args.max_results,
              fileTypes: args.file_types,
              includeHidden: args.include_hidden,
            });
          } catch (error: any) {
            console.warn(`search tool failed, falling back to bash: ${error.message}`);
            // Fallback to bash grep/find
            let command = `grep -r "${args.query}" .`;
            if (args.include_pattern) {
              command += ` --include="${args.include_pattern}"`;
            }
            if (args.exclude_pattern) {
              command += ` --exclude="${args.exclude_pattern}"`;
            }
            return await this.bash.execute(command);
          }

        // Advanced Tools
        case "multi_file_edit":
          switch (args.operation) {
            case "begin_transaction":
              return await this.multiFileEditor.beginTransaction(args.description);
            case "add_operations":
              return await this.multiFileEditor.addOperations(args.operations);
            case "preview_transaction":
              return await this.multiFileEditor.previewTransaction();
            case "commit_transaction":
              return await this.multiFileEditor.commitTransaction();
            case "rollback_transaction":
              return await this.multiFileEditor.rollbackTransaction(args.transaction_id);
            case "execute_multi_file":
              return await this.multiFileEditor.executeMultiFileOperation(args.operations, args.description);
            default:
              return { success: false, error: `Unknown multi_file_edit operation: ${args.operation}` };
          }

        case "advanced_search":
          switch (args.operation) {
            case "search":
              return await this.advancedSearch.search(args.path, args.options);
            case "search_replace":
              return await this.advancedSearch.searchAndReplace(args.path, args.options);
            case "find_files":
              return await this.advancedSearch.findFiles(args.path, args.pattern, args.options);
            default:
              return { success: false, error: `Unknown advanced_search operation: ${args.operation}` };
          }

        case "file_tree_ops":
          switch (args.operation) {
            case "generate_tree":
              return await this.fileTreeOps.generateTree(args.path, args.options);
            case "bulk_operations":
              return await this.fileTreeOps.bulkOperations(args.operations);
            case "copy_structure":
              return await this.fileTreeOps.copyStructure(args.source, args.destination, args.options);
            case "organize_files":
              return await this.fileTreeOps.organizeFiles(args.source, args.organization_type, args.destination);
            case "cleanup_empty_dirs":
              return await this.fileTreeOps.cleanupEmptyDirectories(args.path);
            default:
              return { success: false, error: `Unknown file_tree_ops operation: ${args.operation}` };
          }

        case "code_analysis":
          switch (args.operation) {
            case "analyze":
              return await this.codeAwareEditor.analyzeCode(args.file_path);
            case "refactor":
              return await this.codeAwareEditor.refactor(args.file_path, args.refactor_operation);
            case "smart_insert":
              return await this.codeAwareEditor.smartInsert(args.file_path, args.code, args.location, args.target);
            case "format_code":
              return await this.codeAwareEditor.formatCode(args.file_path, args.options);
            case "add_imports":
              return await this.codeAwareEditor.addMissingImports(args.file_path, args.symbols);
            default:
              return { success: false, error: `Unknown code_analysis operation: ${args.operation}` };
          }

        case "operation_history":
          switch (args.operation) {
            case "show_history":
              return await this.operationHistory.showHistory(args.limit);
            case "undo":
              return await this.operationHistory.undo();
            case "redo":
              return await this.operationHistory.redo();
            case "goto_point":
              return await this.operationHistory.goToHistoryPoint(args.entry_id);
            case "clear_history":
              return await this.operationHistory.clearHistory();
            default:
              return { success: false, error: `Unknown operation_history operation: ${args.operation}` };
          }

        case "ast_parser":
          return await this.astParser.execute(args);

        case "symbol_search":
          return await this.symbolSearch.execute(args);

        case "dependency_analyzer":
          return await this.dependencyAnalyzer.execute(args);

        case "code_context":
          return await this.codeContext.execute(args);

        case "refactoring_assistant":
          return await this.refactoringAssistant.execute(args);

        case "vector_search":
          return await this.vectorSearch.execute(args);

        case "autonomous_task":
          return await this.autonomousTask.execute(args);

        default:
          // Check if this is an MCP tool
          if (toolCall.function.name.startsWith("mcp__")) {
            return await this.executeMCPTool(toolCall);
          }

          return {
            success: false,
            error: `Unknown tool: ${toolCall.function.name}`,
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Tool execution error: ${error.message}`,
      };
    }
  }

  private async executeMCPTool(toolCall: GrokToolCall): Promise<ToolResult> {
    try {
      const args = JSON.parse(toolCall.function.arguments);
      const mcpManager = getMCPManager();

      const result = await mcpManager.callTool(toolCall.function.name, args);

      if (result.isError) {
        return {
          success: false,
          error: (result.content[0] as any)?.text || "MCP tool error",
        };
      }

      // Extract content from result
      const output = result.content
        .map((item) => {
          if (item.type === "text") {
            return item.text;
          } else if (item.type === "resource") {
            return `Resource: ${item.resource?.uri || "Unknown"}`;
          }
          return String(item);
        })
        .join("\n");

      return {
        success: true,
        output: output || "Success",
      };
    } catch (error: any) {
      return {
        success: false,
        error: `MCP tool execution error: ${error.message}`,
      };
    }
  }

  getChatHistory(): ChatEntry[] {
    return [...this.chatHistory];
  }

  saveSessionLog(): void {
    try {
      const sessionDir = path.join(require('os').homedir(), '.grok');
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }
      const sessionFile = path.join(sessionDir, 'session.log');
      const logLines = this.chatHistory.map(entry => JSON.stringify(entry)).join('\n') + '\n';
      fs.writeFileSync(sessionFile, logLines);
    } catch (error) {
      // Silently ignore logging errors to not disrupt the app
      console.warn('Failed to save session log:', error);
    }
  }

  getCurrentDirectory(): string {
    return this.bash.getCurrentDirectory();
  }

  async executeBashCommand(command: string): Promise<ToolResult> {
    return await this.bash.execute(command);
  }

  getCurrentModel(): string {
    return this.grokClient.getCurrentModel();
  }

  setModel(model: string): void {
    this.grokClient.setModel(model);
    // Update token counter for new model
    this.tokenCounter.dispose();
    this.tokenCounter = createTokenCounter(model);
  }

  abortCurrentOperation(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  getMessageCount(): number {
    return this.chatHistory.length;
  }

  getSessionTokenCount(): number {
    return this.tokenCounter.countMessageTokens(this.messages as any);
  }

  private logEntry(entry: ChatEntry): void {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.sessionLogPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Log as JSON line
      const logLine = JSON.stringify({
        type: entry.type,
        content: entry.content,
        timestamp: entry.timestamp.toISOString(),
        toolCallId: entry.toolCall?.id,
        toolCallsCount: entry.toolCalls?.length,
      }) + '\n';

      fs.appendFileSync(this.sessionLogPath, logLine);
    } catch (error) {
      // Silently ignore logging errors to avoid disrupting the app
      console.warn('Failed to log session entry:', error);
    }
  }


  /**
   * Convert workflow results to chat entries for display
   */
  private workflowResultToChatEntries(
    userEntry: ChatEntry,
    output: any,
    approval: any,
    executionResult: any
  ): ChatEntry[] {
    const entries: ChatEntry[] = [userEntry];

    // Add workflow summary entry
    const summaryEntry: ChatEntry = {
      type: "assistant",
      content: `Workflow completed: ${executionResult?.success ? '✅ Success' : '❌ Failed'}\n\n${output?.plan?.summary || 'Task completed'}`,
      timestamp: new Date(),
    };
    entries.push(summaryEntry);
    this.chatHistory.push(summaryEntry);

    // Add execution details if available
    if (executionResult?.executionPlan) {
      const detailsEntry: ChatEntry = {
        type: "assistant",
        content: `Executed ${executionResult.executionPlan.completedSteps}/${executionResult.executionPlan.totalSteps} tasks successfully.`,
        timestamp: new Date(),
      };
      entries.push(detailsEntry);
      this.chatHistory.push(detailsEntry);
    }

    return entries;
  }
}
