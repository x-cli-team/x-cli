---
title: Troubleshooting Guide
---

# Troubleshooting Guide

Solutions to common issues and problems with Grok One-Shot.

## Installation Issues

### "Command not found: x-cli"

**Cause:** Global npm/bun binary not in PATH

**Solutions:**

```bash
# For npm
export PATH="$PATH:$(npm bin -g)"

# For Bun
export PATH="$PATH:$HOME/.bun/bin"

# Or reinstall
npm install -g @xagent/one-shot

# Verify
which x-cli
```

### "Permission denied" during install

**Cause:** Need sudo for global install

**Solutions:**

```bash
# Use sudo (not recommended)
sudo npm install -g @xagent/one-shot

# Or use npx (no install needed)
npx @xagent/one-shot

# Or configure npm for user installs
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### "Module not found" errors

**Cause:** Dependencies not installed

**Solutions:**

```bash
# Reinstall with clean cache
npm cache clean --force
npm install -g @xagent/one-shot

# Or with Bun
bun install -g @xagent/one-shot
```

## API Key Issues

### "No API key found"

**Cause:** GROK_API_KEY not set

**Solutions:**

```bash
# Set environment variable
export GROK_API_KEY="your-key-here"

# Add to shell profile
echo 'export GROK_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc

# Or pass via flag
x-cli -k "your-key"
```

### "Invalid API key" or 401 errors

**Cause:** Wrong or expired key

**Solutions:**

```bash
# Verify key
cat ~/.x-cli/settings.json

# Get new key from x.ai

# Update key
x-cli -k "new-key-here"
```

### "Rate limit exceeded"

**Cause:** Too many API requests

**Solutions:**

- Wait a few minutes
- Upgrade API plan
- Reduce token usage per request
- Use headless mode for simple queries

## Runtime Issues

### "Error: requires interactive terminal"

**Cause:** Running in non-TTY environment

**Solutions:**

```bash
# Use headless mode
x-cli -p "your message"

# Or ensure proper TTY
# (don't redirect or run in scripts without -p flag)
```

### Responses are slow

**Causes & Solutions:**

**1. Network latency**

```bash
# Check internet speed
# Try different network
```

**2. Using Node.js instead of Bun**

```bash
# Install Bun (4x faster)
curl -fsSL https://bun.sh/install | bash

# Reinstall with Bun
bun install -g @xagent/one-shot
```

**3. Large context loaded**

```bash
# Start fresh session
# Be more specific in requests
# Use Ctrl+I to check token usage
```

**4. Wrong model**

```bash
# Switch to fast model
# Press Ctrl+M, select grok-4-fast-non-reasoning
```

### AI responses are incomplete

**Causes:**

- Network interruption
- Token limit reached
- API timeout

**Solutions:**

```
> Continue from where you left off

> Try that again, but shorter

# Or start new session
/exit
x-cli
```

### "Too many tool rounds" error

**Cause:** Hit MAX_TOOL_ROUNDS limit

**Solutions:**

```bash
# Increase limit
export MAX_TOOL_ROUNDS=500

# Or break task into smaller pieces
# Or be more specific in request
```

## File Operation Issues

### Changes not applied

**Causes:**

1. Rejected confirmation
2. File permissions
3. Git conflicts

**Solutions:**

```bash
# Check file permissions
ls -la <file>

# Check git status
git status

# Try manual approval
# When prompted, press 'y' to approve
```

### Wrong files modified

**Prevention:**

- Review changes before approving
- Use specific file paths in requests
- Keep confirmations enabled

**Recovery:**

```bash
# Git restore
git diff
git checkout -- <file>

# Or restore from session backup
# Sessions saved in ~/.x-cli/sessions/
```

### "File not found" errors

**Causes:**

- Wrong working directory
- File doesn't exist
- Typo in filename

**Solutions:**

```bash
# Check current directory
pwd

# Change directory
x-cli -d /correct/path

# Verify file exists
ls <file>
```

## MCP Server Issues

### MCP server won't start

**Solutions:**

```bash
# Test command independently
npx -y @modelcontextprotocol/server-filesystem /path

