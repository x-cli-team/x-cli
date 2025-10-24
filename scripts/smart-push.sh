#!/bin/bash
# Smart push script that handles automated version bumps

echo "🔄 Smart push: Pulling latest changes first..."

# Get current branch
BRANCH=$(git branch --show-current)

# Pull with rebase to handle automated commits
if git pull --rebase origin "$BRANCH"; then
    echo "✅ Successfully rebased local changes"
    
    # Push to remote (bypass pre-push hook for smart-push)
    if SMART_PUSH_BYPASS=true git push origin "$BRANCH"; then
        echo "🚀 Successfully pushed to origin/$BRANCH"
    else
        echo "❌ Push failed"
        exit 1
    fi
else
    echo "❌ Rebase failed - please resolve conflicts manually"
    echo "💡 Run: git rebase --continue (after fixing conflicts)"
    exit 1
fi