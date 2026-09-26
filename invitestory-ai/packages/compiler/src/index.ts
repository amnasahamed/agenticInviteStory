// Compiler orchestrator - coordinates template adapter and agent tasks

import {
  InvitationSpec,
  JobId,
  TemplateId,
  AttemptNumber,
  Component,
  ComponentId,
  CustomRequirement
} from "@invitestory/contracts";
import { createAdapter, BaseTemplateAdapter, TemplateAdapterError } from "@invitestory/templates";

export interface CompilerContext {
  jobId: JobId;
  attempt: AttemptNumber;
  spec: InvitationSpec;
  templateId: TemplateId;
  templateVersion: string;
  workspacePath: string;
}

export interface CompilerResult {
  success: boolean;
  changedFiles: string[];
  diff: string;
  agentTasks: AgentTaskResult[];
  warnings: string[];
  errors: string[];
}

export interface AgentTask {
  id: string;
  type: "code" | "image";
  requirementId: string;
  instruction: string;
  targetComponent: ComponentId;
  allowedFiles: string[];
  context: {
    specFragment: InvitationSpec;
    templateFiles: string[];
    currentWorkspace: string;
  };
}

export interface AgentTaskResult {
  taskId: string;
  success: boolean;
  changedFiles: string[];
  diff: string;
  logs: string[];
  error?: string;
}

export class CompilerError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = false
  ) {
    super(message);
    this.name = "CompilerError";
  }
}

export class InvitationCompiler {
  private adapter: BaseTemplateAdapter;

  constructor(private context: CompilerContext) {
    this.adapter = createAdapter(context.templateId, {
      spec: context.spec,
      template: { id: context.templateId, name: "", version: context.templateVersion, capabilityVersion: "", capabilities: [], buildCommand: "", previewCommand: "", installCommand: "", baselineScreenshots: { mobile: "", desktop: "" }, knownDifferences: [], unsupportedInteractions: [], adapterEntryPoint: "" },
      workspacePath: context.workspacePath
    });
  }

  async compile(): Promise<CompilerResult> {
    const warnings: string[] = [];
    const errors: string[] = [];
    let allChangedFiles: string[] = [];
    let combinedDiff = "";

    try {
      // Step 1: Apply deterministic template changes
      const adapterResult = await this.adapter.apply();
      allChangedFiles = adapterResult.changedFiles;
      combinedDiff = adapterResult.diff;
      warnings.push(...adapterResult.warnings);
    } catch (error) {
      if (error instanceof TemplateAdapterError) {
        if (error.code === "UNSUPPORTED_COMPONENT") {
          warnings.push(`Unsupported component will need agent task: ${error.componentId}`);
        } else {
          errors.push(`Template adapter error: ${error.message}`);
        }
      } else {
        errors.push(`Unexpected adapter error: ${error}`);
      }
    }

    // Step 2: Create agent tasks for custom requirements
    const agentTasks = this.createAgentTasks();
    const agentResults: AgentTaskResult[] = [];

    for (const task of agentTasks) {
      const result = await this.executeAgentTask(task);
      agentResults.push(result);
      if (result.success) {
        allChangedFiles.push(...result.changedFiles);
        combinedDiff += "\n" + result.diff;
      } else {
        errors.push(`Agent task ${task.id} failed: ${result.error}`);
      }
    }

    return {
      success: errors.length === 0,
      changedFiles: allChangedFiles,
      diff: combinedDiff,
      agentTasks: agentResults,
      warnings,
      errors
    };
  }

  private createAgentTasks(): AgentTask[] {
    const tasks: AgentTask[] = [];

    for (const req of this.context.spec.customRequirements) {
      if (req.status === "requires-agent" || req.status === "requires-image-tool") {
        const component = this.context.spec.components.find(c => c.id === req.target);
        if (!component) continue;

        tasks.push({
          id: `task_${req.id}`,
          type: req.status === "requires-image-tool" ? "image" : "code",
          requirementId: req.id,
          instruction: req.instruction,
          targetComponent: req.target,
          allowedFiles: this.getAllowedFilesForComponent(component),
          context: {
            specFragment: this.createSpecFragment(component),
            templateFiles: this.getTemplateFilesForComponent(component),
            currentWorkspace: this.context.workspacePath
          }
        });
      }
    }

    return tasks;
  }

  private getAllowedFilesForComponent(component: Component): string[] {
    const baseFiles = [
      `src/components/${component.type}/${component.id}.tsx`,
      `src/components/${component.type}/${component.id}.css`,
      `src/data/${component.type}/${component.id}.json`
    ];

    switch (component.type) {
      case "hero":
        return [...baseFiles, "src/components/hero/Hero.tsx", "src/styles/hero.css"];
      case "event":
        return [...baseFiles, "src/components/event/EventCard.tsx", "src/styles/event.css"];
      case "gallery":
        return [...baseFiles, "src/components/gallery/Gallery.tsx", "src/styles/gallery.css"];
      case "rsvp":
        return [...baseFiles, "src/components/rsvp/RSVP.tsx", "src/styles/rsvp.css"];
      case "music":
        return [...baseFiles, "src/components/music/MusicPlayer.tsx", "src/styles/music.css"];
      default:
        return baseFiles;
    }
  }

  private getTemplateFilesForComponent(component: Component): string[] {
    return this.getAllowedFilesForComponent(component);
  }

  private createSpecFragment(component: Component): InvitationSpec {
    const data = component.data as Record<string, unknown>;
    const assetIds = (data.assetIds as string[]) || [];
    const assetId = data.assetId as string | undefined;
    const imageAssetId = data.imageAssetId as string | undefined;
    const personIds = (data.personIds as string[]) || [];
    const venueId = data.venueId as string | undefined;

    const relatedAssets = this.context.spec.assets.filter(a =>
      assetIds.includes(a.id) || assetId === a.id || imageAssetId === a.id
    );

    const relatedPeople = this.context.spec.people.filter(p =>
      personIds.includes(p.id)
    );

    const relatedVenues = this.context.spec.venues.filter(v =>
      venueId === v.id
    );

    return {
      ...this.context.spec,
      components: [component],
      assets: relatedAssets,
      people: relatedPeople,
      venues: relatedVenues,
      designRequests: this.context.spec.designRequests.filter(d =>
        d.target === component.id || d.target === "global"
      ),
      customRequirements: this.context.spec.customRequirements.filter(c => c.target === component.id)
    };
  }

  private async executeAgentTask(task: AgentTask): Promise<AgentTaskResult> {
    // In a real implementation, this would call the coding agent
    // For now, we simulate the agent task execution
    await new Promise(r => setTimeout(r, 100));

    return {
      taskId: task.id,
      success: true,
      changedFiles: [],
      diff: `// Agent task ${task.id}: ${task.instruction}\n// Would modify: ${task.allowedFiles.join(", ")}`,
      logs: [`Started task ${task.id}`, `Instruction: ${task.instruction}`, `Completed task ${task.id}`]
    };
  }
}

export async function compileInvitation(context: CompilerContext): Promise<CompilerResult> {
  const compiler = new InvitationCompiler(context);
  return compiler.compile();
}