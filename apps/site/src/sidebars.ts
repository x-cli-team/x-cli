import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  "tutorialSidebar": [
    "overview",
    {
      "type": "category",
      "label": "Getting Started",
      "items": [
        "getting-started/overview",
        "getting-started/quickstart",
        "getting-started/common-workflows"
      ]
    },
    {
      "type": "category",
      "label": "Configuration",
      "items": [
        "configuration/settings",
        "configuration/terminal-configuration",
        "configuration/model-configuration",
        "configuration/profiles"
      ]
    },
    {
      "type": "category",
      "label": "Features",
      "items": [
        "features/context-management",
        "features/tool-system",
        "features/session-management",
        "features/git-integration",
        "features/workflow-automation",
        "features/research-mode",
        "features/error-handling",
        "features/plan-mode",
        "features/ide-integration",
        "features/multi-file-operations",
        "features/codebase-intelligence",
        "features/performance-monitoring",
        "features/testing-integration",
        "features/code-templates",
        "features/custom-tools",
        "features/session-restore",
        "features/export-import",
        "features/analytics",
        "features/notifications",
        "features/plugin-system",
        "features/cloud-sync"
      ]
    },
    {
      "type": "category",
      "label": "Reference",
      "items": [
        "reference/cli-reference",
        "reference/interactive-mode",
        "reference/slash-commands",
        "reference/advanced-slash-commands"
      ]
    },
    {
      "type": "category",
      "label": "Build with Grok One-Shot",
      "items": [
        "build-with-claude-code/subagents",
        "build-with-claude-code/mcp",
        "build-with-claude-code/troubleshooting"
      ]
    },
    {
      "type": "category",
      "label": "Administration",
      "items": [
        "administration/advanced-installation",
        "administration/data-usage"
      ]
    },
    {
      "type": "category",
      "label": "Architecture",
      "items": [
        "architecture/overview"
      ]
    },
    {
      "type": "category",
      "label": "Community",
      "items": [
        "community/testimonials"
      ]
    },
    "deployment/overview",
    "resources/legal-and-compliance"
  ]
};

export default sidebars;