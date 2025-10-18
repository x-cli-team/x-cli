import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  "tutorialSidebar": [
    // Overview
    "overview",
    
    // Getting Started  
    "getting-started/installation",
    
    // Architecture
    "architecture/overview", 
    "architecture/current-state",
    
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