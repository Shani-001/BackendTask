import express from "express";

import authenticateToken from "../middleware/authMiddleware.js";

import { getDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", authenticateToken, getDashboard);

export default router;