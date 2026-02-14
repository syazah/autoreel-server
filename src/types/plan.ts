import { z } from "zod";

export const PlanTopicSchema = z.object({
    title: z.string(),
    shortSummary: z.string(),
});

export const PlanResponseSchema = z.object({
    topics: z.array(PlanTopicSchema),
});

export type PlanResponse = z.infer<typeof PlanResponseSchema>;
export type PlanTopic = z.infer<typeof PlanTopicSchema>;
export const PlanResponseJsonSchema = z.toJSONSchema(PlanResponseSchema) as Record<string, unknown>;
