/**
 * Context Information Hook
 * 
 * Provides workspace context information that can be shared
 * between the welcome banner and context tooltip.
 */

import { useState, useEffect } from 'react';
import path from 'path';
import fs from 'fs';
import os from 'os';

export interface ContextInfo {
  workspaceFiles: number;
  indexSize: string;
  sessionFiles: number;
  activeTokens: number;
  lastActivity: string;
  gitBranch?: string;
  projectName?: string;
  memoryPressure: 'low' | 'medium' | 'high';
  isLoading: boolean;
}

export function useContextInfo() {
  const [contextInfo, setContextInfo] = useState<ContextInfo>({
    workspaceFiles: 0,
    indexSize: "0 MB",
    sessionFiles: 0,
    activeTokens: 0,
    lastActivity: "Now",
    memoryPressure: 'low',
    isLoading: true,
  });

  // Update context information
  const updateContextInfo = async () => {
    try {
      const info: ContextInfo = {
        workspaceFiles: await getWorkspaceFileCount(),
        indexSize: await getIndexSize(),
        sessionFiles: await getSessionFileCount(),
        activeTokens: 0, // TODO: Get from token counter
        lastActivity: "Now",
        gitBranch: await getGitBranch(),
        projectName: await getProjectName(),
        memoryPressure: getMemoryPressure(),
        isLoading: false,
      };
      setContextInfo(info);
    } catch (error) {
      console.warn('[ContextInfo] Failed to update context:', error);
      setContextInfo(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Initial load and periodic updates
  useEffect(() => {
    updateContextInfo();
    const interval = setInterval(updateContextInfo, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  return {
    contextInfo,
    updateContextInfo,
    refreshContext: updateContextInfo
  };
}

// Helper functions for gathering context information
async function getWorkspaceFileCount(): Promise<number> {
  try {
    const cwd = process.cwd();
    const entries = await fs.promises.readdir(cwd, { withFileTypes: true });
    
    let count = 0;
    for (const entry of entries) {
      if (entry.isFile() && !shouldIgnoreFile(entry.name)) {
        count++;
      } else if (entry.isDirectory() && !shouldIgnoreDirectory(entry.name)) {
        try {
          const subEntries = await fs.promises.readdir(path.join(cwd, entry.name), { withFileTypes: true });
          count += subEntries.filter(sub => sub.isFile() && !shouldIgnoreFile(sub.name)).length;
        } catch {
          // Skip directories we can't read
        }
      }
    }
    
    return count;
  } catch {
    return 0;
  }
}

function shouldIgnoreFile(filename: string): boolean {
  return filename.startsWith('.') || 
         filename.endsWith('.log') ||
         filename.includes('.tmp');
}

function shouldIgnoreDirectory(dirname: string): boolean {
  const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
  return ignoreDirs.includes(dirname) || dirname.startsWith('.');
}

async function getIndexSize(): Promise<string> {
  try {
    const indexPath = path.join(process.cwd(), '.grok', 'index.json');
    if (fs.existsSync(indexPath)) {
      const stats = await fs.promises.stat(indexPath);
      const mb = stats.size / (1024 * 1024);
      return mb > 1 ? `${mb.toFixed(1)} MB` : `${(stats.size / 1024).toFixed(1)} KB`;
    }
  } catch {
    // Ignore errors
  }
  return "0 MB";
}

async function getSessionFileCount(): Promise<number> {
  try {
    const sessionPath = path.join(os.homedir(), '.grok', 'session.log');
    if (fs.existsSync(sessionPath)) {
      const content = await fs.promises.readFile(sessionPath, 'utf8');
      return content.split('\n').filter(line => line.trim()).length;
    }
  } catch {
    // Ignore errors
  }
  return 0;
}

async function getGitBranch(): Promise<string | undefined> {
  try {
    const gitPath = path.join(process.cwd(), '.git', 'HEAD');
    if (fs.existsSync(gitPath)) {
      const content = await fs.promises.readFile(gitPath, 'utf8');
      const match = content.match(/ref: refs\/heads\/(.+)/);
      return match ? match[1].trim() : 'detached';
    }
  } catch {
    // Ignore errors
  }
  return undefined;
}

async function getProjectName(): Promise<string | undefined> {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const content = await fs.promises.readFile(packagePath, 'utf8');
      const pkg = JSON.parse(content);
      return pkg.name;
    }
  } catch {
    // Ignore errors
  }
  
  // Fallback to directory name
  return path.basename(process.cwd());
}

function getMemoryPressure(): 'low' | 'medium' | 'high' {
  try {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    
    if (heapUsedMB > 200) return 'high';
    if (heapUsedMB > 100) return 'medium';
    return 'low';
  } catch {
    return 'low';
  }
}