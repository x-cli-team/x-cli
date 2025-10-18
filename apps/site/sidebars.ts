import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  "tutorialSidebar": [
    "overview",
    {
      "type": "category",
      "label": "Getting Started",
      "collapsed": false,
      "items": [
        "getting-started/installation"
      ]
    },
    {
      "type": "category",
      "label": "Architecture",
      "collapsed": false,
      "items": [
        "architecture/overview",
        "architecture/current-state"
      ]
    },
    {
      "type": "category",
      "label": "API Reference",
      "collapsed": false,
      "items": [
        "api/schema"
      ]
    },
    {
      "type": "category",
      "label": "Guides",
      "collapsed": false,
      "items": [
        "guides/releases",
        "guides/automation"
      ]
    },
    {
      "type": "category",
      "label": "Troubleshooting",
      "collapsed": false,
      "items": [
        "troubleshooting/npm"
      ]
    }
  ]
};

export default sidebars;