import { Router, type Request, type Response } from "express";
import { admin } from "../config/firebase/firebase.js";
import { handleGoogleAuth } from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post("/google", handleGoogleAuth);

export default authRouter;
