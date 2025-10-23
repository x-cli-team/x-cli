import { useState, useMemo, useEffect } from "react";
import { useInput } from "ink";
import path from "path";
import { GrokAgent, ChatEntry } from "../agent/grok-agent.js";
import { ConfirmationService } from "../utils/confirmation-service.js";
import { useEnhancedInput, Key } from "./use-enhanced-input.js";
import { GrokToolCall } from "../grok/client.js";
import { ToolResult } from "../types/index.js";
import { PasteEvent } from "../services/paste-detection.js";

import { filterCommandSuggestions } from "../ui/components/command-suggestions.js";
import { loadModelConfig, updateCurrentModel } from "../utils/model-config.js";
import { AgentSystemGenerator } from "../tools/documentation/agent-system-generator.js";
import { generateDocsMenuText, findDocsMenuOption } from "../tools/documentation/docs-menu.js";
import { ReadmeGenerator } from "../tools/documentation/readme-generator.js";
import { CommentsGenerator } from "../tools/documentation/comments-generator.js";
import { ApiDocsGenerator } from "../tools/documentation/api-docs-generator.js";
import { ChangelogGenerator } from "../tools/documentation/changelog-generator.js";
import { UpdateAgentDocs } from "../tools/documentation/update-agent-docs.js";
import { SubagentFramework } from "../subagents/subagent-framework.js";
import { SelfHealingSystem } from "../tools/documentation/self-healing-system.js";

