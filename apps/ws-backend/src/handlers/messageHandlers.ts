import type { EditMessagePayload, SendMessagePayload } from "../types.js";
import { prisma } from "@repo/db";
import { userManager } from "../userManager.js";
import { SERVER_EVENTS } from "../event.js";

export async function handleSendMessage(userId: string, payload: SendMessagePayload) {
    if (!userId) {
        return;
    }

    const conversationId = payload.conversationId;

    // check if user is a member of this conversation
    const membership = await prisma.conversationMember.findFirst({
        where: {
            conversationId: conversationId,
            userId: userId,
        },
        include: {
            conversation: {
                select: { isDormant: true }
            }
        }
    });

    if (!membership) {
        userManager.sendToUser(userId, {
            type: SERVER_EVENTS.ERROR,
            payload: { message: "You are not a member of this conversation" }
        });
        return;
    }

    const wasDormant = membership.conversation.isDormant;

    // set message lifespan
    let expiresAt: Date | null = null;
    if (payload.lifespan === "SENSITIVE") {
        expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    }

    // atomic transaction: save message and update conversation activity together
    const [message] = await prisma.$transaction([
        prisma.message.create({
            data: {
                conversationId: conversationId,
                senderId: userId,
                content: payload.content,
                lifespan: payload.lifespan || "NORMAL",
                expiresAt: expiresAt,
            },
            include: {
                sender: {
                    select: {
                        name: true,
                        username: true,
                        avatarType: true,
                        avatarUrl: true,
                    }
                },
                conversation: {
                    include: {
                        member: {
                            select: {
                                userId: true,
                            }
                        }
                    }
                }
            }
        }),
        prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastActivityAt: new Date(),
                isDormant: false,
            }
        })
    ]);

    // broadcast message to all active conversation members
    const recipientIds = message.conversation.member.map(m => m.userId);
    const { conversation, ...messageData } = message;

    userManager.broadcastToUsers(recipientIds, {
        type: SERVER_EVENTS.MESSAGE_NEW,
        payload: messageData,
    });

    // if conversation was dormant, notify members that it is now active
    if (wasDormant) {
        userManager.broadcastToUsers(recipientIds, {
            type: SERVER_EVENTS.CONVERSATION_REACTIVATED,
            payload: { conversationId: conversationId }
        });
    }
}


export async function handleEditMessage(userId: string, payload: EditMessagePayload) {
    if (!userId) {
        return;
    }

    const { messageId, content } = payload;

    // find if message exists
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        select: {
            id: true,
            senderId: true,
            createdAt: true,
            expiresAt: true,
        },
    });

    if (!message) {
        userManager.sendToUser(userId, {
            type: SERVER_EVENTS.ERROR,
            payload: { message: "Message not found" }
        });
        return;
    }

    // check if user is the sender
    if (message.senderId !== userId) {
        userManager.sendToUser(userId, {
            type: SERVER_EVENTS.ERROR,
            payload: { message: "You can only edit your own messages" }
        });
        return;
    }

    // check if 15-minute edit window has expired
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
        userManager.sendToUser(userId, {
            type: SERVER_EVENTS.ERROR,
            payload: { message: "Messages can only be edited within 15 minutes of sending" }
        });
        return;
    }

    // check if sensitive message is expired
    if (message.expiresAt && message.expiresAt < new Date()) {
        userManager.sendToUser(userId, {
            type: SERVER_EVENTS.ERROR,
            payload: { message: "Cannot edit an expired message" }
        });
        return;
    }

    // update message content and fetch conversation members in one query
    const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { content: content },
        include: {
            sender: {
                select: {
                    name: true,
                    username: true,
                    avatarType: true,
                    avatarUrl: true,
                }
            },
            conversation: {
                include: {
                    member: {
                        select: {
                            userId: true,
                        }
                    }
                }
            }
        }
    });

    // broadcast edited message to all active conversation members
    const recipientIds = updatedMessage.conversation.member.map(m => m.userId);
    const { conversation, ...messageData } = updatedMessage;

    userManager.broadcastToUsers(recipientIds, {
        type: SERVER_EVENTS.MESSAGE_EDITED,
        payload: messageData,
    });
}