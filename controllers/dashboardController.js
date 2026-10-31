import db from "../config/mysql.js";
import Task from "../models/taskModel.js";

export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get project statistics from MySQL
        const [projectStats] = await db.execute(
            `SELECT
                COUNT(*) AS totalProjects,
                COALESCE(SUM(status = 'active'), 0) AS activeProjects,
                COALESCE(SUM(status = 'completed'), 0) AS completedProjects
             FROM projects
             WHERE user_id = ?`,
            [userId]
        );

        // Get task statistics from MongoDB
        const taskStats = await Task.aggregate([
            {
                $match: {
                    ownerId: Number(userId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    pendingTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "todo"] }, 1, 0]
                        }
                    },
                    completedTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
                        }
                    },
                    highPriorityTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$priority", "high"] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const tasks = taskStats[0] || {
            totalTasks: 0,
            pendingTasks: 0,
            completedTasks: 0,
            highPriorityTasks: 0
        };

        res.status(200).json({
            success: true,
            message: "Dashboard statistics fetched successfully",
            data: {
                projects: projectStats[0],
                tasks
            }
        });

    } catch (error) {
        next(error);
    }
};