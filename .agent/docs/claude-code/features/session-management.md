# Session Management

How Grok One-Shot handles conversation sessions, storage, and recovery.

## Overview

Sessions are the foundation of Grok One-Shot's conversational interface. Each session maintains context, tracks usage, and can be saved, restored, or analyzed.

## Session Lifecycle

### Starting a Session

**Interactive mode:**
```bash
grok

# Session starts
# Loads: GROK.md + docs-index.md (~3,500 tokens)
# Ready for conversation
```

**With initial message:**
```bash
grok "analyze authentication flow"

# Session starts with your message already queued
# AI processes and responds immediately
```

**Headless mode (no session persistence):**
```bash
grok -p "quick query"

# Executes query
# No session file created
# Exits immediately
```

### During a Session

**Conversation flow:**
```
1. User types message
2. AI receives message + full context
3. AI uses tools as needed
4. AI generates response
5. Conversation continues
6. Session auto-saves periodically
```

**Context accumulation:**
```
Initial: ~3,500 tokens (startup context)
Message 1: +1,500 tokens
Message 2: +2,000 tokens
Message 3: +3,500 tokens
...
After 20 messages: ~40,000 tokens
```

### Ending a Session

**Graceful exit:**
```bash
# In session, type:
/exit
# or
/quit

# Session saved to ~/.x-cli/sessions/
# Clean shutdown
```

**Keyboard shortcuts:**
```
Ctrl+D  → Exit gracefully
Ctrl+C  → Interrupt (may not save)
Ctrl+C (twice) → Force exit (no save)
```

**Automatic save:**
- Sessions save periodically during conversation
- Final save on graceful exit
- Emergency save on unexpected termination (best effort)

## Session Storage

### Storage Location

**Default directory:**
```bash
~/.x-cli/sessions/
```

**Session files:**
```bash
ls ~/.x-cli/sessions/

session-2025-11-05-14-30-12.json
session-2025-11-05-16-45-03.json
session-2025-11-06-09-15-22.json
```

### Session File Format

**Structure:**
```json
{
  "sessionId": "session-2025-11-05-14-30-12",
  "startTime": "2025-11-05T14:30:12.345Z",
  "endTime": "2025-11-05T15:15:42.789Z",
  "model": "grok-2-1212",
  "messages": [
    {
      "role": "system",
      "content": "[GROK.md + docs-index.md content]"
    },
    {
      "role": "user",
      "content": "analyze authentication flow",
      "timestamp": "2025-11-05T14:30:15.000Z"
    },
    {
      "role": "assistant",
      "content": "I'll analyze the authentication flow...",
      "timestamp": "2025-11-05T14:30:18.500Z",
      "toolCalls": [
        {
          "tool": "Glob",
          "parameters": { "pattern": "**/*auth*" },
          "result": ["src/auth/middleware.ts", "..."]
        }
      ]
    }
  ],
  "tokenUsage": {
    "input": 23450,
    "output": 8920,
    "total": 32370
  },
  "metadata": {
    "workingDirectory": "/home/user/myproject",
    "nodeVersion": "20.10.0",
    "grokVersion": "1.1.101"
  }
}
```

### Session File Benefits

**Review conversations:**
```bash
# View recent session
cat ~/.x-cli/sessions/session-2025-11-05-14-30-12.json | jq '.messages[] | {role, content}'
```

**Track token usage:**
```bash
# Total tokens across all sessions
find ~/.x-cli/sessions/ -name "*.json" -exec jq -r '.tokenUsage.total' {} + | awk '{sum+=$1} END {print sum " total tokens"}'
```

**Audit tool usage:**
```bash
# What tools were used?
cat ~/.x-cli/sessions/*.json | jq -r '.messages[].toolCalls[]?.tool' | sort | uniq -c
```

**Debug issues:**
```bash
# What happened in that session?
cat ~/.x-cli/sessions/problem-session.json | jq '.messages'
```

## Session Features

### ✅ Implemented

**Auto-save:**
- ✅ Periodic saves during conversation
- ✅ Save on graceful exit
- ✅ Emergency save on crash (best effort)

**Session files:**
- ✅ JSON format for easy parsing
- ✅ Complete conversation history
- ✅ Tool call tracking
- ✅ Token usage accounting
- ✅ Metadata (directory, versions, timestamps)

**Session isolation:**
- ✅ Each session independent
- ✅ No cross-session context leakage
- ✅ Clean state per session

