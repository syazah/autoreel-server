import { z } from "zod";

export const AccessPayloadSchema = z.object({
    userId: z.string(),
    type: z.literal("access"),
});
export type AccessPayload = z.infer<typeof AccessPayloadSchema>;

export const RefreshPayloadSchema = z.object({
    userId: z.string(),
    tokenVersion: z.number(),
    type: z.literal("refresh"),
});
export type RefreshPayload = z.infer<typeof RefreshPayloadSchema>;
