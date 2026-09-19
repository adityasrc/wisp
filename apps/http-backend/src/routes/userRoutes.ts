import { Router } from "express";
import { UsersController } from "../users/users.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router: Router = Router();

router.get("/me", authMiddleware, UsersController.me);
router.patch("/me/username", authMiddleware, UsersController.username);
router.get("/search", authMiddleware, UsersController.searchUser);

export default router;