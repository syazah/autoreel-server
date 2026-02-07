import { Router } from "express"
import authRouter from "./routes/auth.routes.js"

const routes = Router()

routes.use("/auth", authRouter)

export default routes