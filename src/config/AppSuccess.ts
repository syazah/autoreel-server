import type { Response } from "express";

class AppSuccess {
    private status: number;
    private data: any;
    private message: string;
    private res: Response
    constructor(res: Response, status: number, data?: any, message?: string) {
        this.res = res;
        this.status = status;
        this.data = data || {};
        this.message = message || "Success";
    }

    public returnResponse() {
        return this.res.status(this.status).json({ success: true, data: this.data, message: this.message });
    }
}

export default AppSuccess;