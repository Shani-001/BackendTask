import mongoose from "mongoose";
import Task from "../models/taskModel.js";
import db from "../config/mysql.js";

// Check whether the project belongs to the logged-in user
const checkProjectOwnership = async (projectId, userId) => {
    const [rows] = await db.execute(
        "SELECT id FROM projects WHERE id = ? AND user_id = ?",
        [projectId, userId]
    );

    return rows.length > 0;
};

// 1. CREATE TASK
export const createTask = async (req, res, next) => {
    try {
        const { title, description, projectId, status, priority, dueDate } =
            req.body;

        const projectExists = await checkProjectOwnership(
            Number(projectId),
            req.user.id
        );

        if (!projectExists) {
            return res.status(404).json({
                success: false,
                message: "Project not found or you do not own this project"
            });
        }

        const task = await Task.create({
            title,
            description,
            projectId: Number(projectId),
            ownerId: req.user.id,
            status: status || "todo",
            priority: priority || "medium",
            dueDate: dueDate || null
        });

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task
        });

    } catch (error) {
        next(error);
    }
};

// 2. GET ALL TASKS WITH FILTERING AND PAGINATION
export const getTasks = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            priority,
            projectId
        } = req.query;

        const currentPage = Number(page);
        const pageLimit = Number(limit);

        if (
            !Number.isInteger(currentPage) ||
            currentPage < 1 ||
            !Number.isInteger(pageLimit) ||
            pageLimit < 1 ||
            pageLimit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Page must be positive and limit must be between 1 and 100"
            });
        }

        if (status && !["todo", "in_progress", "completed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task status"
            });
        }

        if (priority && !["low", "medium", "high"].includes(priority)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task priority"
            });
        }

        if (
            projectId &&
            (!Number.isInteger(Number(projectId)) || Number(projectId) <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid projectId"
            });
        }

        const filter = {
            ownerId: req.user.id
        };

        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (projectId) filter.projectId = Number(projectId);

        const totalRecords = await Task.countDocuments(filter);

        const tasks = await Task.find(filter)
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * pageLimit)
            .limit(pageLimit);

        res.status(200).json({
            success: true,
            message: "Tasks fetched successfully",
            data: tasks,
            pagination: {
                currentPage,
                limit: pageLimit,
                totalRecords,
                totalPages: Math.ceil(totalRecords / pageLimit)
            }
        });

    } catch (error) {
        next(error);
    }
};

// 3. GET SINGLE TASK
export const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });
        }

        const task = await Task.findOne({
            _id: id,
            ownerId: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });

    } catch (error) {
        next(error);
    }
};

// 4. UPDATE TASK
export const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });
        }

        const {
            title,
            description,
            projectId,
            status,
            priority,
            dueDate
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });
        }

        if (
            !Number.isInteger(Number(projectId)) ||
            Number(projectId) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid projectId is required"
            });
        }

        if (status && !["todo", "in_progress", "completed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task status"
            });
        }

        if (priority && !["low", "medium", "high"].includes(priority)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task priority"
            });
        }

        if (dueDate && Number.isNaN(Date.parse(dueDate))) {
            return res.status(400).json({
                success: false,
                message: "Invalid due date"
            });
        }

        const projectExists = await checkProjectOwnership(
            Number(projectId),
            req.user.id
        );

        if (!projectExists) {
            return res.status(404).json({
                success: false,
                message: "Project not found or you do not own this project"
            });
        }

        const task = await Task.findOneAndUpdate(
            {
                _id: id,
                ownerId: req.user.id
            },
            {
                title,
                description,
                projectId: Number(projectId),
                status: status || "todo",
                priority: priority || "medium",
                dueDate: dueDate || null
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: task
        });

    } catch (error) {
        next(error);
    }
};

// 5. DELETE TASK
export const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });
        }

        const task = await Task.findOneAndDelete({
            _id: id,
            ownerId: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};