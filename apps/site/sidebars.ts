import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  "tutorialSidebar": [
    // Overview
    "overview",
    
    // Getting Started  
    "getting-started/quickstart",
    "getting-started/installation",
    
    // Architecture
    "architecture/overview", 
    "architecture/current-state",
    
    // Build with Grok CLI
    "build/tools",
    "build/agents",
    "build/troubleshooting",
    
    // Configuration
    "config/settings",
    
    // Reference
    "reference/cli-reference",
    
    // API
    "api/schema",
    
    // Guides  
    "guides/releases",
    "guides/automation",
    
    // Troubleshooting
    "troubleshooting/npm",
    
    // Resources
    "roadmap"
  ]
};

export default sidebars;