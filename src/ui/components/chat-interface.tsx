import React, { useState, useEffect, useRef } from "react";
import pkg from '../../../package.json' with { type: 'json' };
import fs from 'fs';
import path from 'path';
import os from 'os';

import { Box, Text, DOMElement } from "ink";
import { GrokAgent, ChatEntry } from "../../agent/grok-agent.js";
import { GrokToolCall } from "../../grok/client.js";
import { useInputHandler } from "../../hooks/use-input-handler.js";
import { LoadingSpinner } from "./loading-spinner.js";
import { CommandSuggestions } from "./command-suggestions.js";
import { ModelSelection } from "./model-selection.js";
import { ChatHistory } from "./chat-history.js";
import { ChatInput } from "./chat-input.js";
import { MCPStatus } from "./mcp-status.js";
import ConfirmationDialog from "./confirmation-dialog.js";
import { Banner } from "./banner.js";
import { ContextTooltip } from "./context-tooltip.js";
import { VersionNotification } from "./version-notification.js";
import { PlanModeIndicator, PlanModeStatusIndicator } from "./plan-mode-indicator.js";
import ContextIndicator from "./context-indicator.js";
import {
  ConfirmationService,
  ConfirmationOptions,
} from "../../utils/confirmation-service.js";
import ApiKeyInput from "./api-key-input.js";
import { useContextInfo } from "../../hooks/use-context-info.js";

interface ChatInterfaceProps {
  agent?: GrokAgent;
  initialMessage?: string;
}

