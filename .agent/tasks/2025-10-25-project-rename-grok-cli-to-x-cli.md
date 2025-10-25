# Project Rename: grok-cli → x-cli

**Priority**: P0 (High Risk - Automated Publishing System)  
**Duration**: 2-3 days  
**Complexity**: Very High (Breaking Changes)  
**Risk Level**: CRITICAL (NPM Publishing Automation)

## 🚨 CRITICAL WARNING

This rename involves the **AUTOMATED NPM PUBLISHING SYSTEM** that is fully operational. According to `.agent/README.md`, the current system is **PROTECTED** and took "multiple iterations to get working."

**PROTECTED SETTINGS (DO NOT BREAK):**

- `package.json` name: `"grok-cli-hurry-mode"`
- GitHub Secrets: `NPM_TOKEN` for `grok_cli` account
- Publishing to npmjs.com (not GitHub Packages)
- Automated version bumping on main branch

## 📋 Rename Scope Analysis

### 1. NPM Package Name Change

**Current**: `grok-cli-hurry-mode`  
**Target**: `x-cli-hurry-mode` or `x-cli`

**CRITICAL DECISION NEEDED:**

- **Option A**: `x-cli` (clean but might be taken)
- **Option B**: `x-cli-hurry-mode` (consistent with current pattern)
- **Option C**: `@x-ai/cli` (scoped package - requires x.ai NPM org access)

### 2. Command Name Change

**Current**: `grok` command  
**Target**: `x` command

### 3. Repository & URLs

**Current**: `grok-cli-hurry-mode`  
**Target**: `x-cli-hurry-mode` or `x-cli`

### 4. Configuration & Branding

**Current**: `.grok/` directories, `GROK.md` files  
**Target**: `.x/` directories, `X.md` files

## 🎯 Implementation Strategy

### Phase 1: Pre-Rename Preparation (Day 1)

**Goal**: Secure new package name and prepare migration

#### 1.1 NPM Package Name Reservation

```bash
# Check availability
npm view x-cli
npm view x-cli-hurry-mode
npm view @x-ai/cli

# Reserve chosen name (publish placeholder)
npm publish --dry-run
```

#### 1.2 GitHub Repository Setup

- [ ] Create new repository: `hinetapora/x-cli-hurry-mode`
- [ ] Set up GitHub Secrets: `NPM_TOKEN`, `PAT_TOKEN`
- [ ] Configure branch protection rules
- [ ] Test GitHub Actions workflow

#### 1.3 Domain & Documentation

- [ ] Reserve `xcli.dev` domain (if available)
- [ ] Set up Vercel project for new domain
- [ ] Prepare documentation migration

### Phase 2: Core Package Rename (Day 2)

**Goal**: Update all package-related files

#### 2.1 Package Configuration

```json
// package.json changes
{
  "name": "x-cli-hurry-mode", // or chosen name
  "bin": {
    "x": "dist/index.js"
  },
  "repository": {
    "url": "https://github.com/hinetapora/x-cli-hurry-mode.git"
  },
  "homepage": "https://xcli.dev",
  "bugs": {
    "url": "https://github.com/hinetapora/x-cli-hurry-mode/issues"
  }
}
```

#### 2.2 CLI Command Updates

**Files to update:**

- `src/index.ts` - Program name and description
- `README.md` - All installation instructions
- Command help text and error messages
- CLI usage examples

#### 2.3 Configuration System

**Rename configuration directories:**

- `.grok/` → `.x/`
- `GROK.md` → `X.md`
- `user-settings.json` paths
- Environment variable names: `GROK_API_KEY` → `X_API_KEY`

### Phase 3: Branding & Documentation (Day 2-3)

**Goal**: Update all user-facing content

#### 3.1 Documentation Updates

**Files requiring updates:**

- `README.md` - Complete rewrite of installation/usage
- `CHANGELOG.md` - Add migration notice
- `apps/site/` - Entire documentation site
- `.agent/` documentation system
- GitHub issue templates
- Contributing guidelines

#### 3.2 Code References

**Search and replace patterns:**

```bash
# Find all "grok" references
grep -r "grok" --exclude-dir=node_modules .
grep -r "Grok" --exclude-dir=node_modules .

# Environment variables
GROK_API_KEY → X_API_KEY
GROK_BASE_URL → X_BASE_URL
GROK_MODEL → X_MODEL

# File paths and configs
.grok/ → .x/
GROK.md → X.md
```

#### 3.3 UI & Branding

- Welcome banners and ASCII art
- Error messages and help text
- Loading spinners and status text
- Model names and API references

### Phase 4: Migration & Publishing (Day 3)

**Goal**: Safely transition to new package

#### 4.1 Migration Strategy

```bash
# 1. Publish new package first
npm publish x-cli-hurry-mode

# 2. Add deprecation notice to old package
npm deprecate grok-cli-hurry-mode "⚠️ Renamed to x-cli-hurry-mode. Install: npm install -g x-cli-hurry-mode"

# 3. Update old package to show migration notice
```

#### 4.2 Backward Compatibility

