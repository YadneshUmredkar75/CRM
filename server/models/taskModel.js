// src/models/taskModel.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    employeeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Employee", 
      required: true 
    },
    title: { 
      type: String, 
      required: true,
      trim: true 
    },
    description: { 
      type: String,
      trim: true 
    },
    type: { 
      type: String, 
      enum: ["Daily", "Weekly", "Monthly", "Project"], 
      default: "Daily" 
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "On Hold"],
      default: "Pending"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    progress: { 
      type: Number, 
      min: 0, 
      max: 100, 
      default: 0 
    },
    dueDate: {
      type: Date
    },
    notes: { 
      type: String,
      trim: true 
    },
    lastUpdated: { 
      type: Date, 
      default: Date.now 
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);



// Method to check if task is completed
taskSchema.methods.isCompleted = function() {
  return this.status === "Completed" || this.progress === 100;
};

export default mongoose.model("Task", taskSchema);