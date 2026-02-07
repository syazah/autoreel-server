import type { Request, Response } from "express";
import { admin } from "../config/firebase/firebase.js";
import AppError from "../config/AppError.js";
import httpStatus from "http-status";
import AppSuccess from "../config/AppSuccess.js";
import { JWTService } from "../services/JWTService.js";
import { UserDB } from "../db/user.db.js";

const jwtService = JWTService.getInstance();
const userDB = UserDB.getInstance();

export const handleGoogleAuth = async (req: Request, res: Response) => {
    const { idToken } = req.body;
    if (!idToken) {
        throw new AppError("Missing idToken", httpStatus.BAD_REQUEST);
        return;
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const username = decodedToken.email
        const phoneNumber = decodedToken.phone_number
        const profilePicture = decodedToken.picture

        let user = await userDB.getUserOrNull(uid);
        if (user === null) {
            user = await userDB.createUser({ uid, username: username || "", phoneNumber: phoneNumber || "", profilePicture: profilePicture || "", version: 0 });
        }

        const accessToken = jwtService.signAccessToken(uid);
        const refreshToken = jwtService.signRefreshToken(accessToken, user.version)
        return new AppSuccess(res, httpStatus.OK, { accessToken, refreshToken, user }, "User authenticated successfully").returnResponse();
    } catch (error) {
        console.error("Auth error:", error);
        throw new AppError("Invalid token", httpStatus.INTERNAL_SERVER_ERROR);
    }
}