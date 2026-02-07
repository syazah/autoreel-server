import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors"
import dotenv from "dotenv"
import routes from "./routes.js";
import AppError from "./config/AppError.js";
import httpStatus from "http-status";
dotenv.config()

const app = express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: 200, message: "Server is OK" });
});

app.use("/api/v1", routes)

app.use((err: Error, req: Request, res: Response) => {
    if (err instanceof AppError) {
        res.status(err.status).json({ success: false, message: err.message })
    } else {
        console.log(err)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message || "Something Went Wrong" })
    }
})

const port = process.env.PORT || 8000
app.listen(Number(port), "0.0.0.0", () => {
    console.log(`Server is started on port ${port} 🚀`)
})