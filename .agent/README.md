# 📚 .agent Documentation System

*Last synced: 2025-01-13*
*Protection: Husky pre-commit hook prevents accidental folder deletion*

## Overview
This directory contains AI agent documentation for X-CLI. This system helps AI agents understand the project context efficiently without scanning the entire codebase.

### 🎯 Recent Features
- **Custom Assistant Name**: Users can set a custom name for the AI assistant via `grok set-name <name>`, stored globally in user settings
- **Persistent Confirmation System**: File operations and bash commands require user confirmation by default, with `grok toggle-confirmations` to enable/disable

## 🚀 New: "Research → Recommend → Execute → Auto-Doc" Workflow

X-CLI now features a complete workflow that transforms complex tasks into structured, operator-in-the-loop experiences:

### **Phase 1: Research** 🤔
- AI analyzes your task using intelligent context loading
- Loads system docs, SOPs, and recent task history
- Generates structured Issues/Options/Recommendation/Plan output

### **Phase 2: Recommend** 💡
- Presents clear decision framework with trade-offs
- Shows multiple options with effort/risk analysis
- Recommends optimal approach with confidence scoring

### **Phase 3: Execute** ⚡
- Sequential TODO execution with real-time progress
- Automatic diff display and patch generation
- Safety features: backups, git commits, error recovery
- Adaptive recovery when execution fails

### **Phase 4: Auto-Doc** 📝
- Automatic completion documentation in `.agent/tasks/`
- Lesson learning and SOP candidate detection
- Complete audit trail with metadata and outcomes

### Usage
```bash
# Interactive workflow (recommended)
xcli "implement user authentication system"

# Headless mode for CI
xcli --headless "add logging to API endpoints"

# Non-interactive fallback
xcli --noninteractive "old behavior"
```

### Benefits
- **Safety First**: All changes have patches and backups
- **Resilient**: Adaptive recovery from execution failures
- **Documented**: Automatic knowledge accumulation
- **Efficient**: "One-confirm" decision points, then hands-free execution
- **Contextual**: AI learns from project history and patterns

## 🚨 Critical Configuration Warnings

**🤖 AUTOMATED RELEASE SYSTEM IS NOW FULLY OPERATIONAL (2025-10-17)**

**DO NOT MODIFY THESE SETTINGS UNLESS YOU KNOW WHAT YOU'RE DOING:**

### 🔒 Protected NPM Publishing Settings
- **`package.json` name**: Must remain `"grok-cli-hurry-mode"` (unscoped). Changing to scoped (e.g., `@username/grok-cli-hurry-mode`) will break NPM publishing unless you have token access for that scope.
- **`package.json` publishConfig**: Must not include `"registry": "https://npm.pkg.github.com/"`. Publishing should go to npmjs.com, not GitHub Packages.
- **NPM_TOKEN secret**: Must be a valid automation token from the NPM account owning `grok-cli-hurry-mode`.

### 🔒 Protected Automation Workflow  
- **`.github/workflows/release.yml`**: Combined workflow handling version bump + NPM publish
- **`.husky/pre-commit`**: Git hook for version synchronization
- **`scripts/check-version.cjs`**: Automated version bumping and README updates
- **GitHub Secrets**: `PAT_TOKEN` (git operations) + `NPM_TOKEN` (NPM publishing)

### 🔒 Protected Git Operations
- **Git Hooks**: Do not re-enable interactive pre-push hooks, as they block CI/CD pushes.
- **Branch Protection**: Do not prevent GitHub Actions from pushing to main branch.

**Why?** Previous changes to these broke the entire publishing flow. The current system took multiple iterations to get working.

**📚 Full Protection Details**: See `sop/automation-protection.md`

## 📁 Directory Structure

### 📋 system/
Core project information and architecture:
- **architecture.md** - Project structure and design patterns
- **api-schema.md** - API endpoints and data schemas
- **critical-state.md** - Current system state snapshot
- **installation.md** - Installation and setup guide
- **ux-feedback-system.md** - Claude Code-style visual feedback architecture
- **version-synchronization.md** - Automated version management system

### 📝 tasks/
Product requirement documents and feature specifications:
- Store PRDs before implementation
- Reference related architecture and dependencies
- Track implementation progress

### 🎯 parity/
**STRATEGIC PRIORITY**: Competitive analysis driving development roadmap:
- **README.md** - Strategic overview and navigation
- **claude-code-features.md** - Comprehensive Claude Code capability analysis
- **cursor-features.md** - Cursor IDE AI-native editor capabilities
- **codex-features.md** - OpenAI Codex autonomous coding agent analysis
- **grok-cli-current-state.md** - Complete Grok CLI capability inventory
- **gap-analysis.md** - Detailed feature gaps with P0/P1/P2 priorities
- **implementation-roadmap.md** - Strategic development plan through Q4 2025
- **competitive-matrix.md** - Side-by-side feature comparison matrix

**Current Position**: 65/100 vs Claude Code 95/100  
**Target**: 90%+ feature parity by Q4 2025

### 📖 sop/
Standard operating procedures and workflows:
- Development patterns and conventions
- Deployment and maintenance procedures
- Code review and testing guidelines
- **ux-feedback-system-maintenance.md** - UX system maintenance and extension guidelines
- **automation-protection.md** - Critical automation system protection
- **release-management.md** - Automated publishing workflow procedures

### 🚨 incidents/
Documented failures with root cause analysis:
- Error patterns and their fixes
- Recovery procedures
- Prevention strategies

### 🛡️ guardrails/
Enforceable rules to prevent recurring mistakes:
- Naming conventions
- Configuration constraints
- Implementation patterns

### ⚙️ commands/
Documentation for documentation system commands:
- Usage guides for /init-agent, /update-agent-docs, etc.
- Integration workflows

### 📝 sessions/
Agent-assisted development session logs:
- Documented learnings and changes from development sessions
- Technical insights gained during implementation
- Process improvements and future recommendations

## 🎯 Usage Guidelines

### For AI Agents
1. **Always read README.md first** - Get project overview (this file)
2. **Check system/critical-state.md** - Understand current architecture
3. **Review relevant tasks/** - Check for related work or conflicts
4. **Follow sop/** patterns - Use established conventions
5. **Check guardrails/** - Avoid known failure patterns

### For Updates
- Run `/update-agent-docs` after significant changes
- Add new PRDs to tasks/ before implementation
- Update system docs when architecture changes
- Document new patterns in sop/

## 🔗 Cross-References
- Main project documentation: ../README.md
- Configuration: ../.grok/settings.json
- Build instructions: ../package.json

---
*Generated by Grok CLI Documentation System*
*Last updated: 2025-10-11*
