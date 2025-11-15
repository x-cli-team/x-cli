import { useState, useCallback, useRef } from "react";
import {
  deleteCharBefore,
  deleteCharAfter,
  deleteWordBefore,
  deleteWordAfter,
  insertText,
  moveToLineStart,
  moveToLineEnd,
  moveToPreviousWord,
  moveToNextWord,
} from "../utils/text-utils.js";
import { useInputHistory } from "./use-input-history.js";

// Debug logging disabled - using session logger instead  
const enhancedLog = (..._args: any[]) => {
  // Disabled debug logging
};

export interface Key {
  name?: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  paste?: boolean;
  sequence?: string;
  upArrow?: boolean;
  downArrow?: boolean;
  leftArrow?: boolean;
  rightArrow?: boolean;
  return?: boolean;
  escape?: boolean;
  tab?: boolean;
  backspace?: boolean;
  delete?: boolean;
}

export interface EnhancedInputHook {
  input: string;
  cursorPosition: number;
  isMultiline: boolean;
  setInput: (text: string) => void;
  setCursorPosition: (position: number) => void;
  clearInput: () => void;
  insertAtCursor: (text: string) => void;
  resetHistory: () => void;
  handleInput: (inputChar: string, key: Key) => void;
}

interface UseEnhancedInputProps {
  onSubmit?: (text: string) => void;
  onEscape?: () => void;
  onSpecialKey?: (key: Key) => boolean; // Return true to prevent default handling
  disabled?: boolean;
  multiline?: boolean;
}

