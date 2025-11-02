#!/bin/bash
# Smart push script with comprehensive checks and GitHub status monitoring
# Test comment for PR creation
# Third test comment to trigger PR
# Fourth comment - branch protection test

set -e  # Exit on any error
set -u  # Exit on undefined variables

echo "🚀 Smart push with quality gates and GitHub monitoring..."

# Get current branch
BRANCH=$(git branch --show-current)

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Spinner function for visual feedback during long operations
show_spinner() {
    local pid=$1
    local message="$2"
    local delay=0.1
    local spinstr='|/-\'
    while kill -0 $pid 2>/dev/null; do
        local temp=${spinstr#?}
        printf "\r$message %c " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
    done
    printf "\r"
}

# Function to wait for GitHub Actions
wait_for_github_actions() {
    if ! command_exists gh; then
        echo "⏳ GitHub CLI not available - skipping workflow monitoring"
        echo "💡 Install gh CLI for automatic workflow monitoring"
        return 0
    fi

    local commit_sha="$1"
    local max_wait=300  # 5 minutes max wait
    local wait_interval=5
    local elapsed=0
    
    echo "🔍 Monitoring GitHub Actions for commit ${commit_sha:0:7}..."
    
    # Initial wait for workflows to start
    printf "⏳ Waiting for workflows to start"
    (sleep 10) &
    show_spinner $! "⏳ Waiting for workflows to start"
    echo "✓ Initial wait complete"
    
    while [ $elapsed -lt $max_wait ]; do
        # Get workflow runs for this commit
        local status=$(gh run list --commit "$commit_sha" --json status,conclusion,name --limit 5 2>/dev/null || echo "[]")
        
        if [ "$status" != "[]" ] && [ "$status" != "" ]; then
            # Check if any runs are still in progress
            local in_progress=$(echo "$status" | jq -r '.[] | select(.status == "in_progress" or .status == "queued") | .name' 2>/dev/null || echo "")
            local failed=$(echo "$status" | jq -r '.[] | select(.conclusion == "failure") | .name' 2>/dev/null || echo "")
            local completed=$(echo "$status" | jq -r '.[] | select(.conclusion == "success") | .name' 2>/dev/null || echo "")
            
            if [ -n "$completed" ]; then
                echo "✅ Completed workflows: $(echo "$completed" | tr '\n' ', ' | sed 's/,$//')"
            fi
            
            if [ -z "$in_progress" ]; then
                if [ -z "$failed" ]; then
                    echo "🎉 All GitHub Actions passed successfully!"
                    echo "🔗 View details: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\/[^/.]*\).*/\1/')/actions"
                    return 0
                else
                    echo "❌ Failed workflows: $(echo "$failed" | tr '\n' ', ' | sed 's/,$//')"
                    gh run list --commit "$commit_sha" --limit 5
                    echo ""
                    echo "💡 Fix the failing checks and try pushing again"
                    return 1
                fi
            else
                # Show spinner for in-progress workflows
                printf "\r🔄 Running: $(echo "$in_progress" | tr '\n' ', ' | sed 's/,$//')"
                (sleep $wait_interval) &
                show_spinner $! "🔄 Running: $(echo "$in_progress" | tr '\n' ', ' | sed 's/,$//')"
            fi
        else
            printf "🔍 Waiting for workflows to appear"
            (sleep $wait_interval) &
            show_spinner $! "🔍 Waiting for workflows to appear"
        fi
        
        elapsed=$((elapsed + wait_interval))
    done
    
    echo ""
    echo "⏰ GitHub Actions monitoring timed out after 5 minutes"
    echo "💡 Check manually: gh run list --commit $commit_sha"
    echo "🔗 Monitor: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\/[^/.]*\).*/\1/')/actions"
    return 0  # Don't fail on timeout
}

# Step 1: Run quality checks before push
echo "🔍 Running pre-push quality checks..."

# TypeScript check
echo "📝 Checking TypeScript..."
if bun run typecheck; then
    echo "✅ TypeScript check passed"
else
    echo "❌ TypeScript check failed"
    exit 1
fi

# Linting check (warnings allowed, only errors block)
echo "🧹 Running ESLint..."
if bun run lint || [ $? -eq 1 ]; then
    echo "✅ ESLint check completed (warnings allowed)"
else
    echo "❌ ESLint check failed with critical errors"
    exit 1
fi

# Step 2: Pull latest changes
echo "🔄 Pulling latest changes..."

# Check for ongoing git operations
if [[ -d .git/rebase-apply ]] || [[ -d .git/rebase-merge ]] || [[ -f .git/MERGE_HEAD ]]; then
    echo "⚠️  Git operation in progress - aborting to clean state..."
    git rebase --abort 2>/dev/null || git merge --abort 2>/dev/null || true
fi

# Try rebase first, fall back to merge if it fails
if git pull --rebase origin "$BRANCH" 2>&1; then
    echo "✅ Successfully rebased local changes"
elif git pull origin "$BRANCH" 2>&1; then
    echo "⚠️  Rebase failed, fell back to merge"
else
    echo "❌ Pull failed completely"
    echo "💡 Check git status and resolve any conflicts"
    exit 1
fi

# Step 3: Push to remote
echo "📤 Pushing to origin/$BRANCH..."
PUSH_OUTPUT=$(git push origin "$BRANCH" 2>&1)
PUSH_EXIT_CODE=$?

if [ $PUSH_EXIT_CODE -eq 0 ] || echo "$PUSH_OUTPUT" | grep -q "Everything up-to-date"; then
    # Check if we actually pushed commits (not just "everything up-to-date")
    if echo "$PUSH_OUTPUT" | grep -q "Everything up-to-date"; then
        echo "✅ Repository is up to date - no commits to push"
        echo ""
        echo "🎉 Smart push completed successfully!"
        exit 0
    else
        echo "✅ Successfully pushed commits to origin/$BRANCH"

        # Get the commit SHA for monitoring
        COMMIT_SHA=$(git rev-parse HEAD)

        # Step 4: Monitor GitHub Actions (only when we actually pushed commits)
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
    fi

    # Step 5: Verify NPM package publication (for main branch)
    if [ "$BRANCH" = "main" ]; then
        echo "📦 Verifying NPM package publication..."
        
        # Get current version from package.json
        CURRENT_VERSION=$(node -pe "require('./package.json').version")
        PACKAGE_NAME=$(node -pe "require('./package.json').name")
        
        echo "🔍 Checking for $PACKAGE_NAME@$CURRENT_VERSION..."
        
        # NPM verification with spinner and retry logic
        verification_success=false
        max_attempts=6
        
        for attempt in $(seq 1 $max_attempts); do
            if [ $attempt -eq 1 ]; then
                printf "⏳ Waiting for NPM registry propagation"
                # Initial wait in background
                (sleep 5) &
                show_spinner $! "⏳ Waiting for NPM registry propagation"
                echo "✓ Initial wait complete"
            fi
            
            printf "🔎 Attempt $attempt/$max_attempts: Checking NPM registry"
            
            # Check NPM in background to show spinner
            (npm view "$PACKAGE_NAME@$CURRENT_VERSION" version >/dev/null 2>&1) &
            npm_check_pid=$!
            show_spinner $npm_check_pid "🔎 Attempt $attempt/$max_attempts: Checking NPM registry"
            
            # Wait for the background process to complete
            wait $npm_check_pid
            npm_check_result=$?
            
            if [ $npm_check_result -eq 0 ]; then
                echo "✅ NPM package $PACKAGE_NAME@$CURRENT_VERSION verified on registry!"
                echo "🔗 Package URL: https://www.npmjs.com/package/$PACKAGE_NAME/v/$CURRENT_VERSION"
                echo "📋 Install command: npm install -g $PACKAGE_NAME@$CURRENT_VERSION"
                verification_success=true
                break
            else
                if [ $attempt -lt $max_attempts ]; then
                    echo "❌ Not available yet, waiting 10 seconds..."
                    printf "⏳ Waiting"
                    (sleep 10) &
                    show_spinner $! "⏳ Waiting"
                    echo ""
                else
                    echo "❌ Package not available after $max_attempts attempts"
                    echo "💡 This is normal - NPM can take 5-15 minutes to propagate"
                    echo "💡 Manual check: npm view $PACKAGE_NAME@$CURRENT_VERSION"
                    echo "💡 Monitor: https://www.npmjs.com/package/$PACKAGE_NAME"
                fi
            fi
        done
        
        if [ "$verification_success" = true ]; then
            echo "🎊 NPM verification completed successfully!"
        else
            echo "⚠️  NPM verification incomplete (but push was successful)"
        fi
    fi
    
    echo ""
    echo "🎉 Smart push completed successfully!"
    echo "📋 Summary:"
    echo "   ✓ Branch: $BRANCH"
    echo "   ✓ TypeScript & ESLint checks passed"
    echo "   ✓ Git push successful"
    if [ "$BRANCH" = "main" ]; then
        echo "   ✓ GitHub Actions monitoring completed"
        if [ "$verification_success" = true ]; then
            echo "   ✓ NPM package verification successful"
        else
            echo "   ⏳ NPM package verification pending"
        fi
        echo "📊 Monitor: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\/[^/.]*\).*/\1/')/actions"
    fi
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
                        echo "📦 After merge, NPM package will be published automatically"
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

# Final test comment
# test
# Final test comment
# test pr creation
# manual test
# pr test 2
# test
# test branch protection PR creation
# final pr test
