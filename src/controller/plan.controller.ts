import type { NextFunction, Request, Response } from "express";
import { PlanResponseJsonSchema, type PlanResponse } from "../types/plan.js";
import AppError from "../config/AppError.js";
import httpStatus from "http-status";
import { TrendsService } from "../services/TrendsService.js";
import { GroqClient } from "../config/groq/client.js";
import { buildWeekPlanMessages } from "../prompts/plan.prompt.js";
import { UserDB } from "../db/user.db.js";
import AppSuccess from "../config/AppSuccess.js";
import { PlanDB } from "../db/plan.db.js";

const trendsService = TrendsService.getInstance();
const groqClient = GroqClient.getInstance();
const userDB = UserDB.getInstance();
const planDB = PlanDB.getInstance();

export const handlePlanController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers.userId as string;
        const user = await userDB.getUserOrNull(userId);
        if (!user) {
            return next(new AppError("User Not Found", httpStatus.NOT_FOUND));
        }
        let { frequency, categories } = user
        if (!categories) {
            categories = []
        }
        const trendingContent = await trendsService.getCategoryTrendVideos(categories);

        const messages = buildWeekPlanMessages(frequency || 1, categories, trendingContent);

        const plan = await groqClient.getStructuredCompletion<PlanResponse>({
            messages,
            schema: PlanResponseJsonSchema,
            schemaName: "WeeklyContentPlan",
        });
        await planDB.updateCompletePlan(userId, plan)
        return new AppSuccess(
            res,
            httpStatus.OK,
            { plan },
            "Plan Generated Successfully",
        ).returnResponse();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        } else if (error instanceof Error) {
            return next(new AppError(error.message, httpStatus.INTERNAL_SERVER_ERROR));
        }
        return next(new AppError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR));
    }
}

export const handleGetPlansController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers.userId as string;
        const { date } = req.body as { date: string }
        const plans = await planDB.getPlanForUserOnDate(userId, date)
        return new AppSuccess(
            res,
            httpStatus.OK,
            { plans },
            "Plans Retrieved Successfully",
        ).returnResponse();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        } else if (error instanceof Error) {
            return next(new AppError(error.message, httpStatus.INTERNAL_SERVER_ERROR));
        }
        return next(new AppError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR));
    }
}
