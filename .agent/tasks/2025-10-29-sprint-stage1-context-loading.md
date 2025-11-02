# Sprint Stage 1: Context Loading Foundation

## Overview
Implement smart .agent/ context ingestion that loads system.md, sop.md, and task files with intelligent summarization. This provides the foundation for all subsequent stages without changing user-facing behavior yet.

## Date: 2025-10-29
## Owner: x-cli core
## Status: ✅ Completed
## Goal: Enable x-cli to intelligently load and prioritize .agent/ context files for better decision making

## Objectives
- Load .agent/system.md and .agent/sop.md in full
- Load .agent/tasks/* files with smart prioritization and summarization
- Display context loading status to user
- Prepare context pack for model consumption
- Handle context budget management (280KB across ~24 files)

## In-Scope
- File reading and parsing logic
- Smart summarization algorithm for older task files
- Context priority system (system > sop > recent tasks > summarized older tasks)
- Startup console message showing loaded context
- Token budget management and warnings

## Out-of-Scope
- User-facing workflow changes
- Model calling modifications
- Execution logic changes

## Implementation Tasks
- [x] Create context loader module in src/utils/context-loader.ts
- [x] Implement file reading logic for .agent/system.md and .agent/sop.md
- [x] Add task file discovery and sorting (newest first)
- [x] Implement summarization algorithm for older task files
- [x] Add context size calculation and budget warnings
- [x] Create context pack structure for model consumption
- [x] Add startup console message showing loaded context
- [x] Integrate context loader into main CLI startup flow
- [ ] Add configuration option to exclude specific .agent/ files if needed

## Acceptance Criteria
- AC-1: On startup, .agent/system.md and .agent/sop.md are loaded completely
- AC-2: Task files are loaded with newest prioritized over older ones
- AC-3: When context exceeds budget, older tasks are summarized rather than loaded fully
- AC-4: Startup message shows accurate file counts and total size
- AC-5: Context pack is properly formatted for model consumption
- AC-6: No performance regression in startup time

## Test Cases
- Large context load (24 files, 280KB) with summarization
- Small context load (just system.md and sop.md)
- Missing .agent/ directory handling
- Individual file read failures
- Context budget threshold testing

## Risks & Mitigations
- Large context causing slow startups → Implement lazy loading and caching
- File parsing errors → Add robust error handling with fallbacks
- Token budget calculations → Test with various model context limits

## Success Metrics
- Startup time increase < 500ms for typical .agent/ sizes
- Accurate context loading and prioritization
- Clear user feedback on context status