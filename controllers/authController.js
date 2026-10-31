import db from "../config/mysql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// REGISTER
export const register = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const [existingUser] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already registered"
            });
        }
         console.error("REGISTRATION ERROR:", error);
        res.status(500).json({
            message: "Registration failed"
        });
    }
};


// LOGIN
export const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        res.status(500).json({
            message: "Login failed"
        });
    }
};


// GET MY PROFILE
export const getMe = async (req, res) => {

    try {

        const [users] = await db.query(
            "SELECT id, name, email, created_at FROM users WHERE id = ?",
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user: users[0]
        });

    } catch (error) {

        res.status(500).json({
            message: "Error fetching profile"
        });
    }
};


// UPDATE PROFILE
export const updateProfile = async (req, res) => {

    try {

        const { name, email } = req.body;

        if (!name || !name.trim() || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Invalid email address"
            });
        }

        const [existingUser] = await db.query(
            "SELECT id FROM users WHERE email = ? AND id != ?",
            [email, req.user.id]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already used by another user"
            });
        }

        await db.query(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            [name.trim(), email, req.user.id]
        );

        res.status(200).json({
            message: "Profile updated successfully"
        });

    } catch (error) {

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already used"
            });
        }

        res.status(500).json({
            message: "Profile update failed"
        });
    }
};