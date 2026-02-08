import { Router } from 'express';
import { handleUserAccessToken } from '../middlewares/auth.middleware.js';
import { handleCreateProject } from '../controller/project.controller.js';

const projectRouter = Router()

projectRouter.route("/create").post(handleUserAccessToken, handleCreateProject)

export { projectRouter };