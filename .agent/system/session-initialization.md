# Session Initialization Protocol

## Purpose
This document outlines the mandatory initialization sequence for Grok CLI sessions to ensure consistent awareness of project context, workflows, and documentation.

## Initialization Sequence

### Phase 1: Environment Setup
1. Load current working directory
2. Verify .agent folder exists
3. If .agent missing, create basic structure and prompt user

### Phase 2: Context Loading (MANDATORY)
1. **Read .agent/README.md** - Load project overview and directory structure
2. **Read .agent/sop/documentation-workflow.md** - Load documentation standards and workflows
3. **Read .agent/system/architecture.md** - Load current system architecture
4. **Scan .agent/tasks/** - Load active PRDs and task status
5. **Check .agent/incidents/** - Load recent lessons learned

### Phase 3: Awareness Priming
- Store key conventions in session memory:
  - PRD saving location: `.agent/tasks/`
  - Documentation update triggers
  - Current architecture state
  - Active guardrails and constraints

### Phase 4: Validation
- Confirm critical paths are accessible
- Test basic .agent file reading
- Log initialization status

## Implementation Requirements

### Code Integration
- Add initialization hook in main CLI entry point
- Cache loaded context for session duration
- Provide fallback for offline/missing .agent

### Error Handling
- If .agent files unreadable, use default conventions
- Log initialization failures in .agent/incidents/
- Alert user to missing documentation

## Key Conventions to Prime
- **PRD Location**: Always save in `.agent/tasks/` as `.md` files
- **File Naming**: `feature-name-prd.md` format
- **Update Triggers**: Architecture changes, new features, failures
- **Cross-references**: Link related docs in .agent

## Testing
- New sessions must demonstrate awareness of PRD locations
- Queries about documentation locations should reference .agent first
- Incident logging for initialization failures

*Updated: 2023-10-12*