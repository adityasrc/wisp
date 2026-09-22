import { prisma } from "@repo/db"
import { AppError } from "../utils/AppError.js";

export class UsersService {

    static async getUserProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                bio: true,
                avatarType: true,
                avatarUrl: true,
            }
        })

        if (!user) {
            return null;
        }

        return user;
    }

    static async updateUsername(username: string, userId: string) {

        // fetch current username
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
                avatarType: true
            }
        })

        if (!currentUser) {
            throw new AppError(404, "User not found");
        }


        if (username === currentUser?.username) {
            throw new AppError(400, "New username cannot be the same as current");
        }

        // check if username already taken
        const exists = await prisma.user.findUnique({
            where: { username }
        })
        if (exists) {
            throw new AppError(409, "Username already taken");
        }

        const reservedUsername = await prisma.reservedUsername.findUnique({
            where: { username },
            select: {
                userId: true,
                expiresAt: true,
            }
        });

        if (reservedUsername && reservedUsername.expiresAt > new Date() && reservedUsername.userId !== userId) {
            throw new AppError(409, "Username is currently reserved");
        }

        const isReclaim = Boolean(reservedUsername && reservedUsername.userId === userId && reservedUsername.expiresAt > new Date());

        return await prisma.$transaction(async (tx) => {

            if (reservedUsername) {
                await tx.reservedUsername.delete({
                    where: { username }
                });
            }

            if (!isReclaim) {
                const hasActiveReservation = await tx.reservedUsername.findFirst({
                    where: {
                        userId: userId,
                        expiresAt: { gt: new Date() }
                    }
                });

                if (!hasActiveReservation) {
                    await tx.reservedUsername.create({
                        data: {
                            username: currentUser.username,
                            userId: userId,
                            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
                        }
                    });
                }
            }


            let avatarData = {};
            if (currentUser.avatarType === "UPLOADED") {
                avatarData = {
                    avatarType: "GENERATED",
                    avatarUrl: null,
                };
            }

            // update user
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    username: username,
                    ...avatarData,
                },
                select: {
                    id: true,
                    username: true,
                    bio: true,
                    avatarType: true,
                    avatarUrl: true,
                }
            });

            return updatedUser;
        });
    }

    static async getUsers(search: string, currentUserId: string) {

        return await prisma.user.findMany({
            where: {
                username: {
                    contains: search,
                    mode: 'insensitive',
                },
                id: {
                    not: currentUserId,
                }
            },
            select: {
                id: true,
                username: true,
                avatarType: true,
                avatarUrl: true,
            },
            take: 10,
        })
    }
}