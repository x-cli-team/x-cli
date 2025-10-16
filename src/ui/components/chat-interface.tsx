import React, { useState, useEffect, useRef } from "react";
import pkg from '../../../package.json' with { type: 'json' };
import fs from 'fs';
import path from 'path';
import os from 'os';

import { Box, Text, DOMElement } from "ink";
import { GrokAgent, ChatEntry } from "../../agent/grok-agent.js";
import { useInputHandler } from "../../hooks/use-input-handler.js";
import { LoadingSpinner } from "./loading-spinner.js";
import { CommandSuggestions } from "./command-suggestions.js";
import { ModelSelection } from "./model-selection.js";
import { ChatHistory } from "./chat-history.js";
import { ChatInput } from "./chat-input.js";
import { MCPStatus } from "./mcp-status.js";
import ConfirmationDialog from "./confirmation-dialog.js";
import {
  ConfirmationService,
  ConfirmationOptions,
} from "../../utils/confirmation-service.js";
import ApiKeyInput from "./api-key-input.js";

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
  const scrollRef = useRef<DOMElement | null>(null);
  const processingStartTime = useRef<number>(0);
  const lastChatHistoryLength = useRef<number>(0);

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
    const logoOutput = "HURRY MODE" + "\n" + pkg.version;

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
          let pendingToolCalls: any[] | null = null;
          let pendingToolResults: Array<{ toolCall: any; toolResult: any }> = [];
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

  return (
    <Box flexDirection="column" paddingX={2}>
      {/* Show logo and tips only when no chat history and no confirmation dialog */}
      {chatHistory.length === 0 && !confirmationOptions && (
        <Box flexDirection="column" marginBottom={2}>
          <Text color="cyan" bold>
{`    dBBBBb dBBBBBb    dBBBBP  dBP dBP          dBBBP  dBP    dBP
               dBP   dB'.BP  dBP.d8P                            
  dBBBB    dBBBBK'  dB'.BP  dBBBBP'          dBP    dBP    dBP  
 dB' BB   dBP  BB  dB'.BP  dBP BB  dBBBBBP  dBP    dBP    dBP   
dBBBBBB  dBP  dB' dBBBBP  dBP dB'          dBBBBP dBBBBP dBP    `}
          </Text>
          <Text color="cyan" bold>
            Tips for getting started:
          </Text>
          <Box marginTop={1} flexDirection="column">
            <Text color="gray">
              1. Ask questions, edit files, or run commands.
            </Text>
            <Text color="gray">2. Be specific for the best results.</Text>
            <Text color="gray">
              3. Create GROK.md files to customize your interactions with Grok.
            </Text>
            <Text color="gray">
              4. Press Shift+Tab to toggle auto-edit mode.
            </Text>
            <Text color="gray">
              5. Run "/init-agent" to set up an .agent docs system for this project.
            </Text>
            <Text color="gray">
              6. Run "/heal" after errors to capture a fix and add a guardrail.
            </Text>
            <Text color="gray">7. /help for more information.</Text>
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
          />

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
            <MCPStatus />
          </Box>

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
