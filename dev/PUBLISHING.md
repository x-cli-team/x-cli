# Publishing Setup Guide

## 🎯 Recommended: CI/CD with GitHub Actions

### Setup Steps:

1. **Create NPM Token:**
   ```bash
   # Login to npmjs.com and create an automation token
   npm login
   # Go to npmjs.com > Access Tokens > Generate New Token (Automation)
   ```

2. **Add GitHub Secret:**
   - Go to your repo: Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your NPM automation token

3. **Set up GitHub Authentication (for Push Access):**
   - For manual pushes or workflow triggers, ensure you have a GitHub Personal Access Token (PAT) with appropriate permissions.
   - **Fine-grained PAT** (recommended for security):
     - Repository access: Select your repo (e.g., `hinetapora/grok-cli-hurry-mode`).
     - Permissions: `Contents` (Read and write), `Metadata` (Read), `Workflows` (Read and write).
   - **Classic PAT** (alternative):
     - Scopes: `repo` (full access to repos).
   - Update Git credentials:
     ```bash
     printf "protocol=https\nhost=github.com\nusername=<your_username>\npassword=<your_PAT>\n" | git credential approve
     ```

4. **Commit and Push:**
   ```bash
   git add .github/workflows/publish.yml
   git commit -m "Add automated NPM publishing"
   git push
   ```

### How It Works:

- **Auto-publishes** on every push to `main` branch
- **Version bumping** based on commit messages:
  - `[major]` in commit → major version bump
  - `[minor]` in commit → minor version bump
  - Default → patch version bump
- **Auto-commits and pushes** version bumps and tags back to the repo (uses `GITHUB_TOKEN` for secure internal pushes)
- **Manual publishing** via "workflow_dispatch" in GitHub Actions tab
- **Tag-based publishing** when you create version tags

### Example Commits:
```bash
git commit -m "Add new advanced tools [minor]"  # 1.0.0 → 1.1.0
git commit -m "Fix critical bug [major]"        # 1.1.0 → 2.0.0  
git commit -m "Update documentation"            # 2.0.0 → 2.0.1
```

---

## 🔧 Alternative: Git Hook (Local Only)

### Setup Steps:

1. **Install the hook:**
   ```bash
   ln -sf ../../.githooks/pre-push .git/hooks/pre-push
   ```

2. **Set your NPM token:**
   ```bash
   export NPM_TOKEN=your_npm_token_here
   # Add to ~/.bashrc or ~/.zshrc to persist
   ```

3. **Push to trigger:**
   ```bash
   git push origin main  # Will auto-publish if on main branch
   ```

### Limitations:
- Only works on your machine
- No CI/CD safety checks
- Requires local NPM token setup
- Can fail silently

---

## 📦 Manual Publishing

```bash
# Build and publish manually
bun run build
npm version patch  # or minor/major
npm publish --access public
git push --tags
```

---

## 🚀 Recommendation

**Use GitHub Actions CI/CD** because:
- ✅ Works for all contributors
- ✅ Safer (tests before publishing)
- ✅ Better version management
- ✅ Audit trail in GitHub
- ✅ Can rollback easily
- ✅ No local setup required

The git hook is provided as a backup option, but CI/CD is the professional approach for package publishing.