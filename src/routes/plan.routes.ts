import { Router } from "express";
import { handleGetPlansController, handlePlanController } from "../controller/plan.controller.js";
import { handleUserAccessToken } from "../middlewares/auth.middleware.js";

const planRouter = Router();

planRouter.route("/").post(handleUserAccessToken, handlePlanController)
planRouter.route("/date").post(handleUserAccessToken, handleGetPlansController)

export { planRouter };