**Token tracking:**
- ✅ Input token count
- ✅ Output token count
- ✅ Total usage per session
- ✅ Real-time monitoring (Ctrl+I)

### 🚧 Partially Implemented

**Session management:**
- ⚠️ No built-in session listing UI
- ⚠️ No session restore command
- ⚠️ No session search/filter
- ✅ Manual review via file system

**Session cleanup:**
- ⚠️ No automatic cleanup
- ⚠️ No retention policies
- ✅ Manual deletion supported

**Session naming:**
- ⚠️ Automatic timestamp-based names
- ⚠️ No custom session names
- ⚠️ No session tagging

### 🔮 Planned Features

**Session management UI:**
```bash
# Future commands
grok sessions list
grok sessions show <session-id>
grok sessions delete <session-id>
grok sessions resume <session-id>
```

**Session restoration:**
- Resume previous session with context
- Continue where you left off
- Session branching (fork from point)

**Intelligent cleanup:**
- Auto-delete sessions older than N days
- Configurable retention policy
- Archive important sessions

**Session analytics:**
- Cost tracking per session
- Performance metrics
- Tool usage statistics
- Success rate analysis

## Session Management Tasks

### View Sessions

**List all sessions:**
```bash
ls -lah ~/.x-cli/sessions/
```

**Recent sessions:**
```bash
ls -ltr ~/.x-cli/sessions/ | tail -5
```

**Session details:**
```bash
# View specific session
cat ~/.x-cli/sessions/session-2025-11-05-14-30-12.json | jq '.'

# Pretty print conversation
cat ~/.x-cli/sessions/session-2025-11-05-14-30-12.json | jq -r '.messages[] | "\(.role): \(.content | .[0:100])..."'
```

### Clean Up Sessions

**Delete old sessions:**
```bash
# Sessions older than 30 days
find ~/.x-cli/sessions/ -name "*.json" -mtime +30 -delete

# Sessions older than 90 days
find ~/.x-cli/sessions/ -name "*.json" -mtime +90 -delete
```

**Delete all sessions:**
```bash
rm ~/.x-cli/sessions/*.json

# Or delete directory
rm -rf ~/.x-cli/sessions/
mkdir ~/.x-cli/sessions/
```

**Selective deletion:**
```bash
# Delete sessions from specific date
rm ~/.x-cli/sessions/session-2025-11-05-*.json

# Keep only last 10 sessions
ls -t ~/.x-cli/sessions/*.json | tail -n +11 | xargs rm
```

### Archive Sessions

**Create archive:**
```bash
# Archive by month
mkdir -p ~/session-archives/2025-11
mv ~/.x-cli/sessions/session-2025-11-*.json ~/session-archives/2025-11/

# Compress archive
tar -czf ~/session-archives/2025-11.tar.gz ~/session-archives/2025-11/
```

**Automated archival:**
```bash
# Add to crontab
# Archive sessions older than 30 days, first day of month
0 0 1 * * find ~/.x-cli/sessions/ -name "*.json" -mtime +30 -exec mv {} ~/session-archives/ \;
```

### Analyze Sessions

**Token usage by session:**
```bash
for file in ~/.x-cli/sessions/*.json; do
  echo "$file: $(jq -r '.tokenUsage.total' $file) tokens"
done | sort -t: -k2 -n
```

**Most expensive sessions:**
```bash
find ~/.x-cli/sessions/ -name "*.json" -exec jq -r '"\(.tokenUsage.total) \(.sessionId)"' {} \; | sort -rn | head -10
```

**Tool usage stats:**
```bash
cat ~/.x-cli/sessions/*.json | jq -r '.messages[].toolCalls[]?.tool' | sort | uniq -c | sort -rn
```

**Average session length:**
```bash
cat ~/.x-cli/sessions/*.json | jq -r '.messages | length' | awk '{sum+=$1; count++} END {print sum/count " messages per session"}'
```

## Best Practices

### Session Hygiene

**DO:**
- ✅ Start new session for unrelated tasks
- ✅ Use descriptive initial messages
- ✅ Exit gracefully (/exit or Ctrl+D)
- ✅ Clean up old sessions periodically

**DON'T:**
- ❌ Let sessions grow to 100k+ tokens
- ❌ Force exit (Ctrl+C twice) unless necessary
- ❌ Mix unrelated tasks in one session
- ❌ Accumulate unlimited session files

