# Migration Guide: Repository Rename

**From**: `https://github.com/x-cli-team/x-cli`  
**To**: `https://github.com/x-cli-team/grok-one-shot`

## 📋 Summary

The repository has been renamed from `x-cli` to `grok-one-shot` to better reflect the project's identity and align with the CLI command naming.

## 🚀 What's Changed

### Repository

- **Old URL**: `https://github.com/x-cli-team/x-cli`
- **New URL**: `https://github.com/x-cli-team/grok-one-shot`
- **GitHub automatically redirects** old URLs to the new repository

### CLI Command

- **New primary command**: `grok-one-shot`
- **Legacy support**: `grok` command still works for backward compatibility
- **Package name**: Unchanged (`@xagent/one-shot`)

### NPM Publishing

- **Primary package**: `@xagent/one-shot` (unchanged)
- **Legacy package**: `@xagent/x-cli` (still published for backward compatibility)
- **GitHub Packages**: Now published as `@x-cli-team/grok-one-shot`

## 👥 For Users

### No Action Required

- **Existing installations continue to work**
- **Old URLs automatically redirect**
- **Package name remains the same**

### Optional Updates

Update your command usage to the new canonical form:

```bash
# New canonical command
grok-one-shot

# Old command (still works)
grok
```

### Fresh Installations

New users should use:

```bash
# Install
npm install -g @xagent/one-shot@latest

# Run
grok-one-shot
```

## 🔧 For Developers

### Update Local Repository

If you have a local clone, update your remote:

```bash
# Check current remote
git remote -v

# If it shows old URL, update it
git remote set-url origin https://github.com/x-cli-team/grok-one-shot.git

# Verify the change
git remote -v
```

### Update Documentation/Links

If you have documentation or links pointing to the old repository:

- **Old**: `https://github.com/x-cli-team/x-cli`
- **New**: `https://github.com/x-cli-team/grok-one-shot`

### Vercel Projects

If you have Vercel deployments connected to the repository:

1. Go to Vercel Dashboard
2. Update the Git repository connection to point to `grok-one-shot`
3. Redeploy if needed

Note: GitHub's automatic redirects should handle most cases automatically.

## 🔄 Services Status

### ✅ Working Automatically

- **GitHub redirects**: Old URLs forward to new repository
- **NPM packages**: Continue to work without changes
- **Vercel deployments**: Should continue working via redirects
- **GitHub Actions**: Updated to use new repository URLs
- **Documentation links**: All updated to new URLs

### 📦 Package Publishing

- **Primary**: `@xagent/one-shot` (unchanged)
- **Legacy**: `@xagent/x-cli` (continues for backward compatibility)
- **GitHub Packages**: `@x-cli-team/grok-one-shot` (updated)

## 🛡️ Backward Compatibility

### Commands

```bash
# Both work
grok-one-shot  # New canonical
grok           # Legacy support
```

### NPM Packages

```bash
# Both work
npm install -g @xagent/one-shot    # Primary
npm install -g @xagent/x-cli       # Legacy
```

### URLs

- Old GitHub URLs automatically redirect
- Old clone URLs continue to work
- Old issue/PR links redirect properly

## 📅 Timeline

- **Pre-rename**: All configuration files updated
- **Rename day**: GitHub repository renamed (automatic redirects start)
- **Post-rename**: Vercel and other services updated if needed
- **Ongoing**: Legacy commands/packages maintained indefinitely

## 🚨 Potential Issues

### Rare Cases Requiring Manual Updates

1. **Hardcoded git remotes** in CI/CD systems
2. **Package.json with exact repository URLs** in forks
3. **Documentation** that bypasses GitHub redirects

### If You Experience Issues

1. **Update git remotes**: Use the commands in the "For Developers" section
2. **Clear npm cache**: `npm cache clean --force`
3. **Reinstall package**: `npm uninstall -g @xagent/one-shot && npm install -g @xagent/one-shot@latest`

## 🆘 Support

If you encounter any issues after the rename:

1. **GitHub Issues**: [https://github.com/x-cli-team/grok-one-shot/issues](https://github.com/x-cli-team/grok-one-shot/issues)
2. **NPM Package**: [https://www.npmjs.com/package/@xagent/one-shot](https://www.npmjs.com/package/@xagent/one-shot)

## 🎯 Benefits of the Rename

1. **Better Branding**: Repository name matches the CLI identity
2. **Clearer Purpose**: `grok-one-shot` clearly indicates the tool's function
3. **Consistency**: Aligns with command naming and documentation
4. **Future-Proof**: Supports the project's evolving direction

---

**The migration is designed to be seamless with minimal user impact. Most users won't need to take any action.**
