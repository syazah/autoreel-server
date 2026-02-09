import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat.mjs";
import type { ProjectCategory } from "./project.js";

export type HookType =
    | "question"
    | "shocking_fact"
    | "mistake"
    | "relatable_statement"
    | "story_start";

export interface StructuredCompletionOptions<T> {
    messages: ChatCompletionMessageParam[];
    schema: any;
    schemaName: string;
}

export interface LLMTextStoryRequest {
    projectId: string;
    projectCategory: ProjectCategory;
    prompt: string;
}

export interface LLMScriptFormat {
    title: string;
    intent: string;
    hook: Hook;
    message: CoreMessage;
    segments: ScriptSegment[];
    hashtags: string[];
    estimated_total_duration: number;
}
export interface ScriptSegment {
    order: number;
    narration: string;
    visual_idea: string;
    image_prompt_seed: string;
}

export interface Hook {
    text: string;
    type: HookType;
}

export interface CoreMessage {
    main_message: string;
    problem: string;
    resolution: string;
    takeaway: string;
}