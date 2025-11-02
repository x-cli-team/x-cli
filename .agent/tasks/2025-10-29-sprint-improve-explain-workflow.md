# Sprint: One-Confirm "Research → Recommend → Execute → Auto-Doc" Workflow

## Overview
Implement a structured, operator-in-the-loop workflow that transforms x-cli from a chatty interactive tool into a decisive "one-confirm" experience. This sprint is broken into **5 implementation stages** for manageable delivery and risk mitigation.

## Sprint Metadata
- **Date:** 2025-10-29
- **Owner:** x-cli core
- **Status:** ✅ COMPLETE - All Stages Implemented
- **Total Effort:** 8-13 days (across 5 stages)
- **Goal:** Create a production-ready workflow where users approve once, then watch clean diffs flow by

## Problem Statement
Developers experience friction with either overly autonomous tools that go off-course or chatty CLIs requiring constant micro-management. We need a single, decisive approval point that guides direction without constant interruption.

## Solution Overview
**Default Flow:** Research → Recommend → (One Confirm) → Execute → Auto-Doc

### Key Differentiators
- **Context Awareness:** Auto-loads .agent/ documentation for smarter planning
- **One-Confirm UX:** Single approval gate, then hands-free execution
- **Adaptive Recovery:** Intelligent error handling with structured re-planning
- **Self-Documenting:** Automatic knowledge accumulation in .agent/ folder

## 📋 Implementation Stages

### **Stage 1: Context Loading Foundation**
**File:** `2025-10-29-sprint-stage1-context-loading.md`
**Status:** Ready to implement
**Effort:** 1-2 days
**Goal:** Smart .agent/ context ingestion without changing user flow
- Context loader module with file prioritization
- Smart summarization for older task files
- Startup console message showing loaded context
- Foundation for intelligent decision-making

### **Stage 2: Research → Recommend Flow**
**File:** `2025-10-29-sprint-stage2-research-recommend.md`
**Status:** Ready to implement (depends on Stage 1)
**Effort:** 2-3 days
**Goal:** Core planning UX with Issues/Options/Recommendation/Plan output
- Structured JSON research output
- Y/n/R approval flow with revision capability
- Console rendering of decision framework
- Validates "one-confirm" UX concept

### **Stage 3: Execute Stage Integration**
**File:** `2025-10-29-sprint-stage3-execute-integration.md`
**Status:** Ready to implement (depends on Stages 1-2)
**Effort:** 2-3 days
**Goal:** Connect planning to execution with safety guarantees
- Sequential TODO execution using existing infrastructure
- Enhanced diff printing and patch/commit creation
- Execution logging with progress tracking
- "Watch clean diffs flow by" experience

### **Stage 4: Adaptive Recovery**
**File:** `2025-10-29-sprint-stage4-adaptive-recovery.md`
**Status:** Ready to implement (depends on Stages 1-3)
**Effort:** 2-3 days
**Goal:** Intelligent error handling and re-planning
- Error detection for tests, builds, and runtime issues
- Recovery flow re-entering Issues/Options/Recommendation
- Execution state preservation and resumption
- Maintains "one-confirm" experience during failures

### **Stage 5: Auto-Doc & Polish**
**File:** `2025-10-29-sprint-stage5-auto-doc-polish.md`
**Status:** Ready to implement (depends on Stages 1-4)
**Effort:** 1-2 days
**Goal:** Production-ready workflow with documentation and polish
- Automatic .agent/tasks/ documentation generation
- Optional SOP updates for new durable rules
- CLI flags (--headless, --noninteractive, XCLI_PATCH_DIR)
- Final UX polish and help documentation

## 🎯 User Experience Flow

1. **Startup Context Load** → "Loaded N agent notes from .agent/ (system.md, sop.md, tasks: 24 files, 280 KB)"
2. **Research & Recommend** → Issues/Options/Recommendation/Plan → "Proceed with recommendation? (Y/n) [R=revise]"
3. **Execute (Auto)** → Sequential TODOs with diffs, patches, commits
4. **Adaptive Recovery** → Only when needed: re-enter planning flow
5. **Auto-Doc** → .agent/tasks/YYYY-MM-DD-slug.md + optional SOP updates

## ✅ Acceptance Criteria (End-to-End)
- AC-1: On `xcli "<task>"`, CLI shows Issues/Options/Rec/Plan and asks once for approval
- AC-2: After approval, completes all TODOs automatically unless errors occur
- AC-3: All writes show diffs, save patches, create commits (git) or .bak files (non-git)
- AC-4: Successful runs create .agent/tasks/ documentation with outcomes and lessons
- AC-5: Startup loads .agent/system and .agent/sop fully; summarizes older tasks appropriately
- AC-6: Errors trigger structured recovery proposals with same approval flow
- **AC-7 (2025-01-13):** Code-enforced confirmation system ensures all file operations and bash commands require explicit user approval by default, with `grok toggle-confirmations` for advanced users

## 🚀 Rollout Strategy
- **Default:** New workflow enabled by default for optimal UX
- **--headless:** CI-friendly auto-approval for recommendations
- **--noninteractive:** Legacy behavior fallback for compatibility

## 📈 Success Metrics
- **Adoption:** Users prefer "one-confirm" over legacy chatty mode
- **Efficiency:** Reduced context-switching during complex tasks
- **Safety:** Zero data loss incidents with patch/.bak system + code-enforced confirmations
- **Knowledge:** .agent/ folder becomes valuable project knowledge base
- **Resilience:** Users successfully recover from common failure scenarios

## 🎉 Done Looks Like
- Developers run `xcli "refactor authentication"`, skim a clear plan, approve once
- Watch clean diffs flow by as the tool executes flawlessly
- If tests fail, tool politely presents recovery options for approval
- .agent/ folder automatically captures lessons for smarter future runs

## 📋 Next Steps
Begin with **Stage 1: Context Loading Foundation** to establish the groundwork. Each stage builds incrementally, allowing early validation of core concepts and progressive value delivery.