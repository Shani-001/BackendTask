const validStatuses = ["active", "completed", "archived"];

export default function validateProject(req, res, next) {

    const { name, status } = req.body;

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

    next();
}