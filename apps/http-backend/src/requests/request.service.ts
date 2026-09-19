import { prisma } from "@repo/db"
import { AppError } from "../utils/AppError.js"


export class RequestService {

    static async sendRequest(currentUserId: string, targetUsername: string, message?: string) {

        // find if the target user exists
        const targetUser = await prisma.user.findUnique({
            where: { username: targetUsername },
            select: {
                id: true,
            }
        })

        if (!targetUser) {
            throw new AppError(404, "User not found");
        }

        if (currentUserId === targetUser.id) {
            throw new AppError(400, "Cannot send chat request to yourself");
        }

        // check if they are already friends
        const existingConverstation = await prisma.conversation.findFirst({
            where: {
                type: "DM",
                AND: [
                    { member: { some: { userId: currentUserId } } }, // some => at least one member
                    { member: { some: { userId: targetUser.id } } }
                ]
            }
        })

        if (existingConverstation) {
            throw new AppError(409, "Already connected to this user");
        }

        const existingRequest = await prisma.chatRequest.findFirst({
            where: {
                senderId: targetUser.id,
                receiverId: currentUserId,
                status: "PENDING",
            }
        })

        if (existingRequest) {
            const acceptRequest = await prisma.$transaction(async (tx) => {
                // create new conversation and add both user ans their member
                const conversation = await tx.conversation.create({
                    data: {
                        type: "DM",
                        member: {
                            create: [
                                { userId: currentUserId },
                                { userId: targetUser.id },
                            ]
                        }
                    }
                })

                await tx.chatRequest.delete({
                    where: { id: existingRequest.id }
                });

                return {
                    status: "ACCEPTED",
                    conversationId: conversation.id,
                };
            });

            return acceptRequest;
        }

        const firstRequestExist = await prisma.chatRequest.findFirst({
            where: {
                senderId: currentUserId,
                receiverId: targetUser.id,
                status: "PENDING"
            }
        })

        if (firstRequestExist) {
            throw new AppError(409, "Chat request already sent");
        }

        const request = await prisma.chatRequest.create({
            data: {
                senderId: currentUserId,
                receiverId: targetUser.id,
                status: "PENDING",
                message: message?.trim() || null,
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                message: true
            }
        });

        return {
            status: "PENDING",
            request
        };
    }
}