# Sprint: Rename grok-cli to x-cli

## Sprint Overview
**Sprint Goal**: Rename all "grok-cli" branding references to "x-cli" across the codebase while preserving official x.ai API model names and integration code.  
**Duration**: 3-5 days  
**Priority**: High (Branding Consistency)  
**Status**: Ready to implement  

## 🎯 Sprint Objectives

### Primary Goals
- ✅ Update all "grok-cli" branding references to "x-cli" in source code
- ✅ Update documentation and configuration files
- ✅ Update package.json and build artifacts
- ✅ Update website content and landing pages
- ✅ Verify no remaining "grok-cli" branding references exist
- ✅ Preserve all x.ai API model names (grok-code-fast-1, grok-4-latest, etc.)

### Success Criteria
- Zero "grok-cli" branding references in the codebase (excluding historical/git logs)
- All x.ai API model names preserved (grok-code-fast-1, grok-4-latest, grok-3-fast)
- All functionality works with "x-cli" branding
- Documentation accurately reflects the new name
- Website and landing pages show "x-cli"
- Build and installation scripts work correctly
- API integration with x.ai remains functional

## 🔍 Scope Clarification

### What to Change (Branding References)
- ✅ `grok-cli` product name → `x-cli`
- ✅ `grok-cli-hurry-mode` package name → appropriate x-cli name
- ✅ Documentation references to the CLI tool
- ✅ Marketing and branding content
- ✅ Installation instructions and scripts

### What to Preserve (API Integration)
- ✅ `grok-code-fast-1` - Official x.ai API model name
- ✅ `grok-4-latest` - Official x.ai API model name
- ✅ `grok-3-fast` - Official x.ai API model name
- ✅ All x.ai API endpoints and integration code
- ✅ Technical API documentation and references
- ✅ Import statements and API client code

### Search Strategy
- Search for `"grok-cli"` excluding API model patterns: `*grok-code-fast-1*`, `*grok-4-latest*`, `*grok-3-fast*`
- Focus on branding/product name references only
- Preserve all technical API integration code

## 📋 Sprint Backlog

### Epic: Source Code Updates
**Story Points**: 8
**Priority**: High

#### Tasks:
- [ ] **Update package.json** (2 points)
  - Change name field from "grok-cli-hurry-mode" to appropriate x-cli name
  - Update description and keywords
  - Verify publishConfig and other fields

- [ ] **Update CLI entry points** (3 points)
  - Fix any hardcoded references in src/index.ts
  - Update welcome messages and branding
  - Verify binary name references

- [ ] **Update build configuration** (3 points)
  - Fix tsup.config.ts if needed
  - Update any build scripts or references
  - Verify dist/ output naming

### Epic: Documentation Updates
**Story Points**: 10
**Priority**: High

#### Tasks:
- [ ] **Update .agent documentation** (4 points)
  - Update system/architecture.md
  - Update critical-state.md
  - Update API schema references
  - Update installation.md

- [ ] **Update public docs** (6 points)
  - Update apps/site/docs/ files (installation.md, guides, etc.)
  - Update docusaurus.config.ts
  - Update landing page (index.tsx)
  - Update README.md references

### Epic: Scripts and Configuration
**Story Points**: 5
**Priority**: Medium

#### Tasks:
- [ ] **Update install.sh** (2 points)
  - Fix installation script references
  - Update any hardcoded paths or names

- [ ] **Update automation scripts** (3 points)
  - Fix release-management.md references
  - Update automation-protection.md
  - Update npm-publishing-troubleshooting.md

### Epic: Website and Branding
**Story Points**: 4
**Priority**: Medium

#### Tasks:
- [ ] **Update website content** (2 points)
  - Fix apps/site/ landing page content
  - Update any hardcoded branding

- [ ] **Update configuration files** (2 points)
  - Fix any config files with old references
  - Update version sync scripts if needed

## 🔍 Files to Update (Based on Search Results)

### High Priority Files:
- `package.json` - Core package name
- `install.sh` - Installation script
- `apps/site/src/pages/index.tsx` - Landing page
- `apps/site/docusaurus.config.ts` - Site configuration
- `apps/site/docs/getting-started/installation.md` - Installation docs

### Medium Priority Files:
- `apps/site/docs/guides/automation.md` - 3 matches
- `apps/site/docs/development/transparency.md` - 1 match
- `apps/site/docs/guides/releases.md` - 1 match
- `.agent/system/` files - Architecture docs
- `.agent/sop/` files - Process docs

### Low Priority Files:
- `dist/index.js` - Built artifacts (regenerate after changes)
- Any remaining config files

## 🏗️ Implementation Strategy

### Phase 1: Core Package Changes (Day 1)
- Update package.json name and fields
- Test build process works
- Update CLI entry points

### Phase 2: Documentation Updates (Day 2-3)
- Update all .agent/ documentation
- Update public docs and website
- Update installation and automation docs

### Phase 3: Scripts and Testing (Day 4)
- Update install.sh and automation scripts
- Comprehensive testing of all changes
- Verify no broken references

