---
title: What's New?
---

# What's New in Grok CLI

Stay up to date with the latest features, improvements, and updates to Grok CLI.

## Version 1.0.97 (Latest)

**X.AI-Inspired Documentation**
- Complete documentation redesign matching X.AI's clean aesthetic
- Enhanced overview page with feature cards and "Jump right in" section
- Flat navigation structure for improved accessibility
- Professional styling with minimal visual elements

**Enhanced User Experience**
- Improved landing page navigation with functional links
- Better development server integration
- Standardized tool naming conventions aligned with Claude Code

## Version 1.0.96

**Documentation Infrastructure**
- Automated documentation synchronization from `.agent` system
- Comprehensive documentation website at [grokcli.dev](https://grokcli.dev)
- Clean, professional theme with emoji-free content
- Mobile-responsive design for all devices

## Version 1.0.95

**Security and Workflow Enhancements**
- Pre-commit security scanning for API keys and secrets
- Smart-push workflow to handle automated version bumps
- Enhanced git workflow automation with conflict resolution
- Comprehensive security protection against credential exposure

## Version 1.0.94

**Navigation and Styling Improvements**
- Fixed localhost development server navigation
- Proper Docusaurus configuration with working links
- Enhanced footer with credits to original project founders
- Domain configuration for grokcli.dev

## Version 1.0.93-1.0.91

**Tool Standardization and Reliability**
- Aligned tool naming with Claude Code industry standards
- Standardized Read, Write, Edit, Bash, Grep, Glob, LS tools
- Enhanced WebFetch, WebSearch, Task, TodoWrite capabilities
- Improved tool reliability with comprehensive error handling

## Major Feature Releases

### P2: Code Intelligence Tools
- **AST Parser**: Language-specific syntax tree analysis
- **Symbol Search**: Fuzzy search with cross-references
- **Dependency Analyzer**: Circular dependency detection
- **Code Context**: Semantic analysis with quality metrics
- **Refactoring Assistant**: Safe rename, extract, inline operations

### P1: Enhanced File Operations
- **MultiEdit**: Atomic operations with transaction support
- **Advanced Search**: Regex patterns with bulk replace
- **File Tree Operations**: Visual trees and bulk operations
- **Code-Aware Editor**: Syntax-aware editing capabilities
- **Operation History**: Comprehensive undo/redo system

### P3: Reliability & Workflow
- **Agent System**: AI-powered task management
- **Healer Script**: Automated issue detection and resolution
- **FsPort Abstraction**: Improved file system operations
- **Automated Installer**: Enhanced installation UX
- **Tool Reliability**: Standardized imports and fallback mechanisms

## Automation Infrastructure

**Fully Automated Release System**
- Combined GitHub Actions workflow for version management
- Automatic NPM publishing with version synchronization
- Self-healing guardrails and error recovery
- Comprehensive troubleshooting documentation

**Version Management**
- Auto-bump with README synchronization
- Protection against workflow breakage
- Smart conflict resolution for automated commits
- Persistent release history and monitoring

## Upcoming Features

**Enhanced IDE Integration**
- VS Code extension development
- Vim plugin support
- Enhanced Jupyter notebook integration

**Advanced Cloud Integration**
- AWS, GCP, Azure service integration
- Docker and Kubernetes support
- Enhanced database tools for SQL/NoSQL operations

**Extended Tool Ecosystem**
- Additional MCP server integrations
- Custom tool development framework
- Enhanced testing and debugging capabilities

## Migration Notes

**From Earlier Versions**
- Tool names have been standardized to match Claude Code conventions
- Configuration format remains backward compatible
- New features are opt-in and don't break existing workflows

**API Changes**
- Tool interfaces now follow industry standard naming
- Enhanced error handling and recovery mechanisms
- Improved streaming and real-time feedback

## Community Contributions

We welcome contributions from the community:

- **Bug Reports**: [GitHub Issues](https://github.com/hinetapora/grok-cli-hurry-mode/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/hinetapora/grok-cli-hurry-mode/discussions)
- **Documentation**: Help improve our guides and examples
- **Tool Development**: Contribute new tools and capabilities

## Getting the Latest Version

```bash
# Update to latest version
npm update -g grok-cli-hurry-mode@latest

# Check current version
grok --version

# View changelog
npm view grok-cli-hurry-mode versions --json
```

Stay connected with our community for the latest updates and announcements!