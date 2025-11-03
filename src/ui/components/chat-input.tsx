import React from "react";
import { Box, Text } from "ink";

interface ChatInputProps {
  input: string;
  cursorPosition: number;
  isProcessing: boolean;
  isStreaming: boolean;
}

export function ChatInput({
  input,
  cursorPosition,
  isProcessing,
  isStreaming,
}: ChatInputProps) {
  const beforeCursor = input.slice(0, cursorPosition);
  // afterCursor removed - not used in single line mode

  // Handle multiline input display - support different line endings
  const lines = input.split(/\r\n|\r|\n/);
  const isMultiline = lines.length > 1;
  
  // Limit display to reasonable number of lines to prevent terminal overflow
  const MAX_DISPLAY_LINES = 10;
  const shouldTruncateDisplay = lines.length > MAX_DISPLAY_LINES;
  
  // Optional debug logging
  if (shouldTruncateDisplay) {
    console.log(`📄 Large paste detected: ${lines.length} lines, showing truncated view`);
  }

  // Calculate cursor position across lines
  let currentLineIndex = 0;
  let currentCharIndex = 0;
  let totalChars = 0;

  for (let i = 0; i < lines.length; i++) {
    if (totalChars + lines[i].length >= cursorPosition) {
      currentLineIndex = i;
      currentCharIndex = cursorPosition - totalChars;
      break;
    }
    totalChars += lines[i].length + 1; // +1 for newline
  }

  const showCursor = !isProcessing && !isStreaming;
  const borderColor = isProcessing || isStreaming ? "yellow" : "blue";
  const promptColor = "cyan";

  // Display placeholder when input is empty
  const placeholderText = "Ask me anything...";
  const isPlaceholder = !input;

  if (isMultiline) {
    return (
      <Box
        borderStyle="round"
        borderColor={borderColor}
        paddingX={1}
        paddingY={0}
        marginTop={1}
        flexDirection="column"
      >
        <Text>
          {shouldTruncateDisplay ? (
            // Show truncated view for very large pastes
            `❯ [Large paste: ${lines.length} lines, ${input.length} chars]
  First few lines:
  ${lines.slice(0, 3).map(line => `  ${line}`).join('\n')}
  ...
  Last few lines:
  ${lines.slice(-2).map(line => `  ${line}`).join('\n')}
  
  Press Enter to submit or edit to modify.`
          ) : (
            // Normal multiline display for reasonable sizes
            lines.map((line, index) => {
              const isCurrentLine = index === currentLineIndex;
              const promptChar = index === 0 ? "❯ " : "  ";
              
              let lineText = promptChar + line;
              
              // Add cursor if this is the current line
              if (isCurrentLine && showCursor) {
                const cursorPos = promptChar.length + currentCharIndex;
                lineText = lineText.slice(0, cursorPos) + 
                          "█" + 
                          lineText.slice(cursorPos + 1);
              }
              
              return index === lines.length - 1 ? lineText : lineText + "\n";
            }).join("")
          )}
        </Text>
      </Box>
    );
  }

  // Single line input box
  const cursorChar = input.slice(cursorPosition, cursorPosition + 1) || " ";
  const afterCursorText = input.slice(cursorPosition + 1);

  return (
    <Box
      borderStyle="round"
      borderColor={borderColor}
      paddingX={1}
      paddingY={0}
      marginTop={1}
    >
      <Box>
        <Text color={promptColor}>❯ </Text>
        {isPlaceholder ? (
          <>
            <Text color="gray" dimColor>
              {placeholderText}
            </Text>
            {showCursor && (
              <Text backgroundColor="white" color="black">
                {" "}
              </Text>
            )}
          </>
        ) : (
          <Text>
            {beforeCursor}
            {showCursor && (
              <Text backgroundColor="white" color="black">
                {cursorChar}
              </Text>
            )}
            {!showCursor && cursorChar !== " " && cursorChar}
            {afterCursorText}
          </Text>
        )}
      </Box>
    </Box>
  );
}
