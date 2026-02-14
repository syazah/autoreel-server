import { z } from "zod";

export const VideoCategoriesSchema = z.enum(["Music", "Gaming", "Entertainment", "News", "Science", "Sports", "Education", "Comedy", "People"]);
export type VideoCategory = z.infer<typeof VideoCategoriesSchema>;
