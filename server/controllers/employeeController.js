// src/controllers/employeeController.js
import Employee from "../models/employeeModel.js";
import Attendance from "../models/attendenceModel.js";
import Task from "../models/taskModel.js";
import jwt from "jsonwebtoken";

// Password encryption utilities
const encryptPassword = (password) => {
  return Buffer.from(password).toString('base64');
};

const decryptPassword = (encryptedPassword) => {
  try {
    return Buffer.from(encryptedPassword, 'base64').toString('ascii');
  } catch (error) {
    return "Decryption Error";
  }
};

// ---------------------------------------------------------------------
// Helper: Recalculate performance & attendance
// ---------------------------------------------------------------------
const recalculateMetrics = async (employeeId) => {
  try {
    const totalDaysAttended = await Attendance.countDocuments({
      employee: employeeId,
      clockIn: { $exists: true },
      clockOut: { $exists: true }
    });

    const totalTasks = await Task.countDocuments({ assignedTo: employeeId });
    const completedTasks = await Task.countDocuments({
      assignedTo: employeeId,
      status: "Completed"
    });
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await Employee.findByIdAndUpdate(employeeId, {
      attendance: totalDaysAttended,
      performance: taskCompletionRate
    });
  } catch (error) {
    console.error("Error recalculating metrics:", error);
  }
};

