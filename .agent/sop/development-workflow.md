# Development Workflow Guide

## ⚠️ CRITICAL GIT WORKFLOW WARNING FOR AI AGENTS ⚠️

**🚨 NEVER USE DIRECT GIT PUSH TO MAIN BRANCH:**
```bash
git push origin main  # ❌ FORBIDDEN - Bypasses automation
git push             # ❌ DANGEROUS - Missing quality gates
```

**✅ ALWAYS USE SMART PUSH SCRIPT:**
```bash
npm run smart-push   # ✅ REQUIRED for main branch
./scripts/smart-push.sh  # ✅ Alternative method
```

**💡 WHY CRITICAL:**
- Main branch pushes trigger automated NPM publishing
- Missing pushes = No NPM releases = Broken deployment pipeline  
- Direct pushes bypass TypeScript/ESLint checks and GitHub Actions monitoring
- Smart push handles automated version bumps and prevents conflicts

**📋 CORRECT DEVELOPMENT WORKFLOW:**
1. Work on feature branch: `git checkout -b feature/name`
2. Make commits on feature branch
3. Switch to main: `git checkout main`  
4. Merge feature: `git merge feature/name`
5. **Smart push**: `npm run smart-push` (triggers NPM publish)

## Package Manager Migration (2025-11-02)

### Overview
The project has migrated from npm to Bun for development workflows while maintaining npm compatibility for distribution and CI/CD.

### Why Bun?
- **Speed**: 4.17s install vs previous npm times
- **TypeScript Native**: Better TS support out of the box
- **Smaller Lock Files**: bun.lock (147KB) vs package-lock.json (297KB)
- **Modern Tooling**: Optimized for CLI tools and modern JS/TS projects

## Development Commands

### Package Management
```bash
# Install dependencies (development)
bun install

# Add new dependency
bun add package-name

# Add dev dependency
bun add -d package-name

# Remove dependency
bun remove package-name
```

### Build & Testing
```bash
# Development build (fast)
bun run build

# Development with watch
bun run dev

# Linting (with auto-fix)
bun run lint
bun run lint --fix

# Type checking
bun run typecheck  # if available
```

### File Management
- **Keep**: `bun.lock` (commit this)
- **Ignore**: `package-lock.json`, `yarn.lock` (in .gitignore)
- **Clean**: Remove old `node_modules` and reinstall with `bun install`

## CI/CD Strategy

### Development vs Production
- **Local Development**: Use Bun for speed and efficiency
- **GitHub Actions**: Continue using npm for stability and ecosystem compatibility
- **Publishing**: npm for universal package manager support

### Workflow Files
No changes required to GitHub Actions workflows - they continue using npm:
```yaml
- name: Install dependencies
  run: |
    rm -rf node_modules package-lock.json
    npm install
```

## Troubleshooting

### Common Issues After Migration
1. **Import/Export Errors**: Ensure all imports use proper file extensions (.js for compiled output)
2. **Missing Dependencies**: Run `bun install` after pulling changes
3. **Build Failures**: Clear `node_modules` and reinstall with Bun

### Lint Error Resolution
Recent fixes addressed:
- Invalid character parsing errors in TypeScript files
- Missing service imports (research-recommend.ts)
- Build configuration compatibility

### Performance Benefits
- **Install Speed**: ~4x faster than npm
- **Build Speed**: Improved TypeScript compilation
- **Development Loop**: Faster iteration cycles

## Best Practices

### For Contributors
1. Use `bun install` for dependencies
2. Use `bun run <script>` for all commands
3. Commit `bun.lock` changes
4. Never commit `package-lock.json`

### For Maintainers
1. Test locally with Bun before pushing
2. Verify GitHub Actions still work (uses npm)
3. Monitor package distribution compatibility
4. Keep both ecosystems working

## Migration Validation

### Checklist
- [x] Dependencies installed with Bun successfully
- [x] Build process works with `bun run build`
- [x] Linting passes with `bun run lint`
- [x] .gitignore updated for package manager files
- [x] Documentation updated
- [x] CI/CD pipeline still functional

### Performance Metrics
- **Before**: npm install (variable, often >30s)
- **After**: bun install (4.17s)
- **node_modules**: Consistent at 267MB (optimized by Bun)
- **Build time**: Improved TypeScript compilation speed

## Future Considerations

### Potential Enhancements
- Explore Bun's built-in bundler as alternative to tsup
- Consider Bun's test runner for future test suites
- Evaluate Bun for CI/CD once ecosystem matures

### Monitoring
- Track installation success rates across different environments
- Monitor CI/CD stability with npm workflow
- Gather developer feedback on Bun experience

---

*Updated: 2025-11-02*
*Status: Active - Bun migration complete and operational*