---
title: Plan Mode
---

# 🎯 Plan Mode

Plan Mode is X-CLI's signature read-only exploration feature that brings Claude Code-level intelligent planning to your terminal. It provides safe, comprehensive codebase analysis and AI-powered implementation planning without any risk of modifying your code.

## Quick Start

### Activation
Press **Shift+Tab twice** in quick succession to enter Plan Mode.

```bash
# Keyboard shortcut
Shift+Tab, Shift+Tab
```

The interface will show:
```
🎯 Plan Mode: Analysis
📊 Exploring codebase and gathering insights...
```

### What Plan Mode Does

1. **📁 Project Structure Analysis**
   - Automatically detects project type (Node.js, Python, React, etc.)
   - Maps directory structure and identifies key components
   - Analyzes dependencies and build configurations

2. **🔍 Codebase Exploration**
   - Safely reads and analyzes source files
   - Identifies entry points, modules, and architecture patterns
   - Gathers complexity metrics and code statistics

3. **🧠 AI-Powered Planning**
   - Generates strategic implementation plans using Grok models
   - Provides risk assessment and mitigation strategies
   - Estimates effort and timeline for requested changes

4. **📋 Interactive Review**
   - Presents comprehensive plan for user approval
   - Allows feedback and plan refinement
   - Transitions to execution mode only after confirmation

## Features

### Read-Only Safety
- **Destructive Operation Blocking**: All file modifications are blocked during exploration
- **Simulation Mode**: Write/edit operations are simulated and logged for analysis
- **Safe Command Filtering**: Only read-only bash commands are allowed (ls, cat, grep, etc.)

### Real-Time Progress
- **Phase Indicators**: Visual feedback showing current exploration phase
- **Progress Bars**: Completion percentage for each analysis stage
- **Activity Monitoring**: Real-time display of what Plan Mode is currently analyzing

### Intelligence Features
- **Context Awareness**: Understands your current workspace and git state
- **Pattern Recognition**: Identifies common architectural patterns and frameworks
- **Dependency Mapping**: Analyzes relationships between modules and components

## Plan Mode Phases

### 1. Analysis Phase 🔍
```
🔍 Plan Mode: Analyzing
• Reading project structure
• Analyzing dependencies  
• Identifying key components
```

**Duration**: 1-5 seconds  
**Purpose**: Gather comprehensive project understanding

### 2. Strategy Phase 🧠
```
🧠 Plan Mode: Planning
• Evaluating implementation approaches
• Assessing risks and dependencies
• Estimating effort and timeline
```

**Duration**: 5-15 seconds  
**Purpose**: Generate strategic implementation plan

### 3. Presentation Phase 📋
```
📋 Plan Mode: Presenting
• Preparing implementation plan
• Organizing steps and dependencies
• Ready for your review
```

**Duration**: 1-2 seconds  
**Purpose**: Format and present plan for approval

### 4. Approval Phase ✅
```
✅ Plan Mode: Approved
• Plan approved - ready for execution
• Type "execute" to start implementation
```

**Duration**: User-controlled  
**Purpose**: Review and confirm implementation plan

## Usage Examples

### Adding a New Feature
```bash
# Enter Plan Mode with Shift+Tab twice
You: "Add a user authentication system with JWT tokens"

# Plan Mode explores your codebase and responds:
Plan Mode Analysis Complete ✅

📋 Implementation Plan: User Authentication System

🏗️ Architecture Changes:
1. Create auth middleware (src/middleware/auth.js)
2. Add JWT utilities (src/utils/jwt.js)  
3. Implement user model (src/models/user.js)
4. Create auth routes (src/routes/auth.js)
5. Update main app configuration

🔍 Dependencies Required:
- jsonwebtoken ^9.0.0
- bcryptjs ^2.4.3
- express-validator ^6.14.0

⚠️ Risk Assessment:
- Medium: Database schema changes required
- Low: Existing routes need protection middleware

⏱️ Estimated Effort: 2-3 hours
🎯 Confidence: High (common pattern detected)

Approve this plan? (y/n)
```

### Refactoring Code
```bash
You: "Refactor the API endpoints to use TypeScript"

Plan Mode Analysis Complete ✅

📋 Implementation Plan: TypeScript Migration

🔄 Migration Strategy:
1. Install TypeScript dependencies
2. Create tsconfig.json configuration
3. Migrate models to TypeScript interfaces
4. Convert route handlers with proper typing
5. Update build scripts and CI/CD

📁 Files to Convert: 23 JavaScript files
🔧 Build Changes: webpack.config.js, package.json
📦 New Dependencies: typescript, @types/express, @types/node

⚠️ Risk Assessment:
- High: Breaking changes possible during conversion
- Medium: Build pipeline needs updates
- Low: Runtime behavior should remain identical

⏱️ Estimated Effort: 1-2 days
🎯 Confidence: High (standard migration pattern)

Approve this plan? (y/n)
```

## Best Practices

### When to Use Plan Mode
- **Complex Features**: Multi-file changes requiring careful planning
- **Refactoring**: Large-scale code reorganization or technology migration
- **Unknown Codebases**: Exploring and understanding unfamiliar projects
- **Risk Assessment**: Evaluating impact of proposed changes

### Tips for Better Results
1. **Be Specific**: Provide clear, detailed descriptions of what you want to achieve
2. **Context Matters**: Plan Mode works better when it understands your project structure
3. **Review Carefully**: Always review the generated plan before approval
4. **Iterative Refinement**: Provide feedback to improve plan quality

### Keyboard Shortcuts
- **Shift+Tab twice**: Activate Plan Mode
- **Ctrl+I**: Show context tooltip with workspace insights
- **Enter**: Confirm plan approval
- **Escape**: Exit Plan Mode without executing

## Troubleshooting

### Plan Mode Won't Activate
- Ensure you press Shift+Tab twice in quick succession (< 2 seconds)
- Check that no confirmation dialogs are active
- Verify you're not already in Plan Mode

### Analysis Takes Too Long
- Large codebases may take 30-60 seconds for complete analysis
- Plan Mode automatically skips binary files and node_modules
- Consider using more specific requests for faster results

### Plan Quality Issues
- Provide more context about your project structure
- Be more specific about desired outcomes
- Use Plan Mode after major changes to refresh understanding

## Advanced Usage

### Custom Instructions
Create `.grok/GROK.md` in your project to provide Plan Mode with custom context:

```markdown
# Project Context for Plan Mode

## Architecture
This is a microservices application using Docker and Kubernetes.

## Coding Standards  
- Use functional components in React
- Prefer TypeScript over JavaScript
- Follow clean architecture principles

## Constraints
- No direct database access from frontend
- All API calls must go through the gateway
- Maintain backward compatibility
```

### Integration with CI/CD
Plan Mode analysis can inform automated processes:

```bash
# Generate plans for review in pull requests
grok --headless "analyze the changes in this PR and create implementation plan"

# Validate architecture compliance
grok --headless "check if proposed changes follow our architecture guidelines"
```

## Comparison with Claude Code

| Feature | Claude Code | X-CLI Plan Mode |
|---------|-------------|-------------------|
| Activation | Shift+Tab twice | ✅ Shift+Tab twice |
| Read-only Safety | ✅ | ✅ |
| AI Planning | ✅ | ✅ |
| Progress Visualization | ✅ | ✅ |
| Risk Assessment | ✅ | ✅ |
| Terminal Integration | ❌ | ✅ |
| Custom Instructions | ✅ | ✅ |

---

Plan Mode brings Claude Code's intelligent exploration capabilities directly to your terminal, enabling safe, thorough analysis and strategic planning for any codebase changes.