// ---------------------------------------------------------------------
// EMPLOYEE: Login
// ---------------------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { identifier, password, email, loginId } = req.body;
    const userIdentifier = identifier || email || loginId;

    if (!userIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Identifier and password required"
      });
    }

    const employee = await Employee.findOne({
      $or: [
        { email: userIdentifier },
        { loginId: userIdentifier }
      ]
    });

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Verify password
    const decryptedPassword = decryptPassword(employee.password);
    const isPasswordValid = password === decryptedPassword;

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Create JWT token (optional now)
    const token = jwt.sign(
      {
        id: employee._id,
        role: "employee",
        email: employee.email
      },
      process.env.JWT_SECRET || "employee_secret_key_2024",
      { expiresIn: "7d" }
    );

    await recalculateMetrics(employee._id);
    const updatedEmployee = await Employee.findById(employee._id).select('-password');

    res.json({
      success: true,
      message: "Login successful",
      token,
      employee: {
        _id: updatedEmployee._id,
        id: updatedEmployee._id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        loginId: updatedEmployee.loginId,
        position: updatedEmployee.position,
        department: updatedEmployee.department,
        employeeType: updatedEmployee.employeeType,
        performance: updatedEmployee.performance,
        attendance: updatedEmployee.attendance,
        status: updatedEmployee.status,
        salary: updatedEmployee.salary,
        pendingSalary: updatedEmployee.pendingSalary,
        paidSalary: updatedEmployee.paidSalary
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------------------------------------------------------------
// GET ALL EMPLOYEES
// ---------------------------------------------------------------------
export const getAll = async (req, res) => {
  try {
    const employees = await Employee.find({})
      .select('-password')
      .lean();

    const employeesWithDetails = await Promise.all(
      employees.map(async (emp) => {
        const tasks = await Task.find({ assignedTo: emp._id });
        const attendance = await Attendance.find({ employee: emp._id })
          .sort({ date: -1 })
          .limit(30);

        const completedTasks = tasks.filter(task => task.status === "Completed").length;
        const taskCompletion = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyAttendance = await Attendance.find({
          employee: emp._id,
          date: { $gte: startOfMonth },
          status: "Present"
        });
        const workingDays = 22;
        const attendancePercentage = monthlyAttendance.length > 0 ?
          Math.round((monthlyAttendance.length / workingDays) * 100) : 0;

        return {
          ...emp,
          tasks,
          attendance,
          performance: taskCompletion,
          attendancePercentage,
          taskCompletion
        };
      })
    );

    res.json({
      success: true,
      employees: employeesWithDetails,
      count: employeesWithDetails.length
    });
  } catch (err) {
    console.error("Get all employees error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------------------------------------------------------------
// CREATE EMPLOYEE
// ---------------------------------------------------------------------
export const createEmployee = async (req, res) => {
  const {
    name, email, phone, department, position, salary, joiningDate,
    status = "Active", employeeType = "Employee", loginId, password,
  } = req.body;

  if (!name || !email || !department || !position || !salary || !joiningDate || !loginId || !password) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided"
    });
  }

  try {
    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { loginId }]
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Email or Login ID already exists"
      });
    }

    const encryptedPassword = encryptPassword(password);

    const employee = await Employee.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      department: Number(department),
      position: position.trim(),
      salary: Number(salary),
      joiningDate: new Date(joiningDate),
      status,
      employeeType,
      loginId: loginId.trim(),
      password: encryptedPassword,
      pendingSalary: Number(salary),
      paidSalary: 0,
    });

    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: employeeResponse,
      credentials: {
        name,
        email,
        loginId,
        password
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email or Login ID already exists"
      });
    }
    console.error("Create employee error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------------------------------------------------------------
// GET EMPLOYEE BY ID
// ---------------------------------------------------------------------
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required"
      });
    }

    const employee = await Employee.findById(id).select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const tasks = await Task.find({ employeeId: id });
    const attendanceRecords = await Attendance.find({ employee: id });

    const completedTasks = tasks.filter(task => task.status === "Completed").length;
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const totalDaysAttended = await Attendance.countDocuments({
      employee: id,
      clockIn: { $exists: true },
      clockOut: { $exists: true }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthAttendance = await Attendance.countDocuments({
      employee: id,
      date: { $gte: startOfMonth },
      status: "Present"
    });

    const recentTasks = await Task.find({ employeeId: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status priority dueDate');

    const recentAttendance = await Attendance.find({ employee: id })
      .sort({ date: -1 })
      .limit(7)
      .select('date clockIn clockOut status workingHours');

    const employeeData = {
      _id: employee._id,
      id: employee._id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone || "",
      loginId: employee.loginId,
      position: employee.position,
      department: employee.department,
      employeeType: employee.employeeType,
      status: employee.status,
      salary: employee.salary,
      pendingSalary: employee.pendingSalary,
      paidSalary: employee.paidSalary,
      joiningDate: employee.joiningDate,
      performance: employee.performance,
      attendance: employee.attendance,
      stats: {
        taskCompletionRate,
        totalTasks: tasks.length,
        completedTasks,
        totalDaysAttended,
        currentMonthAttendance,
        attendancePercentage: Math.round((currentMonthAttendance / 22) * 100)
      },
      recentActivity: {
        tasks: recentTasks,
        attendance: recentAttendance
      }
    };

    res.json({
      success: true,
      employee: employeeData
    });

  } catch (err) {
    console.error("Get employee by ID error:", err);

    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------------------------------------------------------------
// UPDATE EMPLOYEE
// ---------------------------------------------------------------------
export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    if (updates.salary) {
      const current = await Employee.findById(id);
      if (!current) {
        return res.status(404).json({
          success: false,
          message: "Employee not found"
        });
      }

      const newSalary = Number(updates.salary);
      const diff = newSalary - current.salary;

      updates.pendingSalary = Math.max(0, current.pendingSalary + diff);
      updates.salary = newSalary;
    }

    if (updates.department) updates.department = Number(updates.department);

    const employee = await Employee.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee
    });
  } catch (err) {
    console.error("Update employee error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------------------------------------------------------------
// DELETE EMPLOYEE
// ---------------------------------------------------------------------
export const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await Attendance.deleteMany({ employee: id });
    await Task.deleteMany({ assignedTo: id });

    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.json({
      success: true,
      message: "Employee deleted successfully"
    });
  } catch (err) {
    console.error("Delete employee error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------------------------------------------------------------
// RESET PASSWORD
// ---------------------------------------------------------------------
export const resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.trim().length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters"
    });
  }

  try {
    const encryptedPassword = encryptPassword(newPassword.trim());
    const employee = await Employee.findByIdAndUpdate(
      id,
      { password: encryptedPassword },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.json({
      success: true,
      message: "Password reset successfully",
      credentials: {
        name: employee.name,
        email: employee.email,
        loginId: employee.loginId,
        password: newPassword.trim(),
      },
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------------------------------------------------------------
// CHANGE PASSWORD
// ---------------------------------------------------------------------
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "New passwords do not match"
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters"
    });
  }

  try {
    // For demo purposes, get any employee or handle differently
    const employee = await Employee.findOne();
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "No employee found"
      });
    }

    const decryptedCurrentPassword = decryptPassword(employee.password);
    if (currentPassword !== decryptedCurrentPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    const encryptedNewPassword = encryptPassword(newPassword);
    employee.password = encryptedNewPassword;
    await employee.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------------------------------------------------------------
// GET EMPLOYEE PASSWORD
// ---------------------------------------------------------------------
export const getEmployeePassword = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const decryptedPassword = decryptPassword(employee.password);

    res.json({
      success: true,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        loginId: employee.loginId,
      },
      password: decryptedPassword
    });
  } catch (err) {
    console.error("Get employee password error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------------------------------------------------------------
// TASK MANAGEMENT - ADD TASK FUNCTION
// ---------------------------------------------------------------------
export const addTask = async (req, res) => {
  try {
    const { title, description, type, priority, progress, notes, employeeId } = req.body;

    // If employeeId is "public-user", create task without employee reference
    const taskData = {
      title,
      description,
      type,
      priority,
      progress,
      notes,
      ...(employeeId && employeeId !== "public-user" && { employeeId }) // Only add if valid
    };

    const task = await Task.create(taskData);
    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: [error.message]
    });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required"
      });
    }

    const updateData = {
      ...updates,
      lastUpdated: new Date()
    };

    if (updates.progress !== undefined) {
      updateData.status = updates.progress === 100 ? "Completed" : "In Progress";
      if (updates.progress === 100) {
        updateData.completedAt = new Date();
      }
    }

    const task = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employeeId', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      task
    });

  } catch (err) {
    console.error("Update task error:", err);

    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Task ID is required",
      });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
      deletedTask: {
        id: task._id,
        title: task.title,
      },
    });
  } catch (err) {
    console.error("Delete task error:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------------------
// GET TASKS
// ---------------------------------------------------------------------
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .sort({ createdAt: -1 })
      .populate('employeeId', 'name email');

    res.json({
      success: true,
      tasks,
      count: tasks.length
    });
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// ---------------------------------------------------------------------
// GET EMPLOYEE TASKS
// ---------------------------------------------------------------------
export const getEmployeeTasks = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const employee = await Employee.findById(id).select("name email position department");
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const tasks = await Task.find({ employeeId: id })
      .sort({ createdAt: -1 })
      .populate("employeeId", "name email position department");

    res.json({
      success: true,
      tasks,
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        position: employee.position,
        department: employee.department,
      },
      count: tasks.length,
    });
  } catch (err) {
    console.error("Get employee tasks error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------------------
// GET EMPLOYEE ATTENDANCE
// ---------------------------------------------------------------------
export const getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let query = { employee: id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('employee', 'name email position department')
      .limit(100);

    const totalDaysAttended = await Attendance.countDocuments({
      employee: id,
      clockIn: { $exists: true },
      clockOut: { $exists: true }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthDaysAttended = await Attendance.countDocuments({
      employee: id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      clockIn: { $exists: true },
      clockOut: { $exists: true }
    });

    res.json({
      success: true,
      attendance,
      count: attendance.length,
      stats: {
        totalDaysAttended,
        currentMonthDaysAttended
      }
    });
  } catch (err) {
    console.error("Get employee attendance error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ---------------------------------------------------------------------
// GET EMPLOYEE PERFORMANCE
// ---------------------------------------------------------------------
export const getEmployeePerformance = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tasks = await Task.find({
      employeeId: employeeId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task =>
      task.status === 'Completed' || task.status === 'completed'
    ).length;

    const taskCompletionRate = totalTasks > 0 ?
      Math.round((completedTasks / totalTasks) * 100) : 0;

    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: thirtyDaysAgo }
    });

    const totalAttendanceDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record =>
      record.status === 'Present' || record.status === 'present'
    ).length;

    const attendanceRate = totalAttendanceDays > 0 ?
      Math.round((presentDays / totalAttendanceDays) * 100) : 0;

    const performanceScore = Math.round(
      (taskCompletionRate * 0.6) +
      (attendanceRate * 0.4)
    );

    const finalPerformanceScore = Math.min(100, Math.max(0, performanceScore));

    let performanceLevel;
    if (finalPerformanceScore >= 90) {
      performanceLevel = 'Excellent';
    } else if (finalPerformanceScore >= 80) {
      performanceLevel = 'Very Good';
    } else if (finalPerformanceScore >= 70) {
      performanceLevel = 'Good';
    } else if (finalPerformanceScore >= 60) {
      performanceLevel = 'Satisfactory';
    } else {
      performanceLevel = 'Needs Improvement';
    }

    const performanceData = {
      success: true,
      performance: finalPerformanceScore,
      performanceLevel: performanceLevel,
      breakdown: {
        taskCompletion: {
          rate: taskCompletionRate,
          completed: completedTasks,
          total: totalTasks
        },
        attendance: {
          rate: attendanceRate,
          present: presentDays,
          total: totalAttendanceDays,
          period: 'last 30 days'
        }
      },
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position
      }
    };

    res.status(200).json(performanceData);

  } catch (error) {
    console.error('Get employee performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating performance',
      error: error.message
    });
  }
};

