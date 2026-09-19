import { Router } from "express";
import { RequestController } from "../requests/request.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post("/", authMiddleware, RequestController.createRequest);
router.get("/incoming", authMiddleware, RequestController.incomingRequest);
router.get("/outgoing", authMiddleware, RequestController.outgoingRequest);
router.post("/:id/accept", authMiddleware, RequestController.acceptRequest);
router.post("/:id/reject", authMiddleware, RequestController.rejectRequest);

export default router;