export function useEnhancedInput({
  onSubmit,
  onEscape,
  onSpecialKey,
  disabled = false,
  multiline = false,
}: UseEnhancedInputProps = {}): EnhancedInputHook {
  const [input, setInputState] = useState("");
  const [cursorPosition, setCursorPositionState] = useState(0);
  
  // Wrapper for setInputState (debug logging removed)
  const debugSetInputState = useCallback((newInput: string) => {
    setInputState(newInput);
  }, []);
  
  // Wrapper for setCursorPositionState (debug logging removed)
  const debugSetCursorPositionState = useCallback((newPos: number) => {
    setCursorPositionState(newPos);
  }, []);
  const isMultilineRef = useRef(multiline);
  
  const {
    addToHistory,
    navigateHistory,
    resetHistory,
    setOriginalInput,
    isNavigatingHistory,
  } = useInputHistory();

  const setInput = useCallback((text: string) => {
    enhancedLog('🔄 setInput called');
    enhancedLog('setInput details:', {
      previousInput: input.slice(0, 100) + (input.length > 100 ? '...' : ''),
      newText: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
      previousLength: input.length,
      newLength: text.length,
      cursorPosition,
      isNavigatingHistory: isNavigatingHistory()
    });

    const previousInput = input;
    debugSetInputState(text);
    debugSetCursorPositionState(Math.min(text.length, cursorPosition));
    if (!isNavigatingHistory()) {
      setOriginalInput(text);
    }

    enhancedLog('✅ setInput completed');

    // NOTE: Paste detection is now handled by UI component and input handler
    // This duplicate detection was causing counter increments on regular typing
    // The UI-based detection in chat-input.tsx handles paste detection instead
  }, [input, cursorPosition, isNavigatingHistory, setOriginalInput]);

  const setCursorPosition = useCallback((position: number) => {
    debugSetCursorPositionState(Math.max(0, Math.min(input.length, position)));
  }, [input.length, debugSetCursorPositionState]);

  const clearInput = useCallback(() => {
    debugSetInputState("");
    debugSetCursorPositionState(0);
    setOriginalInput("");
  }, [setOriginalInput, debugSetInputState, debugSetCursorPositionState]);

  const insertAtCursor = useCallback((text: string) => {
    const result = insertText(input, cursorPosition, text);
    debugSetInputState(result.text);
    debugSetCursorPositionState(result.position);
    setOriginalInput(result.text);
  }, [input, cursorPosition, setOriginalInput]);

  const handleSubmit = useCallback(() => {
    if (input.trim()) {
      addToHistory(input);
      onSubmit?.(input);
      clearInput();
    }
  }, [input, addToHistory, onSubmit, clearInput]);

  const handleInput = useCallback((inputChar: string, key: Key) => {
    enhancedLog('⌨️ handleInput called');
    enhancedLog('Input event:', {
      inputChar: inputChar === '' ? '(empty)' : inputChar,
      charCode: inputChar.charCodeAt(0) || 'N/A',
      key: {
        name: key.name || 'undefined',
        ctrl: !!key.ctrl,
        meta: !!key.meta,
        shift: !!key.shift,
        paste: !!key.paste,
        return: !!key.return,
        backspace: !!key.backspace,
        delete: !!key.delete
      },
      currentInput: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
      currentInputLength: input.length,
      disabled
    });

    if (disabled) {
      enhancedLog('❌ Input disabled, returning early');
      return;
    }

    // Handle Ctrl+C - check multiple ways it could be detected
    if ((key.ctrl && inputChar === "c") || inputChar === "\x03") {
      debugSetInputState("");
      debugSetCursorPositionState(0);
      setOriginalInput("");
      return;
    }

    // Allow special key handler to override default behavior
    if (onSpecialKey?.(key)) {
      return;
    }

    // Handle Escape
    if (key.escape) {
      onEscape?.();
      return;
    }

    // Handle Enter/Return
    if (key.return) {
      if (multiline && key.shift) {
        // Shift+Enter in multiline mode inserts newline
        const result = insertText(input, cursorPosition, "\n");
        debugSetInputState(result.text);
        debugSetCursorPositionState(result.position);
        setOriginalInput(result.text);
      } else {
        handleSubmit();
      }
      return;
    }

    // Handle history navigation
    if ((key.upArrow || key.name === 'up') && !key.ctrl && !key.meta) {
      const historyInput = navigateHistory("up");
      if (historyInput !== null) {
        debugSetInputState(historyInput);
        debugSetCursorPositionState(historyInput.length);
      }
      return;
    }

    if ((key.downArrow || key.name === 'down') && !key.ctrl && !key.meta) {
      const historyInput = navigateHistory("down");
      if (historyInput !== null) {
        debugSetInputState(historyInput);
        debugSetCursorPositionState(historyInput.length);
      }
      return;
    }

    // Handle cursor movement - ignore meta flag for arrows as it's unreliable in terminals
    // Only do word movement if ctrl is pressed AND no arrow escape sequence is in inputChar
    if ((key.leftArrow || key.name === 'left') && key.ctrl && !inputChar.includes('[')) {
      const newPos = moveToPreviousWord(input, cursorPosition);
      debugSetCursorPositionState(newPos);
      return;
    }

    if ((key.rightArrow || key.name === 'right') && key.ctrl && !inputChar.includes('[')) {
      const newPos = moveToNextWord(input, cursorPosition);
      debugSetCursorPositionState(newPos);
      return;
    }

    // Handle regular cursor movement - single character (ignore meta flag)
    if (key.leftArrow || key.name === 'left') {
      const newPos = Math.max(0, cursorPosition - 1);
      debugSetCursorPositionState(newPos);
      return;
    }

    if (key.rightArrow || key.name === 'right') {
      const newPos = Math.min(input.length, cursorPosition + 1);
      debugSetCursorPositionState(newPos);
      return;
    }

    // Handle Home/End keys or Ctrl+A/E
    if ((key.ctrl && inputChar === "a") || key.name === "home") {
      debugSetCursorPositionState(0); // Simple start of input
      return;
    }

    if ((key.ctrl && inputChar === "e") || key.name === "end") {
      debugSetCursorPositionState(input.length); // Simple end of input
      return;
    }

    // Handle deletion - check multiple ways backspace might be detected
    // Backspace can be detected in different ways depending on terminal
    // In some terminals, backspace shows up as delete:true with empty inputChar
    const isBackspace = key.backspace || 
                       key.name === 'backspace' || 
                       inputChar === '\b' || 
                       inputChar === '\x7f' ||
                       (key.delete && inputChar === '' && !key.shift);
                       
    if (isBackspace) {
      if (key.ctrl || key.meta) {
        // Ctrl/Cmd + Backspace: Delete word before cursor
        const result = deleteWordBefore(input, cursorPosition);
        debugSetInputState(result.text);
        debugSetCursorPositionState(result.position);
        setOriginalInput(result.text);
      } else {
        // Regular backspace
        const result = deleteCharBefore(input, cursorPosition);
        debugSetInputState(result.text);
        debugSetCursorPositionState(result.position);
        setOriginalInput(result.text);
      }
      return;
    }

    // Handle forward delete (Del key) - but not if it was already handled as backspace above
    if ((key.delete && inputChar !== '') || (key.ctrl && inputChar === "d")) {
      if (key.ctrl || key.meta) {
        // Ctrl/Cmd + Delete: Delete word after cursor
        const result = deleteWordAfter(input, cursorPosition);
        debugSetInputState(result.text);
        debugSetCursorPositionState(result.position);
        setOriginalInput(result.text);
      } else {
        // Regular delete
        const result = deleteCharAfter(input, cursorPosition);
        debugSetInputState(result.text);
        debugSetCursorPositionState(result.position);
        setOriginalInput(result.text);
      }
      return;
    }

    // Handle Ctrl+K: Delete from cursor to end of line
    if (key.ctrl && inputChar === "k") {
      const lineEnd = moveToLineEnd(input, cursorPosition);
      const newText = input.slice(0, cursorPosition) + input.slice(lineEnd);
      debugSetInputState(newText);
      setOriginalInput(newText);
      return;
    }

    // Handle Ctrl+U: Delete from cursor to start of line
    if (key.ctrl && inputChar === "u") {
      const lineStart = moveToLineStart(input, cursorPosition);
      const newText = input.slice(0, lineStart) + input.slice(cursorPosition);
      debugSetInputState(newText);
      debugSetCursorPositionState(lineStart);
      setOriginalInput(newText);
      return;
    }

    // Handle Ctrl+W: Delete word before cursor
    if (key.ctrl && inputChar === "w") {
      const result = deleteWordBefore(input, cursorPosition);
      debugSetInputState(result.text);
      debugSetCursorPositionState(result.position);
      setOriginalInput(result.text);
      return;
    }

    // Handle Ctrl+X: Clear entire input
    if (key.ctrl && inputChar === "x") {
      debugSetInputState("");
      debugSetCursorPositionState(0);
      setOriginalInput("");
      return;
    }

    // Handle regular character input
    if (inputChar && !key.ctrl && !key.meta) {
      enhancedLog('📝 Regular character input detected');
      enhancedLog('Character details:', {
        character: inputChar,
        currentPosition: cursorPosition,
        currentInputLength: input.length,
        willInsertAt: cursorPosition
      });

      const previousInput = input;
      const result = insertText(input, cursorPosition, inputChar);
      
      enhancedLog('📝 Text insertion result:', {
        oldLength: input.length,
        newLength: result.text.length,
        newPosition: result.position,
        insertedChar: inputChar
      });
      
      debugSetInputState(result.text);
      debugSetCursorPositionState(result.position);
      setOriginalInput(result.text);

      enhancedLog('✅ Regular character input completed');

      // Note: Paste detection is handled in setInput(), not here
      // This avoids duplicate detection events
    } else {
      enhancedLog('❌ Character input skipped:', {
        hasInputChar: !!inputChar,
        isCtrl: !!key.ctrl,
        isMeta: !!key.meta,
        reason: !inputChar ? 'No input char' : (key.ctrl ? 'Ctrl pressed' : 'Meta pressed')
      });
    }
  }, [disabled, onSpecialKey, input, cursorPosition, multiline, handleSubmit, navigateHistory, setOriginalInput]);

  return {
    input,
    cursorPosition,
    isMultiline: isMultilineRef.current,
    setInput,
    setCursorPosition,
    clearInput,
    insertAtCursor,
    resetHistory,
    handleInput,
  };
}