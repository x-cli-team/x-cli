/**
 * Autonomous Task Executor
 * 
 * Orchestrates complex multi-step tasks by combining VSE semantic search,
 * codebase intelligence, and automated execution workflows.
 * 
 * This provides Claude Code's autonomous capabilities in the terminal.
 */

import { VectorSearchEngine } from './vector-search-engine.js';
import { CodebaseExplorer } from './codebase-explorer.js';
import { MultiFileEditorTool } from '../tools/advanced/multi-file-editor.js';
import { ASTParserTool } from '../tools/intelligence/ast-parser.js';
import { SymbolSearchTool } from '../tools/intelligence/symbol-search.js';
import { DependencyAnalyzerTool } from '../tools/intelligence/dependency-analyzer.js';

export interface TaskStep {
  id: string;
  type: 'search' | 'analyze' | 'edit' | 'validate' | 'test';
  description: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  error?: string;
}

export interface TaskPlan {
  id: string;
  goal: string;
  description: string;
  steps: TaskStep[];
  context: {
    rootPath: string;
    affectedFiles: string[];
    relatedSymbols: string[];
    dependencies: string[];
  };
  status: 'planned' | 'executing' | 'completed' | 'failed';
  progress: number; // 0-100
  startTime?: number;
  endTime?: number;
}

export interface ExecutionContext {
  searchEngine: VectorSearchEngine;
  codebaseExplorer: CodebaseExplorer;
  currentFiles: Set<string>;
  symbolCache: Map<string, any>;
  validationResults: Map<string, boolean>;
}

export interface AutonomousTaskConfig {
  rootPath: string;
  maxSteps: number;
  timeoutMs: number;
  validationEnabled: boolean;
  backupEnabled: boolean;
}

/**
 * Autonomous Task Executor for complex multi-step operations
 */
export class AutonomousExecutor {
  private config: AutonomousTaskConfig;
  private vectorSearch: VectorSearchEngine;
  private codebaseExplorer: CodebaseExplorer;
  private multiFileEditor: MultiFileEditorTool;
  private astParser: ASTParserTool;
  private symbolSearch: SymbolSearchTool;
  private dependencyAnalyzer: DependencyAnalyzerTool;
  
  private activeTasks = new Map<string, TaskPlan>();
  private executionHistory: TaskPlan[] = [];

  constructor(config: Partial<AutonomousTaskConfig> = {}) {
    this.config = {
      rootPath: process.cwd(),
      maxSteps: 50,
      timeoutMs: 5 * 60 * 1000, // 5 minutes
      validationEnabled: true,
      backupEnabled: true,
      ...config
    };

    // Initialize tools
    this.vectorSearch = new VectorSearchEngine({
      rootPath: this.config.rootPath,
      cacheEnabled: true,
      embeddingProvider: 'openai',
      maxMemoryMB: 500
    });

    this.codebaseExplorer = new CodebaseExplorer({
      maxExplorationDepth: 10,
      maxFileSize: 1024 * 1024,
      planGenerationTimeout: 30000,
      enableDetailedLogging: false,
      autoSavePlans: false,
      planSaveDirectory: '/tmp'
    });

    this.multiFileEditor = new MultiFileEditorTool();
    this.astParser = new ASTParserTool();
    this.symbolSearch = new SymbolSearchTool();
    this.dependencyAnalyzer = new DependencyAnalyzerTool();
  }

