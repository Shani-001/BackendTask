import express from "express";

import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} from "../controllers/projectController.js";

import authenticateToken from "../middleware/authMiddleware.js";

import validateProject from "../validators/projectValidate.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", validateProject, createProject);

router.get("/", getProjects);

router.get("/:id", getProjectById);

router.put("/:id", validateProject, updateProject);

router.delete("/:id", deleteProject);

export default router;