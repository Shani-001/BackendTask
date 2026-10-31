const validStatuses = ["todo", "in_progress", "completed"];
const validPriorities = ["low", "medium", "high"];

export const validateTask = (req, res, next) => {
    const {
        title,
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

    if (!Number.isInteger(Number(projectId)) || Number(projectId) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Valid projectId is required"
        });
    }

    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid task status"
        });
    }

    if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
            success: false,
            message: "Invalid task priority"
        });
    }

    if (
        dueDate &&
        (Number.isNaN(Date.parse(dueDate)))
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid due date"
        });
    }

    next();
};