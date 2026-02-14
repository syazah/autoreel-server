import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { admin } from "../config/firebase/firebase.js";
import AppError from "../config/AppError.js";
import httpStatus from "http-status";
import AppSuccess from "../config/AppSuccess.js";
import { JWTService } from "../services/JWTService.js";
import { UserDB } from "../db/user.db.js";


const jwtService = JWTService.getInstance();
const userDB = UserDB.getInstance();

const GoogleAuthBody = z.object({ idToken: z.string() });
const RefreshTokenBody = z.object({ refreshToken: z.string() });
const OnboardBody = z.object({ frequency: z.number() });

export const handleGoogleAuth = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = GoogleAuthBody.safeParse(req.body);
    if (!parsed.success) {
        return next(new AppError("Missing or invalid idToken", httpStatus.UNAUTHORIZED));
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
            user = await userDB.createUser({ uid, username: username || "", phoneNumber: phoneNumber || "", profilePicture: profilePicture || "", name: name || "", version: 0, isOnboarded: false });
        }

        const accessToken = jwtService.signAccessToken(uid);
        const refreshToken = jwtService.signRefreshToken(uid, user.version)
        return new AppSuccess(res, httpStatus.OK, { accessToken, refreshToken, user }, "User authenticated successfully").returnResponse();
    } catch (error) {
        console.error("Auth error:", error);
        return next(new AppError("Invalid token", httpStatus.UNAUTHORIZED));
    }
}

export const handleRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = RefreshTokenBody.safeParse(req.body);
    if (!parsed.success) {
        return next(new AppError("Missing or invalid refresh token", httpStatus.UNAUTHORIZED));
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
        const user = await userDB.getUserOrNull(userId);
        if (!user) {
            throw new AppError("User not found", httpStatus.NOT_FOUND);
        }
        return new AppSuccess(res, httpStatus.OK, { user }, "User data fetched successfully").returnResponse();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        } else if (error instanceof Error) {
            return next(new AppError(error.message, httpStatus.INTERNAL_SERVER_ERROR));
        }
        return next(new AppError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR));
    }
}

export const handleOnboardUser = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = OnboardBody.safeParse(req.body);
    if (!parsed.success) {
        return next(new AppError("Missing or invalid frequency", httpStatus.BAD_REQUEST));
    }
    try {
        const userId = req.headers.userId as string;
        await userDB.updateUser(userId, { frequency: parsed.data.frequency, isOnboarded: true });
        return new AppSuccess(res, httpStatus.OK, null, "User onboarded successfully").returnResponse();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        } else if (error instanceof Error) {
            return next(new AppError(error.message, httpStatus.INTERNAL_SERVER_ERROR));
        }
        return next(new AppError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR));
    }
}
