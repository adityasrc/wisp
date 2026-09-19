import type { Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { ConversationService } from "./conversations.service.js";





export class ConversationController {

    static async getConversations(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, "Unauthorized");
        }

        const conversations = await ConversationService.getConversations(userId);

        return res.status(200).json({ conversations });
    }

    static async getConversationById(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, "Unauthorized");
        }

        const { id } = req.params;
        if (!id || typeof id !== "string") {
            throw new AppError(400, "Conversation ID is required");
        }

        const conversation = await ConversationService.getConversationById(id, userId);

        return res.status(200).json({ conversation })
    }
}