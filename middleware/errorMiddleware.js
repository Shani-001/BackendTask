const errorMiddleware = (err, req, res, next) => {
    console.error("ERROR:", err);

    // Mongoose invalid data
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    // Invalid MongoDB ID
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID"
        });
    }

    // Duplicate data
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Duplicate record"
        });
    }

    // JWT authentication errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token"
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Authentication token expired"
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.statusCode
            ? err.message
            : "Internal server error"
    });
};

export default errorMiddleware;