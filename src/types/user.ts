import { z } from "zod";

export const UserDataSchema = z.object({
    uid: z.string(),
    username: z.string(),
    phoneNumber: z.string(),
    profilePicture: z.string(),
    version: z.number(),
    name: z.string(),
    frequency: z.number().optional(),
    isOnboarded: z.boolean().optional(),
});

export type UserData = z.infer<typeof UserDataSchema>;
