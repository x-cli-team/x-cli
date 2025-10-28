import { useEffect } from 'react';
import fs from 'fs';
import path from 'path';
import { ChatEntry } from '../agent/grok-agent.js';

export interface AutoReadConfig {
  enabled?: boolean;
  showLoadingMessage?: boolean;
  showSummaryMessage?: boolean;
  showFileContents?: boolean;
  folders?: Array<{
    name: string;
    priority?: number;
    files: Array<{
      name: string;
      title?: string;
      icon?: string;
      required?: boolean;
      pattern?: string;
    }>;
  }>;
  customFolders?: Array<{
    name: string;
    priority?: number;
    files: Array<{
      name: string;
      title?: string;
      icon?: string;
      required?: boolean;
      pattern?: string;
    }>;
  }>;
}

export function useAutoRead(
  setChatHistory: (messages: ChatEntry[]) => void
): void {
  useEffect(() => {
    // Auto-read .agent folder on first run if exists
    if (fs.existsSync('.agent')) {
      const initialMessages: ChatEntry[] = [];
      let docsRead = 0;

      // Load configuration if available
      let config: AutoReadConfig | null = null;
      const configPaths = [
        path.join('.xcli', 'auto-read-config.json'), // User config (distributed)
        path.join('.agent', 'auto-read-config.json') // Dev override (gitignored)
      ];

      for (const configPath of configPaths) {
        if (fs.existsSync(configPath)) {
          try {
            const configContent = fs.readFileSync(configPath, 'utf8');
            config = JSON.parse(configContent);
            break; // Use first config found (user config takes precedence)
          } catch (_error) {
            // Silently ignore config parsing errors, continue to next path
          }
        }
      }

      // Use config or fall back to hardcoded defaults
      const isEnabled = config?.enabled !== false;
      const showLoadingMessage = config?.showLoadingMessage !== false;
      const showSummaryMessage = config?.showSummaryMessage !== false;
      const showFileContents = config?.showFileContents === true;

      if (!isEnabled) {
        // Auto-read is disabled
        return;
      }

      // Add loading message
      if (showLoadingMessage) {
        initialMessages.push({
          type: 'assistant',
          content: '📚 Reading core documentation into memory...',
          timestamp: new Date(),
        });
      }

      // Process folders in priority order
      const folders = config?.folders || [
        {
          name: 'system',
          priority: 1,
          files: [
            { name: 'architecture.md', title: 'System Architecture', icon: '📋', required: true },
            { name: 'critical-state.md', title: 'Critical State', icon: '🏗️', required: false },
            { name: 'installation.md', title: 'Installation', icon: '🏗️', required: false },
            { name: 'api-schema.md', title: 'API Schema', icon: '🏗️', required: false },
            { name: 'auto-read-system.md', title: 'Auto-Read System', icon: '🏗️', required: false }
          ]
        },
        {
          name: 'sop',
          priority: 2,
          files: [
            { name: 'git-workflow.md', title: 'Git Workflow SOP', icon: '🔧', required: true },
            { name: 'release-management.md', title: 'Release Management SOP', icon: '📖', required: false },
            { name: 'automation-protection.md', title: 'Automation Protection SOP', icon: '📖', required: false },
            { name: 'npm-publishing-troubleshooting.md', title: 'NPM Publishing Troubleshooting', icon: '📖', required: false }
          ]
        }
      ];

      // Add custom folders if configured
      if (config?.customFolders) {
        folders.push(...config.customFolders);
      }

      // Sort folders by priority
      folders.sort((a, b) => (a.priority || 999) - (b.priority || 999));

      // Process each folder
      for (const folder of folders) {
        const folderPath = path.join('.agent', folder.name);

        if (!fs.existsSync(folderPath)) {
          continue;
        }

        for (const file of folder.files) {
          let filePaths: string[] = [];

          if (file.pattern) {
            // Handle glob patterns (future enhancement)
            // For now, skip pattern files
            continue;
          } else {
            filePaths = [file.name];
          }

          for (const fileName of filePaths) {
            const filePath = path.join(folderPath, fileName);

            if (!fs.existsSync(filePath)) {
              if (file.required) {
                // Log missing required files (optional enhancement)
              }
              continue;
            }

            try {
              const content = fs.readFileSync(filePath, 'utf8');
              const displayTitle = file.title || fileName.replace('.md', '').replace('-', ' ').toUpperCase();
              const icon = file.icon || '📄';

              if (showFileContents) {
                initialMessages.push({
                  type: 'assistant',
                  content: `${icon} **${displayTitle} (from .agent/${folder.name}/${fileName})**\n\n${content}`,
                  timestamp: new Date(),
                });
              }
              docsRead++;
            } catch (_error) {
              // Silently ignore read errors
            }
          }
        }
      }

      // Add summary message
      if (showSummaryMessage && docsRead > 0) {
        initialMessages.push({
          type: 'assistant',
          content: `✅ ${docsRead} documentation files read - I have a complete understanding of the current architecture and operational procedures.`,
          timestamp: new Date(),
        });
      }

      if (initialMessages.length > 0) {
        setChatHistory(initialMessages);
      }
    }
  }, [setChatHistory]);
}