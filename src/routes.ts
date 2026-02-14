import { Router } from "express"
import { authRouter } from "./routes/auth.routes.js"
import { trendsRouter } from "./routes/trends.routes.js"
import { planRouter } from "./routes/plan.routes.js"
import { videoRouter } from "./routes/video.routes.js"
const routes = Router()

routes.use("/auth", authRouter)
routes.use("/trends", trendsRouter)
routes.use("/plan", planRouter)
routes.use("/video", videoRouter)


export default routes
