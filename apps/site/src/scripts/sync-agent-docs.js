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
// Note: overview.md is excluded to preserve custom overview page
const SYNC_MAP = {
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
  
  // Remove emojis for clean X.AI-inspired look - but preserve line breaks
  filtered = filtered.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  
  // Remove emoji shortcodes like :emoji:
  filtered = filtered.replace(/:[a-z_+-]+:/g, '');
  
  // Remove common emoji patterns in markdown (🚀 ✅ 📚 etc) - but preserve line structure
  filtered = filtered.replace(/[🚀✅📚🔧🎯⚡🔍🌐📊🤖💻🏗️🛠️📦🔄📝💡🆕🔗📖🌍⚙️💬🧠📄🔎🌳📋🛡️🎨🔥💻]/g, '');
  
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
  
  // Ensure docs directory exists but don't delete everything
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
  
  // Process mapped files (only sync specific files, preserving custom docs)
  Object.entries(SYNC_MAP).forEach(([source, target]) => {
    const sourcePath = path.join(AGENT_DIR, source);
    const targetPath = path.join(DOCS_DIR, target);
    
    if (fs.existsSync(sourcePath)) {
      console.log(`📄 Processing ${source} → ${target}`);
      
      let content = fs.readFileSync(sourcePath, 'utf8');
      
      // Transform content
      content = filterContent(content, sourcePath);
      content = rewriteLinks(content);
      
      // Add frontmatter - extract just the first line after #
      const titleMatch = content.match(/^# (.+?)(?:\n|$)/m);
      const title = titleMatch ? titleMatch[1].trim() : path.basename(target, '.md');
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
  
  // Create flat sidebar config like X.AI docs (no categories)
  const sidebarConfig = {
    tutorialSidebar: [
      'overview',
      'getting-started/installation',
      'architecture/overview',
      'architecture/current-state', 
      'api/schema',
      'guides/releases',
      'guides/automation',
      'troubleshooting/npm',
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