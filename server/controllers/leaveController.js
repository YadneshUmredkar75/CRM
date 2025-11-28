// src/controllers/leaveController.js
import Leave from "../models/leave.js";
import Employee from "../models/employeeModel.js";

// Helper: Async wrapper
const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// =============== EMPLOYEE CONTROLLERS ===============

// 1. Submit Leave Request
// controllers/leaveController.js
export const submitLeave = catchAsync(async (req, res) => {
  const employeeId = req.employee._id;
  const { leaveType, startDate, endDate, reason } = req.body;

  // Fetch employee with required fields
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ success: false, message: "End date cannot be before start date" });
  }

  const leave = await Leave.create({
    employee: employeeId,
    employeeName: employee.name,           // Added
    employeeId: employee.loginId,          // Added (or use employee._id.toString())
    department: employee.department,       // Added
    position: employee.position,           // Added
    leaveType,
    startDate,
    endDate,
    reason,
    status: "pending",
  });

  const populatedLeave = await Leave.findById(leave._id)
    .populate("employee", "name loginId department position email phone");

  res.status(201).json({
    success: true,
    message: "Leave request submitted successfully",
    data: populatedLeave,
  });
});

// 2. Get My Leaves + Stats
export const getMyLeaves = catchAsync(async (req, res) => {
  const employeeId = req.employee._id;
  const { page = 1, limit = 10, status } = req.query;

  const filter = { employee: employeeId };
  if (status && status !== "all") filter.status = status;

  const total = await Leave.countDocuments(filter);
  const leaves = await Leave.find(filter)
    .populate("employee", "name department position")
    .sort({ appliedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  // Stats for employee
  const stats = await Leave.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
      },
    },
  ]);

  const s = stats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };

  res.json({
    success: true,
    stats: {
      totalLeaves: s.total,
      pendingLeaves: s.pending,
      approvedLeaves: s.approved,
      rejectedLeaves: s.rejected,
      approvalRate: s.total === 0 ? 0 : Math.round((s.approved / s.total) * 100),
    },
    data: leaves,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
    },
  });
});

// 3. Delete My Pending Leave
export const deleteMyLeave = catchAsync(async (req, res) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });
  if (leave.employee.toString() !== req.employee._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }
  if (leave.status !== "pending") {
    return res.status(400).json({ success: false, message: "Can only delete pending leaves" });
  }

  await Leave.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: "Leave request deleted" });
});

// 4. My Leave Stats (Dashboard)
export const getMyLeaveStats = catchAsync(async (req, res) => {
  const stats = await Leave.aggregate([
    { $match: { employee: req.employee._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
      },
    },
  ]);

  const s = stats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };

  res.json({
    success: true,
    scope: "employee",
    data: {
      totalLeaves: s.total,
      pendingLeaves: s.pending,
      approvedLeaves: s.approved,
      rejectedLeaves: s.rejected,
      approvalRate: s.total === 0 ? 0 : Math.round((s.approved / s.total) * 100),
    },
  });
});

// =============== ADMIN CONTROLLERS ===============

// 5. Get All Leaves (Admin Dashboard)
export const getAllLeavesAdmin = catchAsync(async (req, res) => {
  const { page = 1, limit = 15, status, employee, search, startDate, endDate } = req.query;

  let query = {};
  if (status && status !== "All") query.status = status;
  if (employee) query.employee = employee;
  if (search) {
    query.$or = [
      { "employee.name": { $regex: search, $options: "i" } },
      { reason: { $regex: search, $options: "i" } },
    ];
  }
  if (startDate || endDate) {
    query.appliedAt = {};
    if (startDate) query.appliedAt.$gte = new Date(startDate);
    if (endDate) query.appliedAt.$lte = new Date(endDate);
  }

  const total = await Leave.countDocuments(query);
  const leaves = await Leave.find(query)
    .populate("employee", "name email phone loginId department position")
    .sort({ appliedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: leaves,
  });
});

// 6. Admin: Global Leave Stats
export const getLeaveStatsAdmin = catchAsync(async (req, res) => {
  const stats = await Leave.aggregate([
    {
      $group: {
        _id: null,
        totalLeaves: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        totalLeaves: 1,
        pending: 1,
        approved: 1,
        rejected: 1,
        approvalRate: {
          $cond: [
            { $eq: ["$totalLeaves", 0] },
            0,
            { $round: [{ $multiply: [{ $divide: ["$approved", "$totalLeaves"] }, 100] }, 1] },
          ],
        },
      },
    },
  ]);

  res.json({
    success: true,
    scope: "global-admin",
    data: stats[0] || {
      totalLeaves: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      approvalRate: 0,
    },
  });
});

// 7. Get Leaves by Employee (Admin)
export const getLeavesByEmployee = catchAsync(async (req, res) => {
  const { employeeId } = req.params;
  const employee = await Employee.findById(employeeId);
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

  const leaves = await Leave.find({ employee: employeeId })
    .populate("employee", "name department position")
    .sort({ appliedAt: -1 });

  res.json({
    success: true,
    employee: {
      name: employee.name,
      department: employee.department === 1 ? "Sales" : "Other",
      position: employee.position,
    },
    data: leaves,
  });
});

// 8. Approve / Reject Leave
export const updateLeaveStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  // Validate status
  if (!status || !["approved", "rejected"].includes(status.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be 'approved' or 'rejected'",
    });
  }

  // Find leave request
  const leave = await Leave.findById(id);

  if (!leave) {
    return res.status(404).json({
      success: false,
      message: "Leave request not found",
    });
  }

  // Prevent re-processing already handled requests
  if (leave.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: `This leave is already ${leave.status}. Cannot modify.`,
    });
  }

  // Update status
  leave
  leave.status = status.toLowerCase();
  leave.reviewedAt = new Date();
  leave.reviewedBy = req.employee?._id || req.user?._id; // Support both employee & admin auth

  await leave.save();

  // Populate employee details for response
  const updatedLeave = await Leave.findById(id).populate(
    "employee",
    "name email loginId position"
  );

  return res.status(200).json({
    success: true,
    message: `Leave request ${status.toLowerCase()} successfully`,
    data: updatedLeave,
  });
});
// 9. Admin: Force Delete Any Leave
export const deleteLeaveAdmin = catchAsync(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

  await Leave.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: "Leave deleted by admin" });
});