  /**
   * Plan and execute a complex task autonomously
   */
  async executeTask(goal: string, description: string): Promise<TaskPlan> {
    console.log(`🤖 Autonomous Executor: Planning task - ${goal}`);
    
    const taskId = this.generateTaskId();
    const startTime = Date.now();

    try {
      // Step 1: Analyze the goal and create execution plan
      const plan = await this.createExecutionPlan(taskId, goal, description);
      this.activeTasks.set(taskId, plan);

      console.log(`📋 Task Plan Created: ${plan.steps.length} steps identified`);

      // Step 2: Execute the plan step by step
      const context = await this.initializeExecutionContext();
      
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        
        try {
          console.log(`⚙️  Step ${i + 1}/${plan.steps.length}: ${step.description}`);
          
          step.status = 'running';
          plan.status = 'executing';
          plan.progress = Math.round((i / plan.steps.length) * 100);

          const stepResult = await this.executeStep(step, context);
          
          step.outputs = stepResult;
          step.status = 'completed';
          step.duration = Date.now() - startTime;

          console.log(`✅ Step ${i + 1} completed`);

        } catch (error) {
          step.status = 'failed';
          step.error = error instanceof Error ? error.message : String(error);
          
          console.error(`❌ Step ${i + 1} failed:`, step.error);
          
          // Attempt recovery
          const recovered = await this.attemptRecovery(step, context);
          if (!recovered) {
            plan.status = 'failed';
            break;
          }
        }
      }

      // Step 3: Finalize execution
      if (plan.status !== 'failed') {
        plan.status = 'completed';
        plan.progress = 100;
        
        // Run validation if enabled
        if (this.config.validationEnabled) {
          await this.validateExecution(plan, context);
        }
      }

      plan.endTime = Date.now();
      this.executionHistory.push(plan);
      this.activeTasks.delete(taskId);

      const duration = plan.endTime - startTime;
      console.log(`🎯 Task ${plan.status}: ${goal} (${duration}ms)`);

      return plan;

    } catch (error) {
      console.error('🚨 Autonomous execution failed:', error);
      
      const failedPlan: TaskPlan = {
        id: taskId,
        goal,
        description,
        steps: [],
        context: {
          rootPath: this.config.rootPath,
          affectedFiles: [],
          relatedSymbols: [],
          dependencies: []
        },
        status: 'failed',
        progress: 0,
        startTime,
        endTime: Date.now()
      };

      this.executionHistory.push(failedPlan);
      return failedPlan;
    }
  }

  /**
   * Create an execution plan by analyzing the goal
   */
  private async createExecutionPlan(taskId: string, goal: string, description: string): Promise<TaskPlan> {
    // Use VSE to understand the codebase context for this goal
    const searchResults = await this.vectorSearch.semanticSearch(goal, 10);
    
    const context = {
      rootPath: this.config.rootPath,
      affectedFiles: searchResults.map(r => r.filePath),
      relatedSymbols: searchResults.map(r => r.symbol.name),
      dependencies: []
    };

    // Analyze dependencies
    if (context.affectedFiles.length > 0) {
      const depResult = await this.dependencyAnalyzer.execute({
        rootPath: this.config.rootPath,
        filePatterns: context.affectedFiles.map(f => `**/${f.split('/').pop()}`),
        detectCircular: true
      });

      if (depResult.success && depResult.output) {
        const parsed = JSON.parse(depResult.output);
        context.dependencies = parsed.result?.dependencies?.map((d: any) => d.name) || [];
      }
    }

    // Generate execution steps based on goal analysis
    const steps = await this.generateExecutionSteps(goal, description, context);

    return {
      id: taskId,
      goal,
      description,
      steps,
      context,
      status: 'planned',
      progress: 0,
      startTime: Date.now()
    };
  }

  /**
   * Generate execution steps based on goal analysis
   */
  private async generateExecutionSteps(goal: string, description: string, context: any): Promise<TaskStep[]> {
    const steps: TaskStep[] = [];

    // Determine task type and generate appropriate steps
    if (goal.toLowerCase().includes('refactor')) {
      steps.push(
        {
          id: 'analyze_code',
          type: 'analyze',
          description: 'Analyze current code structure and dependencies',
          inputs: { files: context.affectedFiles },
          status: 'pending'
        },
        {
          id: 'plan_refactoring',
          type: 'analyze',
          description: 'Plan refactoring approach and identify changes',
          inputs: { symbols: context.relatedSymbols },
          status: 'pending'
        },
        {
          id: 'apply_changes',
          type: 'edit',
          description: 'Apply refactoring changes to codebase',
          inputs: { files: context.affectedFiles },
          status: 'pending'
        },
        {
          id: 'validate_changes',
          type: 'validate',
          description: 'Validate refactoring maintains functionality',
          inputs: {},
          status: 'pending'
        }
      );
    } else if (goal.toLowerCase().includes('add') || goal.toLowerCase().includes('implement')) {
      steps.push(
        {
          id: 'research_context',
          type: 'search',
          description: 'Research existing patterns and implementations',
          inputs: { query: goal },
          status: 'pending'
        },
        {
          id: 'identify_location',
          type: 'analyze',
          description: 'Identify optimal location for new implementation',
          inputs: { files: context.affectedFiles },
          status: 'pending'
        },
        {
          id: 'implement_feature',
          type: 'edit',
          description: 'Implement the new feature or functionality',
          inputs: {},
          status: 'pending'
        },
        {
          id: 'update_dependencies',
          type: 'edit',
          description: 'Update imports, exports, and dependencies',
          inputs: { dependencies: context.dependencies },
          status: 'pending'
        },
        {
          id: 'validate_implementation',
          type: 'validate',
          description: 'Validate implementation works correctly',
          inputs: {},
          status: 'pending'
        }
      );
    } else if (goal.toLowerCase().includes('fix') || goal.toLowerCase().includes('bug')) {
      steps.push(
        {
          id: 'locate_issue',
          type: 'search',
          description: 'Locate the source of the issue',
          inputs: { query: description },
          status: 'pending'
        },
        {
          id: 'analyze_impact',
          type: 'analyze',
          description: 'Analyze impact and related components',
          inputs: { files: context.affectedFiles },
          status: 'pending'
        },
        {
          id: 'apply_fix',
          type: 'edit',
          description: 'Apply fix to resolve the issue',
          inputs: {},
          status: 'pending'
        },
        {
          id: 'test_fix',
          type: 'validate',
          description: 'Test that fix resolves issue without side effects',
          inputs: {},
          status: 'pending'
        }
      );
    } else {
      // Generic task steps
      steps.push(
        {
          id: 'understand_task',
          type: 'search',
          description: 'Understand task requirements and context',
          inputs: { query: goal },
          status: 'pending'
        },
        {
          id: 'analyze_codebase',
          type: 'analyze',
          description: 'Analyze relevant codebase components',
          inputs: { files: context.affectedFiles },
          status: 'pending'
        },
        {
          id: 'execute_changes',
          type: 'edit',
          description: 'Execute required changes',
          inputs: {},
          status: 'pending'
        },
        {
          id: 'validate_result',
          type: 'validate',
          description: 'Validate execution results',
          inputs: {},
          status: 'pending'
        }
      );
    }

    return steps;
  }

  /**
   * Initialize execution context with tools and state
   */
  private async initializeExecutionContext(): Promise<ExecutionContext> {
    // Ensure VSE is indexed
    if (!this.vectorSearch.getStats().totalSymbols) {
      console.log('🔍 Initializing semantic search index...');
      await this.vectorSearch.buildIndex();
    }

    return {
      searchEngine: this.vectorSearch,
      codebaseExplorer: this.codebaseExplorer,
      currentFiles: new Set(),
      symbolCache: new Map(),
      validationResults: new Map()
    };
  }

  /**
   * Execute a single step in the task plan
   */
  private async executeStep(step: TaskStep, context: ExecutionContext): Promise<any> {
    const stepStart = Date.now();

    try {
      switch (step.type) {
        case 'search':
          return await this.executeSearchStep(step, context);
        case 'analyze':
          return await this.executeAnalyzeStep(step, context);
        case 'edit':
          return await this.executeEditStep(step, context);
        case 'validate':
          return await this.executeValidateStep(step, context);
        case 'test':
          return await this.executeTestStep(step, context);
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }
    } finally {
      step.duration = Date.now() - stepStart;
    }
  }

  private async executeSearchStep(step: TaskStep, context: ExecutionContext): Promise<any> {
    const query = step.inputs.query || step.description;
    const results = await context.searchEngine.semanticSearch(query, 10);
    
    // Update context with search results
    for (const result of results) {
      context.currentFiles.add(result.filePath);
      context.symbolCache.set(result.symbol.id, result.symbol);
    }

    return { results, fileCount: results.length };
  }

  private async executeAnalyzeStep(step: TaskStep, context: ExecutionContext): Promise<any> {
    const files = step.inputs.files || Array.from(context.currentFiles);
    const analysisResults: any[] = [];

    for (const filePath of files) {
      try {
        const parseResult = await this.astParser.execute({
          filePath,
          includeSymbols: true,
          includeImports: true
        });

        if (parseResult.success && parseResult.output) {
          analysisResults.push(JSON.parse(parseResult.output));
        }
      } catch (error) {
        console.warn(`Analysis failed for ${filePath}:`, error);
      }
    }

    return { analyses: analysisResults, fileCount: files.length };
  }

  private async executeEditStep(step: TaskStep, context: ExecutionContext): Promise<any> {
    // Placeholder for edit operations
    // In practice, this would use MultiFileEditorTool with AI-generated changes
    console.log(`📝 Edit step: ${step.description}`);
    
    return { 
      message: 'Edit step executed (placeholder)',
      filesModified: Array.from(context.currentFiles).slice(0, 3)
    };
  }

  private async executeValidateStep(step: TaskStep, context: ExecutionContext): Promise<any> {
    // Placeholder for validation
    // In practice, this would run tests, check compilation, etc.
    console.log(`✅ Validation step: ${step.description}`);
    
    return { 
      valid: true,
      checks: ['compilation', 'tests', 'linting'],
      message: 'Validation passed (placeholder)'
    };
  }

  private async executeTestStep(step: TaskStep, context: ExecutionContext): Promise<any> {
    // Placeholder for test execution
    console.log(`🧪 Test step: ${step.description}`);
    
    return { 
      passed: true,
      testCount: 5,
      message: 'Tests passed (placeholder)'
    };
  }

  private async attemptRecovery(step: TaskStep, context: ExecutionContext): Promise<boolean> {
    console.log(`🔄 Attempting recovery for failed step: ${step.description}`);
    
    // Simple recovery strategy - retry once
    try {
      step.status = 'running';
      await this.executeStep(step, context);
      step.status = 'completed';
      return true;
    } catch (error) {
      step.status = 'failed';
      return false;
    }
  }

  private async validateExecution(plan: TaskPlan, context: ExecutionContext): Promise<void> {
    console.log('🔍 Running final validation...');
    
    // Validate that all files still compile/parse correctly
    for (const filePath of context.currentFiles) {
      try {
        const result = await this.astParser.execute({ filePath, includeSymbols: false });
        context.validationResults.set(filePath, result.success);
      } catch {
        context.validationResults.set(filePath, false);
      }
    }
  }

  /**
   * Get current task status
   */
  getActiveTask(taskId: string): TaskPlan | undefined {
    return this.activeTasks.get(taskId);
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): TaskPlan[] {
    return [...this.executionHistory];
  }

  /**
   * Cancel active task
   */
  cancelTask(taskId: string): boolean {
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.status = 'failed';
      task.endTime = Date.now();
      this.executionHistory.push(task);
      this.activeTasks.delete(taskId);
      return true;
    }
    return false;
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}