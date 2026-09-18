export class AppError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message); // passed message to built-in Error class
        this.statusCode = statusCode;
    }
}