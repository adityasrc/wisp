import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { MessageController } from "../messages/messages.controller.js";

const router: Router = Router();

router.patch("/:id", authMiddleware, MessageController.editMessage);

export default router;
