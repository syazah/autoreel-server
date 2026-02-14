import { Router } from "express";
import { handlePlanController } from "../controller/plan.controller.js";

const planRouter = Router();

planRouter.route("/").post(handlePlanController)

export { planRouter };