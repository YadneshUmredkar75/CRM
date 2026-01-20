import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true
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

    dueDate: Date,

    notes: {
      type: String,
      trim: true
    },

    lastUpdated: {
      type: Date,
      default: Date.now
    },

    completedAt: Date
  },
  { timestamps: true }
);

// Check completion
taskSchema.methods.isCompleted = function () {
  return this.status === "Completed" || this.progress === 100;
};

// Auto update completed date
taskSchema.pre("save", function (next) {
  if (this.isCompleted() && !this.completedAt) {
    this.completedAt = new Date();
  }
  this.lastUpdated = new Date();
  next();
});

// ✅ SAFE EXPORT
export default mongoose.models.Task ||
  mongoose.model("Task", taskSchema);
