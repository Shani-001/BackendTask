import express from "express";

import {
    register,
    login,
    getMe,
    updateProfile
} from "../controllers/authController.js";

import authenticateToken from "../middleware/authMiddleware.js";

import {
    validateRegister,
    validateLogin
} from "../validators/authValidate.js";

const router = express.Router();

router.post("/register", validateRegister, register);

router.post("/login", validateLogin, login);

router.get("/me", authenticateToken, getMe);

router.put("/profile", authenticateToken, updateProfile);

export default router;