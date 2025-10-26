---
title: Overview
---

# X CLI

X CLI is a conversational AI tool that brings Claude Code-level intelligence directly into your terminal. Built with X.AI's Grok models, it provides advanced file operations, code analysis, and workflow automation through natural language interaction.

<div className="hero-card">
  <div className="hero-card-background">
    <video className="hero-card-video" autoPlay muted loop playsInline preload="auto">
      <source src="/img/grok-hero-video.mp4" type="video/mp4" />
      <source src="/img/grok-hero-video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
  <div className="hero-card-overlay"></div>
  <div className="hero-card-content">
    <div className="hero-card-text">
      <h3>X CLI v1.0.96</h3>
      <p>We're excited to release the latest advancement in terminal-based AI development tools with Claude Code-level capabilities.</p>
      
      <div className="feature-grid">
        <div className="feature-item">
          <strong>Tool System</strong>
          <span>15+ specialized tools</span>
        </div>
        <div className="feature-item">
          <strong>Context</strong>
          <span>Unlimited project context</span>
        </div>
      </div>
      
      <div className="feature-list">
        <ul>
          <li>File operations</li>
          <li>Code intelligence</li>
          <li>Web integration</li>
          <li>Context awareness</li>
          <li>Professional UX</li>
        </ul>
      </div>
    </div>
    
    <div className="card-actions">
      <a href="getting-started/installation" className="btn-primary">Get Started</a>
      <a href="architecture/overview" className="btn-secondary">View Architecture</a>
    </div>
  </div>
</div>

## Jump right in

<div className="jump-in-grid">
  <div className="jump-card">
    <h4>Quickstart</h4>
    <p>Install globally and make your first request with natural language.</p>
    <a href="getting-started/installation">Learn more</a>
  </div>
  
  <div className="jump-card">
    <h4>Tool System</h4>
    <p>Let X CLI perform file operations, code analysis, and workflow automation.</p>
    <a href="architecture/overview">Learn more</a>
  </div>
  
  <div className="jump-card">
    <h4>MCP Integration</h4>
    <p>Extend capabilities with Model Context Protocol servers and external services.</p>
    <a href="api/schema">Learn more</a>
  </div>
</div>

## Key Features

**Advanced File Operations**

- Read, Write, Edit with atomic multi-file support
- Search and discovery with Grep, Glob, LS tools
- Transaction-based editing with rollback capabilities

**Code Intelligence**

- Syntax-aware editing with AST parsing
- Symbol search across codebases
- Dependency analysis and refactoring tools

**Web Integration**

- Real-time web search and content retrieval
- HTTP client capabilities for external services
- External service integration via MCP protocol

**Workflow Automation**

- Task management and progress tracking
- Specialized agent delegation for complex operations
- IDE integration with VS Code and Jupyter

**🎯 Plan Mode (Claude Code Parity)**

- **Shift+Tab twice activation** - Exact Claude Code keyboard shortcut
- **Read-only exploration** - Safe codebase analysis with destructive operation blocking
- **AI-powered planning** - Strategic implementation planning with Grok models
- **Real-time progress** - Multi-phase exploration and planning indicators

**Claude Code-Style UX**

- Professional visual feedback with contextual spinners and progress indicators
- Context awareness with `Ctrl+I` workspace tooltip (project stats, git branch, memory pressure)
- Real-time background activity monitoring and dynamic status updates
- Unified color system with 120ms smooth animations for calm interface

## Architecture

X CLI is built on a modular architecture with:

- **Agent System**: Central orchestration with streaming responses
- **Tool System**: Modular tools for specific operations
- **MCP Integration**: Extensible server integration
- **Configuration Management**: User and project-level settings

## Tool Categories

**Core Tools**

- Read, Write, Edit, Bash, Grep, Glob, LS

**Advanced Tools**

- MultiEdit, WebFetch, WebSearch, Task, TodoWrite, **Plan Mode**

**IDE Integration**

- NotebookEdit, BashOutput, KillBash

---

Are you looking for a different AI coding assistant? Visit [Claude Code](https://claude.ai/code) or check out our [comparison table](https://github.com/x-cli-team/x-cli#comparison) for the differences.

## Questions and feedback

If you have any questions or feedback, feel free to create an issue on our [GitHub repository](https://github.com/x-cli-team/x-cli/issues) or join the [xAI Community Discord](https://discord.com/channels/1315720379607679066/1315822328139223064).

**Happy Grokking in the Terminal!** ⚡
