import { Router } from "express"
import { authRouter } from "./routes/auth.routes.js"
import { projectRouter } from "./routes/project.routes.js"
const routes = Router()

routes.use("/auth", authRouter)
routes.use("/project", projectRouter)
export default routes