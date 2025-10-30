/**
 * Research & Recommend Service
 *
 * Implements the "Research → Recommend" flow that generates structured
 * Issues/Options/Recommendation/Plan output for user approval.
 */

import {
  ResearchOutput,
  ResearchRequest,
  ResearchConfig,
  ResearchIssue,
  ResearchOption,
  ResearchRecommendation,
  ResearchPlan,
  ApprovalResponse
} from '../types/research-recommend.js';
import { GrokAgent, ChatEntry } from '../agent/grok-agent.js';
import { ContextPack } from '../utils/context-loader.js';
import { ExecutionOrchestrator } from './execution-orchestrator.js';
import { ExecutionResult } from '../types/execution.js';
import * as readline from 'readline';

const DEFAULT_CONFIG: ResearchConfig = {
  maxOptions: 3,
  includeContext: true,
  timeout: 60000 // 60 seconds
};

export class ResearchRecommendService {
  constructor(
    private agent: GrokAgent,
    private config: ResearchConfig = DEFAULT_CONFIG
  ) {}

  /**
   * Perform research and generate recommendation
   */
  async researchAndRecommend(
    request: ResearchRequest,
    contextPack?: ContextPack
  ): Promise<ResearchOutput> {
    const prompt = this.buildResearchPrompt(request, contextPack);

    try {
      const response = await this.agent.processUserMessage(prompt);
      return this.parseResearchOutput(response);
    } catch (error) {
      console.error('[ResearchRecommend] Research failed:', error);
      throw new Error(`Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build the research prompt
   */
  private buildResearchPrompt(request: ResearchRequest, contextPack?: ContextPack): string {
    let prompt = `Analyze the following task and provide a structured research output in JSON format.

TASK: ${request.userTask}

`;

    if (request.constraints && request.constraints.length > 0) {
      prompt += `CONSTRAINTS:
${request.constraints.map(c => `- ${c}`).join('\n')}

`;
    }

    if (request.preferences && request.preferences.length > 0) {
      prompt += `PREFERENCES:
${request.preferences.map(p => `- ${p}`).join('\n')}

`;
    }

    if (this.config.includeContext && contextPack) {
      prompt += `CONTEXT INFORMATION:
System Documentation:
${contextPack.system}

SOP Documentation:
${contextPack.sop}

Recent Task Documentation:
${contextPack.tasks.slice(0, 5).map(t => `${t.filename}:\n${t.content}`).join('\n\n')}

`;
    }

    prompt += `Please provide your analysis in the following JSON structure:
{
  "issues": [
    {
      "type": "fact|gap|risk",
      "description": "Description of the issue",
      "severity": "low|medium|high",
      "impact": "Impact description (optional)"
    }
  ],
  "options": [
    {
      "id": 1,
      "title": "Option title",
      "description": "Detailed description",
      "tradeoffs": {
        "pros": ["pro1", "pro2"],
        "cons": ["con1", "con2"]
      },
      "effort": "low|medium|high",
      "risk": "low|medium|high"
    }
  ],
  "recommendation": {
    "optionId": 1,
    "reasoning": "Why this option is recommended",
    "justification": "Detailed justification",
    "confidence": "low|medium|high"
  },
  "plan": {
    "summary": "Brief summary of the plan",
    "approach": ["step1", "step2", "step3"],
    "todo": ["TODO item 1", "TODO item 2"],
    "estimatedEffort": "Time estimate",
    "keyConsiderations": ["consideration1", "consideration2"]
  }
}

Provide exactly ${this.config.maxOptions} options. Focus on actionable, practical solutions. Be thorough but concise. Respond with ONLY the JSON.`;

    return prompt;
  }

  /**
   * Parse the AI response into structured output
   */
  private parseResearchOutput(response: ChatEntry[]): ResearchOutput {
    // Extract the last assistant message
    let jsonText = '';
    if (Array.isArray(response)) {
      for (const entry of response) {
        if (entry.type === 'assistant' && entry.content) {
          jsonText = entry.content.trim();
          break;
        }
      }
    } else if (typeof response === 'string') {
      jsonText = response;
    }

    // Try to extract JSON from the response
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and normalize the structure
      return {
        issues: this.validateIssues(parsed.issues || []),
        options: this.validateOptions(parsed.options || []),
        recommendation: this.validateRecommendation(parsed.recommendation),
        plan: this.validatePlan(parsed.plan)
      };
    } catch (error) {
      console.error('[ResearchRecommend] JSON parse error:', error);
      console.error('Raw response:', jsonText);
      throw new Error('Failed to parse research output JSON');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private validateIssues(issues: any[]): ResearchIssue[] {
    return issues.map(issue => ({
      type: ['fact', 'gap', 'risk'].includes(issue.type) ? issue.type : 'fact',
      description: issue.description || 'No description provided',
      severity: ['low', 'medium', 'high'].includes(issue.severity) ? issue.severity : 'medium',
      impact: issue.impact
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private validateOptions(options: any[]): ResearchOption[] {
    return options.slice(0, this.config.maxOptions).map((option, index) => ({
      id: option.id || (index + 1),
      title: option.title || `Option ${index + 1}`,
      description: option.description || 'No description provided',
      tradeoffs: {
        pros: Array.isArray(option.tradeoffs?.pros) ? option.tradeoffs.pros : [],
        cons: Array.isArray(option.tradeoffs?.cons) ? option.tradeoffs.cons : []
      },
      effort: ['low', 'medium', 'high'].includes(option.effort) ? option.effort : 'medium',
      risk: ['low', 'medium', 'high'].includes(option.risk) ? option.risk : 'medium'
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private validateRecommendation(rec: any): ResearchRecommendation {
    return {
      optionId: rec?.optionId || 1,
      reasoning: rec?.reasoning || 'No reasoning provided',
      justification: rec?.justification || 'No justification provided',
      confidence: ['low', 'medium', 'high'].includes(rec?.confidence) ? rec.confidence : 'medium'
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private validatePlan(plan: any): ResearchPlan {
    return {
      summary: plan?.summary || 'No summary provided',
      approach: Array.isArray(plan?.approach) ? plan.approach : [],
      todo: Array.isArray(plan?.todo) ? plan.todo : [],
      estimatedEffort: plan?.estimatedEffort || 'Unknown',
      keyConsiderations: Array.isArray(plan?.keyConsiderations) ? plan.keyConsiderations : []
    };
  }

  /**
   * Render research output to console
   */
  renderToConsole(output: ResearchOutput): void {
    console.log('\n' + '='.repeat(50));
    console.log('🤖 RESEARCH & RECOMMENDATION');
    console.log('='.repeat(50));

    this.renderIssues(output.issues);
    this.renderOptions(output.options);
    this.renderRecommendation(output.recommendation, output.options);
    this.renderPlan(output.plan);

    console.log('='.repeat(50));
  }

  private renderIssues(issues: ResearchIssue[]): void {
    console.log('\n📋 ISSUES');
    console.log('-'.repeat(20));

    if (issues.length === 0) {
      console.log('No issues identified.');
      return;
    }

    for (const issue of issues) {
      const icon = issue.type === 'fact' ? '📊' : issue.type === 'gap' ? '⚠️' : '🚨';
      const severity = issue.severity ? ` (${issue.severity.toUpperCase()})` : '';
      console.log(`${icon} ${issue.type.toUpperCase()}${severity}: ${issue.description}`);
      if (issue.impact) {
        console.log(`   Impact: ${issue.impact}`);
      }
    }
  }

  private renderOptions(options: ResearchOption[]): void {
    console.log('\n🎯 OPTIONS');
    console.log('-'.repeat(20));

    for (const option of options) {
      console.log(`\n${option.id}) ${option.title}`);
      console.log(`   ${option.description}`);

      console.log(`   Effort: ${option.effort.toUpperCase()} | Risk: ${option.risk.toUpperCase()}`);

      if (option.tradeoffs.pros.length > 0) {
        console.log(`   ✅ Pros: ${option.tradeoffs.pros.join(', ')}`);
      }

      if (option.tradeoffs.cons.length > 0) {
        console.log(`   ❌ Cons: ${option.tradeoffs.cons.join(', ')}`);
      }
    }
  }

  private renderRecommendation(recommendation: ResearchRecommendation, options: ResearchOption[]): void {
    console.log('\n🎯 RECOMMENDATION');
    console.log('-'.repeat(20));

    const recommendedOption = options.find(o => o.id === recommendation.optionId);
    const optionTitle = recommendedOption ? recommendedOption.title : `Option ${recommendation.optionId}`;

    console.log(`→ ${optionTitle} (Confidence: ${recommendation.confidence.toUpperCase()})`);
    console.log(`Reasoning: ${recommendation.reasoning}`);
    console.log(`Justification: ${recommendation.justification}`);
  }

  private renderPlan(plan: ResearchPlan): void {
    console.log('\n📝 PLAN SUMMARY');
    console.log('-'.repeat(20));

    console.log(`Summary: ${plan.summary}`);
    console.log(`Estimated Effort: ${plan.estimatedEffort}`);

    if (plan.approach.length > 0) {
      console.log('\nApproach:');
      plan.approach.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step}`);
      });
    }

    if (plan.todo.length > 0) {
      console.log('\nTODO:');
      plan.todo.forEach((item) => {
        console.log(`   [ ] ${item}`);
      });
    }

    if (plan.keyConsiderations.length > 0) {
      console.log('\nKey Considerations:');
      plan.keyConsiderations.forEach(consideration => {
        console.log(`   • ${consideration}`);
      });
    }
  }

  /**
   * Prompt user for approval with Y/n/R options
   */
  async promptForApproval(_output: ResearchOutput): Promise<ApprovalResponse> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const promptUser = () => {
        console.log('\nProceed with recommendation? (Y/n) [R=revise]');
        rl.question('> ', (answer) => {
          const cleanAnswer = answer.trim().toLowerCase();

          if (cleanAnswer === 'y' || cleanAnswer === 'yes' || cleanAnswer === '') {
            rl.close();
            resolve({ approved: true, revised: false });
          } else if (cleanAnswer === 'n' || cleanAnswer === 'no') {
            rl.close();
            resolve({ approved: false, revised: false });
          } else if (cleanAnswer === 'r' || cleanAnswer === 'revise') {
            rl.question('Revision note (brief description of changes needed): ', (revisionNote) => {
              rl.close();
              resolve({
                approved: false,
                revised: true,
                revisionNote: revisionNote.trim() || 'User requested revision'
              });
            });
          } else {
            console.log('❌ Invalid input. Please enter Y (yes), N (no), or R (revise).');
            promptUser();
          }
        });
      };

      promptUser();
    });
  }

  /**
   * Handle revision flow with updated request
   */
  async handleRevision(
    originalRequest: ResearchRequest,
    revisionNote: string,
    contextPack?: ContextPack
  ): Promise<ResearchOutput> {
    console.log(`🔄 Revising based on: "${revisionNote}"`);
    console.log('🔍 Re-researching with revision context...');

    const revisedRequest: ResearchRequest = {
      ...originalRequest,
      constraints: [
        ...(originalRequest.constraints || []),
        `REVISION REQUEST: ${revisionNote}`
      ]
    };

    return await this.researchAndRecommend(revisedRequest, contextPack);
  }

  /**
   * Full research and approval workflow with revision support
   */
  async researchAndGetApproval(
    request: ResearchRequest,
    contextPack?: ContextPack,
    maxRevisions: number = 3
  ): Promise<{ output: ResearchOutput; approval: ApprovalResponse; revisions: number }> {
    let currentRequest = request;
    let revisions = 0;

    while (revisions <= maxRevisions) {
      console.log('🔍 Researching and analyzing...');

      const output = await this.researchAndRecommend(currentRequest, contextPack);
      this.renderToConsole(output);

      const approval = await this.promptForApproval(output);

      if (approval.approved || !approval.revised) {
        return { output, approval, revisions };
      }

      // Handle revision
      revisions++;
      if (revisions > maxRevisions) {
        console.log(`❌ Maximum revisions (${maxRevisions}) reached.`);
        return { output, approval, revisions };
      }

      console.log(`🔄 Revision ${revisions}/${maxRevisions}`);
      currentRequest = {
        ...request,
        constraints: [
          ...(request.constraints || []),
          `REVISION ${revisions}: ${approval.revisionNote}`
        ]
      };
    }

    // Should not reach here, but just in case
    throw new Error('Unexpected end of revision loop');
  }

  /**
   * Complete workflow: Research → Recommend → Execute with Adaptive Recovery
   */
  async researchRecommendExecute(
    request: ResearchRequest,
    contextPack?: ContextPack,
    maxRevisions: number = 3
  ): Promise<{
    output: ResearchOutput;
    approval: ApprovalResponse;
    revisions: number;
    execution?: ExecutionResult;
  }> {
    // Phase 1: Research and get approval
    const { output, approval, revisions } = await this.researchAndGetApproval(request, contextPack, maxRevisions);

    if (!approval.approved) {
      return { output, approval, revisions };
    }

    // Phase 2: Execute the approved plan with adaptive recovery
    console.log('\n🚀 Proceeding with execution (with adaptive recovery)...');
    const orchestrator = new ExecutionOrchestrator(this.agent);
    const execution = await orchestrator.executeWithRecovery(output.plan, this, request);

    return {
      output,
      approval,
      revisions,
      execution
    };
  }
}