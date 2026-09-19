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

        return res.status(200).json({ conversation });
    }

    static async getMessages(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, "Unauthorized");
        }

        const { id } = req.params;
        if (!id || typeof id !== "string") {
            throw new AppError(400, "Conversation ID is required");
        }

        const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined; // bookmark to the last message
        const limitParam = req.query.limit ? parseInt(req.query.limit as string, 10) : 20; // parsing the limit (default: 20)
        const limit = isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), 50); // safetyp check ( 1 <= limit >= 50)

        const messages = await ConversationService.getMessages(id, userId, cursor, limit);

        return res.status(200).json({ messages });
    }
}