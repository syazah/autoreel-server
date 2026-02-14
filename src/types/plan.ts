import { VideoCategoriesSchema, type VideoCategory } from "./video.js";
import { z } from "zod";

export const PlanRequestBody = z.object({
    frequency: z.number().positive(),
    categories: z.array(VideoCategoriesSchema)
})

export type PlanRequestBodySchema = z.infer<typeof PlanRequestBody>