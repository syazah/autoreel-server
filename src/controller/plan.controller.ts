import type { NextFunction, Request, Response } from "express";
import { PlanRequestBody } from "../types/plan.js";
import AppError from "../config/AppError.js";
import httpStatus from "http-status";
import { TrendsService } from "../services/TrendsService.js";

const trendsService = TrendsService.getInstance();
export const handlePlanController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedBody = PlanRequestBody.safeParse(req.body);
        if (!parsedBody.success) {
            return next(new AppError("Invalid request body", httpStatus.BAD_REQUEST));
        }
        const frequency = parsedBody.data.frequency
        const categories = parsedBody.data.categories
        const trends = await trendsService.getTrends({
            regionCode: "US",
            maxResults: 50,
            categories
        })
        
        return res.status(httpStatus.OK).json({
            success: true, data: trends, message: "Plan generated successfully"
        })
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        } else if (error instanceof Error) {
            return next(new AppError(error.message, httpStatus.INTERNAL_SERVER_ERROR));
        }
        return next(new AppError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR));
    }
}