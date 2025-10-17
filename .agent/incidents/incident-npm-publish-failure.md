# Incident: NPM Publish Failure on Tag Push

## Summary
- **Date Created**: [Current Date]
- **Status**: Open
- **Issue**: Automated NPM publishing fails despite successful builds and tag creation. Version 1.0.63 was tagged but not published to NPM.
- **Root Cause**: Likely NPM token/auth mismatch, ownership issues, or workflow misconfiguration (e.g., missing permissions, incorrect token type, or .npmrc setup).
- **Impact**: New versions are not released to NPM, blocking users from installing updates.

## Investigation Notes
- GitHub Actions release workflow successfully bumps version, commits, and pushes tags (e.g., v1.0.63).
- Publish workflow triggers on tag push but fails at `npm publish` step (confirmed not published via NPM registry check).
- Local build succeeds; issue is CI-specific.
- NPM_TOKEN secret is set in GitHub repo, but may be invalid, for wrong account, or not an Automation token.

## Fix Plan (Based on Provided Guidance)
Follow the battle-tested checklist in order:

1. **Confirm Package Ownership**:
   - Run `npm whoami` and `npm view grok-cli-hurry-mode maintainers` locally.
   - If not owner/maintainer, rename to scoped package (e.g., `@hinetapora/grok-cli-hurry-mode`) or request access.
   - Update `package.json` name and add `"publishConfig": { "access": "public" }` if scoping.

2. **Use Automation Token**:
   - Regenerate NPM token as "Automation" type (not "Publish") to handle 2FA.
   - Update GitHub secret `NPM_TOKEN` with new token.

3. **Update Workflows for Auth and Permissions**:
   - Add `.npmrc` generation in publish workflow.
   - Add `permissions: { contents: write, id-token: write }` to jobs.
   - Add dry-run step before publish.
   - Use `--provenance` in publish command.

4. **Workflow Snippets**:
   - Replace current `release.yml` and `publish.yml` with improved versions (see below).

## Updated Workflow Files
### release.yml (Bump + Tag on Push to Main)
```yaml
name: Release
on:
  push:
    branches: [ main ]

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install (bun optional)
        run: npm ci

      # Prevent loops if last commit was an automated bump
      - name: Skip if previous commit was auto-bump
        run: |
          if git log -1 --pretty=%B | grep -qiE "^Bump version to "; then
            echo "Auto-bump detected; skipping."
            exit 78
          fi

      - name: Bump patch version (no tag yet)
        run: |
          NEW_VER=$(npm version patch --no-git-tag-version)
          git add package.json package-lock.json || true
          git commit -m "Bump version to ${NEW_VER#v}"

      - name: Create tag and push
        run: |
          NEW_VER=$(node -p "require('./package.json').version")
          git tag "v${NEW_VER}"
          git push origin HEAD:main --follow-tags
```

### publish.yml (Publish on Tag)
```yaml
name: Publish
on:
  push:
    tags:
      - "v*"

permissions:
  contents: read
  id-token: write  # for --provenance

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Configure npm auth
        run: |
          npm config set //registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}
          npm config set always-auth true
          npm config set registry https://registry.npmjs.org
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Install deps
        run: npm ci

      - name: Build
        run: npm run build

      - name: Dry run (sanity check)
        run: npm publish --access public --dry-run

      - name: Publish to npm
        run: npm publish --access public --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Next Steps
- Confirm package ownership and update token if needed.
- Apply workflow updates.
- Test with a new push to `main` (should bump to 1.0.64 and publish).
- Monitor GitHub Actions logs for errors.

## Resolution
- [ ] Ownership confirmed/updated
- [ ] Automation token set
- [ ] Workflows updated
- [ ] Test publish successful
- [ ] Close incident