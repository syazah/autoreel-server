import { Router } from "express"
import { handleUserAccessToken } from "../middlewares/auth.middleware.js"
import { handleGenerateScriptForVideo } from "../controller/video.controller.js"

const videoRouter = Router()

videoRouter.route("/script").post(handleUserAccessToken, handleGenerateScriptForVideo)

export { videoRouter }