// Main chat component that handles input when agent is available
function ChatInterfaceWithAgent({
  agent,
  initialMessage,
}: {
  agent: GrokAgent;
  initialMessage?: string;
}) {
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [confirmationOptions, setConfirmationOptions] =
    useState<ConfirmationOptions | null>(null);
  const [showContextTooltip, setShowContextTooltip] = useState(false);
  const scrollRef = useRef<DOMElement | null>(null);
  const processingStartTime = useRef<number>(0);
  const lastChatHistoryLength = useRef<number>(0);
  
  // Get context information for banner, tooltip, and context indicator
  const { contextInfo } = useContextInfo(agent);

  // Handle global keyboard shortcuts via input handler
  const handleGlobalShortcuts = (str: string, key: any) => {
    if (key.ctrl && (str === 'i' || key.name === 'i')) {
      setShowContextTooltip(prev => !prev);
      return true;
    }
    return false;
  };


  const confirmationService = ConfirmationService.getInstance();

  const {
    input,
    cursorPosition,
    showCommandSuggestions,
    selectedCommandIndex,
    showModelSelection,
    selectedModelIndex,
    commandSuggestions,
    availableModels,
    autoEditEnabled,
    planMode,
  } = useInputHandler({
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
    isConfirmationActive: !!confirmationOptions,
    onGlobalShortcut: handleGlobalShortcuts,
  });

  useEffect(() => {
    // Only clear console on non-Windows platforms or if not PowerShell
    // Windows PowerShell can have issues with console.clear() causing flickering
    const isWindows = process.platform === "win32";
    const isPowerShell =
      process.env.ComSpec?.toLowerCase().includes("powershell") ||
      process.env.PSModulePath !== undefined;

    if (!isWindows || !isPowerShell) {
      console.clear();
    }

    // Add top padding
    console.log("    ");



    console.log(" ");

    // Generate welcome text with margin to match Ink paddingX={2}
    const logoOutput = "X-CLI" + "\n" + pkg.version;

    const logoLines = logoOutput.split("\n");
    logoLines.forEach((line: string) => {
      if (line.trim()) {
        console.log(" " + line); // Add 2 spaces for horizontal margin
      } else {
        console.log(line); // Keep empty lines as-is
      }
    });

    console.log(" "); // Spacing after logo

    setChatHistory([]);
  }, []);

  // Session logging: append new chat entries to ~/.grok/session.log
  useEffect(() => {
    const newEntries = chatHistory.slice(lastChatHistoryLength.current);
    if (newEntries.length > 0) {
      const sessionFile = path.join(os.homedir(), '.grok', 'session.log');
      try {
        const dir = path.dirname(sessionFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const lines = newEntries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
        fs.appendFileSync(sessionFile, lines);
      } catch {
        // Silently ignore session logging errors
      }
    }
    lastChatHistoryLength.current = chatHistory.length;
  }, [chatHistory]);

  // Process initial message if provided (streaming for faster feedback)
  useEffect(() => {
    if (initialMessage && agent) {
      const userEntry: ChatEntry = {
        type: "user",
        content: initialMessage,
        timestamp: new Date(),
      };
      setChatHistory([userEntry]);

      const processInitialMessage = async () => {
        setIsProcessing(true);
        setIsStreaming(true);

        try {
          let streamingEntry: ChatEntry | null = null;
          let accumulatedContent = "";
          let lastTokenCount = 0;
          let pendingToolCalls: GrokToolCall[] | null = null;
          let pendingToolResults: Array<{ toolCall: GrokToolCall; toolResult: any }> = [];
          let lastUpdateTime = Date.now();

          const flushUpdates = () => {
            const now = Date.now();
            if (now - lastUpdateTime < 150) return; // Throttle to ~6-7 FPS to reduce re-render frequency

            // Batch all chat history updates into a single setState call
            setChatHistory((prev) => {
              let newHistory = [...prev];

              // Update token count if changed
              if (lastTokenCount !== 0) {
                // Note: token count is handled separately, not in chat history
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
                  newHistory.push(newStreamingEntry);
                  streamingEntry = newStreamingEntry;
                } else {
                  const lastIdx = newHistory.length - 1;
                  if (lastIdx >= 0 && newHistory[lastIdx].isStreaming) {
                    newHistory[lastIdx] = { ...newHistory[lastIdx], content: newHistory[lastIdx].content + accumulatedContent };
                  }
                }
                accumulatedContent = "";
              }

              // Handle pending tool calls
              if (pendingToolCalls) {
                // Mark streaming entry as complete
                const streamingIdx = newHistory.findIndex(entry => entry.isStreaming);
                if (streamingIdx >= 0) {
                  newHistory[streamingIdx] = { ...newHistory[streamingIdx], isStreaming: false, toolCalls: pendingToolCalls };
                }
                streamingEntry = null;

                // Add individual tool call entries
                pendingToolCalls.forEach((toolCall) => {
                  const toolCallEntry: ChatEntry = {
                    type: "tool_call",
                    content: "Executing...",
                    timestamp: new Date(),
                    toolCall: toolCall,
                  };
                  newHistory.push(toolCallEntry);
                });
                pendingToolCalls = null;
              }

              // Handle pending tool results
              if (pendingToolResults.length > 0) {
                newHistory = newHistory.map((entry) => {
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
                });
                streamingEntry = null;
                pendingToolResults = [];
              }

              return newHistory;
            });

            // Update token count separately
            if (lastTokenCount !== 0) {
              setTokenCount(lastTokenCount);
            }

            lastUpdateTime = now;
          };

          for await (const chunk of agent.processUserMessageStream(initialMessage)) {
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
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorEntry: ChatEntry = {
            type: "assistant",
            content: `Error: ${errorMessage}`,
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, errorEntry]);
          setIsStreaming(false);
        }

        setIsProcessing(false);
        processingStartTime.current = 0;
      };

      processInitialMessage();
    }
  }, [initialMessage, agent]);

  useEffect(() => {
    const handleConfirmationRequest = (options: ConfirmationOptions) => {
      setConfirmationOptions(options);
    };

    confirmationService.on("confirmation-requested", handleConfirmationRequest);

    return () => {
      confirmationService.off(
        "confirmation-requested",
        handleConfirmationRequest
      );
    };
  }, [confirmationService]);

  useEffect(() => {
    if (!isProcessing && !isStreaming) {
      setProcessingTime(0);
      return;
    }

    if (processingStartTime.current === 0) {
      processingStartTime.current = Date.now();
    }

    const interval = setInterval(() => {
      setProcessingTime(
        Math.floor((Date.now() - processingStartTime.current) / 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing, isStreaming]);

  const handleConfirmation = (dontAskAgain?: boolean) => {
    confirmationService.confirmOperation(true, dontAskAgain);
    setConfirmationOptions(null);
  };

  const handleRejection = (feedback?: string) => {
    confirmationService.rejectOperation(feedback);
    setConfirmationOptions(null);

    // Reset processing states when operation is cancelled
    setIsProcessing(false);
    setIsStreaming(false);
    setTokenCount(0);
    setProcessingTime(0);
    processingStartTime.current = 0;
  };

  const toggleContextTooltip = () => {
    setShowContextTooltip(prev => !prev);
  };

  return (
    <Box flexDirection="column" paddingX={2}>
      {/* Show enhanced banner only when no chat history and no confirmation dialog */}
      {chatHistory.length === 0 && !confirmationOptions && (
        <Box flexDirection="column">
          <Banner 
            style="default"
            showContext={true}
            workspaceFiles={contextInfo.workspaceFiles}
            indexSize={contextInfo.indexSize}
            sessionRestored={contextInfo.sessionFiles > 0}
          />
          
          <Box marginTop={1} flexDirection="column">
            <Text color="cyan" bold>
              💡 Quick Start Tips:
            </Text>
            <Box marginTop={1} flexDirection="column">
              <Text color="gray">
                • <Text color="yellow">Ask anything:</Text> "Create a React component" or "Debug this Python script"
              </Text>
              <Text color="gray">
                • <Text color="yellow">Edit files:</Text> "Add error handling to app.js" 
              </Text>
              <Text color="gray">
                • <Text color="yellow">Run commands:</Text> "Set up a new Node.js project"
              </Text>
              <Text color="gray">
                • <Text color="yellow">Get help:</Text> Type "/help" for all commands
              </Text>
            </Box>
            
            <Box marginTop={1}>
              <Text color="cyan" bold>
                🛠️ Power Features:
              </Text>
            </Box>
            <Box marginTop={1} flexDirection="column">
              <Text color="gray">
                • <Text color="magenta">Auto-edit mode:</Text> Press Shift+Tab to toggle hands-free editing
              </Text>
              <Text color="gray">
                • <Text color="magenta">Project memory:</Text> Create .grok/GROK.md to customize behavior
              </Text>
              <Text color="gray">
                • <Text color="magenta">Documentation:</Text> Run "/init-agent" for .agent docs system
              </Text>
              <Text color="gray">
                • <Text color="magenta">Error recovery:</Text> Run "/heal" after errors to add guardrails
              </Text>
            </Box>
          </Box>
        </Box>
      )}

      <Box flexDirection="column" marginBottom={1}>
        <Text color="gray">
          Type your request in natural language. Ctrl+C to clear, 'exit' to
          quit.
        </Text>
      </Box>

      <Box flexDirection="column" ref={scrollRef}>
        <ChatHistory
          entries={chatHistory}
          isConfirmationActive={!!confirmationOptions}
        />
      </Box>

      {/* Context Tooltip */}
      <ContextTooltip
        isVisible={showContextTooltip}
        onToggle={toggleContextTooltip}
      />

      {/* Show confirmation dialog if one is pending */}
      {confirmationOptions && (
        <ConfirmationDialog
          operation={confirmationOptions.operation}
          filename={confirmationOptions.filename}
          showVSCodeOpen={confirmationOptions.showVSCodeOpen}
          content={confirmationOptions.content}
          onConfirm={handleConfirmation}
          onReject={handleRejection}
        />
      )}

      {!confirmationOptions && (
        <>
          <LoadingSpinner
            isActive={isProcessing || isStreaming}
            processingTime={processingTime}
            tokenCount={tokenCount}
            operation={isStreaming ? 'thinking' : 'process'}
            progress={undefined} // TODO: Add progress tracking for long operations
          />

          <VersionNotification isVisible={!isProcessing && !isStreaming} />
          
          {/* Plan Mode Detailed Indicator */}
          {planMode.isActive && (
            <Box marginBottom={1}>
              <PlanModeIndicator
                isActive={planMode.isActive}
                phase={planMode.currentPhase}
                progress={planMode.progress}
                sessionDuration={planMode.sessionDuration}
                detailed={true}
              />
            </Box>
          )}
          
          <ChatInput
            input={input}
            cursorPosition={cursorPosition}
            isProcessing={isProcessing}
            isStreaming={isStreaming}
          />

          <Box flexDirection="row" marginTop={1}>
            <Box marginRight={2}>
              <Text color="cyan">
                {autoEditEnabled ? "▶" : "⏸"} auto-edit:{" "}
                {autoEditEnabled ? "on" : "off"}
              </Text>
              <Text color="gray" dimColor>
                {" "}
                (shift + tab)
              </Text>
            </Box>
            <Box marginRight={2}>
              <Text color="yellow">≋ {agent.getCurrentModel()}</Text>
            </Box>
            <Box marginRight={2}>
              <PlanModeStatusIndicator
                isActive={planMode.isActive}
                phase={planMode.currentPhase}
                progress={planMode.progress}
              />
            </Box>
            <MCPStatus />
          </Box>

          {/* Context Memory Indicator */}
          {contextInfo.tokenUsage && (
            <Box marginTop={1}>
              <ContextIndicator
                state={{
                  tokenUsage: contextInfo.tokenUsage,
                  memoryPressure: contextInfo.memoryPressure,
                  loadedFiles: contextInfo.loadedFiles,
                  messagesCount: contextInfo.messagesCount,
                  contextHealth: contextInfo.contextHealth,
                  fileCount: contextInfo.loadedFiles.length,
                }}
                compact={true}
              />
            </Box>
          )}

          <CommandSuggestions
            suggestions={commandSuggestions}
            input={input}
            selectedIndex={selectedCommandIndex}
            isVisible={showCommandSuggestions}
          />

          <ModelSelection
            models={availableModels}
            selectedIndex={selectedModelIndex}
            isVisible={showModelSelection}
            currentModel={agent.getCurrentModel()}
          />
        </>
      )}
    </Box>
  );
}

// Main component that handles API key input or chat interface
export default function ChatInterface({
  agent,
  initialMessage,
}: ChatInterfaceProps) {
  const [currentAgent, setCurrentAgent] = useState<GrokAgent | null>(
    agent || null
  );

  const handleApiKeySet = (newAgent: GrokAgent) => {
    setCurrentAgent(newAgent);
  };

  if (!currentAgent) {
    return <ApiKeyInput onApiKeySet={handleApiKeySet} />;
  }

  return (
    <ChatInterfaceWithAgent
      agent={currentAgent}
      initialMessage={initialMessage}
    />
  );
}
