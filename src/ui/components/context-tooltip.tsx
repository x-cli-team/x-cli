import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { inkColors } from "../colors.js";
import path from "path";
import fs from "fs";
import os from "os";

interface ContextTooltipProps {
  isVisible: boolean;
  onToggle?: () => void;
}

interface ContextInfo {
  workspaceFiles: number;
  indexSize: string;
  sessionFiles: number;
  activeTokens: number;
  lastActivity: string;
  gitBranch?: string;
  projectName?: string;
}

export function ContextTooltip({ isVisible }: ContextTooltipProps) {
  const [contextInfo, setContextInfo] = useState<ContextInfo>({
    workspaceFiles: 0,
    indexSize: "0 MB",
    sessionFiles: 0,
    activeTokens: 0,
    lastActivity: "Now",
  });

  // Update context information periodically
  useEffect(() => {
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
        };
        setContextInfo(info);
      } catch {
        // Silently handle errors
      }
    };

    if (isVisible) {
      updateContextInfo();
      const interval = setInterval(updateContextInfo, 5000); // Update every 5s
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Note: Keyboard handling for Ctrl+I is managed by parent component

  if (!isVisible) return null;

  return (
    <Box
      borderStyle="round"
      borderColor={inkColors.accent}
      padding={1}
      marginTop={1}
      marginBottom={1}
      flexDirection="column"
    >
      <Box marginBottom={1}>
        <Text color={inkColors.accent} bold>
          🧠 Context Awareness
        </Text>
        <Text color={inkColors.muted}>
          {" "}(Ctrl+I to toggle)
        </Text>
      </Box>

      <Box flexDirection="column">
        {/* Project Information */}
        <Box marginBottom={1}>
          <Text color={inkColors.primary} bold>
            📁 Project: 
          </Text>
          <Text color={inkColors.text}>
            {" "}{contextInfo.projectName || "Unknown"}
          </Text>
          {contextInfo.gitBranch && (
            <>
              <Text color={inkColors.muted}> on </Text>
              <Text color={inkColors.warning}>
                {contextInfo.gitBranch}
              </Text>
            </>
          )}
        </Box>

        {/* Workspace Stats */}
        <Box justifyContent="space-between" marginBottom={1}>
          <Box>
            <Text color={inkColors.success}>📊 Workspace:</Text>
            <Text color={inkColors.text}>
              {" "}{contextInfo.workspaceFiles} files
            </Text>
          </Box>
          <Box>
            <Text color={inkColors.success}>💾 Index:</Text>
            <Text color={inkColors.text}>
              {" "}{contextInfo.indexSize}
            </Text>
          </Box>
        </Box>

        {/* Session Information */}
        <Box justifyContent="space-between" marginBottom={1}>
          <Box>
            <Text color={inkColors.warning}>📝 Session:</Text>
            <Text color={inkColors.text}>
              {" "}{contextInfo.sessionFiles} files
            </Text>
          </Box>
          <Box>
            <Text color={inkColors.warning}>🔤 Tokens:</Text>
            <Text color={inkColors.text}>
              {" "}{contextInfo.activeTokens.toLocaleString()}
            </Text>
          </Box>
        </Box>

        {/* Real-time Activity */}
        <Box>
          <Text color={inkColors.accent}>⚡ Activity:</Text>
          <Text color={inkColors.text}>
            {" "}{contextInfo.lastActivity}
          </Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text color={inkColors.muted} dimColor>
          💡 This shows your current workspace context and session state
        </Text>
      </Box>
    </Box>
  );
}

// Helper functions for gathering context information
async function getWorkspaceFileCount(): Promise<number> {
  try {
    const cwd = process.cwd();
    const files = await fs.promises.readdir(cwd, { recursive: true });
    return files.filter(file => 
      typeof file === 'string' && 
      !file.includes('node_modules') && 
      !file.includes('.git') &&
      !file.startsWith('.')
    ).length;
  } catch {
    return 0;
  }
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