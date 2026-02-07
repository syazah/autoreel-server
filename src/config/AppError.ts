import httpStatus from "http-status";

class AppError extends Error {
    public status: number;
    public message: string;
    constructor(message: string, status: number = httpStatus.INTERNAL_SERVER_ERROR) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
export default AppError;