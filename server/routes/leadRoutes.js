// src/routes/leadRoutes.js
import express from "express";
import {
  createLead,
  getAllLeads,           // employee's my-leads
  getLeadStats,          // employee's stats
  updateLeadStatus,
  deleteLead,

  // Admin only
  getAllLeadsAdmin,
  getLeadStatsAdmin,
  getLeadsByEmployee,
  markLeadPaymentDone,
  updateLeadIncentive,
} from "../controllers/leadController.js";

import { protectEmployee } from "../middleware/authEmployee.js";
import { protect } from "../middleware/auth.js"; // your admin middleware

const router = express.Router();

// ==================== EMPLOYEE ROUTES ====================
router.post("/", protectEmployee, createLead);
router.get("/my-leads", protectEmployee, getAllLeads);
router.get("/my-stats", protectEmployee, getLeadStats);
router.patch("/:id/status", protectEmployee, updateLeadStatus);
router.delete("/:id", protectEmployee, deleteLead);

// ==================== ADMIN ROUTES ====================
// These will ONLY run protect (admin middleware), NEVER protectEmployee
router.get("/all", protect, getAllLeadsAdmin);
router.get("/stats/admin", protect, getLeadStatsAdmin);
router.get("/employee/:employeeId", protect, getLeadsByEmployee);
router.patch("/lead/:id/mark-paid", protect, markLeadPaymentDone);
router.patch("/:id", protect, updateLeadIncentive);
export default router;