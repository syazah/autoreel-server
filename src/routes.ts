import { Router } from "express"
import { authRouter } from "./routes/auth.routes.js"
import { trendsRouter } from "./routes/trends.routes.js"
const routes = Router()

routes.use("/auth", authRouter)
routes.use("/trends", trendsRouter)
export default routes
