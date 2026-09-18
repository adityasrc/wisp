import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {

    let statusCode: number = 500;
    let message: string = "Something went wrong";

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else {
        console.log("Unhandled Error", err);
    }

    return res.status(statusCode).json({
        status: 'error',
        message
    })

}