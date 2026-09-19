import { Router } from "express";
import { RequestController } from "../requests/request.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post("/", authMiddleware, RequestController.createRequest)

export default router;