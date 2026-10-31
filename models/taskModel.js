import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
            maxlength: 150
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        projectId: {
            type: Number,
            required: [true, "Project ID is required"]
        },

        ownerId: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["todo", "in_progress", "completed"],
            default: "todo"
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        dueDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;