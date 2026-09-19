import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ConversationController } from "../conversations/conversations.controller.js";


const router: Router = Router();

router.get("/", authMiddleware, ConversationController.getConversations);
router.get("/:id", authMiddleware, ConversationController.getConversationById);
router.get("/:id/messages", authMiddleware, ConversationController.getMessages);

export default router;