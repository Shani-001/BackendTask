import db from "../config/mysql.js";

// CREATE PROJECT
export const createProject = async (req, res) => {

    try {

        const { name, description, status } = req.body;

        const [result] = await db.query(
            `INSERT INTO projects
            (user_id, name, description, status)
            VALUES (?, ?, ?, ?)`,
            [
                req.user.id,
                name.trim(),
                description || null,
                status || "active"
            ]
        );

        res.status(201).json({
            message: "Project created successfully",
            projectId: result.insertId
        });

    } catch (error) {

        res.status(500).json({
            message: "Error creating project"
        });
    }
};


// GET ALL PROJECTS
export const getProjects = async (req, res) => {

    try {

        const [projects] = await db.query(
            "SELECT * FROM projects WHERE user_id = ? ORDER BY id DESC",
            [req.user.id]
        );

        res.status(200).json({
            projects
        });

    } catch (error) {

        res.status(500).json({
            message: "Error fetching projects"
        });
    }
};


// GET PROJECT BY ID
export const getProjectById = async (req, res) => {

    try {

        const { id } = req.params;

        const [projects] = await db.query(
            "SELECT * FROM projects WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        if (projects.length === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.status(200).json({
            project: projects[0]
        });

    } catch (error) {

        res.status(500).json({
            message: "Error fetching project"
        });
    }
};


// UPDATE PROJECT
export const updateProject = async (req, res) => {

    try {

        const { id } = req.params;

        const { name, description, status } = req.body;

        const validStatuses = ["active", "completed", "archived"];

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Project name is required"
            });
        }

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid project status"
            });
        }

        const [result] = await db.query(
            `UPDATE projects
            SET name = ?, description = ?, status = ?
            WHERE id = ? AND user_id = ?`,
            [
                name.trim(),
                description || null,
                status || "active",
                id,
                req.user.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.status(200).json({
            message: "Project updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Error updating project"
        });
    }
};


// DELETE PROJECT
export const deleteProject = async (req, res) => {

    try {

        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM projects WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.status(200).json({
            message: "Project deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Error deleting project"
        });
    }
};