import { InvitationSpec, JobId, TemplateId, AttemptNumber, ComponentId } from "@invitestory/contracts";
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
export declare class CompilerError extends Error {
    code: string;
    recoverable: boolean;
    constructor(message: string, code: string, recoverable?: boolean);
}
export declare class InvitationCompiler {
    private context;
    private adapter;
    constructor(context: CompilerContext);
    compile(): Promise<CompilerResult>;
    private createAgentTasks;
    private getAllowedFilesForComponent;
    private getTemplateFilesForComponent;
    private createSpecFragment;
    private executeAgentTask;
}
export declare function compileInvitation(context: CompilerContext): Promise<CompilerResult>;
//# sourceMappingURL=index.d.ts.map