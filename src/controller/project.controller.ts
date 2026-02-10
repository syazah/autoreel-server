import type { NextFunction, Request, Response } from "express";
import AppError from "../config/AppError.js";
import httpStatus from "http-status";
import { ProjectSchema } from "../types/project.js";
import { ProjectDB } from "../db/project.db.js";
import AppSuccess from "../config/AppSuccess.js";
import { v4 as uuidv4 } from 'uuid';


const projectDB = ProjectDB.getInstance();
export const handleCreateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers.userId as string;
        const parsed = ProjectSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new AppError(`Invalid project data: ${parsed.error.issues.map(i => i.message).join(", ")}`, httpStatus.BAD_REQUEST));
        }
        const project = await projectDB.createProject(userId, { id: uuidv4(), ...parsed.data });
        return new AppSuccess(res, httpStatus.CREATED, { project }, "Project created successfully").returnResponse();
    } catch (error) {
        console.log(error)
        if (error instanceof AppError) {
            return next(error)
        } else if (error instanceof Error) {
            return next(new AppError(error.message, httpStatus.INTERNAL_SERVER_ERROR))
        } else {
            return next(new AppError("Something went wrong", httpStatus.INTERNAL_SERVER_ERROR))
        }
    }
}
