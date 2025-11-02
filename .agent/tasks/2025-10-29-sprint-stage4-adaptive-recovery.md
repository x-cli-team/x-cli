# Sprint Stage 4: Adaptive Recovery

## Overview
Add intelligent error detection and recovery capabilities that pause execution when problems occur and present structured re-planning proposals. This creates resilience for complex tasks while maintaining the "one-confirm" UX philosophy.

## Date: 2025-10-29
## Owner: x-cli core
## Status: ✅ Completed
## Goal: Enable x-cli to handle execution failures gracefully by re-entering the research phase with problem context

## Objectives
- Detect execution problems (test failures, build errors, etc.)
- Pause execution and provide clear problem context
- Re-enter Issues/Options/Recommendation flow for the specific problem
- Allow users to approve recovery plans and resume execution
- Maintain the "one-confirm" experience even during failures

## In-Scope
- Error detection logic for common failure scenarios
- Problem context gathering and presentation
- Recovery flow that reuses research infrastructure
- Execution state preservation and resumption
- Clear error messaging and problem diagnosis

## Out-of-Scope
- Auto-documentation features
- New error types beyond common development scenarios
- Complex error recovery automation
- Multi-stage recovery flows

## Implementation Tasks
- [x] Define error detection patterns (test failures, linting errors, build failures)
- [x] Create error context gathering (stack traces, error messages, file states)
- [x] Implement execution pause mechanism when errors detected
- [x] Add problem presentation: "[x-cli] Issue encountered: test suite failing in pkg A (2 tests)"
- [x] Create recovery research prompt that includes error context
- [x] Implement recovery flow re-entry into Issues/Options/Recommendation
- [x] Add execution state preservation (completed TODOs, current progress)
- [x] Implement resume capability after recovery approval
- [x] Add recovery attempt limits and escalation options
- [x] Test integration with existing execution infrastructure

## Acceptance Criteria
- AC-1: Execution halts when detectable errors occur during TODO execution
- AC-2: Error context is clearly presented to users
- AC-3: Recovery re-enters research phase with problem-specific context
- AC-4: Users can approve recovery plans with same Y/n/R flow
- AC-5: After recovery approval, execution resumes from appropriate point
- AC-6: Recovery maintains execution state and progress tracking
- AC-7: Clear messaging distinguishes original planning from recovery planning

## Error Detection Patterns
**Test Failures:**
- Jest/mocha/rspec output parsing
- Test result summary analysis
- Specific failing test identification

**Build Errors:**
- TypeScript compilation errors
- ESLint/stylelint violations
- Build tool failures (webpack, vite, etc.)

**Runtime Errors:**
- Import/module resolution failures
- Configuration validation errors
- Environment/setup issues

## Console Output Format
```
[x-cli] #3 Running tests to verify config validation...
[x-cli] Issue encountered: test suite failing in config validation (2 tests failed)
Re-planning...

=== Issues ===
- Error: validateConfig() throwing TypeError on invalid port values
- Context: Tests expecting ValidationResult but getting raw errors
- Impact: Validation logic incomplete, error handling missing

=== Options ===
1) Fix validation function to return proper ValidationResult objects
2) Update tests to handle raw error throwing behavior
3) Add error handling wrapper around validation calls

=== Recommendation ===
→ Option 1: Fix validation function (Reason: Proper error handling is fundamental to validation)

=== Recovery Plan Summary ===
Summary: Fix validation function error handling
Approach:
- Update validateConfig to return ValidationResult consistently
- Add proper error types and messages
- Re-run tests to verify fixes
TODO:
- [ ] #3.1 Update validateConfig return types
- [ ] #3.2 Add error message constants
- [ ] #3.3 Re-run test suite

Proceed with recovery recommendation? (Y/n) [R=revise]
```

## Test Cases
- Test failure detection and recovery flow
- Build error handling and re-planning
- Successful recovery and resumed execution
- Multiple recovery attempts on same error
- Recovery rejection and graceful abort
- Complex multi-step error recovery
- State preservation across recovery cycles

## Risks & Mitigations
- False positive error detection → Conservative detection rules with user confirmation
- Recovery loops → Attempt limits and escalation to manual intervention
- Complex error context → Structured error reporting with actionable information
- State corruption during recovery → Atomic state updates and rollback capabilities

## Success Metrics
- All detectable errors trigger appropriate recovery flows
- Recovery plans are contextual and actionable
- Users can successfully recover from common failure scenarios
- Recovery maintains the "one-confirm" UX philosophy
- Clear distinction between original planning and recovery planning