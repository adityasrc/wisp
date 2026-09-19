import type { Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { UsersService } from "./users.service.js";
import { updateUsernameSchema, type UpdateUsernameSchema } from "@repo/common";

export class UsersController {

    static async me(req: Request, res: Response) {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, "Unauthorized");
        }

        const user = await UsersService.getUserProfile(userId);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        return res.status(200).json({ user });
    }

    static async username(req: Request, res: Response) {
        const parsedData = updateUsernameSchema.safeParse(req.body);
        if (!parsedData.success) {
            throw new AppError(400, "Invalid username");
        }

        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, "Unauthorized");
        }



        const updateUser = await UsersService.updateUsername(parsedData.data.username, userId);

        const message = "Username updated successfully";
        return res.status(200).json({ message, user: updateUser });
    }

    static async searchUser(req: Request, res: Response) {
        const q = req.query.q;

        // return empty array if no search username provided
        if (!q || typeof q !== "string" || q.trim() === "") {
            return res.status(200).json([]);
        }

        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, "Unauthorized");
        }

        const users = await UsersService.getUsers(q.trim(), userId);

        return res.status(200).json({ users });

    }
}