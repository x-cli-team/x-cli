import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  "tutorialSidebar": [
    "overview",
    {
      type: "html",
      value: '<div class="sidebar-divider">For Users</div>',
    },
    "getting-started/quickstart",
    "getting-started/installation",
    "tools/overview",
    "troubleshooting/npm",
    "roadmap",
    {
      type: "html",
      value: '<div class="sidebar-divider">Community</div>',
    },
    "community/testimonials",
    {
      type: "html",
      value: '<div class="sidebar-divider">For Developers</div>',
    },
    "architecture/overview", 
    "architecture/current-state",
    "api/schema",
    "guides/releases",
    "guides/automation",
    "development/transparency"
  ]
};

export default sidebars;