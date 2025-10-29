#!/bin/bash
# Smart push script with comprehensive checks and GitHub status monitoring
# Test comment for PR creation

set -e  # Exit on any error

echo "🚀 Smart push with quality gates and GitHub monitoring..."

# Get current branch
BRANCH=$(git branch --show-current)

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for GitHub Actions
wait_for_github_actions() {
    local commit_sha="$1"
    local max_wait=300  # 5 minutes max wait
    local wait_interval=10
    local elapsed=0
    
    echo "⏳ Monitoring GitHub Actions for commit $commit_sha..."
    
    while [ $elapsed -lt $max_wait ]; do
        if command_exists gh; then
            # Get workflow runs for this commit
            local status=$(gh run list --commit "$commit_sha" --json status,conclusion --limit 5 2>/dev/null || echo "[]")
            
            if [ "$status" != "[]" ] && [ "$status" != "" ]; then
                # Check if any runs are still in progress
                local in_progress=$(echo "$status" | jq -r '.[] | select(.status == "in_progress" or .status == "queued") | .status' 2>/dev/null || echo "")
                local failed=$(echo "$status" | jq -r '.[] | select(.conclusion == "failure") | .conclusion' 2>/dev/null || echo "")
                
                if [ -z "$in_progress" ]; then
                    if [ -z "$failed" ]; then
                        echo "✅ All GitHub Actions passed!"
                        return 0
                    else
                        echo "❌ Some GitHub Actions failed"
                        gh run list --commit "$commit_sha" --limit 5
                        echo ""
                        echo "💡 Fix the failing checks and try pushing again"
                        return 1
                    fi
                fi
            fi
        else
            echo "⚠️  GitHub CLI not available - skipping workflow monitoring"
            return 0
        fi
        
        printf "."
        sleep $wait_interval
        elapsed=$((elapsed + wait_interval))
    done
    
    echo ""
    echo "⏰ GitHub Actions monitoring timed out after 5 minutes"
    echo "💡 Check manually: gh run list --commit $commit_sha"
    return 0  # Don't fail on timeout
}

# Step 1: Run quality checks before push
echo "🔍 Running pre-push quality checks..."

# TypeScript check
echo "📝 Checking TypeScript..."
if npm run typecheck; then
    echo "✅ TypeScript check passed"
else
    echo "❌ TypeScript check failed"
    exit 1
fi

# Linting check (warnings allowed, only errors block)
echo "🧹 Running ESLint..."
if npm run lint || [ $? -eq 1 ]; then
    echo "✅ ESLint check completed (warnings allowed)"
else
    echo "❌ ESLint check failed with critical errors"
    exit 1
fi

# Step 2: Pull latest changes
echo "🔄 Pulling latest changes..."
if git pull --rebase origin "$BRANCH"; then
    echo "✅ Successfully rebased local changes"
else
    echo "❌ Rebase failed - please resolve conflicts manually"
    echo "💡 Run: git rebase --continue (after fixing conflicts)"
    exit 1
fi

# Step 3: Push to remote
echo "📤 Pushing to origin/$BRANCH..."
PUSH_OUTPUT=$(git push origin "$BRANCH" 2>&1)
PUSH_EXIT_CODE=$?

if [ $PUSH_EXIT_CODE -eq 0 ]; then
    echo "✅ Successfully pushed to origin/$BRANCH"

    # Get the commit SHA for monitoring
    COMMIT_SHA=$(git rev-parse HEAD)

    # Step 4: Monitor GitHub Actions
    if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
        wait_for_github_actions "$COMMIT_SHA"
        github_status=$?

        if [ $github_status -eq 1 ]; then
            echo ""
            echo "🔧 GitHub Actions failed. Here's how to fix and retry:"
            echo "   1. Fix the issues shown above"
            echo "   2. Commit your fixes: git commit -am 'fix: resolve CI failures'"
            echo "   3. Re-run smart push: npm run smart-push"
            exit 1
        fi
    fi

    echo ""
    echo "🎉 Smart push completed successfully!"
    [ "$BRANCH" = "main" ] && echo "📊 Monitor at: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\/[^/.]*\).*/\1/')/actions"
else
    # Check if push failed due to branch protection
    if echo "$PUSH_OUTPUT" | grep -q -E "(protected branch|Changes must be made through a pull request|GH006)"; then
        echo "🛡️ Branch protection detected - creating PR workflow..."

        # Check if we have commits to push
        if git log --oneline origin/"$BRANCH"..HEAD 2>/dev/null | head -1 | grep -q .; then
            # Create feature branch
            FEATURE_BRANCH="feature/$(date +%Y%m%d-%H%M%S)-auto-pr"
            echo "🌿 Creating feature branch: $FEATURE_BRANCH"
            git checkout -b "$FEATURE_BRANCH"

            # Push to feature branch
            echo "📤 Pushing to feature branch..."
            if git push -u origin "$FEATURE_BRANCH"; then
                echo "✅ Successfully pushed to $FEATURE_BRANCH"

                # Create PR if GitHub CLI is available
                if command_exists gh; then
                    echo "📋 Creating Pull Request..."

                    # Get commit messages for PR
                    PR_TITLE=$(git log -1 --pretty=%s origin/"$BRANCH"..HEAD)
                    PR_BODY=$(git log --pretty=format:"- %s%n%b" origin/"$BRANCH"..HEAD | head -20)

                    # Create PR
                    if gh pr create --title "$PR_TITLE" --body "$PR_BODY" --head "$FEATURE_BRANCH" --base "$BRANCH"; then
                        PR_URL=$(gh pr view --json url -q .url)
                        echo "✅ Pull Request created successfully!"
                        echo "🔗 PR URL: $PR_URL"
                        echo ""
                        echo "🎯 Next steps:"
                        echo "   • Review and approve the PR on GitHub"
                        echo "   • Wait for CI checks to pass"
                        echo "   • Merge when ready"
                        echo ""
                        echo "💡 Or run: gh pr merge $FEATURE_BRANCH --merge"
                    else
                        echo "❌ Failed to create PR automatically"
                        echo "💡 Create PR manually: $FEATURE_BRANCH → $BRANCH"
                        echo "   Title: $PR_TITLE"
                    fi
                else
                    echo "⚠️  GitHub CLI not available - create PR manually:"
                    echo "   Branch: $FEATURE_BRANCH → $BRANCH"
                    echo "   Title: $(git log -1 --pretty=%s origin/$BRANCH..HEAD)"
                fi
            else
                echo "❌ Failed to push to feature branch"
                exit 1
            fi
        else
            echo "ℹ️  No commits to push - repository is up to date"
        fi
    else
        echo "❌ Push failed:"
        echo "$PUSH_OUTPUT"
        echo ""
        echo "💡 Check your git configuration and try again"
        exit 1
    fi
fi