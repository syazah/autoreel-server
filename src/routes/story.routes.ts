import { Router } from "express"
import { handleCreateScriptPromptController, handleGetScriptsPromptController } from "../controller/story.controller.js"
import { handleUserAccessToken } from "../middlewares/auth.middleware.js"

const storyRouter = Router()

storyRouter.route("/prompt").post(handleUserAccessToken, handleCreateScriptPromptController).get(handleUserAccessToken, handleGetScriptsPromptController)

export { storyRouter }
