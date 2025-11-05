# Documentation Index

Complete map of Grok One-Shot documentation. All files are in `.agent/` directory.

## Quick Navigation

- **Start Here**: `GROK.md` (or `CLAUDE.md` symlink)
- **Architecture**: `.agent/system/architecture.md`
- **Contributing**: `.agent/README.md`
- **Git Workflow**: `.agent/sop/git-workflow.md`
- **Current Sprint**: `.agent/tasks/2025-11-05-sprint-claude-md-migration-and-docs-alignment.md`

## Documentation Structure

### Core Documentation (Root)

- `GROK.md` - Main documentation (this file)
- `CLAUDE.md` - Symlink to GROK.md for industry compatibility
- `docs-index.md` - This index file
- `README.md` - Project README for GitHub

### System Architecture (`.agent/system/`)

**Core System Design**
- `architecture.md` - System architecture, data flow, module structure
- `critical-state.md` - Critical system state and health monitoring
- `api-schema.md` - API schemas and data structures

**Installation & Configuration**
- `installation.md` - Installation guide and setup
- `version-synchronization.md` - Version management across monorepo

**User Experience**
- `ux-feedback-system.md` - User feedback collection and analysis

### Standard Operating Procedures (`.agent/sop/`)

**Development Workflows**
- `documentation-workflow.md` - How to write and sync documentation
- `git-workflow.md` - Git branching, commits, and collaboration
- `automation-protection.md` - Protecting automated processes

**Release Management**
- `release-management.md` - Release process and checklist
- `version-management.md` - Version numbering and synchronization
- `npm-publishing-troubleshooting.md` - NPM publish issues and solutions

**Feature Development**
- `adding-new-command.md` - How to add new CLI commands
- `ux-feedback-system-maintenance.md` - Maintaining UX feedback system

### Feature Parity Analysis (`.agent/parity/`)

**Competitive Analysis**
- `README.md` - Overview of parity analysis
- `competitive-matrix.md` - Feature comparison matrix
- `gap-analysis.md` - Feature gaps and priorities

**Tool-Specific Analysis**
- `claude-code-features.md` - Claude Code feature breakdown
- `cursor-features.md` - Cursor feature breakdown
- `codex-features.md` - GitHub Copilot/Codex features
- `grok-cli-current-state.md` - Current Grok One-Shot capabilities

**Planning**
- `implementation-roadmap.md` - Feature implementation roadmap

### Active Tasks (`.agent/tasks/`)

**Current Sprint (November 2025)**
- `2025-11-05-sprint-claude-md-migration-and-docs-alignment.md` - Current epic
- `2025-11-05-claude-code-docs-mapping.md` - Claude Code docs mapping
- `2025-11-05-epic-status-summary.md` - Current status summary
- `2025-11-05-sprint-rebaseline.md` - Rebase documentation
- `2025-11-05-align-docs-to-claude-code-standards.md` - Initial alignment plan

**October 2025 Sprints**
- `2025-10-24-sprint-build-agent-claude-code-parity.md` - Agent parity work
- `2025-10-24-sprint-ux-refinement-claude-feel.md` - UX improvements
- `2025-10-23-sprint-git-integration-enhancement.md` - Git improvements
- `2025-10-23-sprint-paste-text-summary-enhancement.md` - Paste handling
- `2025-10-18-sprint-documentation-website.md` - Docusaurus site setup
- `2025-10-18-sprint-automated-testimonial-collection.md` - Testimonials
- `2025-10-18-sprint-enhanced-installation-ux.md` - Installation UX
- `2025-10-17-sprint-auto-compact-mode.md` - Compact mode
- `2025-10-17-sprint-hotfix-repaint-storm.md` - Performance fix
- `2025-10-16-sprint-automate-version-sync-and-hooks.md` - Version sync
- `2025-10-16-sprint-fix-faulty-tools.md` - Tool reliability
- `2025-10-16-sprint-stop-screen-glitch-cpu-spikes.md` - Performance issues

**Planning Documents**
- `2025-10-18-roadmap-claude-code-parity.md` - Long-term roadmap
- `2025-10-16-prd-example.md` - PRD template example
- `2025-10-16-prd-tool-inventory.md` - Tool inventory PRD
- `2025-10-16-plan-continue-tool-fixes.md` - Tool fix planning
- `2024-10-24-test-plan-mode-implementation.md` - Plan mode testing

