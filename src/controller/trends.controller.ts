import type { NextFunction, Request, Response } from "express";
import AppError from "../config/AppError.js";
import httpStatus from "http-status";
import { TrendsService } from "../services/TrendsService.js";
import { TrendsRequestSchema } from "../types/trends.js";
import AppSuccess from "../config/AppSuccess.js";

const trendsService = TrendsService.getInstance();
export const handleGetTrends = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = TrendsRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        return next(new AppError("Missing or invalid trends request", httpStatus.BAD_REQUEST));
    }
    try {
        const trends = await trendsService.getTrends(parsed.data);
        return new AppSuccess(res, httpStatus.OK, { trends }, "Trends fetched successfully").returnResponse();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        } else if (error instanceof Error) {
            return next(new AppError(error.message, httpStatus.INTERNAL_SERVER_ERROR));
        }
        return next(new AppError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR));
    }

}
