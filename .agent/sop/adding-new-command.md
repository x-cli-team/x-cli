# ⚙️ Adding New Commands SOP

## Command System Architecture

### Current Implementation
- Commands handled in `src/hooks/use-input-handler.ts`
- Direct implementation in `handleDirectCommand` function
- No centralized command registry (yet)

### Command Types

#### 1. Slash Commands
Built-in commands starting with `/`:
- Implementation: Add to `handleDirectCommand` function
- Pattern: `if (trimmedInput === "/your-command") { ... }`
- Registration: Update `commandSuggestions` array

#### 2. Direct Bash Commands  
Immediate execution commands:
- Pattern: Add to `directBashCommands` array
- Execution: Automatic bash execution

#### 3. Natural Language
AI-processed commands:
- Fallback: Processed by `processUserMessage`
- Tool selection: Automatic based on AI analysis

### Implementation Steps

#### 1. Add Slash Command
```typescript
// In commandSuggestions array
{ command: "/your-command", description: "Your command description" }

// In handleDirectCommand function  
if (trimmedInput === "/your-command") {
  // Implementation logic
  const result = await someOperation();
  
  const entry: ChatEntry = {
    type: "assistant",
    content: result,
    timestamp: new Date(),
  };
  setChatHistory((prev) => [...prev, entry]);
  clearInput();
  return true;
}
```

#### 2. Add Tool-Based Command
Create tool in `src/tools/`, then reference in command handler.

#### 3. Update Documentation
- Add command to /help output
- Document in .agent/commands/
- Update this SOP if pattern changes

### Best Practices
- **Consistent UX**: Follow existing command patterns
- **Error Handling**: Provide clear feedback
- **Tool Integration**: Leverage existing tool system
- **State Management**: Update chat history appropriately
- **Input Cleanup**: Always call `clearInput()`

### Future Improvements
- Centralized command registry system
- Dynamic command loading
- Plugin-based command architecture

*Updated: 2025-10-11*
