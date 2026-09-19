import { prisma } from "@repo/db"
import { AppError } from "../utils/AppError.js";

export class ConversationService {

    static async getConversations(userId: string) {

        const conversations = await prisma.conversation.findMany({
            where: {
                member: {
                    some: {
                        userId: userId,
                    }
                }
            },
            orderBy: {
                lastActivityAt: "desc",
            },
            include: { // join
                member: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                avatarType: true,
                                avatarUrl: true,
                            }
                        }
                    }
                },
                message: {
                    take: 1,
                    orderBy: {
                        createdAt: "desc",
                    },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        senderId: true,
                    }
                }
            }
        })

        return conversations.map(conv => {

            const partnerMember = conv.member.find((m) => m.userId !== userId);
            const lastMessage = conv.message[0] || null;

            return {
                id: conv.id,
                type: conv.type,
                lastActivityAt: conv.lastActivityAt,
                isDormant: conv.isDormant,
                partner: partnerMember?.user || null,
                lastMessage: lastMessage,
            };
        });

    }

    static async getConversationById(conversationId: string, userId: string) {

        const chats = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                member: { some: { userId: userId } }
            },
            include: {
                member: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                username: true,
                                avatarType: true,
                                avatarUrl: true,
                            }
                        }
                    }
                }
            }
        })

        if (!chats) {
            throw new AppError(404, "Conversation not found");
        }

        const partnerMember = chats.member.find((m) => m.userId !== userId);

        return {
            id: chats.id,
            type: chats.type,
            lastActivityAt: chats.lastActivityAt,
            isDormant: chats.isDormant,
            partnerMember: partnerMember?.user || null,
        }
    }
}