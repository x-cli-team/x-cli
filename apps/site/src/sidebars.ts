import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  "tutorialSidebar": [
    "overview",
    
    // === FOR USERS ===
    {
      "type": "category", 
      "label": "🚀 Getting Started",
      "items": [
        "getting-started/overview",
        "getting-started/installation", 
        "getting-started/quickstart",
        "getting-started/common-workflows",
        "getting-started/skills"
      ]
    },
    {
      "type": "category",
      "label": "⚙️ Configuration", 
      "items": [
        "configuration/settings",
        "configuration/terminal-configuration",
        "configuration/model-configuration",
        "configuration/profiles"
      ]
    },
    {
      "type": "category",
      "label": "✨ Features",
      "items": [
        "features/plan-mode",
        "features/context-management",
        "features/session-management", 
        "features/git-integration",
        "features/workflow-automation",
        "features/multi-file-operations",
        "features/codebase-intelligence",
        "features/research-mode",
        "features/error-handling",
        "features/session-restore",
        "features/export-import"
      ]
    },
    {
      "type": "category",
      "label": "📖 Reference",
      "items": [
        "reference/cli-reference",
        "reference/interactive-mode", 
        "reference/slash-commands",
        "reference/advanced-slash-commands",
        "reference/output-styles"
      ]
    },
    
    // === COMMUNITY ===
    {
      "type": "category",
      "label": "👥 Community",
      "items": [
        "community",
        "community/testimonials",
        "community/contributing", 
        "community/support"
      ]
    },
    
    // === FOR DEVELOPERS ===
    {
      "type": "category", 
      "label": "🏗️ Developer Guide",
      "items": [
        "developers",
        "developers/getting-started",
        "developers/api-reference",
        "developers/examples"
      ]
    },
    {
      "type": "category", 
      "label": "🏗️ Architecture",
      "items": [
        "architecture/overview"
      ]
    },
    {
      "type": "category",
      "label": "🔧 Build with Grok One-Shot",
      "items": [
        "build-with-claude-code/mcp",
        "build-with-claude-code/hooks",
        "build-with-claude-code/hooks-guide",
        "build-with-claude-code/subagents",
        "build-with-claude-code/troubleshooting",
        "features/custom-tools",
        "features/tool-system"
      ]
    },
    {
      "type": "category",
      "label": "🚀 Deployment & Admin",
      "items": [
        "administration/advanced-installation",
        "administration/data-usage",
        "deployment/overview", 
        "deployment/github-actions",
        "deployment/claude-code-on-the-web"
      ]
    },
    {
      "type": "category",
      "label": "⚡ Advanced Features",
      "items": [
        "features/ide-integration",
        "features/testing-integration",
        "features/performance-monitoring",
        "features/code-templates", 
        "features/analytics",
        "features/notifications",
        "features/plugin-system",
        "features/cloud-sync"
      ]
    },
    
    "roadmap",
    "resources/legal-and-compliance"
  ]
};

export default sidebars;