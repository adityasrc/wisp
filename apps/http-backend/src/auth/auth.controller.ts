import { loginSchema, signupSchema } from "@repo/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { AppError } from "../utils/AppError.js";

export class AuthController {

    static async register(req: Request, res: Response) {
        const parsedData = signupSchema.safeParse(req.body);

        if (!parsedData.success) {
            const message = parsedData.error.issues[0]?.message || "Invalid Inputs";
            throw new AppError(400, message);
        }

        const { username, password } = parsedData.data;

        if (await AuthService.userExist(username)) {
            throw new AppError(409, "User already exists");
        }

        const user = await AuthService.createUser(username, password);
        if (!user) {
            throw new AppError(500, "Signup Failed");
        }

        const token = await AuthService.createToken(user.id);
        if (!token) {
            throw new AppError(500, "Failed to generate token");
        }

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // false for localhost, true for production
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        const message = "User created successfully ";
        return res.status(201).json({
            message,
            user: {
                id: user.id,
                username: user.username
            }
        });
    }


    static async login(req: Request, res: Response) {
        const parsedData = loginSchema.safeParse(req.body);

        if (!parsedData.success) {
            const message = parsedData.error.issues[0]?.message || "Invalid Inputs";
            throw new AppError(400, message);
        }

        const { username, password } = parsedData.data;

        const user = await AuthService.getUser(username);
        if (!user) {
            throw new AppError(401, "Invalid username or password");
        }

        const isMatch = await AuthService.verifyPassword(password, user.password);
        if (!isMatch) {
            throw new AppError(401, "Invalid username or password");
        }

        const token = await AuthService.createToken(user.id);
        if (!token) {
            throw new AppError(500, "Failed to generate token");
        }

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // false for localhost, true for production
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Logged in successfully",
            user: {
                id: user.id,
                username: user.username
            }
        });
    }

    static async logout(req: Request, res: Response) {
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        return res.status(200).json({ message: "Logged out successfully" });
    }
}