// ---------------------------------------------------------------------
// GET CURRENT EMPLOYEE
// ---------------------------------------------------------------------
export const getCurrentEmployee = async (req, res) => {
  try {
    // For demo, get first employee or handle differently
    const employee = await Employee.findOne().select('-password');
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "No employee found"
      });
    }

    const tasks = await Task.find({ employeeId: employee._id });
    const attendanceRecords = await Attendance.find({ employee: employee._id });

    const completedTasks = tasks.filter(task =>
      task.status === "Completed" || task.status === "completed"
    ).length;
    const taskCompletionRate = tasks.length > 0 ?
      Math.round((completedTasks / tasks.length) * 100) : 0;

    const totalDaysAttended = await Attendance.countDocuments({
      employee: employee._id,
      clockIn: { $exists: true },
      clockOut: { $exists: true }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthAttendance = await Attendance.countDocuments({
      employee: employee._id,
      date: { $gte: startOfMonth },
      status: "Present"
    });

    const recentTasks = await Task.find({ employeeId: employee._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status priority dueDate createdAt');

    const recentAttendance = await Attendance.find({ employee: employee._id })
      .sort({ date: -1 })
      .limit(7)
      .select('date clockIn clockOut status workingHours');

    const employeeData = {
      _id: employee._id,
      id: employee._id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone || "",
      loginId: employee.loginId,
      position: employee.position,
      department: employee.department,
      employeeType: employee.employeeType,
      status: employee.status,
      salary: employee.salary,
      pendingSalary: employee.pendingSalary,
      paidSalary: employee.paidSalary,
      joiningDate: employee.joiningDate,
      performance: employee.performance,
      attendance: employee.attendance,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,

      stats: {
        taskCompletionRate,
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks: tasks.length - completedTasks,
        totalDaysAttended,
        currentMonthAttendance,
        attendancePercentage: Math.round((currentMonthAttendance / 22) * 100),
        overallPerformance: employee.performance || taskCompletionRate
      },

      recentActivity: {
        tasks: recentTasks,
        attendance: recentAttendance
      }
    };

    res.json({
      success: true,
      message: "Employee data retrieved successfully",
      employee: employeeData
    });

  } catch (error) {
    console.error("Get current employee error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching employee data",
      error: error.message
    });
  }
};

// ---------------------------------------------------------------------
// UPDATE PROFILE
// ---------------------------------------------------------------------
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, department, position } = req.body;

    if (!name || name.toString().trim() === "") {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email || email.toString().trim() === "") {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(email.toString().trim())) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // For demo, update first employee or handle differently
    const employee = await Employee.findOne();
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const newEmail = email.toString().trim().toLowerCase();

    if (newEmail !== employee.email.toLowerCase()) {
      const exists = await Employee.findOne({ email: newEmail, _id: { $ne: employee._id } });
      if (exists) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
    }

    const updates = {
      name: name.toString().trim(),
      email: newEmail,
      updatedAt: new Date(),
    };

    if (phone !== undefined) updates.phone = phone.toString().trim();
    if (department?.toString().trim()) updates.department = department.toString().trim();
    if (position?.toString().trim()) updates.position = position.toString().trim();

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employee._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    const tasks = await Task.find({ employeeId: employee._id });
    const completedTasks = tasks.filter(t => ["Completed", "completed"].includes(t.status)).length;
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const totalDaysAttended = await Attendance.countDocuments({
      employee: employee._id,
      clockIn: { $exists: true },
      clockOut: { $exists: true },
    });

    return res.json({
      success: true,
      message: "Profile updated successfully",
      employee: {
        _id: updatedEmployee._id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone || "",
        loginId: updatedEmployee.loginId,
        department: updatedEmployee.department,
        position: updatedEmployee.position,
        stats: {
          totalTasks: tasks.length,
          completedTasks,
          taskCompletionRate,
          totalDaysAttended,
        },
      },
    });

  } catch (error) {
    console.error("UpdateProfile Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server error. Please try again later.",
    });
  }
};