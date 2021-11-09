import { Router } from "express";

import CommentsController from "../controllers/comments.controller.js";

const router = new Router()

router.post("/", CommentsController.apiPostComment);
router.post("/", CommentsController.apiUpdateComment);
router.post("/", CommentsController.apiDeleteComment);

export default router;