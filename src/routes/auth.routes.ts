import { Router } from "express";
import { handleGoogleAuth, handleGetUserData, handleRefreshToken } from "../controller/auth.controller.js";
import { handleUserAccessToken } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/google", handleGoogleAuth);
authRouter.get("/user", handleUserAccessToken, handleGetUserData);
authRouter.post("/refresh", handleRefreshToken);

export { authRouter };
