# Sprint Stage 2: Research → Recommend Flow

## Overview
Implement the core planning UX that generates structured research output (Issues/Options/Recommendation/Plan) and presents it to users for approval. This creates the "one-confirm" decision point that defines the operator-in-the-loop experience.

## Date: 2025-10-29
## Owner: x-cli core
## Status: ✅ Completed
## Goal: Enable x-cli to research tasks comprehensively and present clear, actionable recommendations for user approval

## Objectives
- Generate structured research output: Issues, Options, Recommendation, Plan
- Present clear decision framework to users
- Implement Y/n approval flow with R=revise capability
- Create foundation for execution stage
- Validate the "one-confirm" UX concept

## In-Scope
- Model prompt engineering for structured JSON output
- Console rendering of Issues/Options/Recommendation/Plan sections
- Y/n/R prompt system with input validation
- Revision flow for quick corrections
- Error handling for malformed responses

## Out-of-Scope
- Actual task execution
- File modifications
- Error recovery logic
- Auto-documentation

## Implementation Tasks
- [x] Create research prompt template that requests structured JSON output
- [x] Add JSON schema validation for Issues[], Options[], Recommendation, Plan
- [x] Implement console rendering for Issues section (facts, gaps, risks)
- [x] Implement console rendering for Options section (2-3 options with trade-offs)
- [x] Implement console rendering for Recommendation section (chosen option + justification)
- [x] Implement console rendering for Plan section (Summary/Approach/TODO)
- [x] Create approval prompt system: "Proceed with recommendation? (Y/n) [R=revise]"
- [x] Implement R=revise flow with short revision input and re-planning
- [x] Add input validation and error handling for user responses
- [x] Integrate with Stage 1 context loading
- [x] Add loading indicators during research phase

## Acceptance Criteria
- AC-1: Research phase generates valid Issues/Options/Recommendation/Plan structure
- AC-2: All sections render clearly in console with proper formatting
- AC-3: Y/n prompt accepts valid inputs and provides clear feedback
- AC-4: R=revise allows short corrections and triggers re-research
- AC-5: Invalid inputs are handled gracefully with helpful error messages
- AC-6: Research uses context from Stage 1 effectively

## Console Output Format
```
=== Issues ===
- Fact: Current config structure lacks validation
- Gap: No automated testing for config changes
- Risk: Breaking changes could affect production deployments

=== Options ===
1) Minimal refactor: Add validation only (+ fast, - limited coverage)
2) Comprehensive refactor: Full validation + tests (+ robust, - more changes)
3) Conservative approach: Validation + gradual rollout (+ safe, - slower)

=== Recommendation ===
→ Option 2: Comprehensive refactor (Reason: Long-term maintainability outweighs short-term effort)

=== Plan Summary ===
Summary: Refactor config validation with comprehensive testing
Approach:
- Add input validation schema
- Implement unit tests for config parsing
- Update error handling throughout
TODO:
- [ ] #1 Add validation schema to config.ts
- [ ] #2 Implement unit tests for validation
- [ ] #3 Update error messages

Proceed with recommendation? (Y/n) [R=revise]
```

## Test Cases
- Valid research output with all required sections
- Malformed JSON handling and error recovery
- User approval flow (Y response)
- User rejection flow (n response)
- Revision flow with short correction input
- Invalid input handling (empty, gibberish)
- Context integration verification

## Risks & Mitigations
- Model generating poor recommendations → Require structured format; allow R=revise for corrections
- Confusing console output → Extensive UX testing and formatting iteration
- Slow research phase → Add progress indicators and timeout handling

## Success Metrics
- 100% valid structured output from research phase
- Clear, scannable console output (< 30 seconds to read)
- Intuitive approval flow (users understand Y/n/R options)
- Effective revision capability (users can easily correct direction)