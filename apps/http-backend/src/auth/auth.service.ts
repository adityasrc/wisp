import "dotenv/config";
import bcrypt from "bcrypt";
import { type User, prisma } from "@repo/db";
import { SignJWT } from "jose";
import { AppError } from "../utils/AppError.js";


export class AuthService {

    private static async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    }

    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    static async userExist(username: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });
        if (user) return true;

        const reserved = await prisma.reservedUsername.findFirst({
            where: {
                username,
                expiresAt: { gt: new Date() }
            }
        });
        return !!reserved;
    }

    static async getUser(username: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: {
                username: username
            }
        });
    }

    static async createUser(name: string, username: string, password: string): Promise<User> {
        const hashedPassword = await this.hashPassword(password);
        try {
            const user = await prisma.user.create({
                data: {
                    name: name,
                    username: username,
                    password: hashedPassword
                }
            });
            return user;
        } catch (err: any) {
            // Postgres return error code P2002 for uniuqe constraint violation
            if (err.code === "P2002") {
                throw new AppError(409, "User already exists");
            }
            throw err;
        }
    }

    static async createToken(userId: string): Promise<string> {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new AppError(500, "JWT_SECRET is not configured")
        }

        const secret = new TextEncoder().encode(JWT_SECRET);

        return await new SignJWT({})
            .setProtectedHeader({ alg: "HS256" })
            .setSubject(userId)
            .setIssuedAt()
            .setExpirationTime("1d")
            .sign(secret);
    }
}


