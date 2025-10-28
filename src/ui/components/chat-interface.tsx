import React, { useState, useEffect, useRef } from "react";
import { GrokAgent, ChatEntry } from "../../agent/grok-agent.js";
import { useInputHandler } from "../../hooks/use-input-handler.js";
import {
  ConfirmationService,
  ConfirmationOptions,
} from "../../utils/confirmation-service.js";
import ApiKeyInput from "./api-key-input.js";
import { useContextInfo } from "../../hooks/use-context-info.js";
import { useAutoRead } from "../../hooks/use-auto-read.js";
import { useStreaming } from "../../hooks/use-streaming.js";
import { useConfirmations } from "../../hooks/use-confirmations.js";
import { useConsoleSetup } from "../../hooks/use-console-setup.js";
import { useSessionLogging } from "../../hooks/use-session-logging.js";
import { useProcessingTimer } from "../../hooks/use-processing-timer.js";
import { ChatInterfaceRenderer, ContextInfo, PlanMode } from "../../ui/components/chat-interface-renderer.js";

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

  const processingStartTime = useRef<number>(0);

  // Setup console display and logo
  useConsoleSetup();

  // Initialize chat history
  useEffect(() => {
    setChatHistory([]);
    useAutoRead(setChatHistory);
  }, []);

  // Session logging
  useSessionLogging(chatHistory);

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
    verbosityLevel,
    explainLevel,
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

  // Use streaming hook for processing initial messages
  useStreaming(agent, initialMessage, setChatHistory, {
    isProcessing,
    isStreaming,
    setIsProcessing,
    setIsStreaming,
    setTokenCount,
    setChatHistory,
  });

  // Use confirmations hook for handling confirmation dialogs
  const { handleConfirmation, handleRejection } = useConfirmations(
    confirmationService,
    {
      confirmationOptions,
      setConfirmationOptions,
      setIsProcessing,
      setIsStreaming,
      setTokenCount,
      setProcessingTime,
      processingStartTime,
    }
  );

  // Processing timer
  useProcessingTimer(isProcessing, isStreaming, setProcessingTime);

  const toggleContextTooltip = () => {
    setShowContextTooltip(prev => !prev);
  };

  return (
    <ChatInterfaceRenderer
      chatHistory={chatHistory}
      confirmationOptions={confirmationOptions}
      showContextTooltip={showContextTooltip}
      contextInfo={contextInfo as ContextInfo}
      verbosityLevel={verbosityLevel}
      explainLevel={explainLevel}
      isProcessing={isProcessing}
      isStreaming={isStreaming}
      processingTime={processingTime}
      tokenCount={tokenCount}
      planMode={planMode as PlanMode}
      input={input}
      cursorPosition={cursorPosition}
      autoEditEnabled={autoEditEnabled}
      agent={agent}
      commandSuggestions={commandSuggestions}
      selectedCommandIndex={selectedCommandIndex}
      showCommandSuggestions={showCommandSuggestions}
      availableModels={availableModels}
      selectedModelIndex={selectedModelIndex}
      showModelSelection={showModelSelection}
      handleConfirmation={handleConfirmation}
      handleRejection={handleRejection}
      toggleContextTooltip={toggleContextTooltip}
    />
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
