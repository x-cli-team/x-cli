#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Sync .agent/docs/claude-code documentation to Docusaurus docs
 * Syncs comprehensive Claude Code parity documentation structure
 */

const AGENT_DIR = path.resolve(__dirname, '../../../../.agent');
const CLAUDE_CODE_DOCS_DIR = path.resolve(__dirname, '../../../../.agent/docs/claude-code');
const DOCS_DIR = path.resolve(__dirname, '../../docs');

function addFrontmatter(content, title, sidebarPosition) {
  const frontmatter = [
    '---',
    `title: ${title}`,
    sidebarPosition ? `sidebar_position: ${sidebarPosition}` : '',
    '---',
    '',
  ].filter(Boolean).join('\n');
  
  // Remove existing frontmatter from content if present
  const cleanContent = content.replace(/^---[\s\S]*?---\s*/, '');
  
  return frontmatter + cleanContent;
}

function rewriteLinks(content) {
  // Convert .agent internal links to public doc links
  return content
    .replace(/\.agent\/system\/([^)]+)\.md/g, '/docs/architecture/$1')
    .replace(/\.agent\/sop\/([^)]+)\.md/g, '/docs/guides/$1') 
    .replace(/\.agent\/tasks\/([^)]+)\.md/g, '/docs/roadmap')
    .replace(/\.agent\/incidents\/([^)]+)\.md/g, '/docs/troubleshooting');
}

function filterContent(content, filePath) {
  // Remove internal/sensitive content for public docs
  let filtered = content;
  
  // Remove system reminder sections
  filtered = filtered.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '');
  
  // Remove internal timestamps and metadata
  filtered = filtered.replace(/Last Updated: \d{4}-\d{2}-\d{2}T[\d:.]+Z/g, '');
  filtered = filtered.replace(/Updated By: .*/g, '');
  
  // Remove all emojis for clean X.AI-inspired look - but preserve line structure
  // Enhanced emoji removal - covers all ranges and specific symbols
  filtered = filtered.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu, '');
  
  // Remove specific emoji variants that might not be caught above
  filtered = filtered.replace(/[🛡️🚨⚠️❌🔧🎯⚡🔍🌐📊🤖💻🏗️🛠️📦🔄📝💡🆕🔗📖🌍⚙️💬🧠📄🔎🌳📋🎨🔥🚀✅📚]/g, '');
  
  // Remove emoji shortcodes like :emoji:
  filtered = filtered.replace(/:[a-z_+-]+:/g, '');
  
  // Clean up multiple spaces but preserve line breaks
  filtered = filtered.replace(/ +/g, ' ');
  filtered = filtered.replace(/^ +| +$/gm, '');
  
  // Filter critical-state.md for public consumption
  if (filePath.includes('critical-state.md')) {
    // Remove internal development notes
    filtered = filtered.replace(/## Known Limitations[\s\S]*?(?=##|$)/g, '');
  }
  
  return filtered.trim();
}


