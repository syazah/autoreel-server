import type { NextFunction, Request, Response } from "express"
import { z } from "zod"
import AppError from "../config/AppError.js"
import httpStatus from "http-status";
import { LLMTextStoryRequestSchema } from "../types/story.js";
import type { LLMScriptFormat } from "../types/story.js";
import AppSuccess from "../config/AppSuccess.js";
import { GroqClient } from "../config/groq/client.js";
import { createStoryPromptMessages, llmScriptSchema } from "../prompts/storyPrompts.prompt.js";
import { StoryDB } from "../db/story.db.js";
import { v4 as uuidv4 } from 'uuid';
const llm = GroqClient.getInstance();
const storyDB = StoryDB.getInstance();

export const handleCreateScriptPromptController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers.userId as string;
        const parsed = LLMTextStoryRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new AppError(`Invalid request: ${parsed.error.issues.map(i => i.message).join(", ")}`, httpStatus.BAD_REQUEST));
        }
        const request = parsed.data;

        // get system prompt for the project for each project category.
        const storyPrompt = createStoryPromptMessages(request.prompt, request.projectCategory)
        // call LLM to get the prompts on the basis of response.
        const script = await llm.getStructuredCompletion<LLMScriptFormat>({ messages: storyPrompt, schema: llmScriptSchema, schemaName: "video_script" });
        // update the story in DB
        const story = await storyDB.createStory(
            userId,
            request.projectId,
            {
                id: uuidv4(),
                script,
            }
        );
        return new AppSuccess(res, httpStatus.OK, { story }, "LLM Text processed successfully").returnResponse();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error)
        } else if (error instanceof Error) {
            return next(new AppError(error.message, httpStatus.INTERNAL_SERVER_ERROR))
        }
        return next(new AppError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR))
    }
}

const GetScriptsQuery = z.object({ projectId: z.string() });

export const handleGetScriptsPromptController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers.userId as string;
        const parsed = GetScriptsQuery.safeParse(req.query);
        if (!parsed.success) {
            return next(new AppError("projectId query parameter is required", httpStatus.BAD_REQUEST));
        }
        if (!userId) {
            return next(new AppError("userId is required", httpStatus.BAD_REQUEST));
        }
        const { projectId } = parsed.data;
        const stories = await storyDB.getAllStoriesByProjectId(userId, projectId);
        return new AppSuccess(res, httpStatus.OK, { stories }, "Stories fetched successfully").returnResponse();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error)
        } else if (error instanceof Error) {
            return next(new AppError(error.message, httpStatus.INTERNAL_SERVER_ERROR))
        }
        return next(new AppError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR))
    }
}