- [ ] Old `.grok/` configs still work (with deprecation warning)
- [ ] Old environment variables still work (with migration notice)
- [ ] Migration utility command: `x migrate-from-grok`

#### 4.3 Community Communication

- [ ] GitHub release announcement
- [ ] README migration notice
- [ ] Discord/community notifications
- [ ] Update all external documentation

## 🔧 Technical Implementation Details

### NPM Publishing Automation Updates

**Critical files to update:**

```yaml
# .github/workflows/release.yml
- name: Publish to NPM
  run: |
    npm config set //registry.npmjs.org/:_authToken ${{ secrets.NPM_TOKEN }}
    npm publish --access public
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Package.json automation-critical fields:**

```json
{
  "name": "x-cli-hurry-mode",
  "publishConfig": {
    "access": "public"
    // NO registry override - publishes to npmjs.com
  }
}
```

### Configuration Migration Logic

**Support both old and new configs:**

```typescript
// src/utils/settings-manager.ts
function getConfigDirectory(): string {
  const newPath = path.join(os.homedir(), ".x");
  const oldPath = path.join(os.homedir(), ".grok");

  if (fs.existsSync(newPath)) {
    return newPath;
  } else if (fs.existsSync(oldPath)) {
    console.warn("⚠️ Using deprecated .grok/ config. Run: x migrate-config");
    return oldPath;
  }

  return newPath; // Create new
}
```

### Environment Variable Migration

```typescript
function getApiKey(): string {
  return (
    process.env.X_API_KEY ||
    process.env.GROK_API_KEY || // Deprecated
    loadFromConfig()
  );
}
```

## 🚨 Risk Mitigation

### Critical Risks & Mitigation

1. **NPM Publishing Automation Breaks**
   - **Risk**: Current automation system stops working
   - **Mitigation**: Test new automation in separate repo first
   - **Rollback**: Keep old repo as backup

2. **Package Name Conflicts**
   - **Risk**: Chosen name already taken or conflicts
   - **Mitigation**: Check npm, GitHub, domains before starting
   - **Backup**: Have 2-3 name options ready

3. **User Migration Issues**
   - **Risk**: Users stuck on old package
   - **Mitigation**: Clear migration docs, backward compatibility
   - **Support**: Migration utility and comprehensive guides

4. **Documentation Consistency**
   - **Risk**: Mixed old/new references cause confusion
   - **Mitigation**: Comprehensive find/replace, review checklist
   - **Quality**: Update all docs atomically

### Testing Strategy

**Pre-Migration Tests:**

```bash
# Test new package name
npm pack
npm install -g ./x-cli-hurry-mode-*.tgz
x --version
x --help

# Test GitHub Actions
git push new-repo
# Verify automation works

# Test migration utilities
x migrate-from-grok
```

## 📋 Execution Checklist

### Pre-Rename (Day 1)

- [ ] Check npm package name availability
- [ ] Reserve chosen package name
- [ ] Create new GitHub repository
- [ ] Set up GitHub Secrets and Actions
- [ ] Reserve new domain (if applicable)
- [ ] Create migration branch in current repo

### Core Rename (Day 2)

- [ ] Update package.json (name, bin, URLs)
- [ ] Update CLI command name and help text
- [ ] Rename configuration directories/files
- [ ] Update environment variable names
- [ ] Search/replace all "grok" → "x" references
- [ ] Update documentation site
- [ ] Test new package locally

### Migration & Publishing (Day 3)

- [ ] Publish new package to npm
- [ ] Test global installation: `npm install -g x-cli-hurry-mode`
- [ ] Add deprecation to old package
- [ ] Update GitHub repository settings
- [ ] Deploy new documentation site
- [ ] Create migration guide
- [ ] Announce to community

### Post-Migration (Ongoing)

- [ ] Monitor for migration issues
- [ ] Update external references
- [ ] Remove old package after 6 months
- [ ] Archive old repository

## 📊 Impact Assessment

### Breaking Changes

- **Package name**: `grok-cli-hurry-mode` → `x-cli-hurry-mode`
- **Command name**: `grok` → `x`
- **Config directories**: `.grok/` → `.x/`
- **Environment variables**: `GROK_*` → `X_*`

### User Migration Required

- Uninstall old package: `npm uninstall -g grok-cli-hurry-mode`
- Install new package: `npm install -g x-cli-hurry-mode`
- Migrate configs: `x migrate-from-grok` (automatic)
- Update scripts/aliases that use `grok` command

### Timeline Estimate

- **Preparation**: 1 day
- **Implementation**: 1 day
- **Testing & Publishing**: 1 day
- **Community Migration**: 1-2 weeks
- **Full Deprecation**: 6 months

## 🎯 Success Criteria

- ✅ New package published and installable
- ✅ All automation (GitHub Actions, NPM) working
- ✅ Documentation completely updated
- ✅ Migration path for existing users
- ✅ Zero downtime for new installations
- ✅ Community successfully migrated within 2 weeks

---

**⚠️ CRITICAL NOTE**: This rename affects the **PROTECTED AUTOMATION SYSTEM**. Any changes to the NPM publishing workflow must be tested thoroughly to avoid breaking the automated release system that "took multiple iterations to get working."
