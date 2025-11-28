// src/routes/employeeRoutes.js
import { Router } from "express";
import {
  getAll, createEmployee, updateEmployee, deleteEmployee,
  login, resetPassword, changePassword, getEmployeePassword,
  getTasks, addTask, updateTask, deleteTask, getEmployeeTasks, getEmployeeAttendance, getEmployeePerformance,
  getEmployeeById, getCurrentEmployee, updateProfile
} from "../controllers/employeeController.js"; // Make sure the path is correct
import { protectEmployee } from "../middleware/authEmployee.js";
import { protect } from "../middleware/auth.js";
const router = Router();

// PUBLIC ROUTES - NO PROTECTION
router.post("/login", login);

// EMPLOYEE ROUTES - NO PROTECTION
router.get("/me",protectEmployee, getCurrentEmployee);
router.patch("/me/change-password",protectEmployee, changePassword);
router.patch("/update-profile",protectEmployee, updateProfile);
router.get("/task",protectEmployee, getTasks);
router.post("/task",protectEmployee, addTask);
router.patch("/task/:id",protectEmployee, updateTask);
router.delete("/task/:id", protectEmployee,deleteTask);
router.get("/employee/:id/tasks",protectEmployee, getTasks);
router.get("/employee/:id/",protectEmployee, getEmployeeById);

// ADMIN ROUTES - NO PROTECTION
router.get("/get/employee",protect, getAll);
router.post("/create/employee",protect, createEmployee);
router.patch("/update/:id",protect, updateEmployee);
router.delete("/delete/:id",protect, deleteEmployee);
router.post("/:id/reset-password",protect, resetPassword);
router.get("/:id/password",protect, getEmployeePassword);
router.get("/admin/employee/:id/tasks",protect, getEmployeeTasks);
router.get("/employee/:id/performance",protect, getEmployeePerformance);
router.get("/:id/tasks",protect, getEmployeeTasks);
router.get("/:id/attendance",protect, getEmployeeAttendance);

export default router;