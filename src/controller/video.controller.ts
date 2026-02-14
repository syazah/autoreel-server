import type { NextFunction, Response, Request } from "express";
import AppError from "../config/AppError.js";
import httpStatus from "http-status";
import { PlanDB } from "../db/plan.db.js";
import { buildScriptPrompt } from "../prompts/scripts.prompt.js";
import { GroqClient } from "../config/groq/client.js";

const planDB = PlanDB.getInstance()
const grokClient = GroqClient.getInstance()
export const handleGenerateScriptForVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers.userId as string
        const { date } = req.body as { date: string }
        if (!date) {
            return next(new AppError("Date is required", httpStatus.BAD_REQUEST))
        }
        const videoPlan = await planDB.getPlanForUserOnDate(userId, date)
        if (!videoPlan) {
            return next(new AppError("No plan found for the given date", httpStatus.NOT_FOUND))
        }
        const prompt = buildScriptPrompt(videoPlan)

        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")
        res.flushHeaders()

        for await (const chunk of grokClient.getCompletionStreams(prompt)) {
            if (chunk) {
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            }
        }
        res.write(`data: [DONE]\n\n`)
        res.end()
    } catch (error) {
        if (res.headersSent) {
            res.end()
            return
        }
        return next(error)
    }
}