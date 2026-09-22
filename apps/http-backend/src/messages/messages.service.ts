import { prisma } from "@repo/db";
import { AppError } from "../utils/AppError.js";

export class MessageService {

    static async editMessage(messageId: string, userId: string, content: string) {

        // find if the message exists
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            select: {
                id: true,
                senderId: true,
                expiresAt: true,
            }
        });

        if (!message) {
            throw new AppError(404, "Message not found");
        }

        // check if user is the sender
        if (message.senderId !== userId) {
            throw new AppError(403, "You can only edit your own messages");
        }

        // check if message is expired
        if (message.expiresAt && message.expiresAt < new Date()) {
            throw new AppError(400, "Cannot edit an expired message");
        }

        // update the message
        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { content },
            select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                lifespan: true,
                expiresAt: true,
                sender: {
                    select: {
                        id: true,
                        username: true,
                        avatarType: true,
                        avatarUrl: true,
                    }
                }
            }
        });

        return updatedMessage;
    }
}
