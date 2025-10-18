# Git Workflow & Smart Push

## 🚨 CRITICAL: Always Use Smart Push

**GitHub Actions automatically creates version bump commits, causing "fetch first" errors with regular `git push`. ALWAYS use smart push methods.**

## ✅ Correct Push Methods

### Method 1: Git Alias (Recommended)
```bash
git pushup
```

### Method 2: NPM Script  
```bash
npm run smart-push
```

### Method 3: Direct Script
```bash
./scripts/smart-push.sh
```

## ❌ NEVER Use Regular Push
```bash
# ❌ DON'T DO THIS - Will fail with "fetch first" error
git push origin main
```

## 🔧 How Smart Push Works

1. **Pulls with rebase** to get automated version bumps from GitHub Actions
2. **Rebases local changes** on top of remote changes  
3. **Pushes cleanly** without merge conflicts
4. **Handles conflicts** gracefully if they occur

## 🤖 Why This is Needed

The automated release system:
- Creates version bump commits like "Bump version to 1.0.87"
- Publishes to NPM automatically
- Updates package.json and README.md
- Creates git tags

Without smart push, you get:
```
! [rejected] main -> main (fetch first)
error: failed to push some refs
```

## 🛠️ Configuration Applied

The following Git settings are configured globally:
- `pull.rebase = true` - Always rebase when pulling  
- `branch.autoSetupRebase = always` - New branches auto-rebase
- `alias.pushup` - Custom pull-then-push command

## 🔄 Workflow Example

```bash
# Make changes
git add .
git commit -m "Add new feature"

# Push with smart push (handles automated version bumps)
git pushup

# ✅ Success! No conflicts with GitHub Actions
```

## 🚨 Emergency Manual Fix

If you accidentally used `git push` and got rejected:

```bash
# Pull to get the automated changes
git pull --rebase origin main

# Then push
git push origin main
```

## 📖 Related Documentation

- `.agent/sop/release-management.md` - Automated release system details
- `scripts/smart-push.sh` - Smart push script implementation
- `package.json` - NPM script configuration

---

**Last Updated**: 2025-10-18  
**Status**: Active - Required for all Git operations