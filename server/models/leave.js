// models/Leave.js
import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeName: { type: String, required: true },
    employeeId: { type: String, required: true },
    department: { type: Number, required: true }, // matches your employeeModel
    position: { type: String, required: true },

    leaveType: {
      type: String,
      enum: ["Sick Leave", "Annual Leave", "Casual Leave", "Other"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);



export default mongoose.model("Leave", leaveSchema);