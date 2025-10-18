#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Sync .agent documentation to Docusaurus docs
 * Transforms internal documentation for public consumption
 */

const AGENT_DIR = path.resolve(__dirname, '../../../../.agent');
const DOCS_DIR = path.resolve(__dirname, '../../docs');

// Mapping of .agent files to public docs
const SYNC_MAP = {
  'README.md': 'overview.md',
  'system/architecture.md': 'architecture/overview.md', 
  'system/critical-state.md': 'architecture/current-state.md',
  'system/installation.md': 'getting-started/installation.md',
  'system/api-schema.md': 'api/schema.md',
  'sop/release-management.md': 'guides/releases.md',
  'sop/automation-protection.md': 'guides/automation.md',
  'sop/npm-publishing-troubleshooting.md': 'troubleshooting/npm.md',
};

function addFrontmatter(content, title, sidebarPosition) {
  const frontmatter = [
    '---',
    `title: ${title}`,
    sidebarPosition ? `sidebar_position: ${sidebarPosition}` : '',
    '---',
    '',
  ].filter(Boolean).join('\n');
  
  return frontmatter + content;
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
  
  // Filter critical-state.md for public consumption
  if (filePath.includes('critical-state.md')) {
    // Remove internal development notes
    filtered = filtered.replace(/## Known Limitations[\s\S]*?(?=##|$)/g, '');
  }
  
  return filtered.trim();
}

function generateRoadmap() {
  const taskFiles = glob.sync(path.join(AGENT_DIR, 'tasks/*.md'));
  
  const roadmapContent = [
    '---',
    'title: Roadmap', 
    'sidebar_position: 1',
    '---',
    '',
    '# Grok CLI Roadmap',
    '',
    'This roadmap is automatically generated from our internal task tracking system.',
    '',
  ];
  
  // Extract key roadmap items (filter for public-appropriate tasks)
  taskFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const filename = path.basename(file);
    
    // Only include roadmap and sprint tasks
    if (filename.includes('roadmap') || filename.includes('sprint')) {
      const title = content.match(/# (.+)/)?.[1] || filename;
      roadmapContent.push(`## ${title}`);
      
      // Extract objective/overview if present
      const objective = content.match(/\*\*Objective\*\*: (.+)/)?.[1];
      if (objective) {
        roadmapContent.push('', objective, '');
      }
    }
  });
  
  return roadmapContent.join('\n');
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function syncAgentDocs() {
  console.log('🔄 Syncing .agent docs to Docusaurus...');
  
  // Clean existing docs
  if (fs.existsSync(DOCS_DIR)) {
    fs.rmSync(DOCS_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  
  // Process mapped files
  Object.entries(SYNC_MAP).forEach(([source, target]) => {
    const sourcePath = path.join(AGENT_DIR, source);
    const targetPath = path.join(DOCS_DIR, target);
    
    if (fs.existsSync(sourcePath)) {
      console.log(`📄 Processing ${source} → ${target}`);
      
      let content = fs.readFileSync(sourcePath, 'utf8');
      
      // Transform content
      content = filterContent(content, sourcePath);
      content = rewriteLinks(content);
      
      // Add frontmatter
      const title = content.match(/# (.+)/)?.[1] || path.basename(target, '.md');
      content = addFrontmatter(content, title);
      
      // Write to target
      ensureDir(targetPath);
      fs.writeFileSync(targetPath, content);
    } else {
      console.warn(`⚠️  Source file not found: ${sourcePath}`);
    }
  });
  
  // Generate dynamic content
  console.log('📊 Generating roadmap...');
  const roadmapContent = generateRoadmap();
  fs.writeFileSync(path.join(DOCS_DIR, 'roadmap.md'), roadmapContent);
  
  // Create sidebar config for TypeScript
  const sidebarConfig = {
    tutorialSidebar: [
      'overview',
      {
        type: 'category',
        label: 'Getting Started',
        items: ['getting-started/installation'],
      },
      {
        type: 'category', 
        label: 'Architecture',
        items: ['architecture/overview', 'architecture/current-state'],
      },
      {
        type: 'category',
        label: 'API Reference', 
        items: ['api/schema'],
      },
      {
        type: 'category',
        label: 'Guides',
        items: ['guides/releases', 'guides/automation'],
      },
      {
        type: 'category',
        label: 'Troubleshooting',
        items: ['troubleshooting/npm'],
      },
      'roadmap',
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
  
  console.log('✅ Sync complete!');
}

// Run if called directly
if (require.main === module) {
  syncAgentDocs();
}

module.exports = { syncAgentDocs };