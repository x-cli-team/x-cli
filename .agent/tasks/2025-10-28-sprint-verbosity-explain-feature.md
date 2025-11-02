# Sprint: Implement Verbosity and Explanation Features

## Overview
Add a `/verbosity` switch to control display verbosity levels in the CLI output. This will allow users to customize how much information is shown during operations, such as file reads, tool executions, and progress indicators. Separately, implement an `/explain` flag to show brief explanations for each action, providing transparency about why operations are performed.

## Motivation
Currently, operations like file viewing display detailed output (e.g., "⏺ Read(.agent/README.md)" and "⎿ File contents:" prefixes). Verbosity levels will enable users to reduce clutter in quiet mode or get more details in verbose mode.

## Requirements
- Implement a `/verbosity` command-line argument
- Define verbosity levels: `quiet`, `normal`, `verbose`
  - `quiet`: Minimal output (e.g., suppress prefixes and extra formatting)
  - `normal`: Current default behavior
  - `verbose`: Additional details and debug information
- Implement an `/explain` argument with levels: `off`, `brief`, `detailed`
  - `off`: No explanations
  - `brief`: Short reasons for operations (e.g., "Reading .agent/tasks to check existing sprints")
  - `detailed`: Comprehensive explanations including context and rationale
- Set defaults: `/verbosity quiet`, `/explain brief`
- Add persistent configuration storage (e.g., .xcli/config.json) to remember user preferences across sessions
- Update display logic in core functions (e.g., file viewing, tool calls) for both verbosity and explanations
- Ensure backward compatibility

## Tasks
- [x] Analyze current output formatting in CLI code
- [x] Add `/verbosity` argument parsing
- [x] Implement verbosity level state management
- [x] Add `/explain` flag parsing and state
- [x] Set default values: verbosity=quiet, explain=brief
- [x] Modify file viewing output based on verbosity level
- [x] Implement action explanations for operations based on /explain level (brief vs detailed)
- [x] Update tool execution output formatting
- [x] Add verbosity and explain settings to configuration persistence if needed
- [x] Test all verbosity levels and explain combinations across scenarios
- [x] Update documentation and help text

## Progress Summary
- **Status**: Completed ✅
- **Completion Date**: [Current Date - Implementation verified and doc updated]
- **Progress**: 100% (all 11 core tasks completed)
- **Effort Spent**: Medium (aligned with 2-3 day estimate for core features)
- **Key Achievements**:
  - `/verbosity` command implemented with quiet/normal/verbose levels
  - `/explain` command implemented with off/brief/detailed levels
  - Output formatting controlled in chat UI (tool content visibility, explanations)
  - Settings persistence added to user config (~/.x/user-settings.json)
  - Defaults set: verbosity=quiet, explain=brief
  - /help updated with command descriptions
- **Optional Enhancements**: Config persistence implemented; others (e.g., context-aware overrides, hooks) not yet done but could be future sprints
- **Testing**: Manual verification done; automated tests not added
- **Notes**: Features control CLI/chat output verbosity and explanations. Backward compatibility maintained.

## Acceptance Criteria
- Default settings: `/verbosity quiet`, `/explain brief`
- `/verbosity quiet` shows minimal output
- `/verbosity normal` maintains current behavior
- `/verbosity verbose` provides extra details
- `/explain off` shows no explanations
- `/explain brief` shows short reasons for operations (e.g., "Reading .agent/tasks to check existing sprints")
- `/explain detailed` shows comprehensive explanations with context
- No breaking changes to existing functionality

## Additional Enhancements (Optional)
- Config persistence & global defaults: Add .xcli/config.json to remember settings (e.g., `xcli /set verbosity=verbose`)
- Context-aware verbosity: Allow per-command overrides (e.g., `xcli build /verbosity verbose`)
- Smart suppression & summarization: Auto-summarize in quiet mode (e.g., "✅ 5 files processed in 0.8s")
- Explain hook system: Hook API for commands to register explanation providers
- Testing automation: Integration test matrix for all verbosity/explain combinations
- Documentation upgrade: Enhanced `/help verbosity` and README updates
- Developer ergonomics: Logger helpers like `log.action('Reading config', explain('Checking defaults'))`
- Stretch goals: `/verbosity debug`, `/explain json`, integration with feature voting

