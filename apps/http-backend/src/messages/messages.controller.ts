import type { Request, Response } from "express";
import { editMessageSchema } from "@repo/common";
import { AppError } from "../utils/AppError.js";
import { MessageService } from "./messages.service.js";

export class MessageController {
    static async editMessage(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, "Unauthorized");
        }

        const { id } = req.params;
        if (!id || typeof id !== "string") {
            throw new AppError(400, "Message ID is required");
        }

        const parsedData = editMessageSchema.safeParse(req.body);
        if (!parsedData.success) {
            const message = parsedData.error.issues[0]?.message || "Invalid input";
            throw new AppError(400, message);
        }

        const { content } = parsedData.data;
        const updatedMessage = await MessageService.editMessage(id, userId, content);

        return res.status(200).json({
            message: "Message updated successfully",
            updatedMessage,
        });
    }
}