function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function syncClaudeCodeDocs() {
  console.log('🔄 Syncing .agent/docs/claude-code to Docusaurus...');
  
  // Ensure docs directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
  
  // Clear existing docs (except custom files we want to preserve)
  const preserveFiles = ['overview.md', 'roadmap.md']; // Keep custom files
  const preserveDirectories = ['architecture', 'community']; // Keep custom directories
  
  if (fs.existsSync(DOCS_DIR)) {
    const existing = fs.readdirSync(DOCS_DIR, { withFileTypes: true });
    existing.forEach(item => {
      const fullPath = path.join(DOCS_DIR, item.name);
      if (item.isDirectory()) {
        // Only remove directories that are not in preserve list
        if (!preserveDirectories.includes(item.name)) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        }
      } else if (!preserveFiles.includes(item.name)) {
        // Remove files not in preserve list
        fs.unlinkSync(fullPath);
      }
    });
  }
  
  // Sync all Claude Code documentation files
  if (fs.existsSync(CLAUDE_CODE_DOCS_DIR)) {
    const files = glob.sync('**/*.md', { cwd: CLAUDE_CODE_DOCS_DIR });
    
    files.forEach(relativeFile => {
      const sourcePath = path.join(CLAUDE_CODE_DOCS_DIR, relativeFile);
      const targetPath = path.join(DOCS_DIR, relativeFile);
      
      console.log(`📄 Processing ${relativeFile}`);
      
      let content = fs.readFileSync(sourcePath, 'utf8');
      
      // Transform content for public docs
      content = filterContent(content, sourcePath);
      content = rewriteLinks(content);
      
      // Add frontmatter - extract title from first heading
      const titleMatch = content.match(/^# (.+?)(?:\n|$)/m);
      const title = titleMatch ? titleMatch[1].trim() : path.basename(relativeFile, '.md');
      content = addFrontmatter(content, title);
      
      // Ensure target directory exists
      ensureDir(targetPath);
      
      // Write file
      fs.writeFileSync(targetPath, content);
      console.log(`✅ Synced ${relativeFile}`);
    });
    
    console.log(`📊 Synced ${files.length} Claude Code documentation files`);
  } else {
    console.warn(`⚠️  Claude Code docs directory not found: ${CLAUDE_CODE_DOCS_DIR}`);
  }
  
  // Generate comprehensive sidebar from synced Claude Code docs
  console.log('📊 Generating comprehensive sidebar...');
  
  // Create sidebar config matching synced Claude Code documentation files
  const sidebarConfig = {
    tutorialSidebar: [
      // Overview (preserve existing custom page)
      'overview',
      
      // Getting Started
      {
        type: 'category',
        label: 'Getting Started',
        items: [
          'getting-started/overview',
          'getting-started/installation',
          'getting-started/quickstart',
          'getting-started/common-workflows',
          'getting-started/hooks',
          'getting-started/hooks-guide',
          'getting-started/skills'
        ]
      },
      
      // Configuration
      {
        type: 'category',
        label: 'Configuration',
        items: [
          'configuration/settings',
          'configuration/terminal-configuration',
          'configuration/model-configuration',
          'configuration/profiles'
        ]
      },
      
      // Features (all available feature docs)
      {
        type: 'category',
        label: 'Features',
        items: [
          'features/context-management',
          'features/tool-system',
          'features/session-management',
          'features/git-integration',
          'features/workflow-automation',
          'features/research-mode',
          'features/error-handling',
          'features/plan-mode',
          'features/ide-integration',
          'features/multi-file-operations',
          'features/codebase-intelligence',
          'features/performance-monitoring',
          'features/testing-integration',
          'features/code-templates',
          'features/custom-tools',
          'features/session-restore',
          'features/export-import',
          'features/analytics',
          'features/notifications',
          'features/plugin-system',
          'features/skills',
          'features/cloud-sync'
        ]
      },
      
      // Reference
      {
        type: 'category',
        label: 'Reference',
        items: [
          'reference/cli-reference',
          'reference/interactive-mode',
          'reference/slash-commands',
          'reference/advanced-slash-commands',
          'reference/output-styles'
        ]
      },
      
      // Build with Grok One-Shot
      {
        type: 'category',
        label: 'Build with Grok One-Shot',
        items: [
          'build-with-claude-code/subagents',
          'build-with-claude-code/mcp',
          'build-with-claude-code/hooks',
          'build-with-claude-code/hooks-guide',
          'build-with-claude-code/troubleshooting'
        ]
      },
      
      // Administration
      {
        type: 'category',
        label: 'Administration',
        items: [
          'administration/advanced-installation',
          'administration/data-usage'
        ]
      },
      
      // Architecture
      {
        type: 'category',
        label: 'Architecture',
        items: [
          'architecture/overview'
        ]
      },
      
      // Community
      {
        type: 'category',
        label: 'Community',
        items: [
          'community/testimonials'
        ]
      },
      
      // Deployment
      {
        type: 'category',
        label: 'Deployment',
        items: [
          'deployment/overview',
          'deployment/github-actions',
          'deployment/claude-code-on-the-web'
        ]
      },
      
      // Roadmap
      'roadmap',
      // Resources
      'resources/legal-and-compliance'
    ],
  };
  
  // Write TypeScript sidebar config
  const sidebarContent = `import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = ${JSON.stringify(sidebarConfig, null, 2)};

export default sidebars;`;
  
  fs.writeFileSync(
    path.join(__dirname, '../sidebars.ts'),
    sidebarContent
  );
  
  console.log('✅ Claude Code documentation sync complete!');
}

// Run if called directly
if (require.main === module) {
  syncClaudeCodeDocs();
}

module.exports = { syncClaudeCodeDocs };