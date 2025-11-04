/**
 * Autonomous Task Tool - CLI interface for the Autonomous Task Executor
 * 
 * Enables users to execute complex multi-step tasks autonomously
 * using natural language descriptions.
 */

import { ToolResult } from '../../types/index.js';
import { AutonomousExecutor, TaskPlan } from '../../services/autonomous-executor.js';

export interface AutonomousTaskArgs {
  goal: string;
  description?: string;
  action?: 'execute' | 'status' | 'history' | 'cancel';
  taskId?: string;
  rootPath?: string;
  maxSteps?: number;
  timeoutMs?: number;
}

/**
 * Autonomous Task Tool
 * 
 * Orchestrates complex multi-step coding tasks autonomously.
 * This brings Claude Code's autonomous capabilities to the terminal.
 */
export class AutonomousTaskTool {
  name = 'autonomous_task';
  description = 'Execute complex multi-step coding tasks autonomously using AI-powered planning and execution. Handles refactoring, feature implementation, bug fixes, and more.';

  private executor: AutonomousExecutor | null = null;
  private isExecuting = false;

  async execute(args: AutonomousTaskArgs): Promise<ToolResult> {
    try {
      const {
        goal,
        description = '',
        action = 'execute',
        taskId,
        rootPath = process.cwd(),
        maxSteps = 50,
        timeoutMs = 5 * 60 * 1000
      } = args;

      // Initialize executor if needed
      if (!this.executor) {
        this.executor = new AutonomousExecutor({
          rootPath,
          maxSteps,
          timeoutMs,
          validationEnabled: true,
          backupEnabled: true
        });
      }

      switch (action) {
        case 'execute':
          if (!goal) {
            return {
              success: false,
              error: 'Goal is required for task execution. Example: "refactor the authentication system to use JWT tokens"'
            };
          }
          return await this.handleExecute(goal, description);

        case 'status':
          if (!taskId) {
            return {
              success: false,
              error: 'Task ID is required for status check'
            };
          }
          return await this.handleStatus(taskId);

        case 'history':
          return await this.handleHistory();

        case 'cancel':
          if (!taskId) {
            return {
              success: false,
              error: 'Task ID is required for cancellation'
            };
          }
          return await this.handleCancel(taskId);

        default:
          return {
            success: false,
            error: `Unknown action: ${action}. Use: execute, status, history, or cancel`
          };
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async handleExecute(goal: string, description: string): Promise<ToolResult> {
    if (this.isExecuting) {
      return {
        success: false,
        error: 'Another autonomous task is already executing. Wait for completion or cancel it first.'
      };
    }

    try {
      this.isExecuting = true;
      
      console.log(`🤖 Starting autonomous task execution...`);
      const taskPlan = await this.executor!.executeTask(goal, description);
      
      const output = this.formatTaskResult(taskPlan);
      
      return {
        success: taskPlan.status === 'completed',
        output
      };

    } catch (error) {
      return {
        success: false,
        error: `Autonomous execution failed: ${error instanceof Error ? error.message : String(error)}`
      };
    } finally {
      this.isExecuting = false;
    }
  }

  private async handleStatus(taskId: string): Promise<ToolResult> {
    const task = this.executor!.getActiveTask(taskId);
    
    if (!task) {
      // Check history
      const history = this.executor!.getExecutionHistory();
      const historicalTask = history.find(t => t.id === taskId);
      
      if (historicalTask) {
        return {
          success: true,
          output: this.formatTaskStatus(historicalTask, false)
        };
      }
      
      return {
        success: false,
        error: `Task ${taskId} not found`
      };
    }

    return {
      success: true,
      output: this.formatTaskStatus(task, true)
    };
  }

  private async handleHistory(): Promise<ToolResult> {
    const history = this.executor!.getExecutionHistory();
    
    if (history.length === 0) {
      return {
        success: true,
        output: '📋 **Autonomous Task History**\n\nNo tasks have been executed yet.\n\nRun an autonomous task with:\n`grok autonomous-task --goal="your task description"`'
      };
    }

    let output = `📋 **Autonomous Task History** (${history.length} tasks)\n\n`;
    
    for (const task of history.slice(-10)) { // Last 10 tasks
      const duration = task.endTime && task.startTime ? task.endTime - task.startTime : 0;
      const statusIcon = task.status === 'completed' ? '✅' : '❌';
      
      output += `${statusIcon} **${task.goal}**\n`;
      output += `   📅 ${task.startTime ? new Date(task.startTime).toLocaleString() : 'Unknown'}\n`;
      output += `   ⏱️  ${duration > 0 ? `${Math.round(duration / 1000)}s` : 'N/A'}\n`;
      output += `   📊 ${task.steps.length} steps, ${task.progress}% progress\n`;
      output += `   🆔 \`${task.id}\`\n\n`;
    }
    
    output += `💡 **Tips**:\n`;
    output += `- Check task details: \`grok autonomous-task --action=status --taskId=TASK_ID\`\n`;
    output += `- Execute new task: \`grok autonomous-task --goal="your goal here"\``;

    return {
      success: true,
      output
    };
  }

  private async handleCancel(taskId: string): Promise<ToolResult> {
    const cancelled = this.executor!.cancelTask(taskId);
    
    if (cancelled) {
      this.isExecuting = false;
      return {
        success: true,
        output: `🛑 **Task Cancelled**\n\nTask \`${taskId}\` has been cancelled successfully.\nAll partial changes have been preserved.`
      };
    }

    return {
      success: false,
      error: `Task ${taskId} not found or already completed`
    };
  }

  private formatTaskResult(task: TaskPlan): string {
    const duration = task.endTime && task.startTime ? task.endTime - task.startTime : 0;
    const statusIcon = task.status === 'completed' ? '✅' : '❌';
    
    let output = `🤖 **Autonomous Task ${task.status.toUpperCase()}** ${statusIcon}\n\n`;
    output += `**Goal**: ${task.goal}\n`;
    output += `**Task ID**: \`${task.id}\`\n`;
    output += `**Duration**: ${duration > 0 ? `${Math.round(duration / 1000)}s` : 'N/A'}\n`;
    output += `**Progress**: ${task.progress}%\n\n`;
    
    output += `📋 **Execution Steps** (${task.steps.length} total):\n\n`;
    
    for (let i = 0; i < task.steps.length; i++) {
      const step = task.steps[i];
      const stepIcon = step.status === 'completed' ? '✅' : 
                     step.status === 'failed' ? '❌' : 
                     step.status === 'running' ? '⚙️' : '⏳';
      
      output += `${i + 1}. ${stepIcon} **${step.description}**\n`;
      
      if (step.status === 'completed' && step.outputs) {
        if (step.outputs.fileCount) {
          output += `   📁 Processed ${step.outputs.fileCount} files\n`;
        }
        if (step.outputs.results) {
          output += `   🔍 Found ${step.outputs.results.length} results\n`;
        }
      }
      
      if (step.status === 'failed' && step.error) {
        output += `   ❌ Error: ${step.error}\n`;
      }
      
      if (step.duration) {
        output += `   ⏱️  ${Math.round(step.duration / 1000)}s\n`;
      }
      
      output += '\n';
    }
    
    if (task.context.affectedFiles.length > 0) {
      output += `📁 **Affected Files** (${task.context.affectedFiles.length}):\n`;
      for (const file of task.context.affectedFiles.slice(0, 5)) {
        output += `- \`${file}\`\n`;
      }
      if (task.context.affectedFiles.length > 5) {
        output += `- ... and ${task.context.affectedFiles.length - 5} more\n`;
      }
      output += '\n';
    }
    
    if (task.status === 'completed') {
      output += `🎯 **Success!** Task completed successfully.\n`;
      output += `All steps executed and validated.\n\n`;
      output += `💡 **Next Steps**:\n`;
      output += `- Review changes: \`git diff\`\n`;
      output += `- Run tests to verify functionality\n`;
      output += `- Commit changes: \`git add . && git commit -m "feat: ${task.goal}"\``;
    } else if (task.status === 'failed') {
      output += `💥 **Task Failed**\n`;
      output += `Some steps could not be completed. Review the errors above.\n\n`;
      output += `🔧 **Recovery Options**:\n`;
      output += `- Check the error messages and resolve manually\n`;
      output += `- Retry with a more specific goal description\n`;
      output += `- Break down the task into smaller steps`;
    }

    return output;
  }

  private formatTaskStatus(task: TaskPlan, isActive: boolean): string {
    const duration = task.endTime && task.startTime ? task.endTime - task.startTime : 
                    isActive && task.startTime ? Date.now() - task.startTime : 0;
    
    let output = `📊 **Task Status**: ${task.status.toUpperCase()}\n\n`;
    output += `**Goal**: ${task.goal}\n`;
    output += `**Task ID**: \`${task.id}\`\n`;
    output += `**Progress**: ${task.progress}%\n`;
    output += `**Duration**: ${duration > 0 ? `${Math.round(duration / 1000)}s` : 'N/A'}\n`;
    output += `**Status**: ${isActive ? '🔄 Active' : '📋 Historical'}\n\n`;
    
    const completedSteps = task.steps.filter(s => s.status === 'completed').length;
    const failedSteps = task.steps.filter(s => s.status === 'failed').length;
    const runningSteps = task.steps.filter(s => s.status === 'running').length;
    
    output += `📋 **Steps Summary**:\n`;
    output += `- ✅ Completed: ${completedSteps}\n`;
    output += `- ❌ Failed: ${failedSteps}\n`;
    output += `- ⚙️ Running: ${runningSteps}\n`;
    output += `- ⏳ Pending: ${task.steps.length - completedSteps - failedSteps - runningSteps}\n\n`;
    
    if (runningSteps > 0) {
      const currentStep = task.steps.find(s => s.status === 'running');
      if (currentStep) {
        output += `🔄 **Current Step**: ${currentStep.description}\n\n`;
      }
    }
    
    if (isActive && task.status !== 'completed') {
      output += `💡 **Actions**:\n`;
      output += `- Cancel task: \`grok autonomous-task --action=cancel --taskId=${task.id}\`\n`;
      output += `- Wait for completion and check status again`;
    }

    return output;
  }

  getSchema() {
    return {
      type: 'object',
      properties: {
        goal: {
          type: 'string',
          description: 'The high-level goal to accomplish (e.g., "refactor authentication to use JWT", "add user profile feature", "fix memory leak in data processing")'
        },
        description: {
          type: 'string',
          description: 'Additional details about the task requirements and constraints'
        },
        action: {
          type: 'string',
          enum: ['execute', 'status', 'history', 'cancel'],
          description: 'Action to perform: execute (default), status, history, or cancel',
          default: 'execute'
        },
        taskId: {
          type: 'string',
          description: 'Task ID for status check or cancellation'
        },
        rootPath: {
          type: 'string',
          description: 'Root path for task execution (defaults to current directory)'
        },
        maxSteps: {
          type: 'integer',
          description: 'Maximum number of execution steps (default: 50)',
          default: 50,
          minimum: 1,
          maximum: 200
        },
        timeoutMs: {
          type: 'integer',
          description: 'Task timeout in milliseconds (default: 300000 = 5 minutes)',
          default: 300000,
          minimum: 10000,
          maximum: 1800000
        }
      }
    };
  }
}