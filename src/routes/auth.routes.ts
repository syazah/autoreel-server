import { Router } from "express";
import { handleGoogleAuth, handleGetUserData, handleRefreshToken, handleOnboardUser } from "../controller/auth.controller.js";
import { handleUserAccessToken } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/google", handleGoogleAuth);
authRouter.get("/user", handleUserAccessToken, handleGetUserData);
authRouter.post("/refresh", handleRefreshToken);
authRouter.post("/onboard", handleUserAccessToken, handleOnboardUser);

export { authRouter };
