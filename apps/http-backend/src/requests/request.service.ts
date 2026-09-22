import { prisma } from "@repo/db"
import { AppError } from "../utils/AppError.js"


export class RequestService {

    private static async createConversation(requestId: string, user1Id: string, user2Id: string) {
        return await prisma.$transaction(async (tx) => {
            const conversation = await tx.conversation.create({
                data: {
                    type: "DM",
                    member: {
                        create: [
                            { userId: user1Id },
                            { userId: user2Id },
                        ]
                    }
                }
            });

            await tx.chatRequest.delete({
                where: { id: requestId }
            });

            return {
                status: "ACCEPTED",
                conversationId: conversation.id,
            };
        });
    }

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
            return await this.createConversation(
                existingRequest.id,
                currentUserId,
                targetUser.id
            );
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

    static async getIncomingRequest(userId: string) {

        const requests = await prisma.chatRequest.findMany({
            where: { receiverId: userId, status: "PENDING" },
            select: {
                id: true,
                message: true,
                createdAt: true,
                sender: {
                    select: {
                        id: true,
                        username: true,
                        avatarType: true,
                        avatarUrl: true,
                    }
                }
            }
        })
        return requests;
    }

    static async getOutgoingRequest(userId: string) {

        const requests = await prisma.chatRequest.findMany({
            where: { senderId: userId, status: "PENDING" },
            select: {
                id: true,
                message: true,
                createdAt: true,
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        avatarType: true,
                        avatarUrl: true,
                    }
                }
            }
        })
        return requests;
    }

    static async acceptRequest(requestId: string, currentUserId: string) {

        const request = await prisma.chatRequest.findUnique({
            where: { id: requestId },
        })

        if (!request) {
            throw new AppError(404, "Request not found");
        }

        if (request.receiverId !== currentUserId) {
            throw new AppError(403, "Not authorized to accept this request");
        }

        if (request.status !== "PENDING") {
            throw new AppError(400, "Request is not pending");
        }

        return await this.createConversation(
            request.id,
            currentUserId,
            request.senderId
        );
    }

    static async rejectRequest(requestId: string, currentUserId: string) {
        const request = await prisma.chatRequest.findUnique({
            where: { id: requestId },
        })

        if (!request) {
            throw new AppError(404, "Request not found");
        }

        if (request.receiverId !== currentUserId) {
            throw new AppError(403, "Not authorized to reject this request");
        }

        if (request.status !== "PENDING") {
            throw new AppError(400, "Request is not pending");
        }

        await prisma.chatRequest.delete({
            where: { id: requestId },
        })

        return { message: "Chat request rejected" }
    }
}