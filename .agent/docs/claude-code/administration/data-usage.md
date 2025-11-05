# Data Usage and Privacy

Understand what data Grok One-Shot collects, stores, and transmits.

## Overview

Grok One-Shot is designed with privacy in mind. This guide explains data handling, storage, transmission, and your control over your data.

## Data Categories

### 1. Configuration Data

**What:** Settings and preferences

**Location:** `~/.x-cli/settings.json`

**Contains:**
- API key
- Model preferences
- Confirmation settings
- MCP server configurations
- User name (optional)

**Transmitted:** No (local only)

**Control:** Full control, can edit or delete

**Example:**
```json
{
  "apiKey": "xai-xxxxx",
  "model": "grok-2-1212",
  "name": "Alice",
  "confirmations": true
}
```

### 2. Session Data

**What:** Conversation history and context

**Location:** `~/.x-cli/sessions/`

**Contains:**
- User messages
- AI responses
- Tool calls and results
- Token usage statistics
- Timestamps and metadata

**Transmitted:** No (local only)

**Control:** Full control, can view, archive, or delete

**Example structure:**
```json
{
  "sessionId": "session-2025-11-05-14-30",
  "messages": [
    {
      "role": "user",
      "content": "list files"
    },
    {
      "role": "assistant",
      "content": "Here are the files..."
    }
  ],
  "tokenUsage": {
    "input": 1234,
    "output": 567
  }
}
```

### 3. API Communication Data

**What:** Data sent to X.AI API