### Phase 4: Cleanup and Verification (Day 5)
- Remove any remaining references
- Update build artifacts
- Final verification with fresh grep search

## 🧪 Testing Strategy

### Automated Testing
- Run grep search for "grok-cli" before and after
- Test build process completes successfully
- Test installation script works

### Manual Testing
- Install and run CLI to verify branding
- Check website builds and displays correctly
- Verify documentation links and content

## ⚠️ Risk Assessment & Mitigations

### High Risk
**🔴 Package Name Change**
- **Impact**: NPM publishing and installation could break
- **Mitigation**: Test package.json changes thoroughly, verify npm install works

**🔴 Website Build Issues**
- **Impact**: Public documentation site could break
- **Mitigation**: Test Docusaurus build locally, have rollback plan

### Medium Risk
**🟡 Documentation Drift**
- **Impact**: Inconsistent branding across docs
- **Mitigation**: Use multi-file edit for systematic updates, verify all files

**🟡 Automation Script Breaks**
- **Impact**: Release process could fail
- **Mitigation**: Test all automation scripts after changes

## 📊 Success Metrics

### Completion Metrics
- **Reference Count**: 0 "grok-cli" references in active codebase
- **Build Success**: All build processes complete without errors
- **Installation Success**: New installs work with "x-cli" branding

### Quality Metrics
- **User Experience**: CLI shows correct "x-cli" branding
- **Documentation Accuracy**: All docs reference "x-cli"
- **Website Functionality**: Site builds and displays properly

## 🔗 Related Documentation

### Implementation References
- **Current Search Results**: 50+ files with "grok-cli" references
- **Package Configuration**: `package.json` structure
- **Documentation System**: `.agent/` folder structure
- **Website Setup**: `apps/site/` Docusaurus configuration

### Process Documentation
- **Version Sync**: `.agent/system/version-synchronization.md`
- **Release Process**: `.agent/sop/release-management.md`
- **Automation**: `.agent/sop/automation-protection.md`

---

## Lessons Learned from Previous Sprints

### Mistakes Identified in Introduction Sprint (2025-10-28-sprint-introduction-feature.md)
1. **Settings Path Inconsistency**: Used legacy `~/.grok/user-settings.json` path instead of the newly specified `~/.xcli/config.json` path, causing branding confusion during user introduction flow.
2. **Incomplete Path Updates**: The introduction feature referenced the old grok-cli settings folder structure, contradicting the x-cli rebranding objectives.

### Additional Critical Path Issues Found (2025-10-30)
3. **Massive Path Reference Gap**: Found 20+ additional files still using `.grok/` paths instead of `.xcli/` paths throughout the codebase
4. **UI Component Branding**: User-facing messages and help text still reference `.grok/` directories
5. **Tool Storage Inconsistency**: Multiple tools (operation-history, auto-update-system, etc.) use `.grok/` paths
6. **Session Logging Paths**: Agent and hooks still use `.grok/session.log` and related paths
7. **Documentation References**: Help text and tool documentation still mention `.grok/` paths

### Files Requiring Path Updates
- `src/index.ts`: CLI name, session log path, save messages
- `src/ui/components/api-key-input.tsx`: User messages about config location
- `src/ui/components/chat-interface-renderer.tsx`: Help text references
- `src/tools/advanced/operation-history.ts`: History file path
- `src/tools/documentation/update-agent-docs.ts`: Exclusion patterns
- `src/tools/documentation/auto-update-system.ts`: Settings path references
- `src/agent/grok-agent.ts`: Session directory path
- `src/hooks/use-session-logging.ts`: Session file path
- `src/hooks/use-console-setup.ts`: Help text
- `src/hooks/use-context-info.ts`: Index and session paths
- `src/hooks/use-input-handler.ts`: Help text
- `src/hooks/use-plan-mode.ts`: Plan save directory
- `src/utils/custom-instructions.ts`: Instructions file path

### Corrective Actions Required
1. Update all settings file paths in introduction code to use `~/.xcli/config.json`
2. Systematically update all `.grok/` path references to `.xcli/` throughout codebase
3. Update user-facing messages and help text to reference correct paths
4. Ensure consistent use of x-cli paths in all tools and components
5. Add validation to prevent future use of legacy grok paths
6. Update all sprint documentation to reflect correct x-cli paths

### Implementation Notes
- The rename sprint should prioritize updating settings paths before completing introduction features
- Add path validation checks to catch legacy grok references
- Ensure all new features use x-cli branded paths consistently

**Sprint Status**: Ready for implementation  
**Estimated Effort**: 3-5 days  
**Risk Level**: Medium (package name changes)  
**User Impact**: High (consistent branding across all user touchpoints)

## 🚀 Implementation Plan

### Day 1: Core Infrastructure
- Update package.json with new name
- Test build process
- Update CLI welcome messages

### Day 2-3: Documentation Overhaul
- Update all .agent/ docs
- Update public docs and website
- Update installation guides

### Day 4: Scripts and Automation
- Update install.sh
- Update release automation docs
- Comprehensive testing

### Day 5: Verification and Cleanup
- Final grep search verification
- Update any missed references
- Rebuild and test everything