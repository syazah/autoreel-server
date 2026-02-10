import { z } from "zod";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat.mjs";
import { ProjectCategorySchema } from "./project.js";

export const HookTypeSchema = z.enum([
    "question",
    "shocking_fact",
    "mistake",
    "relatable_statement",
    "story_start",
]);
export type HookType = z.infer<typeof HookTypeSchema>;

export const HookSchema = z.object({
    text: z.string(),
    type: HookTypeSchema,
});
export type Hook = z.infer<typeof HookSchema>;

export const CoreMessageSchema = z.object({
    main_message: z.string(),
    problem: z.string(),
    resolution: z.string(),
    takeaway: z.string(),
});
export type CoreMessage = z.infer<typeof CoreMessageSchema>;

export const ScriptSegmentSchema = z.object({
    order: z.number(),
    narration: z.string(),
    visual_idea: z.string(),
    image_prompt_seed: z.string(),
});
export type ScriptSegment = z.infer<typeof ScriptSegmentSchema>;

export const LLMScriptFormatSchema = z.object({
    title: z.string(),
    intent: z.string(),
    hook: HookSchema,
    message: CoreMessageSchema,
    segments: z.array(ScriptSegmentSchema).min(3).max(7),
    hashtags: z.array(z.string()).min(5).max(12),
    estimated_total_duration: z.number().min(12).max(60),
});
export type LLMScriptFormat = z.infer<typeof LLMScriptFormatSchema>;

export const LLMTextStoryRequestSchema = z.object({
    projectId: z.string(),
    projectCategory: ProjectCategorySchema,
    prompt: z.string(),
});
export type LLMTextStoryRequest = z.infer<typeof LLMTextStoryRequestSchema>;

export interface StructuredCompletionOptions<T> {
    messages: ChatCompletionMessageParam[];
    schema: any;
    schemaName: string;
}
