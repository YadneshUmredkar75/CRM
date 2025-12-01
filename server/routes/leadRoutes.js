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

// import { protectEmployee } from "../middleware/authEmployee.js";
// import { protect } from "../middleware/auth.js"; // REMOVED PROTECTION FOR NOW

const router = express.Router();

// ==================== EMPLOYEE ROUTES ====================
// Removed protection for testing
router.post("/", createLead);
router.get("/my-leads", getAllLeads);
router.get("/my-stats", getLeadStats);
router.patch("/:id/status", updateLeadStatus);
router.delete("/:id", deleteLead);

// ==================== ADMIN ROUTES ====================
// Removed protection for testing
router.get("/all", getAllLeadsAdmin);
router.get("/stats/admin", getLeadStatsAdmin);
router.get("/employee/:employeeId", getLeadsByEmployee);
router.patch("/lead/:id/mark-paid", markLeadPaymentDone);
router.patch("/:id", updateLeadIncentive);

export default router;