import type { NextFunction, Request, Response } from "express";
import AppError from "../config/AppError.js";
import httpStatus from "http-status";
import type { Project } from "../types/project.js";
import { ProjectDB } from "../db/project.db.js";
import AppSuccess from "../config/AppSuccess.js";

const projectDB = ProjectDB.getInstance();
export const handleCreateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers.userId as string;
        const body = req.body as Project;
        const project = await projectDB.createProject(userId, body);
        return new AppSuccess(res, httpStatus.CREATED, { project }, "Project created successfully").returnResponse();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error)
        } else if (error instanceof Error) {
            return next(new AppError(error.message, httpStatus.INTERNAL_SERVER_ERROR))
        } else {
            return next(new AppError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR))
        }
    }
}