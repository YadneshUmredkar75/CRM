// src/models/employeeModel.js
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    department: { type: Number, required: true }, // 1=Sales, 2=Marketing, etc.
    position: { type: String, required: true },
    salary: { type: Number, required: true },
    joiningDate: { type: Date, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    employeeType: { type: String, enum: ["Employee", "Intern"], default: "Employee" },
    loginId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    performance: { type: Number, min: 0, max: 100, default: 0 },
    attendance: { type: Number, min: 0, max: 100, default: 0 },
    pendingSalary: { type: Number, default: 0 },
    paidSalary: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual for total salary
employeeSchema.virtual("totalSalary").get(function() {
  return (this.paidSalary || 0) + (this.pendingSalary || 0);
});

// Index for better query performance


export default mongoose.model("Employee", employeeSchema);