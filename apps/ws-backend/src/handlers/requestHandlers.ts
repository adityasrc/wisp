import type { RespondRequestPayload, SendRequestPayload } from "../types.js";
import { prisma } from "@repo/db";
import { userManager } from "../userManager.js";
import { SERVER_EVENTS } from "../event.js";


export async function handleSendRequest(userId: string, payload: SendRequestPayload) {
    if (!userId) {
        return;
    }

    // find if target user exists
    const targetUser = await prisma.user.findUnique({
        where: { username: payload.username },
        select: {
            id: true,
            username: true,
        }
    });

    if (!targetUser) {
        userManager.sendToUser(userId, {
            type: SERVER_EVENTS.ERROR,
            payload: { message: "User not found" }
        });
        return;
    }

    if (targetUser.id === userId) {
        userManager.sendToUser(userId, {
            type: SERVER_EVENTS.ERROR,
            payload: { message: "Cannot send chat request to yourself" }
        });
        return;
    }

    // check if they are already friends (DM exists)
    const existingConversation = await prisma.conversation.findFirst({
        where: {
            type: "DM",
            AND: [
                { member: { some: { userId } } },
                { member: { some: { userId: targetUser.id } } }
            ]
        }
    });

    if (existingConversation) {
        userManager.sendToUser(userId, {
            type: SERVER_EVENTS.ERROR,
            payload: { message: "You are already in a conversation with this user" }
        });
        return;
    }

    // check for reverse request (mutual interest -> auto-accept)
    const reverseRequest = await prisma.chatRequest.findFirst({
        where: {
            senderId: targetUser.id,
            receiverId: userId,
            status: "PENDING"
        }
    });

    if (reverseRequest) {
        // create DM conversation and delete pending request
        const conversation = await prisma.$transaction(async (tx) => {
            const conv = await tx.conversation.create({
                data: {
                    type: "DM",
                    member: {
                        create: [
                            { userId },
                            { userId: targetUser.id }
                        ]
                    }
                }
            });

            await tx.chatRequest.delete({
                where: { id: reverseRequest.id }
            });

            return conv;
        });

        userManager.sendToUser(userId, {
            type: SERVER_EVENTS.REQUEST_ACCEPTED,
            payload: { conversationId: conversation.id }
        });

        userManager.sendToUser(targetUser.id, {
            type: SERVER_EVENTS.REQUEST_ACCEPTED,
            payload: { conversationId: conversation.id }
        });

        return;
    }

    // check if request is already sent
    const existingRequest = await prisma.chatRequest.findFirst({
        where: {
            senderId: userId,
            receiverId: targetUser.id,
            status: "PENDING"
        }
    });

    if (existingRequest) {
        userManager.sendToUser(userId, {
            type: SERVER_EVENTS.ERROR,
            payload: { message: "Chat request already sent" }
        });
        return;
    }

    // create new chat request in database
    const newRequest = await prisma.chatRequest.create({
        data: {
            senderId: userId,
            receiverId: targetUser.id,
            message: payload.message || null,
        },
        include: {
            sender: {
                select: {
                    username: true,
                    avatarType: true,
                    avatarUrl: true,
                }
            }
        }
    });

    userManager.sendToUser(targetUser.id, {
        type: SERVER_EVENTS.REQUEST_RECEIVED,
        payload: newRequest
    });
}

export async function handleRespondRequest(userId: string, payload: RespondRequestPayload) {
    if (!userId) {
        return;
    }

    // find if request exists and belongs to this receiver
    const request = await prisma.chatRequest.findUnique({
        where: { id: payload.requestId },
    });

    if (!request || request.receiverId !== userId || request.status !== "PENDING") {
        userManager.sendToUser(userId, {
            type: SERVER_EVENTS.ERROR,
            payload: { message: "Request not found or already processed" }
        });
        return;
    }

    if (payload.action === "ACCEPT") {
        // create DM conversation and remove the request in a transaction
        const conversation = await prisma.$transaction(async (tx) => {
            const conv = await tx.conversation.create({
                data: {
                    type: "DM",
                    member: {
                        create: [
                            { userId: request.senderId },
                            { userId: request.receiverId }
                        ]
                    }
                }
            });

            await tx.chatRequest.delete({
                where: { id: payload.requestId }
            });

            return conv;
        });

        userManager.sendToUser(request.senderId, {
            type: SERVER_EVENTS.REQUEST_ACCEPTED,
            payload: { conversationId: conversation.id }
        });
        userManager.sendToUser(request.receiverId, {
            type: SERVER_EVENTS.REQUEST_ACCEPTED,
            payload: { conversationId: conversation.id }
        });

        return;
    }

    if (payload.action === "REJECT") {
        // delete the request from database
        await prisma.chatRequest.delete({
            where: { id: payload.requestId }
        });

        // notify the sender that their request was rejected
        userManager.sendToUser(request.senderId, {
            type: SERVER_EVENTS.REQUEST_REJECTED,
            payload: { requestId: payload.requestId }
        });

        return;
    }
}
