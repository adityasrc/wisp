import "dotenv/config";
import bcrypt from "bcrypt";
import { type User, prisma } from "@repo/db";
import { SignJWT } from "jose";


export class AuthService {

    private static async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    }

    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        try {
            const isMatch = await bcrypt.compare(password, hash);
            return isMatch;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    static async userExist(username: string): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({
                where: { username },
                select: { id: true }
            });
            return !!user;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    static async getUser(username: string): Promise<User | null> {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    username: username
                }
            });
            return user;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async createUser(name: string, username: string, password: string): Promise<User | null> {
        try {
            const hashedPassword = await this.hashPassword(password);
            const user = await prisma.user.create({
                data: {
                    name: name,
                    username: username,
                    password: hashedPassword
                }
            });
            return user;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async createToken(userId: string): Promise<string | null> {
        try {
            const JWT_SECRET = process.env.JWT_SECRET;
            if (!JWT_SECRET) {
                console.log("JWT_SECRET not defined");
                return null;
            }
            const secret = new TextEncoder().encode(JWT_SECRET);

            const token = await new SignJWT({})
                .setProtectedHeader({ alg: "HS256" })
                .setSubject(userId)
                .setIssuedAt()
                .setExpirationTime("1d")
                .sign(secret);

            return token;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}


