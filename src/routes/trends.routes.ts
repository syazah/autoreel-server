import { Router } from "express";
import { handleGetTrends } from "../controller/trends.controller.js";

const trendsRouter = Router();

trendsRouter.route("/").post(handleGetTrends)

export { trendsRouter }