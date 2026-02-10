import { z } from "zod";

export const ProjectCategorySchema = z.enum(["Children", "Informative", "Fiction"]);
export type ProjectCategory = z.infer<typeof ProjectCategorySchema>;

export const ProjectSchema = z.object({
    name: z.string(),
    frequency: z.number(),
    category: ProjectCategorySchema,
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectWithIdSchema = ProjectSchema.extend({
    id: z.string(),
});
export type ProjectWithId = z.infer<typeof ProjectWithIdSchema>;
