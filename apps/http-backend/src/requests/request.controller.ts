import type { Request, Response } from "express";
import { RequestService } from "./request.service.js";
import { requestSchema } from "@repo/common";
import { AppError } from "../utils/AppError.js";



export class RequestController {

    static async createRequest(req: Request, res: Response) {
        const parsedData = requestSchema.safeParse(req.body);
        if (!parsedData.success) {
            const message = parsedData.error.issues[0]?.message || "Invalid inputs";
            throw new AppError(400, message);
        }

        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, "Unauthorized");
        }

        const { username, message } = parsedData.data;
        const request = await RequestService.sendRequest(userId, username, message);

        if (request.status === "ACCEPTED") {
            return res.status(200).json({
                message: "Chat request accepted",
                ...request
            });
        }

        return res.status(201).json({
            message: "Chat request sent successfully",
            ...request
        });
    }

    static async incomingRequest(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, "Unauthorized");
        }

        const request = await RequestService.getIncomingRequest(userId);

        return res.status(200).json({ request });
    }

    static async outgoingRequest(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, "Unauthorized");
        }

        const request = await RequestService.getOutgoingRequest(userId);

        return res.status(200).json({ request });
    }

    static async acceptRequest(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, "Unauthorized");
        }

        const { id } = req.params;
        if (!id || typeof id !== "string") {
            throw new AppError(400, "Request ID is required");
        }

        const result = await RequestService.acceptRequest(id, userId);

        return res.status(200).json({
            message: "Chat request accepted",
            ...result
        });
    }

    static async rejectRequest(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, "Unauthorized");
        }

        const { id } = req.params;
        if (!id || typeof id !== "string") {
            throw new AppError(400, "Request ID is required");
        }

        const result = await RequestService.rejectRequest(id, userId);

        return res.status(200).json(result);
    }
}