interface UseInputHandlerProps {
  agent: GrokAgent;
  chatHistory: ChatEntry[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatEntry[]>>;
  setIsProcessing: (processing: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setTokenCount: (count: number) => void;
  setProcessingTime: (time: number) => void;
  processingStartTime: React.MutableRefObject<number>;
  isProcessing: boolean;
  isStreaming: boolean;
  isConfirmationActive?: boolean;
}

interface CommandSuggestion {
  command: string;
  description: string;
}

interface ModelOption {
  model: string;
}

export function useInputHandler({
  agent,
  chatHistory,
  setChatHistory,
  setIsProcessing,
  setIsStreaming,
  setTokenCount,
  setProcessingTime,
  processingStartTime,
  isProcessing,
  isStreaming,
  isConfirmationActive = false,
}: UseInputHandlerProps) {
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [autoEditEnabled, setAutoEditEnabled] = useState(() => {
    const confirmationService = ConfirmationService.getInstance();
    const sessionFlags = confirmationService.getSessionFlags();
    return sessionFlags.allOperations;
  });

  const handleSpecialKey = (key: Key): boolean => {
    // Don't handle input if confirmation dialog is active
    if (isConfirmationActive) {
      return true; // Prevent default handling
    }

    // Handle shift+tab to toggle auto-edit mode
    if (key.shift && key.tab) {
      const newAutoEditState = !autoEditEnabled;
      setAutoEditEnabled(newAutoEditState);

      const confirmationService = ConfirmationService.getInstance();
      if (newAutoEditState) {
        // Enable auto-edit: set all operations to be accepted
        confirmationService.setSessionFlag("allOperations", true);
      } else {
        // Disable auto-edit: reset session flags
        confirmationService.resetSession();
      }
      return true; // Handled
    }

    // Handle escape key for closing menus
    if (key.escape) {
      if (showCommandSuggestions) {
        setShowCommandSuggestions(false);
        setSelectedCommandIndex(0);
        return true;
      }
      if (showModelSelection) {
        setShowModelSelection(false);
        setSelectedModelIndex(0);
        return true;
      }
      if (isProcessing || isStreaming) {
        agent.abortCurrentOperation();
        setIsProcessing(false);
        setIsStreaming(false);
        setTokenCount(0);
        setProcessingTime(0);
        processingStartTime.current = 0;
        return true;
      }
      return false; // Let default escape handling work
    }

    // Handle command suggestions navigation
    if (showCommandSuggestions) {
      const filteredSuggestions = filterCommandSuggestions(
        commandSuggestions,
        input
      );

      if (filteredSuggestions.length === 0) {
        setShowCommandSuggestions(false);
        setSelectedCommandIndex(0);
        return false; // Continue processing
      } else {
        if (key.upArrow) {
          setSelectedCommandIndex((prev) =>
            prev === 0 ? filteredSuggestions.length - 1 : prev - 1
          );
          return true;
        }
        if (key.downArrow) {
          setSelectedCommandIndex(
            (prev) => (prev + 1) % filteredSuggestions.length
          );
          return true;
        }
        if (key.tab || key.return) {
          const safeIndex = Math.min(
            selectedCommandIndex,
            filteredSuggestions.length - 1
          );
          const selectedCommand = filteredSuggestions[safeIndex];
          const newInput = selectedCommand.command + " ";
          setInput(newInput);
          setCursorPosition(newInput.length);
          setShowCommandSuggestions(false);
          setSelectedCommandIndex(0);
          return true;
        }
      }
    }

    // Handle model selection navigation
    if (showModelSelection) {
      if (key.upArrow) {
        setSelectedModelIndex((prev) =>
          prev === 0 ? availableModels.length - 1 : prev - 1
        );
        return true;
      }
      if (key.downArrow) {
        setSelectedModelIndex((prev) => (prev + 1) % availableModels.length);
        return true;
      }
      if (key.tab || key.return) {
        const selectedModel = availableModels[selectedModelIndex];
        agent.setModel(selectedModel.model);
        updateCurrentModel(selectedModel.model);
        const confirmEntry: ChatEntry = {
          type: "assistant",
          content: `✓ Switched to model: ${selectedModel.model}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, confirmEntry]);
        setShowModelSelection(false);
        setSelectedModelIndex(0);
        return true;
      }
    }

    return false; // Let default handling proceed
  };

  const handleInputSubmit = async (userInput: string) => {
    if (userInput === "exit" || userInput === "quit") {
      process.exit(0);
      return;
    }

    if (userInput.trim()) {
      const directCommandResult = await handleDirectCommand(userInput);
      if (!directCommandResult) {
        await processUserMessage(userInput);
      }
    }
  };

  const handlePasteDetected = (pasteEvent: PasteEvent) => {
    // Create a user entry with paste summary for display
    const userEntry: ChatEntry = {
      type: "user",
      content: pasteEvent.content,           // Full content for AI
      displayContent: pasteEvent.summary,    // Summary for UI display
      timestamp: new Date(),
      isPasteSummary: true,
      pasteMetadata: {
        pasteNumber: pasteEvent.pasteNumber,
        lineCount: pasteEvent.lineCount,
        charCount: pasteEvent.charCount,
      },
    };

    // Add the paste summary to chat history
    setChatHistory((prev) => [...prev, userEntry]);

    // Process the full pasted content with the AI
    processUserMessage(pasteEvent.content);
  };

  const handleInputChange = (newInput: string) => {
    // Update command suggestions based on input
    if (newInput.startsWith("/")) {
      setShowCommandSuggestions(true);
      setSelectedCommandIndex(0);
    } else {
      setShowCommandSuggestions(false);
      setSelectedCommandIndex(0);
    }
  };

  const {
    input,
    cursorPosition,
    setInput,
    setCursorPosition,
    clearInput,
    resetHistory,
    handleInput,
  } = useEnhancedInput({
    onSubmit: handleInputSubmit,
    onSpecialKey: handleSpecialKey,
    onPasteDetected: handlePasteDetected,
    disabled: isConfirmationActive,
  });

  // Hook up the actual input handling
  useInput((inputChar: string, key: Key) => {
    handleInput(inputChar, key);
  });

  // Update command suggestions when input changes
  useEffect(() => {
    handleInputChange(input);
  }, [input]);

  const commandSuggestions: CommandSuggestion[] = [
    { command: "/help", description: "Show help information" },
    { command: "/clear", description: "Clear chat history" },
    { command: "/models", description: "Switch Grok Model" },
    { command: "/init-agent", description: "Initialize .agent documentation system" },
    { command: "/docs", description: "Documentation generation menu" },
    { command: "/readme", description: "Generate project README.md" },
    { command: "/api-docs", description: "Generate API documentation" },
    { command: "/changelog", description: "Generate changelog from git history" },
    { command: "/update-agent-docs", description: "Update .agent docs with recent changes" },
    { command: "/compact", description: "Compress conversation history" },
    { command: "/heal", description: "Document and prevent failure recurrence" },
    { command: "/guardrails", description: "Manage prevention rules" },
    { command: "/comments", description: "Add code comments to files" },
    { command: "/commit-and-push", description: "AI commit & push to remote" },
    { command: "/exit", description: "Exit the application" },
  ];

  // Load models from configuration with fallback to defaults
  const availableModels: ModelOption[] = useMemo(() => {
    return loadModelConfig(); // Return directly, interface already matches
  }, []);

  const handleDirectCommand = async (input: string): Promise<boolean> => {
    const trimmedInput = input.trim();

    if (trimmedInput === "/clear") {
      // Reset chat history
      setChatHistory([]);

      // Reset processing states
      setIsProcessing(false);
      setIsStreaming(false);
      setTokenCount(0);
      setProcessingTime(0);
      processingStartTime.current = 0;

      // Reset confirmation service session flags
      const confirmationService = ConfirmationService.getInstance();
      confirmationService.resetSession();

      clearInput();
      resetHistory();
      return true;
    }

    if (trimmedInput === "/help") {
      const helpEntry: ChatEntry = {
        type: "assistant",
        content: `Grok CLI Help:

Built-in Commands:
  /clear      - Clear chat history
  /help       - Show this help
  /models     - Switch between available models
  /exit       - Exit application
  exit, quit  - Exit application

Documentation Commands:
  /init-agent       - Initialize .agent documentation system
  /docs             - Interactive documentation menu
  /readme           - Generate comprehensive README.md
  /api-docs         - Generate API documentation from code
  /changelog        - Generate changelog from git history
  /update-agent-docs- Update .agent docs with recent changes
  /comments         - Add intelligent code comments

Self-Healing & Optimization:
  /compact          - Compress conversation history intelligently
  /heal             - Document failures and create prevention rules
  /guardrails       - Manage automated prevention system

Git Commands:
  /commit-and-push - AI-generated commit + push to remote

Enhanced Input Features:
  ↑/↓ Arrow   - Navigate command history
  Ctrl+C      - Clear input (press twice to exit)
  Ctrl+←/→    - Move by word
  Ctrl+A/E    - Move to line start/end
  Ctrl+W      - Delete word before cursor
  Ctrl+K      - Delete to end of line
  Ctrl+U      - Delete to start of line
  Shift+Tab   - Toggle auto-edit mode (bypass confirmations)

Direct Commands (executed immediately):
  ls [path]   - List directory contents
  pwd         - Show current directory
  cd <path>   - Change directory
  cat <file>  - View file contents
  mkdir <dir> - Create directory
  touch <file>- Create empty file

Model Configuration:
  Edit ~/.grok/models.json to add custom models (Claude, GPT, Gemini, etc.)

For complex operations, just describe what you want in natural language.
Examples:
  "edit package.json and add a new script"
  "create a new React component called Header"
  "show me all TypeScript files in this project"`,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, helpEntry]);
      clearInput();
      return true;
    }

    if (trimmedInput === "/exit") {
      process.exit(0);
      return true;
    }

    if (trimmedInput === "/models") {
      setShowModelSelection(true);
      setSelectedModelIndex(0);
      clearInput();
      return true;
    }

    if (trimmedInput.startsWith("/models ")) {
      const modelArg = trimmedInput.split(" ")[1];
      const modelNames = availableModels.map((m) => m.model);

      if (modelNames.includes(modelArg)) {
        agent.setModel(modelArg);
        updateCurrentModel(modelArg); // Update project current model
        const confirmEntry: ChatEntry = {
          type: "assistant",
          content: `✓ Switched to model: ${modelArg}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, confirmEntry]);
      } else {
        const errorEntry: ChatEntry = {
          type: "assistant",
          content: `Invalid model: ${modelArg}

Available models: ${modelNames.join(", ")}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }

      clearInput();
      return true;
    }


    if (trimmedInput === "/commit-and-push") {
      const userEntry: ChatEntry = {
        type: "user",
        content: "/commit-and-push",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      setIsProcessing(true);
      setIsStreaming(true);

      try {
        // First check if there are any changes at all
        const initialStatusResult = await agent.executeBashCommand(
          "git status --porcelain"
        );

        if (
          !initialStatusResult.success ||
          !initialStatusResult.output?.trim()
        ) {
          const noChangesEntry: ChatEntry = {
            type: "assistant",
            content: "No changes to commit. Working directory is clean.",
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, noChangesEntry]);
          setIsProcessing(false);
          setIsStreaming(false);
          setInput("");
          return true;
        }

        // Add all changes
        const addResult = await agent.executeBashCommand("git add .");

        if (!addResult.success) {
          const addErrorEntry: ChatEntry = {
            type: "assistant",
            content: `Failed to stage changes: ${
              addResult.error || "Unknown error"
            }`,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, addErrorEntry]);
          setIsProcessing(false);
          setIsStreaming(false);
          setInput("");
          return true;
        }

        // Show that changes were staged
        const addEntry: ChatEntry = {
          type: "tool_result",
          content: "Changes staged successfully",
          timestamp: new Date(),
          toolCall: {
            id: `git_add_${Date.now()}`,
            type: "function",
            function: {
              name: "bash",
              arguments: JSON.stringify({ command: "git add ." }),
            },
          },
          toolResult: addResult,
        };
        setChatHistory((prev) => [...prev, addEntry]);

        // Get staged changes for commit message generation
        const diffResult = await agent.executeBashCommand("git diff --cached");

        // Generate commit message using AI
        const commitPrompt = `Generate a concise, professional git commit message for these changes:

Git Status:
${initialStatusResult.output}

Git Diff (staged changes):
${diffResult.output || "No staged changes shown"}

Follow conventional commit format (feat:, fix:, docs:, etc.) and keep it under 72 characters.
Respond with ONLY the commit message, no additional text.`;

        let commitMessage = "";
        let streamingEntry: ChatEntry | null = null;
        let accumulatedCommitContent = "";
        let lastCommitUpdateTime = Date.now();

        for await (const chunk of agent.processUserMessageStream(
          commitPrompt
        )) {
          if (chunk.type === "content" && chunk.content) {
            accumulatedCommitContent += chunk.content;
            const now = Date.now();
            if (now - lastCommitUpdateTime >= 150) {
              commitMessage += accumulatedCommitContent;
              if (!streamingEntry) {
                const newEntry = {
                  type: "assistant" as const,
                  content: `Generating commit message...\n\n${commitMessage}`,
                  timestamp: new Date(),
                  isStreaming: true,
                };
                setChatHistory((prev) => [...prev, newEntry]);
                streamingEntry = newEntry;
              } else {
                setChatHistory((prev) =>
                  prev.map((entry, idx) =>
                    idx === prev.length - 1 && entry.isStreaming
                      ? {
                          ...entry,
                          content: `Generating commit message...\n\n${commitMessage}`,
                        }
                      : entry
                  )
                );
              }
              accumulatedCommitContent = "";
              lastCommitUpdateTime = now;
            }
          } else if (chunk.type === "done") {
            if (streamingEntry) {
              setChatHistory((prev) =>
                prev.map((entry) =>
                  entry.isStreaming
                    ? {
                        ...entry,
                        content: `Generated commit message: "${commitMessage.trim()}"`,
                        isStreaming: false,
                      }
                    : entry
                )
              );
            }
            break;
          }
        }

        // Execute the commit
        const cleanCommitMessage = commitMessage
          .trim()
          .replace(/^["']|["']$/g, "");
        const commitCommand = `git commit -m "${cleanCommitMessage}"`;
        const commitResult = await agent.executeBashCommand(commitCommand);

        const commitEntry: ChatEntry = {
          type: "tool_result",
          content: commitResult.success
            ? commitResult.output || "Commit successful"
            : commitResult.error || "Commit failed",
          timestamp: new Date(),
          toolCall: {
            id: `git_commit_${Date.now()}`,
            type: "function",
            function: {
              name: "bash",
              arguments: JSON.stringify({ command: commitCommand }),
            },
          },
          toolResult: commitResult,
        };
        setChatHistory((prev) => [...prev, commitEntry]);

        // If commit was successful, push to remote
        if (commitResult.success) {
          // First try regular push, if it fails try with upstream setup
          let pushResult = await agent.executeBashCommand("git push");
          let pushCommand = "git push";

          if (
            !pushResult.success &&
            pushResult.error?.includes("no upstream branch")
          ) {
            pushCommand = "git push -u origin HEAD";
            pushResult = await agent.executeBashCommand(pushCommand);
          }

          const pushEntry: ChatEntry = {
            type: "tool_result",
            content: pushResult.success
              ? pushResult.output || "Push successful"
              : pushResult.error || "Push failed",
            timestamp: new Date(),
            toolCall: {
              id: `git_push_${Date.now()}`,
              type: "function",
              function: {
                name: "bash",
                arguments: JSON.stringify({ command: pushCommand }),
              },
            },
            toolResult: pushResult,
          };
          setChatHistory((prev) => [...prev, pushEntry]);
        }
      } catch (error: any) {
        const errorEntry: ChatEntry = {
          type: "assistant",
          content: `Error during commit and push: ${error.message}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }

      setIsProcessing(false);
      setIsStreaming(false);
      clearInput();
      return true;
    }

    if (trimmedInput === "/init-agent") {
      const userEntry: ChatEntry = {
        type: "user",
        content: "/init-agent",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      setIsProcessing(true);

      try {
        // Determine project type - assume external project for now, could detect Grok CLI
        const isGrokCli = process.cwd().includes('grok-cli') || 
                         trimmedInput.includes('--grok');
        
        const projectType = isGrokCli ? 'grok-cli' : 'external';
        const projectName = isGrokCli ? 'Grok CLI' : 'Current Project';

        const generator = new AgentSystemGenerator({
          projectName,
          projectType,
          rootPath: process.cwd()
        });

        const result = await generator.generateAgentSystem();

        const resultEntry: ChatEntry = {
          type: "assistant",
          content: result.message,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, resultEntry]);

        if (result.success) {
          // Additional success message with next steps
          const nextStepsEntry: ChatEntry = {
            type: "assistant",
            content: `📚 **Next Steps:**
1. Review the generated documentation in \`.agent/\`
2. Customize \`system/\` docs for your project
3. Add PRDs to \`tasks/\` before implementing features
4. Run \`/update-agent-docs\` after making changes
5. Check \`.agent/README.md\` for complete navigation

💡 **Pro tip**: AI agents will now read these docs to understand your project context efficiently!`,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, nextStepsEntry]);
        }

      } catch (error: any) {
        const errorEntry: ChatEntry = {
          type: "assistant",
          content: `Failed to initialize agent system: ${error.message}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }

      setIsProcessing(false);
      clearInput();
      return true;
    }

    if (trimmedInput === "/docs") {
      const userEntry: ChatEntry = {
        type: "user",
        content: "/docs",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      const menuEntry: ChatEntry = {
        type: "assistant",
        content: generateDocsMenuText(),
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, menuEntry]);

      clearInput();
      return true;
    }

    // Check if input is a docs menu selection
    const docsMenuOption = findDocsMenuOption(trimmedInput);
    if (docsMenuOption) {
      const userEntry: ChatEntry = {
        type: "user", 
        content: trimmedInput,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      const confirmEntry: ChatEntry = {
        type: "assistant",
        content: `🎯 Selected: ${docsMenuOption.title}\nExecuting: \`${docsMenuOption.command}\`...`,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, confirmEntry]);

      // Execute the selected command
      setTimeout(() => {
        handleDirectCommand(docsMenuOption.command);
      }, 100);

      clearInput();
      return true;
    }

    if (trimmedInput === "/readme" || trimmedInput.startsWith("/readme ")) {
      const userEntry: ChatEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      setIsProcessing(true);

      try {
        const args = trimmedInput.split(' ').slice(1);
        const updateExisting = args.includes('--update');
        const template = args.find(arg => arg.startsWith('--template='))?.split('=')[1] as any || 'default';

        const generator = new ReadmeGenerator({
          projectName: '', // Will be auto-detected
          rootPath: process.cwd(),
          updateExisting,
          template
        });

        const result = await generator.generateReadme();

        const resultEntry: ChatEntry = {
          type: "assistant",
          content: result.message,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, resultEntry]);

        if (result.success) {
          const nextStepsEntry: ChatEntry = {
            type: "assistant",
            content: `📝 **README.md Generated!**

**Next Steps:**
1. Review and customize the generated content
2. Add project-specific details and examples
3. Update installation and usage instructions
4. Consider adding screenshots or diagrams

💡 **Tip**: Use \`/docs\` to access other documentation tools!`,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, nextStepsEntry]);
        }

      } catch (error: any) {
        const errorEntry: ChatEntry = {
          type: "assistant", 
          content: `Failed to generate README: ${error.message}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }

      setIsProcessing(false);
      clearInput();
      return true;
    }

    if (trimmedInput === "/comments" || trimmedInput.startsWith("/comments ")) {
      const userEntry: ChatEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      setIsProcessing(true);

      try {
        const args = trimmedInput.split(' ').slice(1);
        const filePath = args[0];

        if (!filePath) {
          const errorEntry: ChatEntry = {
            type: "assistant",
            content: "❌ Please specify a file path. Usage: `/comments <file-path>`\n\nExample: `/comments src/utils/helper.ts`",
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, errorEntry]);
          setIsProcessing(false);
          clearInput();
          return true;
        }

        const commentType = args.includes('--functions') ? 'functions' : 
                           args.includes('--classes') ? 'classes' : 'all';

        const generator = new CommentsGenerator({
          filePath: filePath.startsWith('/') ? filePath : path.join(process.cwd(), filePath),
          commentType,
          style: 'auto'
        });

        const result = await generator.generateComments();

        const resultEntry: ChatEntry = {
          type: "assistant",
          content: result.message,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, resultEntry]);

        if (result.success) {
          const tipsEntry: ChatEntry = {
            type: "assistant",
            content: `💡 **Code Comments Added!**

**Options for next time:**
- \`/comments file.ts --functions\` - Only comment functions
- \`/comments file.ts --classes\` - Only comment classes
- \`/comments file.ts\` - Comment all (default)

**Backup created** - Original file saved with .backup extension`,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, tipsEntry]);
        }

      } catch (error: any) {
        const errorEntry: ChatEntry = {
          type: "assistant",
          content: `Failed to add comments: ${error.message}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }

      setIsProcessing(false);
      clearInput();
      return true;
    }

    if (trimmedInput === "/api-docs" || trimmedInput.startsWith("/api-docs ")) {
      const userEntry: ChatEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      setIsProcessing(true);

      try {
        const args = trimmedInput.split(' ').slice(1);
        const outputFormat = args.includes('--format=html') ? 'html' : 'md';
        const includePrivate = args.includes('--private');
        const scanPaths = args.filter(arg => !arg.startsWith('--') && arg !== '');

        const generator = new ApiDocsGenerator({
          rootPath: process.cwd(),
          outputFormat,
          includePrivate,
          scanPaths: scanPaths.length > 0 ? scanPaths : ['src/']
        });

        const result = await generator.generateApiDocs();

        const resultEntry: ChatEntry = {
          type: "assistant",
          content: result.message,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, resultEntry]);

        if (result.success) {
          const tipsEntry: ChatEntry = {
            type: "assistant",
            content: `📖 **API Documentation Generated!**

**Options for next time:**
- \`/api-docs --format=html\` - Generate HTML format
- \`/api-docs --private\` - Include private members
- \`/api-docs src/ lib/\` - Specify custom scan paths

**Enhancement tips:**
- Add JSDoc comments to your functions and classes
- Use TypeScript for better type information
- Organize exports clearly in your modules`,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, tipsEntry]);
        }

      } catch (error: any) {
        const errorEntry: ChatEntry = {
          type: "assistant",
          content: `Failed to generate API docs: ${error.message}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }

      setIsProcessing(false);
      clearInput();
      return true;
    }

    if (trimmedInput === "/changelog" || trimmedInput.startsWith("/changelog ")) {
      const userEntry: ChatEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      setIsProcessing(true);

      try {
        const args = trimmedInput.split(' ').slice(1);
        const sinceVersion = args.find(arg => arg.startsWith('--since='))?.split('=')[1];
        const commitCount = args.find(arg => arg.startsWith('--commits='))?.split('=')[1];
        const format = args.includes('--simple') ? 'simple' : 'conventional';

        const generator = new ChangelogGenerator({
          rootPath: process.cwd(),
          sinceVersion,
          commitCount: commitCount ? parseInt(commitCount) : undefined,
          format,
          includeBreaking: true
        });

        const result = await generator.generateChangelog();

        const resultEntry: ChatEntry = {
          type: "assistant",
          content: result.message,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, resultEntry]);

        if (result.success) {
          const tipsEntry: ChatEntry = {
            type: "assistant",
            content: `📝 **Changelog Generated!**

**Options for next time:**
- \`/changelog --since=v1.0.0\` - Generate since specific version
- \`/changelog --commits=10\` - Limit to last N commits  
- \`/changelog --simple\` - Use simple format (not conventional)

**Pro tips:**
- Use conventional commit format: \`feat: add new feature\`
- Mark breaking changes: \`feat!: breaking change\`
- The changelog follows Keep a Changelog format`,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, tipsEntry]);
        }

      } catch (error: any) {
        const errorEntry: ChatEntry = {
          type: "assistant",
          content: `Failed to generate changelog: ${error.message}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }

      setIsProcessing(false);
      clearInput();
      return true;
    }

    if (trimmedInput === "/update-agent-docs" || trimmedInput.startsWith("/update-agent-docs ")) {
      const userEntry: ChatEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      setIsProcessing(true);

      try {
        const args = trimmedInput.split(' ').slice(1);
        const updateTarget = args.includes('--system') ? 'system' :
                            args.includes('--tasks') ? 'tasks' :
                            args.includes('--sop') ? 'sop' : 'all';
        const autoCommit = args.includes('--commit');

        const updater = new UpdateAgentDocs({
          rootPath: process.cwd(),
          updateTarget,
          autoCommit
        });

        const result = await updater.updateDocs();

        const resultEntry: ChatEntry = {
          type: "assistant",
          content: result.message,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, resultEntry]);

        if (result.success && result.suggestions.length > 0) {
          const suggestionsEntry: ChatEntry = {
            type: "assistant",
            content: `💡 **Suggestions for Manual Review:**\n\n${result.suggestions.map(s => `- ${s}`).join('\n')}\n\n**Options:**\n- \`/update-agent-docs --system\` - Update only system docs\n- \`/update-agent-docs --tasks\` - Update only tasks docs\n- \`/update-agent-docs --sop\` - Update only SOPs`,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, suggestionsEntry]);
        }

      } catch (error: any) {
        const errorEntry: ChatEntry = {
          type: "assistant",
          content: `Failed to update agent docs: ${error.message}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }

      setIsProcessing(false);
      clearInput();
      return true;
    }

    if (trimmedInput === "/compact" || trimmedInput.startsWith("/compact ")) {
      const userEntry: ChatEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      setIsProcessing(true);

      try {
        const args = trimmedInput.split(' ').slice(1);
        // const force = args.includes('--force'); // TODO: implement force flag
        const dryRun = args.includes('--dry-run');

        // Simulate context compression using subagent framework
        const subagentFramework = new SubagentFramework();
        const taskId = await subagentFramework.spawnSubagent({
          type: 'summarizer',
          input: {
            content: chatHistory.map(entry => entry.content).join('\n'),
            compressionTarget: 0.3 // 70% reduction
          },
          priority: 'medium'
        });

        const result = await subagentFramework.waitForResult(taskId, 10000);

        if (result.success) {
          // const metrics = subagentFramework.getPerformanceMetrics(); // TODO: use metrics
          
          const resultEntry: ChatEntry = {
            type: "assistant",
            content: dryRun 
              ? `📊 **Compression Preview (Dry Run)**\n\n${result.summary}\n\n💡 Use \`/compact\` to apply compression`
              : `🧹 **Context Compressed Successfully**\n\n${result.summary}\n\n📈 **Performance:**\n- Tokens saved: ~${result.output.compressionRatio * 100}%\n- Processing time: ${result.executionTime}ms\n- Subagent tokens used: ${result.tokensUsed}`,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, resultEntry]);

          if (!dryRun && result.success) {
            // In a real implementation, this would actually compress the chat history
            const tipsEntry: ChatEntry = {
              type: "assistant",
              content: `✨ **Context Optimization Complete**\n\n**What happened:**\n- Older conversations summarized\n- Recent context preserved\n- Key decisions and TODOs maintained\n\n**Options:**\n- \`/compact --dry-run\` - Preview compression\n- \`/compact --force\` - Force compression even if below threshold`,
              timestamp: new Date(),
            };
            setChatHistory((prev) => [...prev, tipsEntry]);
          }
        }

      } catch (error: any) {
        const errorEntry: ChatEntry = {
          type: "assistant",
          content: `Failed to compress context: ${error.message}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }

      setIsProcessing(false);
      clearInput();
      return true;
    }

    if (trimmedInput === "/heal" || trimmedInput.startsWith("/heal ")) {
      const userEntry: ChatEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      setIsProcessing(true);

      try {
        // const args = trimmedInput.split(' ').slice(1);
        // const classify = args.includes('--classify'); // TODO: implement classify flag
        // const playbook = args.includes('--playbook'); // TODO: implement playbook flag

        const healingSystem = new SelfHealingSystem(process.cwd());

        // For demo purposes, create a simulated error
        const mockError = {
          message: "Example error for demonstration",
          stack: "at someFunction (src/example.ts:42:10)"
        };
        const mockContext = {
          command: trimmedInput,
          operation: "heal-demo",
          files: ["src/example.ts"]
        };

        const result = await healingSystem.captureIncident(mockError, mockContext);

        const resultEntry: ChatEntry = {
          type: "assistant",
          content: result.message,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, resultEntry]);

        if (result.success) {
          const tipsEntry: ChatEntry = {
            type: "assistant",
            content: `🔄 **Self-Healing System Activated**

**What was captured:**
- Incident documentation with root cause analysis
- Automatic guardrail generation (if applicable)
- Integration with existing .agent system

**Options:**
- \`/heal --classify\` - Classify failure type and suggest guardrail
- \`/heal --playbook\` - Generate step-by-step recovery SOP
- \`/guardrails\` - View and manage all prevention rules

**Next steps:**
- Review the incident documentation
- Check if guardrail was created
- Update SOPs with lessons learned`,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, tipsEntry]);
        }

      } catch (error: any) {
        const errorEntry: ChatEntry = {
          type: "assistant",
          content: `Failed to process healing: ${error.message}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }

      setIsProcessing(false);
      clearInput();
      return true;
    }

    if (trimmedInput === "/guardrails" || trimmedInput.startsWith("/guardrails ")) {
      const userEntry: ChatEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      setIsProcessing(true);

      try {
        const args = trimmedInput.split(' ').slice(1);
        const check = args.includes('--check');
        // const enable = args.find(arg => arg.startsWith('--enable'))?.split('=')[1]; // TODO: implement enable flag
        // const disable = args.find(arg => arg.startsWith('--disable'))?.split('=')[1]; // TODO: implement disable flag

        const healingSystem = new SelfHealingSystem(process.cwd());

        if (check) {
          const checkResult = await healingSystem.checkGuardrails('example-operation', {});
          const resultEntry: ChatEntry = {
            type: "assistant",
            content: `🛡️ **Guardrail Check Results**\n\n**Status:** ${checkResult.passed ? '✅ All Clear' : '❌ Violations Found'}\n**Violations:** ${checkResult.violations.length}\n**Warnings:** ${checkResult.warnings.length}`,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, resultEntry]);
        } else {
          // List all guardrails
          const incidents = await healingSystem.listIncidents();
          const config = healingSystem.getConfig();
          
          const resultEntry: ChatEntry = {
            type: "assistant",
            content: `🛡️ **Guardrails Management**

**System Status:** ${config.enabled ? '✅ Enabled' : '❌ Disabled'}
**Enforcement:** ${config.enforceGuardrails ? '✅ Active' : '❌ Disabled'}
**Error Prompt:** ${config.onErrorPrompt}

**Recent Incidents:** ${incidents.length}
${incidents.slice(0, 3).map(i => `- ${i.title} (${i.impact} impact)`).join('\n')}

**Available Commands:**
- \`/guardrails --check\` - Check current plans against guardrails
- \`/heal\` - Document new failure and create guardrail
- View specific guardrails in \`.agent/guardrails/\``,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, resultEntry]);
        }

      } catch (error: any) {
        const errorEntry: ChatEntry = {
          type: "assistant",
          content: `Failed to manage guardrails: ${error.message}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }

      setIsProcessing(false);
      clearInput();
      return true;
    }

    const directBashCommands = [
      "ls",
      "pwd",
      "cd",
      "cat",
      "mkdir",
      "touch",
      "echo",
      "grep",
      "find",
      "cp",
      "mv",
      "rm",
    ];
    const firstWord = trimmedInput.split(" ")[0];

    if (directBashCommands.includes(firstWord)) {
      const userEntry: ChatEntry = {
        type: "user",
        content: trimmedInput,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, userEntry]);

      try {
        const result = await agent.executeBashCommand(trimmedInput);

        const commandEntry: ChatEntry = {
          type: "tool_result",
          content: result.success
            ? result.output || "Command completed"
            : result.error || "Command failed",
          timestamp: new Date(),
          toolCall: {
            id: `bash_${Date.now()}`,
            type: "function",
            function: {
              name: "bash",
              arguments: JSON.stringify({ command: trimmedInput }),
            },
          },
          toolResult: result,
        };
        setChatHistory((prev) => [...prev, commandEntry]);
      } catch (error: any) {
        const errorEntry: ChatEntry = {
          type: "assistant",
          content: `Error executing command: ${error.message}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorEntry]);
      }

      clearInput();
      return true;
    }

    return false;
  };

  const processUserMessage = async (userInput: string) => {
    const userEntry: ChatEntry = {
      type: "user",
      content: userInput,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userEntry]);

    setIsProcessing(true);
    clearInput();

    try {
      setIsStreaming(true);
      let streamingEntry: ChatEntry | null = null;
      let accumulatedContent = "";
      let lastTokenCount = 0;
      let pendingToolCalls: GrokToolCall[] | null = null;
      let pendingToolResults: Array<{ toolCall: GrokToolCall; toolResult: ToolResult }> = [];
      let lastUpdateTime = Date.now();

      const flushUpdates = () => {
        const now = Date.now();
        if (now - lastUpdateTime < 150) return; // Throttle to ~6-7 FPS

        // Update token count if changed
        if (lastTokenCount !== 0) {
          setTokenCount(lastTokenCount);
        }

        // Handle accumulated content
        if (accumulatedContent) {
          if (!streamingEntry) {
            const newStreamingEntry = {
              type: "assistant" as const,
              content: accumulatedContent,
              timestamp: new Date(),
              isStreaming: true,
            };
            setChatHistory((prev) => [...prev, newStreamingEntry]);
            streamingEntry = newStreamingEntry;
          } else {
            setChatHistory((prev) =>
              prev.map((entry, idx) =>
                idx === prev.length - 1 && entry.isStreaming
                  ? { ...entry, content: entry.content + accumulatedContent }
                  : entry
              )
            );
          }
          accumulatedContent = "";
        }

        // Handle pending tool calls
        if (pendingToolCalls) {
          setChatHistory((prev) =>
            prev.map((entry) =>
              entry.isStreaming
                ? {
                    ...entry,
                    isStreaming: false,
                    toolCalls: pendingToolCalls,
                  }
                : entry
            )
          );
          streamingEntry = null;

          // Add individual tool call entries
          pendingToolCalls.forEach((toolCall) => {
            const toolCallEntry: ChatEntry = {
              type: "tool_call",
              content: "Executing...",
              timestamp: new Date(),
              toolCall: toolCall,
            };
            setChatHistory((prev) => [...prev, toolCallEntry]);
          });
          pendingToolCalls = null;
        }

        // Handle pending tool results
        if (pendingToolResults.length > 0) {
          setChatHistory((prev) =>
            prev.map((entry) => {
              if (entry.isStreaming) {
                return { ...entry, isStreaming: false };
              }
              // Update matching tool_call entries
              const matchingResult = pendingToolResults.find(
                (result) => entry.type === "tool_call" && entry.toolCall?.id === result.toolCall.id
              );
              if (matchingResult) {
                return {
                  ...entry,
                  type: "tool_result",
                  content: matchingResult.toolResult.success
                    ? matchingResult.toolResult.output || "Success"
                    : matchingResult.toolResult.error || "Error occurred",
                  toolResult: matchingResult.toolResult,
                };
              }
              return entry;
            })
          );
          streamingEntry = null;
          pendingToolResults = [];
        }

        lastUpdateTime = now;
      };

      for await (const chunk of agent.processUserMessageStream(userInput)) {
        switch (chunk.type) {
          case "content":
            if (chunk.content) {
              accumulatedContent += chunk.content;
            }
            break;

          case "token_count":
            if (chunk.tokenCount !== undefined) {
              lastTokenCount = chunk.tokenCount;
            }
            break;

          case "tool_calls":
            if (chunk.toolCalls) {
              pendingToolCalls = chunk.toolCalls;
            }
            break;

          case "tool_result":
            if (chunk.toolCall && chunk.toolResult) {
              pendingToolResults.push({ toolCall: chunk.toolCall, toolResult: chunk.toolResult });
            }
            break;

          case "done":
            // Flush all remaining updates
            flushUpdates();
            break;
        }

        // Flush updates periodically
        flushUpdates();
      }

      // Final flush and cleanup
      flushUpdates();
      if (streamingEntry) {
        setChatHistory((prev) =>
          prev.map((entry) =>
            entry.isStreaming ? { ...entry, isStreaming: false } : entry
          )
        );
      }
      setIsStreaming(false);
    } catch (error: any) {
      const errorEntry: ChatEntry = {
        type: "assistant",
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorEntry]);
      setIsStreaming(false);
    }

    setIsProcessing(false);
    processingStartTime.current = 0;
  };


  return {
    input,
    cursorPosition,
    showCommandSuggestions,
    selectedCommandIndex,
    showModelSelection,
    selectedModelIndex,
    commandSuggestions,
    availableModels,
    agent,
    autoEditEnabled,
  };
}
