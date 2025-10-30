/**
 * Context Loader Module
 *
 * Loads and prioritizes .agent/ documentation for intelligent decision making.
 * Handles system.md, sop.md equivalents, and task files with summarization.
 */

import fs from 'fs';
import path from 'path';

export interface TaskDoc {
  filename: string;
  content: string;
  isSummarized: boolean;
  date: Date;
  size: number;
}

export interface ContextPack {
  system: string;
  sop: string;
  tasks: TaskDoc[];
  totalSize: number;
  warnings: string[];
}

const CONTEXT_BUDGET_BYTES = 280 * 1024; // 280KB
const MAX_SUMMARY_LENGTH = 2000; // characters for summary

/**
 * Loads all .md files from a directory and concatenates them
 */
function loadMarkdownDirectory(dirPath: string): string {
  if (!fs.existsSync(dirPath)) {
    return '';
  }

  const files = fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.md'))
    .sort(); // alphabetical sort

  let content = '';
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      content += `\n\n=== ${file} ===\n\n${fileContent}`;
    } catch (error) {
      console.warn(`Failed to read ${filePath}:`, error);
    }
  }

  return content;
}

/**
 * Extracts date from task filename (YYYY-MM-DD format)
 */
function extractDateFromFilename(filename: string): Date {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return new Date(match[1]);
  }
  return new Date(0); // fallback to epoch for undated files
}

/**
 * Simple summarization: take first N characters or until double newline
 */
function summarizeContent(content: string, maxLength: number = MAX_SUMMARY_LENGTH): string {
  if (content.length <= maxLength) {
    return content;
  }

  const truncated = content.substring(0, maxLength);
  const lastNewline = truncated.lastIndexOf('\n\n');
  if (lastNewline > maxLength * 0.8) {
    return truncated.substring(0, lastNewline);
  }

  return truncated + '\n\n[...content truncated for context budget...]';
}

/**
 * Loads and prioritizes task files
 */
function loadTaskFiles(tasksDir: string, maxBudget: number): TaskDoc[] {
  if (!fs.existsSync(tasksDir)) {
    return [];
  }

  const files = fs.readdirSync(tasksDir)
    .filter(file => file.endsWith('.md'))
    .map(filename => {
      const filePath = path.join(tasksDir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      return {
        filename,
        content,
        size: Buffer.byteLength(content, 'utf-8'),
        date: extractDateFromFilename(filename),
        isSummarized: false
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime()); // newest first

  const result: TaskDoc[] = [];
  let usedBudget = 0;

  for (const file of files) {
    let finalContent = file.content;
    let isSummarized = false;

    if (usedBudget + file.size > maxBudget) {
      // Summarize if it would exceed budget
      finalContent = summarizeContent(file.content);
      const summarizedSize = Buffer.byteLength(finalContent, 'utf-8');
      if (usedBudget + summarizedSize > maxBudget) {
        // Skip if even summarized it's too big
        continue;
      }
      usedBudget += summarizedSize;
      isSummarized = true;
    } else {
      usedBudget += file.size;
    }

    result.push({
      ...file,
      content: finalContent,
      isSummarized
    });
  }

  return result;
}

/**
 * Loads context from .agent/ directory
 */
export function loadContext(agentDir: string = '.agent'): ContextPack {
  const systemContent = loadMarkdownDirectory(path.join(agentDir, 'system'));
  const sopContent = loadMarkdownDirectory(path.join(agentDir, 'sop'));

  const systemSize = Buffer.byteLength(systemContent, 'utf-8');
  const sopSize = Buffer.byteLength(sopContent, 'utf-8');

  // Reserve budget for system and sop, then use rest for tasks
  const taskBudget = Math.max(0, CONTEXT_BUDGET_BYTES - systemSize - sopSize);
  const tasks = loadTaskFiles(path.join(agentDir, 'tasks'), taskBudget);

  const totalSize = systemSize + sopSize + tasks.reduce((sum, task) => sum + Buffer.byteLength(task.content, 'utf-8'), 0);

  const warnings: string[] = [];
  if (totalSize > CONTEXT_BUDGET_BYTES) {
    warnings.push(`Context size (${(totalSize / 1024).toFixed(1)}KB) exceeds budget (${(CONTEXT_BUDGET_BYTES / 1024)}KB)`);
  }

  return {
    system: systemContent,
    sop: sopContent,
    tasks,
    totalSize,
    warnings
  };
}

/**
 * Formats context pack for display/logging
 */
export function formatContextStatus(pack: ContextPack): string {
  const taskCount = pack.tasks.length;
  const summarizedCount = pack.tasks.filter(t => t.isSummarized).length;
  const sizeKB = (pack.totalSize / 1024).toFixed(1);

  let status = `[x-cli] Context: loaded system docs, sop docs, ${taskCount} task docs (~${sizeKB} KB).`;

  if (summarizedCount > 0) {
    status += ` Summarized ${summarizedCount} older tasks for context budget.`;
  }

  if (pack.warnings.length > 0) {
    status += ` Warnings: ${pack.warnings.join('; ')}`;
  }

  return status;
}