### Session Organization

**By project:**
```bash
# Create project-specific session directories
mkdir ~/projects/myapp/.sessions
export GROK_SESSIONS_DIR=~/projects/myapp/.sessions  # Future feature

# Manual: move relevant sessions
mv ~/.x-cli/sessions/session-2025-11-05-*.json ~/projects/myapp/.sessions/
```

**By date:**
```bash
# Archive monthly
mkdir -p ~/session-archives/2025-11
mv ~/.x-cli/sessions/session-2025-11-*.json ~/session-archives/2025-11/
```

**By topic:**
```bash
# Manual tagging via filename (workaround)
# Copy session and rename
cp ~/.x-cli/sessions/session-2025-11-05-14-30-12.json \
   ~/session-archives/auth-refactor-session.json
```

### Session Security

**Protect session files:**
```bash
# Restrict permissions
chmod 700 ~/.x-cli/sessions/
chmod 600 ~/.x-cli/sessions/*.json

# Verify
ls -la ~/.x-cli/sessions/
# Should show: drwx------ (700) for directory
#              -rw------- (600) for files
```

**Be careful with sensitive data:**
```
# Sessions contain full conversation history
# Including any files the AI read
# Do NOT share sessions containing secrets
```

## Troubleshooting

### Session Not Saving

**Symptoms:** No session file created

**Causes:**
- Using headless mode (`-p` flag)
- Permission issues
- Disk space full

**Solutions:**
```bash
# Check directory exists
mkdir -p ~/.x-cli/sessions/

# Check permissions
ls -lad ~/.x-cli/sessions/

# Check disk space
df -h ~
```

### Can't Find Session

**Symptoms:** Session file missing

**Causes:**
- Used headless mode (no session created)
- Session didn't save (crash or force exit)
- Deleted by cleanup script

**Solutions:**
```bash
# Check if file exists
ls ~/.x-cli/sessions/session-*

# Check recent files
ls -ltr ~/.x-cli/sessions/ | tail -10

# If lost, can't recover (no cloud backup)
```

### Session Corrupted

**Symptoms:** Invalid JSON in session file

**Causes:**
- Crash during write
- Disk full during write
- Manual editing error

**Solutions:**
```bash
# Validate JSON
jq '.' ~/.x-cli/sessions/session-2025-11-05-14-30-12.json

# If corrupted and unrecoverable, delete
rm ~/.x-cli/sessions/session-2025-11-05-14-30-12.json
```

## Session Workflows

### Example 1: Long-Running Project

```bash
# Day 1: Start project exploration
grok "analyze the authentication system architecture"
# Session: session-2025-11-05-09-00-00.json
# Token usage: 25k

# Day 2: Different task (new session)
grok "refactor error handling in API routes"
# Session: session-2025-11-06-10-30-00.json
# Token usage: 18k

# Day 3: Review what was done
cat ~/.x-cli/sessions/session-2025-11-05-*.json | jq -r '.messages[] | select(.role=="assistant") | .content | .[0:200]'
```

### Example 2: Debugging Session

```bash
# Start debugging session
grok

> Debug: Users report 500 errors on /api/users endpoint
[Long investigation with many tool calls]
[Token usage: 45k]

/exit

# Later: Review what was found
cat ~/.x-cli/sessions/session-2025-11-05-14-30-12.json | jq -r '.messages[-3:] | .[] | .content'
# Shows final findings
```

### Example 3: Cost Tracking

```bash
# Generate cost report
for file in ~/.x-cli/sessions/session-2025-11-*.json; do
  tokens=$(jq -r '.tokenUsage.total' $file)
  # Assume $0.01 per 1k tokens (example rate)
  cost=$(echo "scale=4; $tokens * 0.01 / 1000" | bc)
  echo "$(basename $file): $tokens tokens = \$$cost"
done | tee november-costs.txt
```

## See Also

- [Context Management](./context-management.md) - Context and token usage
- [Interactive Mode](../reference/interactive-mode.md) - Session features
- [Data Usage](../administration/data-usage.md) - Privacy and storage
- [Settings](../configuration/settings.md) - Configuration

---

**Status:** ✅ Core session management implemented, 🚧 Advanced features in development, 🔮 Enhanced UI and automation planned

Sessions provide conversation continuity, usage tracking, and historical analysis capabilities.
