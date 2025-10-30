# X-CLI Workflow Documentation

## Overview

This documentation directory contains comprehensive guides for X-CLI's revolutionary "Research → Recommend → Execute → Auto-Doc" workflow system. These documents explain how to effectively use and integrate with the complete AI-assisted development workflow.

## Documentation Structure

### 📚 User Guide (`workflow-user-guide.md`)
**Primary guide for end users and developers**

- **Complete workflow walkthrough** - Step-by-step guide through all phases
- **Interactive examples** - Real console output and decision flows
- **Best practices** - Task formulation, decision making, error recovery
- **Advanced usage** - CLI flags, environment variables, configuration
- **Troubleshooting** - Common issues and solutions
- **Integration examples** - CI/CD, development workflows

**Perfect for:**
- New users learning the workflow
- Developers implementing features
- Teams adopting X-CLI workflows

### 🔧 API Reference (`api-reference.md`)
**Technical documentation for developers and integrators**

- **Complete type definitions** - All interfaces and data structures
- **Service class documentation** - Methods, parameters, return values
- **Configuration options** - Environment variables, config files
- **Integration examples** - Programmatic usage, CI/CD integration
- **Error handling** - Exception types and recovery patterns
- **Performance optimization** - Memory management, caching strategies

**Perfect for:**
- Building custom integrations
- Extending X-CLI with new tools
- CI/CD pipeline development
- Advanced configuration

### 🏗️ Architecture Overview (`.agent/system/workflow-overview.md`)
**System design and technical architecture**

- **Core principles** - Safety, operator-in-the-loop, context intelligence
- **Workflow phases** - Detailed breakdown of each stage
- **Integration points** - How components work together
- **Safety guarantees** - Data protection and error boundaries
- **Future extensions** - Planned features and integrations

**Perfect for:**
- Understanding system design
- Planning integrations
- Technical architecture reviews

## Quick Start

### For End Users
1. **Read the User Guide** - Start with `workflow-user-guide.md`
2. **Try basic examples** - Use the command examples provided
3. **Explore advanced features** - Check configuration and integration sections

### For Developers
1. **Review API Reference** - Understand available interfaces
2. **Check Architecture** - Learn system design principles
3. **Follow Integration Examples** - See real-world usage patterns

### For Teams
1. **Study User Guide** - Train team members on workflow usage
2. **Review Architecture** - Understand safety and reliability features
3. **Plan Integration** - Use API Reference for CI/CD and tool integration

## Key Concepts

### The Workflow

X-CLI transforms complex tasks into safe, structured experiences through four phases:

1. **🤖 Research** - AI analyzes task with project context
2. **💡 Recommend** - Presents options with trade-offs for approval
3. **⚡ Execute** - Runs approved plan with safety guarantees
4. **📝 Auto-Doc** - Documents completion and learns lessons

### Safety First

- **Zero data loss** - All changes have patches and backups
- **Version control** - Automatic git commits for all modifications
- **Error recovery** - Intelligent handling of execution failures
- **Audit trail** - Complete record of all decisions and actions

### Context Intelligence

- **Automatic loading** - Project docs provide AI context on startup
- **Knowledge accumulation** - Past executions inform future recommendations
- **Adaptive learning** - System improves through documented lessons
- **Project memory** - Institutional knowledge preserved in `.agent/` files

## Usage Examples

### Simple Task
```bash
$ xcli "add input validation to user registration form"

🔍 Researching and analyzing...
[... structured analysis output ...]
Proceed with recommendation? (Y/n) [R=revise] Y

🚀 Starting execution...
✅ Execution completed: 3/3 steps successful
📝 Documentation saved
```

### Complex Task with Recovery
```bash
$ xcli "implement payment processing system"

🔍 Researching and analyzing...
[... comprehensive analysis ...]
Proceed with recommendation? (Y/n) [R=revise] Y

🚀 Starting execution...
🚨 ISSUE ENCOUNTERED: test failures detected
🔄 Initiating adaptive recovery...
[... recovery analysis ...]
Proceed with recovery plan? (Y/n) [R=revise] Y

✅ Recovery completed. Resuming execution...
✅ Execution completed: 8/8 steps successful
```

### CI/CD Integration
```yaml
- name: Implement Feature
  run: |
    npx @xagent/x-cli@latest --headless "add error logging"
  env:
    X_API_KEY: ${{ secrets.X_API_KEY }}
```

## Configuration

### Environment Variables
```bash
# Required
X_API_KEY=your_api_key

# Optional
XCLI_PATCH_DIR=/custom/patches      # Custom patch storage
XCLI_CONTEXT_BUDGET=500             # Context size limit (KB)
XCLI_MAX_RECOVERY_ATTEMPTS=3        # Recovery retry limit
```

### Configuration Files
- **User settings**: `~/.xcli/config.json`
- **Project settings**: `.xcli/project.json`
- **Context docs**: `.agent/` directory structure

## Integration Points

### Programmatic Usage
```typescript
import { ResearchRecommendService } from '@xagent/x-cli';

const service = new ResearchRecommendService(agent);
const result = await service.researchRecommendExecute(request);
```

### Tool Extensions
- Add custom tools to the GrokAgent
- Extend execution capabilities
- Integrate with external systems

### CI/CD Pipelines
- Headless mode for automation
- Structured output for parsing
- Patch file generation for reviews

## Support & Resources

### Getting Help
- **User Guide** - Step-by-step walkthroughs and examples
- **API Reference** - Technical details and integration guides
- **Architecture Docs** - System design and principles
- **Generated Docs** - Auto-created `.agent/tasks/` files

### Common Issues
- **Context loading** - Check `.agent/` directory structure
- **API errors** - Verify X_API_KEY configuration
- **Execution failures** - Review patch files and backups
- **Performance** - Adjust context budget and timeouts

### Community
- **GitHub Issues** - Bug reports and feature requests
- **Discord Community** - Usage questions and discussions
- **Documentation PRs** - Help improve these guides

## Version History

### Current Version: Sprint Complete ✅
- **5-stage implementation** complete
- **Full workflow operational**
- **Production-ready features**
- **Comprehensive documentation**

### Key Features Delivered
- ✅ Intelligent context loading (Stage 1)
- ✅ Research → Recommend flow (Stage 2)
- ✅ Safe execution with patches/backups (Stage 3)
- ✅ Adaptive error recovery (Stage 4)
- ✅ Auto-documentation & learning (Stage 5)

---

*This documentation represents the complete guide to X-CLI's workflow system. Start with the User Guide for practical usage, then explore the API Reference for technical integration details.*