**Transmitted to:** X.AI servers (https://api.x.ai)

**Contains:**
- Your prompts and messages
- File contents (when AI reads/analyzes files)
- Tool call results
- Context and conversation history

**Control:** Managed by X.AI's privacy policy

**Retention:** Per X.AI's data retention policy

**Encryption:** HTTPS/TLS in transit

### 4. Usage Logs

**What:** Diagnostic and error logs

**Location:**
- `xcli-startup.log` (current directory)
- Console output (when `GROK_DEBUG=true`)

**Contains:**
- Startup diagnostics
- Error messages
- Debug information (if enabled)

**Transmitted:** No (local only)

**Control:** Full control, logs are local files

## What Data is Transmitted

### Sent to X.AI API

**Always sent:**
```
✓ User messages and prompts
✓ Conversation history (for context)
✓ Model and parameter selections
✓ API key (for authentication)
```

**Sent when relevant:**
```
✓ File contents (when AI reads files)
✓ Command outputs (when AI runs commands)
✓ Directory structure (when AI explores codebase)
✓ Git information (when AI checks repository status)
```

**Never sent (stays local):**
```
✗ Session files (unless you share them)
✗ Configuration files
✗ Unread files (AI only reads what's needed)
✗ Credentials in environment variables (not accessible to AI)
```

### Network Communication

**API Endpoint:** `https://api.x.ai/v1`

**Protocol:** HTTPS (TLS 1.2+)

**Authentication:** Bearer token (your API key)

**Request structure:**
```json
{
  "model": "grok-2-1212",
  "messages": [
    {"role": "user", "content": "your message"},
    {"role": "assistant", "content": "AI response"}
  ],
  "tools": [...],
  "stream": true
}
```

## Data Storage

### Local Storage

**Configuration:**
- Location: `~/.x-cli/settings.json`
- Permissions: `600` (user read/write only) - recommended
- Format: JSON
- Size: ~1-5 KB

**Sessions:**
- Location: `~/.x-cli/sessions/`
- Permissions: `700` (directory), `600` (files) - recommended
- Format: JSON
- Size: Variable (typically 10-100 KB per session)
- Retention: Indefinite (manual cleanup)

**Logs:**
- Location: `./xcli-startup.log`
- Permissions: Default (usually `644`)
- Format: Plain text
- Size: ~1-10 KB
- Retention: Overwritten each run

### Cloud Storage

**X.AI API:**
- Grok One-Shot does not control X.AI's data retention
- Refer to X.AI Privacy Policy: https://x.ai/privacy
- API requests are logged by X.AI for service delivery
- Data retention per X.AI's terms of service

**No Other Cloud Storage:**
- Grok One-Shot does not use any other cloud storage
- No telemetry sent to Grok One-Shot developers
- No analytics or tracking

## Privacy Controls

### Minimize Data Transmission

**1. Don't let AI read unnecessary files:**
```
❌ "Analyze all files in my home directory"
✅ "Analyze authentication logic in src/auth/"
```

**2. Use specific prompts:**
```
❌ "Fix the code"
✅ "Fix error handling in src/api/users.ts line 47"
```

**3. Avoid sharing sensitive data:**
```
❌ "Here's my API key: sk-xxxxx"
✅ Use environment variables, don't paste secrets
```

### Secure API Keys

**Best practices:**
```bash
# ✅ Environment variable (not saved in history)
export GROK_API_KEY="your-key"

# ✅ Settings file with restricted permissions
chmod 600 ~/.x-cli/settings.json

# ❌ Command-line flag (visible in history)
x-cli -k "your-key"  # Avoid
```

### Clean Up Session Data

**Regularly delete old sessions:**
```bash
# View sessions
ls -lah ~/.x-cli/sessions/

# Delete sessions older than 30 days
find ~/.x-cli/sessions/ -name "*.json" -mtime +30 -delete

# Or delete all sessions
rm ~/.x-cli/sessions/*.json
```

### Disable Logging

**Minimize local logs:**
```bash
# Don't enable debug mode unnecessarily
# export GROK_DEBUG=true  # Only when needed

# Redirect to /dev/null if needed
x-cli 2>/dev/null
```

## Data Security

### At Rest (Local Storage)

**Protect local files:**
```bash
# Restrict permissions
chmod 600 ~/.x-cli/settings.json
chmod 700 ~/.x-cli/sessions/

# Verify
ls -la ~/.x-cli/
# Should show: drwx------ (700) for directories
#              -rw------- (600) for files
```

**Encrypt home directory:**
```bash
# macOS: FileVault
# Windows: BitLocker
# Linux: LUKS / dm-crypt

# Encrypts all data in ~/.x-cli/
```

### In Transit (Network)

**HTTPS encryption:**
- All API requests use HTTPS (TLS 1.2+)
- Certificate validation enforced
- No plain HTTP fallback

**Verify connection security:**
```bash
# Check TLS version
openssl s_client -connect api.x.ai:443 -tls1_2

# Should show: TLSv1.2 or TLSv1.3
```

### API Key Protection

**Security measures:**
```bash
# 1. Use environment variables
export GROK_API_KEY="xai-xxxxx"

# 2. Restrict settings file permissions
chmod 600 ~/.x-cli/settings.json

# 3. Don't commit to git
echo '.x-cli/settings.json' >> ~/.gitignore

# 4. Rotate keys periodically
# Generate new key at https://console.x.ai
# Update in settings or environment
```

## Compliance Considerations

### GDPR (Europe)

**User rights:**
- **Right to access:** View your local session files
- **Right to deletion:** Delete `~/.x-cli/` directory
- **Right to portability:** Session files are JSON (portable)

**X.AI's responsibilities:**
- Data transmitted to X.AI falls under X.AI's GDPR compliance
- See X.AI Privacy Policy for details

**Data controller:**
- Local data: You (the user)
- API data: X.AI

### CCPA (California)

**Consumer rights:**
- Similar to GDPR
- Local data fully under your control
- API data governed by X.AI's CCPA compliance

### Enterprise Compliance

**SOC 2 / ISO 27001:**
- Review X.AI's compliance certifications
- Implement access controls for API keys
- Monitor and audit API usage
- Encrypt data at rest and in transit

**HIPAA / PCI-DSS:**
- **Do not** use Grok One-Shot with protected health information (PHI)
- **Do not** use with payment card data
- Unless: X.AI has appropriate compliance (verify with X.AI)

## Data Retention

### Local Data Retention

**You control retention:**
```bash
# Keep sessions indefinitely
# (default - no automatic cleanup)

# Or implement cleanup policy
# Example: Delete sessions older than 90 days
find ~/.x-cli/sessions/ -mtime +90 -delete

# Add to cron for automatic cleanup
# crontab -e
# 0 0 * * 0 find ~/.x-cli/sessions/ -mtime +90 -delete
```

### API Data Retention

**X.AI retention policy:**
- Refer to X.AI Terms of Service
- Typically: API requests logged for service delivery
- Retention period: Per X.AI's policy (varies)
- Deletion requests: Contact X.AI support

## Audit and Monitoring

### Monitor API Usage

**Check token usage:**
```bash
# During session: Ctrl+I

# From session files
cat ~/.x-cli/sessions/*.json | jq '.tokenUsage'

# Total usage across sessions
find ~/.x-cli/sessions/ -name "*.json" -exec jq '.tokenUsage.input + .tokenUsage.output' {} + | awk '{sum+=$1} END {print sum " total tokens"}'
```

**Review transmitted data:**
```bash
# Session files contain everything sent to API
cat ~/.x-cli/sessions/latest-session.json | jq '.messages'
```

### Audit Logs

**Enable detailed logging:**
```bash
# Debug mode logs API requests
export GROK_DEBUG=true
x-cli 2>&1 | tee audit.log

# Review what was sent
grep "API Request" audit.log
```

### DLP (Data Loss Prevention)

**Pre-commit hooks:**
```bash
# .git/hooks/pre-commit
#!/bin/bash

# Check for API keys in staged files
if git diff --cached | grep -E "xai-[a-zA-Z0-9]+"; then
  echo "❌ API key detected in commit"
  exit 1
fi
```

**Content filtering:**
```bash
# Example: Prevent AI from reading secrets files
> Don't read .env files or files containing 'password'
# AI will respect this instruction
```

## Best Practices

### Data Minimization

**DO:**
- ✅ Be specific about which files to analyze
- ✅ Use headless mode for simple queries
- ✅ Start new sessions for unrelated tasks
- ✅ Clean up old session files

**DON'T:**
- ❌ Let AI explore entire home directory
- ❌ Share passwords or secrets in prompts
- ❌ Accumulate unlimited session history
- ❌ Use with sensitive/regulated data without review

### Access Control

**Protect API keys:**
```bash
# Team environment: separate keys per user
export GROK_API_KEY="user1-key"  # User 1
export GROK_API_KEY="user2-key"  # User 2

# Project environment: separate keys per project
# project-a/.env
GROK_API_KEY="project-a-key"

# project-b/.env
GROK_API_KEY="project-b-key"
```

**Restrict file access:**
```bash
# Settings file: user only
chmod 600 ~/.x-cli/settings.json

# Sessions directory: user only
chmod 700 ~/.x-cli/sessions/

# Verify no group/other access
ls -la ~/.x-cli/
```

### Incident Response

**If API key compromised:**
```bash
# 1. Rotate key immediately
# Go to https://console.x.ai → Generate new key

# 2. Update local configuration
export GROK_API_KEY="new-key"
# or edit ~/.x-cli/settings.json

# 3. Revoke old key (in X.AI console)

# 4. Review API usage logs for unauthorized usage
```

**If sensitive data exposed:**
```bash
# 1. Delete session files
rm ~/.x-cli/sessions/*.json

# 2. Contact X.AI support for data deletion request
# (if data was transmitted to API)

# 3. Review and update security practices
```

## FAQ

**Q: Does Grok One-Shot send telemetry?**
A: No. Grok One-Shot does not send usage telemetry, analytics, or tracking data to developers.

**Q: Can X.AI see my code?**
A: X.AI receives any code that the AI reads or analyzes during your session. This is necessary for AI functionality.

**Q: Is my API key stored securely?**
A: Locally, yes (in settings file). Secure it with file permissions (`chmod 600`). Transmitted via HTTPS to X.AI.

**Q: How long does X.AI keep my data?**
A: Refer to X.AI's Privacy Policy and Terms of Service for data retention policies.

**Q: Can I use Grok One-Shot in regulated industries?**
A: Consult your compliance team and X.AI's compliance certifications. May not be suitable for HIPAA/PCI without additional controls.

**Q: What happens if I delete ~/.x-cli/?**
A: All local configuration and sessions are deleted. No data loss beyond local storage. API data persists per X.AI's policy.

**Q: Can I run Grok One-Shot offline?**
A: No. Requires internet connection to X.AI API. All AI processing happens on X.AI servers.

**Q: Is my session history private?**
A: Locally stored sessions are private (on your machine). Data sent to API is subject to X.AI's privacy policy.

## See Also

- [Settings](../configuration/settings.md) - Configuration management
- [Troubleshooting](../build-with-claude-code/troubleshooting.md) - Common issues
- [Advanced Installation](./advanced-installation.md) - Enterprise setup
- [Legal and Compliance](../resources/legal-and-compliance.md) - Legal information

**External Resources:**
- X.AI Privacy Policy: https://x.ai/privacy
- X.AI Terms of Service: https://x.ai/terms

---

Understanding data usage and privacy helps you use Grok One-Shot securely and responsibly.