## Risks / Mitigations
- Risk: Nested tool output may bypass verbosity filter → Mitigation: Wrap all print calls in central logger
- Risk: Confusion between /explain and /help → Mitigation: Ensure clear docs and examples
- Risk: Performance impact from hooks/explanations → Mitigation: Lazy evaluation and caching

## Deliverable Demos
- CLI session showing `/verbosity quiet` vs `verbose` on file operations
- CLI session showing `/explain brief` vs `detailed` on tool executions
- Demo of config persistence across sessions

## Estimated Effort
Medium (2-3 days for core, +1-2 for enhancements)

## Priority
High - Improves user experience and customization

## Additional Enhancements (Optional)
- Config persistence & global defaults: Add .xcli/config.json to remember user's verbosity/explain settings
- Context-aware verbosity: Allow overrides per sub-command (e.g., xcli build /verbosity verbose)
- Smart suppression & summarization: Auto-summarize in quiet mode (e.g., "5 files processed in 0.8s")
- Explain hook system: Register explanation providers for automatic participation
- Testing automation: Integration test matrix for all verbosity/explain combinations
- Documentation upgrade: Enhanced /help and README updates
- Developer ergonomics: Logger helpers like log.action() with explain()
- Stretch goals: /verbosity debug, /explain json, integration with Feature Manager

## Risks / Mitigations
- Risk: Nested tool output may bypass verbosity filter → Wrap all print calls in central logger
- Risk: Confusion between /explain and /help → Ensure clear docs and examples
- Risk: Performance impact from explanations → Lazy-load explanations only when needed

## Deliverable Demos
- CLI session demonstrating /verbosity quiet vs verbose
- CLI session showing /explain brief vs detailed on the same operation
- Demo of config persistence and global defaults

## Additional Enhancements (Optional)
- Config persistence & global defaults: Add a .xcli/config.json file to remember user settings (e.g., xcli /set verbosity=verbose)
- Context-aware verbosity: Allow overrides per sub-command (e.g., xcli build /verbosity verbose)
- Smart suppression & summarization: Auto-summarize in quiet mode (e.g., "✅ 5 files processed in 0.8s (no errors)")
- Explain hook system: Hook API for operations to register explanation providers
- Testing automation: Test matrix for all verbosity/explain combinations
- Documentation upgrade: Add to /help and README
- Developer ergonomics: Helper in logger class (e.g., log.action with explain)
- Stretch goals: /verbosity debug, /explain json, integration with feature manager

## Risks / Mitigations
- Risk: Nested tool output may bypass verbosity filter → Wrap all print calls in central logger
- Risk: Confusion between /explain and /help → Ensure clear docs and examples

## Deliverable Demos
- CLI session showing /verbosity quiet vs verbose
- CLI session showing /explain brief vs detailed on same operation

## Additional Enhancements (Optional)
- **Config persistence & global defaults**: Add a persistent config file (e.g., .xcli/config.json or YAML) to remember user's last chosen verbosity and explain level, allowing set-and-forget preferences.
- **Context-aware verbosity**: Allow context-specific overrides (e.g., `xcli build /verbosity verbose`), with precedence: local flag > config > default.
- **Smart suppression & summarization**: Introduce auto-summarize mode (e.g., "✅ 5 files processed in 0.8s (no errors)") in quiet/brief; add performance metrics in verbose.
- **Explain hook system**: Turn /explain into a hook API where commands register explanation providers for automatic participation.
- **Testing automation**: Create a test matrix for all verbosity/explain combinations with output snapshots.
- **Documentation upgrade**: Enhance built-in help (`xcli /help verbosity`) and update README/command reference.
- **Developer ergonomics**: Expose logger helpers (e.g., `log.action('Reading config', explain('Checking defaults'))`) to avoid manual checks.
- **Optional stretch goals**: Add `/verbosity debug` for stack traces; `/explain json` for machine-readable output; integrate with Feature Manager for user preference voting.

## Risks / Mitigations
- **Risk: Nested tool output may bypass verbosity filter** → Mitigation: Wrap all print calls in a central logger.
- **Risk: Confusion between /explain and /help** → Mitigation: Ensure clear docs, examples, and distinct naming.

## Deliverable Demos
- CLI session demonstrating `/verbosity quiet` vs. `verbose` on the same operations.
- CLI session showing `/explain brief` vs. `detailed` explanations for identical actions.ailed` on the same operation.