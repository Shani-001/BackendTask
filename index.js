import express from "express";
import "dotenv/config";
import cors from "cors";

import connectMongoDB from "./config/mongodb.js";

import authRoute from "./routes/authRoute.js";
import projectRoute from "./routes/projectRoute.js";
import taskRoute from "./routes/taskRoute.js";
import dashboardRoute from "./routes/dashboardRoute.js";

import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Task Management API is running"
    });
});

app.use("/api/auth", authRoute);
app.use("/api/projects", projectRoute);
app.use("/api/tasks", taskRoute);
app.use("/api/dashboard", dashboardRoute);

app.use(errorMiddleware);


const startServer = async () => {
    try {
        await connectMongoDB();

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};
startServer();