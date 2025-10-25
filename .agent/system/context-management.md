# Context Management System

## Overview

Grok CLI uses a **message-based context management** system that differs significantly from more advanced context management approaches like Claude Code. This document outlines the current implementation, limitations, and roadmap for improvements.

## Current Architecture

### 1. Context Storage

**Primary Context Containers:**

```typescript
private messages: GrokMessage[] = [];          // API conversation history
private chatHistory: ChatEntry[] = [];         // UI chat display
private tokenCounter: TokenCounter;            // Real-time token tracking
```

**Context Flow:**

1. **User Input** → Added to `messages[]` array
2. **System Prompt** → Dynamically built with custom instructions
3. **Tool Execution** → Results appended to `messages[]`
4. **AI Response** → Streamed and stored in context
5. **Context Accumulation** → All messages preserved throughout session

### 2. Context Sources

**Static Context (Loaded Once Per Session):**

- **System Prompt**: Hardcoded tool definitions and instructions
- **Custom Instructions**: From `.grok/GROK.md` file
- **Project Manifest**: From `.grok/project-manifest.json`
- **MCP Tools**: Dynamically loaded tool definitions

**Dynamic Context (On-Demand):**

- **File Contents**: Via `str_replace_editor` tool execution
- **Command Outputs**: Via `bash` tool execution
- **Search Results**: Via `grep`, `glob`, and search tools
- **Code Analysis**: Via AST parser and symbol search tools

### 3. File Context Loading Strategy

**Current Approach:**

- **No Preloading**: Files not loaded until explicitly accessed
- **Tool-Driven**: File content enters context only via tool execution
- **Full File Loading**: Entire files loaded at once (no chunking)
- **Context Persistence**: File contents remain in context after loading

**File Access Patterns:**

```typescript
// File content enters context via tools:
str_replace_editor → Read entire file
grep → Search results with context lines
bash → Command outputs including file content
ast_parser → Code structure analysis
```

### 4. Token Management

**Token Counting:**

```typescript
class TokenCounter {
  countTokens(text: string): number;
  countMessageTokens(messages): number;
  estimateStreamingTokens(content): number;
}
```

**Token Tracking:**

- **Real-time counting** during streaming responses
- **Message-level tracking** for entire conversation
- **No automatic limits** - relies on model's context window
- **No context compression** when approaching limits

### 5. Memory Management

**Session Memory:**

- **Unlimited accumulation** of messages and tool results
- **No automatic cleanup** of old context
- **No conversation summarization** or compression
- **Memory grows indefinitely** during long sessions

**Cross-Session Persistence:**

- **No conversation history** persisted between sessions
- **Project manifest** persists and auto-updates
- **Custom instructions** persist in `.grok/GROK.md`

## Current Limitations

### 1. Context Window Management

- **No chunking system** for large files
- **No sliding window** for long conversations
- **No automatic compression** when approaching token limits
- **Could hit model limits** on extended sessions

### 2. File Context Strategy

- **All-or-nothing loading** (entire files or none)
- **No intelligent chunking** based on relevance
- **No semantic segmentation** of large files
- **No context prioritization** (all content equal weight)

### 3. Memory Efficiency

- **Unbounded growth** of context during sessions
- **No context cleanup** mechanisms
- **No conversation summarization**
- **Potential performance issues** on long sessions

### 4. Context Awareness

- **No live context visibility** for users
- **No memory pressure indicators**
- **No file context status display**
- **Limited context introspection** capabilities

## Claude Code Comparison

**Research Needed:** Current understanding of Claude Code's context management is limited. Key areas to investigate:

### Suspected Claude Code Advantages:

1. **Intelligent Chunking**: Semantic segmentation of large files
2. **Context Prioritization**: Smart relevance-based context selection
3. **Sliding Window**: Automatic management of context window limits
4. **Context Compression**: Summarization of older conversation parts
5. **File Relationship Mapping**: Understanding of file dependencies
6. **Live Context Display**: Real-time context status for users

### Research Tasks:

- [ ] Analyze Claude Code's context management approach
- [ ] Compare token efficiency strategies
- [ ] Study file loading and chunking mechanisms
- [ ] Understand context prioritization algorithms
- [ ] Research context window optimization techniques

## Improvement Roadmap

### Phase 1: Context Visibility (P0)

- **Context Status Indicator**: Show current memory usage and loaded files
- **Token Counter Display**: Real-time token usage with limits
- **File Context List**: Show which files are currently in context
- **Memory Pressure Warnings**: Alert when approaching limits

### Phase 2: Context Management (P1)

- **Smart File Chunking**: Semantic segmentation of large files
- **Context Prioritization**: Relevance-based context selection
- **Automatic Compression**: Summarize older conversation parts
- **Context Window Management**: Handle model token limits gracefully

### Phase 3: Advanced Features (P2)

- **File Relationship Mapping**: Understand code dependencies
- **Semantic File Loading**: Load related files proactively
- **Context Persistence**: Cross-session conversation history
- **Context Optimization**: ML-driven context relevance scoring

## Implementation Notes

### Current Code Locations:

- **Main Agent**: `src/agent/grok-agent.ts` (lines 82-84, messages/chatHistory)
- **Token Counter**: `src/utils/token-counter.ts`
- **Custom Instructions**: `src/utils/custom-instructions.ts`
- **File Tools**: `src/tools/text-editor.ts`, `src/tools/search.ts`

### Key Classes:

```typescript
export class GrokAgent extends EventEmitter {
  private messages: GrokMessage[] = [];
  private chatHistory: ChatEntry[] = [];
  private tokenCounter: TokenCounter;
  // Context management happens here
}
```

### Integration Points:

- **UI Components**: Need context status display
- **Tool System**: Context-aware file loading
- **Streaming**: Token counting during responses
- **Session Management**: Context persistence options

## Documentation Status

**CRITICAL GAP IDENTIFIED**: This document is the first comprehensive documentation of Grok CLI's context management system. Previous documentation gaps included:

- No architecture documentation for context handling
- No user documentation for context limitations
- No developer guidance for context-aware features
- No comparison with other AI code assistants

**Next Steps:**

1. Create user-facing documentation for context behavior
2. Add developer guides for context-aware tool development
3. Document context optimization strategies
4. Create troubleshooting guide for context-related issues

---

_This document should be updated as context management features evolve._
