import type { NextFunction, Request, Response } from "express";
import AppError from "../config/AppError.js";
import httpStatus from "http-status";
import { JWTService } from "../services/JWTService.js";
const jwtService = JWTService.getInstance();

export const handleUserAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization?.split(" ")[1];
        if (!accessToken) {
            throw new AppError("Missing access token", httpStatus.BAD_REQUEST);
        }
        const verifiedToken = await jwtService.verifyAccessToken(accessToken);
        if (!verifiedToken) {
            throw new AppError("Access token could not be verified", httpStatus.UNAUTHORIZED);
        }
        req.headers.userId = (verifiedToken as any).userId
        return next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        } else if (error instanceof Error) {
            return next(new AppError(error.message, httpStatus.UNAUTHORIZED));
        } else {
            return next(new AppError("Something went wrong", httpStatus.UNAUTHORIZED));
        }
    }
}

