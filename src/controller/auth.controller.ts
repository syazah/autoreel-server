import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { admin } from "../config/firebase/firebase.js";
import AppError from "../config/AppError.js";
import httpStatus from "http-status";
import AppSuccess from "../config/AppSuccess.js";
import { JWTService } from "../services/JWTService.js";
import { UserDB } from "../db/user.db.js";
import { ProjectDB } from "../db/project.db.js";


const jwtService = JWTService.getInstance();
const userDB = UserDB.getInstance();
const projectDB = ProjectDB.getInstance();

const GoogleAuthBody = z.object({ idToken: z.string() });
const RefreshTokenBody = z.object({ refreshToken: z.string() });

export const handleGoogleAuth = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = GoogleAuthBody.safeParse(req.body);
    if (!parsed.success) {
        return next(new AppError("Missing or invalid idToken", httpStatus.BAD_REQUEST));
    }
    try {
        const { idToken } = parsed.data;
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const username = decodedToken.email
        const phoneNumber = decodedToken.phone_number
        const profilePicture = decodedToken.picture
        const name = decodedToken.name
        let user = await userDB.getUserOrNull(uid);
        if (user === null) {
            user = await userDB.createUser({ uid, username: username || "", phoneNumber: phoneNumber || "", profilePicture: profilePicture || "", name: name || "", version: 0 });
        }

        const accessToken = jwtService.signAccessToken(uid);
        const refreshToken = jwtService.signRefreshToken(uid, user.version)
        return new AppSuccess(res, httpStatus.OK, { accessToken, refreshToken, user }, "User authenticated successfully").returnResponse();
    } catch (error) {
        console.error("Auth error:", error);
        return next(new AppError("Invalid token", httpStatus.INTERNAL_SERVER_ERROR));
    }
}

export const handleRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = RefreshTokenBody.safeParse(req.body);
    if (!parsed.success) {
        return next(new AppError("Missing or invalid refresh token", httpStatus.BAD_REQUEST));
    }
    try {
        const { refreshToken } = parsed.data;
        const payload = jwtService.verifyRefreshToken(refreshToken) as { userId: string; tokenVersion: number };
        const user = await userDB.getUserOrNull(payload.userId);
        if (!user) {
            throw new AppError("User not found", httpStatus.UNAUTHORIZED);
        }
        if (user.version !== payload.tokenVersion) {
            throw new AppError("Token has been revoked", httpStatus.UNAUTHORIZED);
        }
        const newAccessToken = jwtService.signAccessToken(payload.userId);
        const newRefreshToken = jwtService.signRefreshToken(payload.userId, user.version);
        return new AppSuccess(res, httpStatus.OK, { accessToken: newAccessToken, refreshToken: newRefreshToken }, "Token refreshed successfully").returnResponse();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        return next(new AppError("Invalid refresh token", httpStatus.UNAUTHORIZED));
    }
}

export const handleGetUserData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers.userId as string;
        const getProjects = req.query.getProjects === 'true';
        const user = await userDB.getUserOrNull(userId);
        let projects = null
        if (getProjects) {
            projects = await projectDB.getAllProjectsForUser(userId);
        }
        if (!user) {
            throw new AppError("User not found", httpStatus.NOT_FOUND);
        }
        return new AppSuccess(res, httpStatus.OK, { user, projects }, "User data fetched successfully").returnResponse();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        } else if (error instanceof Error) {
            return next(new AppError(error.message, httpStatus.INTERNAL_SERVER_ERROR));
        }
        return next(new AppError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR));
    }
}