### Incident Reports (`.agent/incidents/`)

**Resolved Incidents**
- `incident-npm-publish-failure.md` - NPM publish 403 error resolution
- `paste-detection-issues-v1123.md` - Paste detection problems
- `tool-reliability-fix-issue.md` - Tool reliability incident

### Session Logs (`.agent/sessions/`)

**Agent Sessions**
- `2025-10-27-agent-session-og-tags-fix.md` - OpenGraph tags fix session

### Commands (`.agent/commands/`)

**Agent Initialization**
- `init-agent.md` - Agent initialization command documentation

## Documentation by Use Case

### For New Contributors

1. Start: `.agent/README.md`
2. Architecture: `.agent/system/architecture.md`
3. Git workflow: `.agent/sop/git-workflow.md`
4. Documentation: `.agent/sop/documentation-workflow.md`

### For Feature Development

1. Current roadmap: `.agent/parity/implementation-roadmap.md`
2. Gap analysis: `.agent/parity/gap-analysis.md`
3. Adding commands: `.agent/sop/adding-new-command.md`
4. Architecture: `.agent/system/architecture.md`

### For Release Management

1. Release SOP: `.agent/sop/release-management.md`
2. Version management: `.agent/sop/version-management.md`
3. NPM troubleshooting: `.agent/sop/npm-publishing-troubleshooting.md`
4. Critical state: `.agent/system/critical-state.md`

### For Understanding Current Work

1. Current sprint: `.agent/tasks/2025-11-05-sprint-claude-md-migration-and-docs-alignment.md`
2. Epic status: `.agent/tasks/2025-11-05-epic-status-summary.md`
3. Roadmap: `.agent/tasks/2025-10-18-roadmap-claude-code-parity.md`

### For Troubleshooting

1. Incidents: `.agent/incidents/`
2. NPM issues: `.agent/sop/npm-publishing-troubleshooting.md`
3. Critical state: `.agent/system/critical-state.md`

## File Naming Conventions

### Task Files
Format: `YYYY-MM-DD-{type}-{description}.md`

Types:
- `sprint-` - Sprint implementation plans
- `plan-` - General planning documents
- `prd-` - Product requirement documents
- `roadmap-` - Long-term roadmaps
- `test-` - Test plans
- `epic-` - Epic status documents

### Incident Files
Format: `incident-{description}.md` or `{description}-v{version}.md`

### Session Files
Format: `YYYY-MM-DD-agent-session-{description}.md`

## Documentation Standards

### Writing Guidelines

1. **Clarity**: Write for both humans and AI agents
2. **Structure**: Use clear headings and sections
3. **Links**: Use relative paths for internal links
4. **Token Efficiency**: Keep docs focused and concise
5. **Updates**: Update via git commits; Husky syncs to Docusaurus

### Markdown Standards

- Use ATX-style headers (`#` not `===`)
- Code blocks with language tags
- Tables for structured data
- Task lists for checklists

### Auto-Sync Process

The Husky pre-commit hook automatically:
1. Syncs `.agent/docs/` → `apps/site/docs/`
2. Updates documentation indexes
3. Validates markdown structure
4. Runs on every commit

See `.agent/sop/documentation-workflow.md` for details.

## Token Budget

This documentation system is designed for token efficiency:

- **GROK.md**: ~400 tokens (comprehensive overview)
- **docs-index.md**: ~200 tokens (this file)
- **Total startup**: ~700 tokens (vs old 65k-85k)
- **On-demand**: AI reads specific docs via Read tool as needed

## Contributing to Documentation

1. **Follow structure**: Add to appropriate directory
2. **Update index**: Add new docs to this file
3. **Use templates**: Follow existing doc patterns
4. **Auto-sync**: Commit triggers Husky pre-commit hook
5. **Test locally**: Verify in `.agent/docs/` before committing

See `.agent/sop/documentation-workflow.md` for complete workflow.

---

**Last Updated**: 2025-11-05
**Version**: 1.1.101
**Maintained By**: Grok One-Shot Team
