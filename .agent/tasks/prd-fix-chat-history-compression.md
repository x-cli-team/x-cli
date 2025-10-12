# 📋 PRD: Fix Chat History Compression to Prevent CLI Slowdown

## Objective
Implement actual chat history compression in the `/compact` command to prevent unbounded growth of `chatHistory` array, resolving CLI performance degradation after ~10 prompts.

## Background
Current Issue: The `/compact` command simulates compression by adding a summary to `chatHistory` but doesn't reduce the history size. This causes:
- Memory usage to grow linearly with prompt count
- Processing time to increase per prompt due to larger history context
- CLI slowdown manifesting after ~10 prompts
- Potential out-of-memory errors in long sessions

Root Cause: Compression logic in `src/hooks/use-input-handler.ts` (lines 1030-1075) only appends compression results without truncating old entries.

## Requirements

### Functional Requirements
1. **History Compression Logic**
   - When `/compact` is executed (non-dry-run), replace older chat entries with the compressed summary
   - Preserve recent context (last N entries) to maintain conversational continuity
   - Maintain chronological order and timestamps

2. **Compression Thresholds**
   - Configurable preservation window (e.g., keep last 5-10 entries)
   - Minimum history size before compression is allowed
   - Optional force compression via `--force` flag

3. **Performance Metrics**
   - Track compression effectiveness (tokens saved, time taken)
   - Report memory usage reduction
   - Ensure compression doesn't exceed reasonable time limits (e.g., <5 seconds)

### Technical Requirements
1. **State Management**
   - Modify `chatHistory` state to support compression operations
   - Ensure thread-safe updates during compression
   - Handle edge cases (empty history, single entry, etc.)

2. **Subagent Integration**
   - Continue using existing summarizer subagent for compression logic
   - Pass appropriate context (older entries) to summarizer
   - Handle subagent failures gracefully

3. **User Experience**
   - Clear feedback on compression results
   - Preview mode (`--dry-run`) shows what would be compressed
   - Undo capability or confirmation for destructive operations

### Non-Functional Requirements
1. **Performance**
   - Compression time < 5 seconds for typical history sizes
   - No performance impact on regular prompts when compression not active
   - Memory usage reduction of 50-70% post-compression

2. **Reliability**
   - Compression failures don't corrupt chat history
   - Atomic operations (either fully compress or rollback)
   - Error handling for subagent timeouts/failures

3. **Compatibility**
   - Backward compatible with existing chat history format
   - No changes to public API or command interface
   - Works with existing subagent framework

## Acceptance Criteria
- [ ] `/compact` command actually reduces `chatHistory` length
- [ ] CLI performance remains stable after 50+ prompts
- [ ] Compression preserves critical recent context
- [ ] Dry-run mode shows accurate preview
- [ ] Error handling prevents history corruption
- [ ] Performance metrics are accurately reported

## Dependencies
- SubagentFramework (existing)
- Summarizer subagent (existing)
- React state management (existing)

## Risk Assessment
- **High**: History corruption during compression could lose user data
- **Medium**: Compression quality affects user experience
- **Low**: Subagent performance impacts compression speed

## Success Metrics
- Chat history growth rate reduced by 60-80%
- CLI response time stable after compression
- User satisfaction with compression results
- Zero data loss incidents

## Implementation Notes
- Focus on atomic state updates
- Extensive testing with various history sizes
- Consider implementing auto-compression thresholds for future enhancement