# Check permissions
ls -la /path

# Remove and re-add
x-cli mcp remove servername
x-cli mcp add servername "command"
```

### MCP tools not working

**Solutions:**

```
> Use the [specific tool name] to ...

# Check server logs
# Restart session
/exit
x-cli
```

## Performance Issues

### High memory usage

**Solutions:**

```bash
# Start new session (clears context)
# Use headless mode for simple tasks
# Close other applications
```

### Terminal is laggy

**Solutions:**

```bash
# Disable UX enhancements
export GROK_UX_ENHANCED=false

# Use minimal terminal
export GROK_UX_MINIMAL=true

# Upgrade terminal emulator (iTerm2, Windows Terminal)
```

## Session Issues

### Session won't save

**Causes:**

- Disk space full
- Permission issues

**Solutions:**

```bash
# Check disk space
df -h

# Check permissions
ls -la ~/.x-cli/sessions/

# Create directory if missing
mkdir -p ~/.x-cli/sessions
chmod 755 ~/.x-cli/sessions
```

### Can't exit session

**Solutions:**

```
# Try slash command
/exit

# Try keyboard shortcut
Ctrl+D

# Force exit
Ctrl+C (twice)
```

## Debug Mode

### Enable debugging

```bash
# Set debug flags
export GROK_DEBUG=true
export GROK_UX_DEBUG=true

# Run with debugging
x-cli

# Check startup log
cat xcli-startup.log
```

### Useful debug output

**Check settings:**

```bash
cat ~/.x-cli/settings.json
```

**Check sessions:**

```bash
ls -la ~/.x-cli/sessions/
cat ~/.x-cli/sessions/latest-session.json
```

**Check environment:**

```bash
printenv | grep GROK
```

## Platform-Specific Issues

### macOS

**Issue:** Terminal color problems

```bash
export TERM_BACKGROUND=dark # or 'light'
```

**Issue:** Permission denied

```bash
# Don't use sudo with npm
# Configure user-level npm instead
```

### Windows

**Issue:** Git Bash compatibility

- Use Windows Terminal or PowerShell instead
- Install latest Git for Windows

**Issue:** Symlink errors (CLAUDE.md)

- Run as Administrator for symlink creation
- Or manually copy GROK.md to CLAUDE.md

### Linux

**Issue:** Old Node.js version

```bash
# Update Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or use nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

## Common Error Messages

### "EACCES: permission denied"

**Solution:** Don't use sudo. Configure npm for user installs.

### "ECONNREFUSED"

**Solution:** Check internet connection and API endpoint.

### "Cannot find module"

**Solution:** Reinstall dependencies: `npm install -g @xagent/one-shot`

### "Maximum call stack size exceeded"

**Solution:** Reduce complexity of request or increase Node.js memory:

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

## Getting Further Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Enable debug mode
3. Check `xcli-startup.log`
4. Review session files
5. Try in a clean environment

### Where to Get Help

- **Documentation:** See GROK.md and docs-index.md
- **GitHub Issues:** Report bugs and feature requests
- **Community:** Join discussions on GitHub
- **Logs:** Include debug logs when reporting issues

### Reporting Issues

**Include:**

1. Grok One-Shot version (`x-cli --version`)
2. Operating system and version
3. Node.js/Bun version
4. Error message and stack trace
5. Steps to reproduce
6. Debug logs (`xcli-startup.log`)

**Template:**

```markdown
**Version:** x-cli 1.1.101
**OS:** macOS 13.5
**Runtime:** Bun 1.0.0
**Error:** [error message]
**Steps to reproduce:**

1. ...
2. ...
   **Debug logs:** [attach xcli-startup.log]
```

## See Also

- [Quickstart Guide](../getting-started/quickstart.md)
- [CLI Reference](../reference/cli-reference.md)
- [Configuration](../configuration/settings.md)
- [Interactive Mode](../reference/interactive-mode.md)

---

**Still having issues?** File an issue on GitHub with debug logs and reproduction steps.
