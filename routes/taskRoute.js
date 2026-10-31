import express from "express";

import authenticateToken from "../middleware/authMiddleware.js";

import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} from "../controllers/taskController.js";

import { validateTask } from "../validators/taskValidate.js";

const router = express.Router();

// All task routes require login
router.use(authenticateToken);

router.post("/", validateTask, createTask);

router.get("/", getTasks);

router.get("/:id", getTaskById);

router.put("/:id", validateTask, updateTask);

router.delete("/:id", deleteTask);

export default router;