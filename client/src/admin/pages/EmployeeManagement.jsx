// src/admin/pages/EmployeeManagement.jsx
import React, { useState, useEffect } from "react";

// === SVG ICONS ===
const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const DepartmentIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const SalaryIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);
const PerformanceIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const EyeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EditIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const DeleteIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const CloseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const TrophyIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const TaskIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const AttendanceIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const LiveStatusIcon = ({ isActive, className = "w-4 h-4" }) => (
  <svg className={className} fill={isActive ? "#10B981" : "#EF4444"} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="8" opacity="0.3" />
    {isActive && <circle cx="12" cy="12" r="5" className="animate-ping" />}
    <circle cx="12" cy="12" r="5" fill="currentColor" />
  </svg>
);

// === MAIN COMPONENT ===
const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [departments] = useState([
    { id: 1, name: "Sales", head: "Sales Manager" },
    { id: 2, name: "Marketing", head: "Marketing Director" },
    { id: 3, name: "Development", head: "Tech Lead" },
    { id: 4, name: "HR", head: "HR Manager" },
    { id: 5, name: "Finance", head: "Finance Controller" },
    { id: 6, name: "Operations", head: "Operations Manager" }
  ]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [employeeAttendance, setEmployeeAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isPaySalaryModalOpen, setIsPaySalaryModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [newEmployeeCredentials, setNewEmployeeCredentials] = useState(null);
  const [sortBy, setSortBy] = useState("performance");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    name: "", email: "", phone: "", department: "", position: "", salary: "", joiningDate: "",
    status: "Active", employeeType: "Employee", loginId: "", password: ""
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    employeeId: "", employeeName: "", newPassword: "", confirmPassword: ""
  });
  const [paySalaryData, setPaySalaryData] = useState({
    employeeId: "", employeeName: "", amount: "", month: new Date().getMonth() + 1,
    year: new Date().getFullYear(), notes: ""
  });

  const API_URL = "https://crm-c1y4.onrender.com/api";
  const token = localStorage.getItem("adminToken");


  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      alert("Admin not logged in. Redirecting...");
      window.location.href = "/admin/login";
    }
  }, [token]);

  // === FIXED: Fetch Tasks (Admin + Fallback) ===
  const fetchEmployeeTasksData = async (employeeId) => {
    if (!employeeId) return { tasks: [], completedTasks: 0, totalTasks: 0 };

    try {
      const response = await fetch(`${API_URL}/admin/tasks/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        const tasks = Array.isArray(data) ? data : data.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'Completed' || t.status === 'completed').length;
        return { tasks, completedTasks, totalTasks: tasks.length };
      }
    } catch (err) { console.error("Admin tasks error:", err); }

    // Fallback
    try {
      const empResponse = await fetch(`${API_URL}/employee/${employeeId}/tasks`);
      if (empResponse.ok) {
        const empData = await empResponse.json();
        const tasks = Array.isArray(empData) ? empData : empData.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'Completed' || t.status === 'completed').length;
        return { tasks, completedTasks, totalTasks: tasks.length };
      }
    } catch (err) { console.error("Fallback tasks error:", err); }

    return { tasks: [], completedTasks: 0, totalTasks: 0 };
  };

  // === FIXED: Fetch Attendance (Admin + Fallback) ===
  const fetchEmployeeAttendanceData = async (employeeId) => {
    if (!employeeId) return { attendance: [], attendanceRate: 0, presentDays: 0, totalDays: 0 };

    try {
      const response = await fetch(`${API_URL}/attendance/${employeeId}/attendance`);
      if (response.ok) {
        const data = await response.json();
        const records = Array.isArray(data) ? data : data.attendance || [];
        const presentDays = records.filter(r => r.status === 'Present' || r.status === 'present').length;
        const totalDays = records.length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        return { attendance: records, attendanceRate, presentDays, totalDays };
      }
    } catch (err) { console.error("Admin attendance error:", err); }

    // Fallback
    try {
      const empResponse = await fetch(`${API_URL}/attendance/admin/employee/${employeeId}/attendance`);
      if (empResponse.ok) {
        const empData = await empResponse.json();
        const records = Array.isArray(empData) ? empData : empData.attendance || [];
        const presentDays = records.filter(r => r.status === 'Present' || r.status === 'present').length;
        const totalDays = records.length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        return { attendance: records, attendanceRate, presentDays, totalDays };
      }
    } catch (err) { console.error("Fallback attendance error:", err); }

    return { attendance: [], attendanceRate: 0, presentDays: 0, totalDays: 0 };
  };

  // === Fetch Performance (with fallback) ===
  const fetchEmployeePerformance = async (employeeId) => {
    try {
      const response = await fetch(`${API_URL}/employee/${employeeId}/performance`);
      if (response.ok) {
        const data = await response.json();
        return { performance: data.performance || 0 };
      }
    } catch (err) { console.log("Performance endpoint not available"); }

    const [tasksData, attendanceData] = await Promise.all([
      fetchEmployeeTasksData(employeeId),
      fetchEmployeeAttendanceData(employeeId)
    ]);

    const taskCompletion = tasksData.totalTasks > 0 ? (tasksData.completedTasks / tasksData.totalTasks) * 100 : 0;
    const attendanceRate = attendanceData.attendanceRate || 0;
    const performance = Math.round((taskCompletion * 0.6) + (attendanceRate * 0.4));
    return { performance };
  };

  // === Fetch All Employees + Tasks + Attendance + Performance ===
  const fetchEmployees = async () => {
    if (!token) return setError("Token missing");

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/employee/get/employee`,);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const employeesData = Array.isArray(data) ? data : data.employees || data.data || [];

      const employeesWithData = await Promise.all(
        employeesData.map(async (emp) => {
          try {
            const [tasksData, attendanceData, performanceData] = await Promise.all([
              fetchEmployeeTasksData(emp._id),
              fetchEmployeeAttendanceData(emp._id),
              fetchEmployeePerformance(emp._id)
            ]);

            return {
              ...emp,
              tasks: tasksData.tasks,
              completedTasks: tasksData.completedTasks,
              totalTasks: tasksData.totalTasks,
              attendance: attendanceData.attendanceRate,
              presentDays: attendanceData.presentDays,
              totalDays: attendanceData.totalDays,
              performance: performanceData.performance
            };
          } catch (err) {
            console.error(`Error for ${emp._id}:`, err);
            return { ...emp, tasks: [], completedTasks: 0, totalTasks: 0, attendance: 0, performance: 0 };
          }
        })
      );

      setEmployees(employeesWithData);
    } catch (err) {
      setError("Failed to load employees. Server down?");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };
const calculateTaskCompletion = (tasks = []) => {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((task) => task.status === "completed").length;
  return Math.round((completed / tasks.length) * 100);
};
  // Modal Fetchers
  const fetchEmployeeTasks = async (employeeId) => {
    const data = await fetchEmployeeTasksData(employeeId);
    setEmployeeTasks(data.tasks);
    setIsTasksModalOpen(true);
  };

  const fetchEmployeeAttendance = async (employeeId) => {
    const data = await fetchEmployeeAttendanceData(employeeId);
    setEmployeeAttendance(data.attendance);
    setIsAttendanceModalOpen(true);
  };

  useEffect(() => {
    if (token) fetchEmployees();
  }, [token]);

  // === Handlers ===
  const openResetPasswordModal = (emp) => {
    setResetPasswordData({ employeeId: emp._id, employeeName: emp.name, newPassword: "", confirmPassword: "" });
    setIsResetPasswordModalOpen(true);
  };

  const openPaySalaryModal = (emp) => {
    setPaySalaryData({
      employeeId: emp._id,
      employeeName: emp.name,
      amount: emp.pendingSalary || emp.salary || 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      notes: ""
    });
    setIsPaySalaryModalOpen(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) return alert("Passwords don't match");
    if (resetPasswordData.newPassword.length < 6) return alert("Password too short");

    try {
      const res = await fetch(`${API_URL}/employee/${resetPasswordData.employeeId}/reset-password`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: resetPasswordData.newPassword })
      });

      if (res.ok) {
        const emp = employees.find(e => e._id === resetPasswordData.employeeId);
        setNewEmployeeCredentials({ name: emp.name, email: emp.email, loginId: emp.loginId, password: resetPasswordData.newPassword });
        setIsResetPasswordModalOpen(false);
        setIsCredentialsModalOpen(true);
        setSuccess("Password reset!");
      } else {
        alert("Reset failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handlePaySalary = async (e) => {
    e.preventDefault();
    if (!paySalaryData.amount || paySalaryData.amount <= 0) return alert("Invalid amount");

    try {
      const res = await fetch(`${API_URL}/salary/pay/${paySalaryData.employeeId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(paySalaryData.amount),
          month: paySalaryData.month,
          year: paySalaryData.year,
          notes: paySalaryData.notes
        })
      });

      if (res.ok) {
        setIsPaySalaryModalOpen(false);
        fetchEmployees();
        setSuccess("Salary paid!");
      } else {
        alert("Payment failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const required = ["name", "email", "department", "position", "salary", "joiningDate", "loginId", "password"];
    if (required.some(f => !newEmployee[f])) return alert("Fill all required fields");
    if (newEmployee.password.length < 6) return alert("Password too short");

    const payload = { ...newEmployee, salary: +newEmployee.salary, department: +newEmployee.department };

    try {
      const res = await fetch(`${API_URL}/employee/create/employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setNewEmployeeCredentials({ name: payload.name, email: payload.email, loginId: payload.loginId, password: payload.password });
        setIsCredentialsModalOpen(true);
        setIsAddModalOpen(false);
        fetchEmployees();
        setSuccess("Employee created!");
        setNewEmployee({ name: "", email: "", phone: "", department: "", position: "", salary: "", joiningDate: "", employeeType: "Employee", loginId: "", password: "" });
      } else {
        alert("Failed to create");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const payload = { ...selectedEmployee, salary: +selectedEmployee.salary, department: +selectedEmployee.department };
    delete payload.tasks; delete payload.attendance; delete payload.performance;

    try {
      const res = await fetch(`${API_URL}/employee/update/${selectedEmployee._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchEmployees();
        setIsEditModalOpen(false);
        setSelectedEmployee(null);
        setSuccess("Updated!");
      } else {
        alert("Update failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this employee?")) return;
    try {
      const res = await fetch(`${API_URL}/employee/delete/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchEmployees();
        setSuccess("Deleted!");
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const copyCredentialsToClipboard = () => {
    const text = `Name: ${newEmployeeCredentials.name}\nEmail: ${newEmployeeCredentials.email}\nLogin ID: ${newEmployeeCredentials.loginId}\nPassword: ${newEmployeeCredentials.password}`;
    navigator.clipboard.writeText(text).then(() => alert("Copied!"));
  };

  // === Filter & Sort ===
  const filteredAndSorted = employees
    .filter(emp => {
      const search = searchTerm.toLowerCase();
      return (
        emp.name?.toLowerCase().includes(search) ||
        emp.email?.toLowerCase().includes(search) ||
        emp.position?.toLowerCase().includes(search) ||
        emp.loginId?.toLowerCase().includes(search)
      ) && (departmentFilter === "all" || emp.department === +departmentFilter) &&
        (employeeTypeFilter === "all" || emp.employeeType === employeeTypeFilter);
    })
    .sort((a, b) => {
      if (sortBy === "performance") return (b.performance || 0) - (a.performance || 0);
      if (sortBy === "salary") return (b.salary || 0) - (a.salary || 0);
      if (sortBy === "name") return (a.name || '').localeCompare(b.name || '');
      return 0;
    })
    .map((emp, i) => ({
      ...emp,
      rank: i + 1,
      taskCompletion: emp.totalTasks > 0 ? Math.round((emp.completedTasks / emp.totalTasks) * 100) : 0
    }));

  const getRankColor = (r) => r === 1 ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
    r <= 3 ? "text-green-600 bg-green-50 border-green-200" : "text-blue-600 bg-blue-50 border-blue-200";

  const getPerformanceColor = (p) => p >= 90 ? "text-green-600 bg-green-50 border-green-200" :
    p >= 80 ? "text-blue-600 bg-blue-50 border-blue-200" :
    p >= 70 ? "text-yellow-600 bg-yellow-50 border-yellow-200" : "text-red-600 bg-red-50 border-red-200";

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "Active").length;
  const internEmployees = employees.filter(e => e.employeeType === "Intern").length;
  const pendingSalaries = employees.filter(e => (e.pendingSalary || 0) > 0).length;
  const avgPerformance = employees.length > 0
    ? Math.round(employees.reduce((s, e) => s + (e.performance || 0), 0) / employees.length)
    : 0;

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(t);
    }
  }, [success]);

  if (!token) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Employee Management</h1>
          <p className="text-gray-600 mt-1">Real-time backend sync • Tasks + Attendance → Performance</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError("")}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-6">
          {[
            { label: "Total", value: totalEmployees, icon: UserIcon, color: "blue" },
            { label: "Active Now", value: activeEmployees, icon: LiveStatusIcon, color: "green", isLive: true },
            { label: "Active", value: activeEmployees, icon: TrophyIcon, color: "green" },
            { label: "Interns", value: internEmployees, icon: DepartmentIcon, color: "purple" },
            { label: "Pending Pay", value: pendingSalaries, icon: SalaryIcon, color: "red" },
            { label: "Avg Perf", value: `${avgPerformance}%`, icon: PerformanceIcon, color: "orange" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4 border-l-4" style={{ borderLeftColor: i === 0 ? "#3B82F6" : i === 1 ? "#10B981" : i === 2 ? "#8B5CF6" : i === 3 ? "#EF4444" : "#F97316" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-full ${i === 0 ? 'bg-blue-100' : i === 1 ? 'bg-green-100' : i === 2 ? 'bg-purple-100' : i === 3 ? 'bg-red-100' : 'bg-orange-100'}`}>
                  <stat.icon className={`w-5 h-5 ${i === 0 ? 'text-blue-600' : i === 1 ? 'text-green-600' : i === 2 ? 'text-purple-600' : i === 3 ? 'text-red-600' : 'text-orange-600'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Employees Directory</h2>
              <div className="flex flex-col md:flex-row gap-2">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-1.5 text-sm border rounded-md">
                  <option value="performance">Performance</option>
                  <option value="salary">Salary</option>
                  <option value="name">Name</option>
                </select>
                <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="px-3 py-1.5 text-sm border rounded-md">
                  <option value="all">All Depts</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select value={employeeTypeFilter} onChange={e => setEmployeeTypeFilter(e.target.value)} className="px-3 py-1.5 text-sm border rounded-md">
                  <option value="all">All Types</option>
                  <option value="Employee">Employee</option>
                  <option value="Intern">Intern</option>
                </select>
                <div className="relative">
                  <input
                    type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-sm border rounded-md w-full md:w-48"
                  />
                  <SearchIcon className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1">
                  <UserIcon className="w-4 h-4" /> Add
                </button>
                <button 
                  onClick={fetchEmployees}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading employees...
              </div>
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {employees.length === 0 ? "No employees found" : "No employees match your search criteria"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-gray-50 text-xs">
                  <tr>
                    {/* <th className="px-3 py-2 text-left">Rank</th> */}
                    {/* <th className="px-6 py-2 text-left">Status</th>  */}
                    <th className="px-4 py-2 text-left">Employee</th>
                    <th className="px-3 py-2 text-left">Login ID</th>
                    <th className="px-3 py-2 text-left">Dept & Role</th>
                    <th className="px-3 py-2 text-left">Salary</th>
                    <th className="px-3 py-2 text-center">Perf</th>
                    <th className="px-3 py-2 text-center">Attn</th>
                    <th className="px-3 py-2 text-center">Tasks</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {filteredAndSorted.map(emp => {
                    if (!emp) return null;
                    const dept = departments.find(d => d.id === emp.department);
                    const hasPendingSalary = (emp.pendingSalary || 0) > 0;
                    const totalTasks = emp.totalTasks || 0;
                    const completedTasks = emp.completedTasks || 0;
                    const taskCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                    
                    return (
                      <tr key={emp._id} className="hover:bg-gray-50">
                        {/* <td className="px-3 py-3 text-center"> */}
                          {/* <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${getRankColor(emp.rank)}`}>
                            #{emp.rank}
                          </div> */}
                        {/* </td> */}
                        {/* <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <LiveStatusIcon isActive={emp.statusDisplay} />
                            <span className={`text-xs font-medium ${emp.isActive ? 'text-green-700' : 'text-red-700'}`}>
                              {emp.isActive ? "Active" : "Deactive"}
                            </span>
                          </div>
                        </td> */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {emp.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{emp.name}</div>
                              <div className="text-xs text-gray-500">{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs">{emp.loginId}</td>
                        <td className="px-3 py-3 text-xs">
                          <div className="font-medium">{dept?.name || "—"}</div>
                          <div className="text-gray-600">{emp.position}</div>
                        </td>
                        <td className="px-3 py-3 text-xs">
                          <div>₹{emp.salary?.toLocaleString() || "0"}</div>
                          {hasPendingSalary && (
                            <div className="text-red-600 text-xs">
                              ₹{emp.pendingSalary?.toLocaleString()} pending
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getPerformanceColor(emp.performance || 0)}`}>
                            {emp.performance || 0}%
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getPerformanceColor(emp.attendance || 0)}`}>
                            {emp.attendance || 0}%
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-xs">
                          {completedTasks}/{totalTasks}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${taskCompletion}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => setSelectedEmployee(emp)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View Details">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setSelectedEmployee(emp); setIsEditModalOpen(true); }} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded" title="Edit">
                              <EditIcon className="w-4 h-4" />
                            </button>
                            {/* <button onClick={() => fetchEmployeeTasks(emp._id)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="View Tasks">
                              <TaskIcon className="w-4 h-4" />
                            </button> */}
                            {/* <button onClick={() => fetchEmployeeAttendance(emp._id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="View Attendance"> */}
                              {/* <AttendanceIcon className="w-4 h-4" />
                            </button> */}
                            <button onClick={() => openResetPasswordModal(emp)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Reset Password">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </button>
                            {hasPendingSalary && (
                              <button
                                onClick={() => openPaySalaryModal(emp)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                title="Pay Salary"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => handleDelete(emp._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                              <DeleteIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Credentials Modal */}
        {isCredentialsModalOpen && newEmployeeCredentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-green-600">Credentials Generated!</h3>
                <p className="text-sm text-gray-600 mt-1">Save these credentials securely</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="font-medium">Name:</span><span>{newEmployeeCredentials.name}</span></div>
                <div className="flex justify-between"><span className="font-medium">Email:</span><span>{newEmployeeCredentials.email}</span></div>
                <div className="flex justify-between"><span className="font-medium">Login ID:</span><span className="font-mono bg-gray-200 px-1 rounded">{newEmployeeCredentials.loginId}</span></div>
                <div className="flex justify-between"><span className="font-medium">Password:</span><span className="font-mono text-red-600 bg-red-50 px-1 rounded">{newEmployeeCredentials.password}</span></div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={copyCredentialsToClipboard} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm">
                  Copy
                </button>
                <button onClick={() => { setIsCredentialsModalOpen(false); setNewEmployeeCredentials(null); }} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {isResetPasswordModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold">Reset Password</h3>
                <button onClick={() => { 
                  setIsResetPasswordModalOpen(false); 
                  setResetPasswordData({
                    employeeId: "",
                    employeeName: "",
                    newPassword: "",
                    confirmPassword: ""
                  });
                }} className="text-gray-500 hover:text-gray-700">
                  <CloseIcon />
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Reset password for: <strong>{resetPasswordData.employeeName}</strong>
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={resetPasswordData.newPassword}
                    onChange={e => setResetPasswordData({
                      ...resetPasswordData,
                      newPassword: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={resetPasswordData.confirmPassword}
                    onChange={e => setResetPasswordData({
                      ...resetPasswordData,
                      confirmPassword: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>

                {resetPasswordData.newPassword && resetPasswordData.confirmPassword && 
                 resetPasswordData.newPassword !== resetPasswordData.confirmPassword && (
                  <div className="text-red-600 text-sm">
                    Passwords do not match
                  </div>
                )}

                {resetPasswordData.newPassword && resetPasswordData.newPassword.length < 6 && (
                  <div className="text-red-600 text-sm">
                    Password must be at least 6 characters long
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { 
                      setIsResetPasswordModalOpen(false); 
                      setResetPasswordData({
                        employeeId: "",
                        employeeName: "",
                        newPassword: "",
                        confirmPassword: ""
                      });
                    }} 
                    className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={!resetPasswordData.newPassword || 
                             !resetPasswordData.confirmPassword || 
                             resetPasswordData.newPassword !== resetPasswordData.confirmPassword ||
                             resetPasswordData.newPassword.length < 6}
                    className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pay Salary Modal */}
        {isPaySalaryModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold">Pay Salary</h3>
                <button onClick={() => { 
                  setIsPaySalaryModalOpen(false); 
                  setPaySalaryData({
                    employeeId: "",
                    employeeName: "",
                    amount: "",
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    notes: ""
                  });
                }} className="text-gray-500 hover:text-gray-700">
                  <CloseIcon />
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Pay salary for: <strong>{paySalaryData.employeeName}</strong>
                </p>
              </div>

              <form onSubmit={handlePaySalary} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={paySalaryData.amount}
                    onChange={e => setPaySalaryData({
                      ...paySalaryData,
                      amount: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount to pay"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      value={paySalaryData.month}
                      onChange={e => setPaySalaryData({
                        ...paySalaryData,
                        month: parseInt(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i+1} value={i+1}>
                          {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={paySalaryData.year}
                      onChange={e => setPaySalaryData({
                        ...paySalaryData,
                        year: parseInt(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={paySalaryData.notes}
                    onChange={e => setPaySalaryData({
                      ...paySalaryData,
                      notes: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes about this payment"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { 
                      setIsPaySalaryModalOpen(false); 
                      setPaySalaryData({
                        employeeId: "",
                        employeeName: "",
                        amount: "",
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                        notes: ""
                      });
                    }} 
                    className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={!paySalaryData.amount || paySalaryData.amount <= 0}
                    className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Pay Salary
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tasks Modal */}
        {isTasksModalOpen && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold">Tasks - {selectedEmployee.name}</h3>
                <button onClick={() => setIsTasksModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <CloseIcon />
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Total Tasks: {employeeTasks.length} | Completed: {employeeTasks.filter(t => 
                    t.status === 'Completed' || t.status === 'completed'
                  ).length}
                </p>
              </div>

              {employeeTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tasks found for this employee
                </div>
              ) : (
                <div className="space-y-3">
                  {employeeTasks.map((task, index) => (
                    <div key={task._id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Type: {task.type}</span>
                          <span>Priority: {task.priority}</span>
                          {task.dueDate && (
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          (task.status === 'Completed' || task.status === 'completed') ? 'bg-green-100 text-green-800' : 
                          task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {task.status}
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${task.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-8 text-center">{task.progress || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance Modal */}
        {isAttendanceModalOpen && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold">Attendance - {selectedEmployee.name}</h3>
                <button onClick={() => setIsAttendanceModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <CloseIcon />
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Total Records: {employeeAttendance.length} | Present Days: {employeeAttendance.filter(a => 
                    a.status === 'Present' || a.status === 'present'
                  ).length}
                </p>
              </div>

              {employeeAttendance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No attendance records found for this employee
                </div>
              ) : (
                <div className="space-y-3">
                  {employeeAttendance.map((record, index) => (
                    <div key={record._id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-gray-800">
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            (record.status === 'Present' || record.status === 'present') ? 'bg-green-100 text-green-800' : 
                            record.status === 'Absent' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                          <span>Clock In: {record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : 'N/A'}</span>
                          <span>Clock Out: {record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : 'N/A'}</span>
                          {record.hoursWorked && (
                            <span>Hours: {record.hoursWorked}h</span>
                          )}
                        </div>
                        {record.notes && (
                          <p className="text-xs text-gray-500 mt-1">{record.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADD MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold">Add New Employee</h3>
                <button onClick={() => { setIsAddModalOpen(false); setNewEmployee({
                  name: "", email: "", phone: "", department: "", position: "", salary: "", 
                  joiningDate: "", status: "Active", employeeType: "Employee", loginId: "", password: ""
                }); }} className="text-gray-500 hover:text-gray-700">
                  <CloseIcon />
                </button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newEmployee.name}
                      onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={newEmployee.email}
                      onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newEmployee.phone}
                      onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      required
                      value={newEmployee.department}
                      onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                    <input
                      type="text"
                      required
                      value={newEmployee.position}
                      onChange={e => setNewEmployee({...newEmployee, position: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter position"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newEmployee.salary}
                      onChange={e => setNewEmployee({...newEmployee, salary: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter salary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date *</label>
                    <input
                      type="date"
                      required
                      value={newEmployee.joiningDate}
                      onChange={e => setNewEmployee({...newEmployee, joiningDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Type</label>
                    <select
                      value={newEmployee.employeeType}
                      onChange={e => setNewEmployee({...newEmployee, employeeType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newEmployee.status}
                      onChange={e => setNewEmployee({...newEmployee, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Login ID *</label>
                    <input
                      type="text"
                      required
                      value={newEmployee.loginId}
                      onChange={e => setNewEmployee({...newEmployee, loginId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter login ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="text"
                      required
                      minLength="6"
                      value={newEmployee.password}
                      onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter password (min 6 characters)"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => { setIsAddModalOpen(false); setNewEmployee({
                    name: "", email: "", phone: "", department: "", position: "", salary: "", 
                    joiningDate: "", status: "Active", employeeType: "Employee", loginId: "", password: ""
                  }); }} className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm">
                    Create Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {isEditModalOpen && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold">Edit Employee</h3>
                <button onClick={() => { setIsEditModalOpen(false); setSelectedEmployee(null); }} className="text-gray-500 hover:text-gray-700">
                  <CloseIcon />
                </button>
              </div>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={selectedEmployee.name || ""}
                      onChange={e => setSelectedEmployee({...selectedEmployee, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={selectedEmployee.email || ""}
                      onChange={e => setSelectedEmployee({...selectedEmployee, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={selectedEmployee.phone || ""}
                      onChange={e => setSelectedEmployee({...selectedEmployee, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      required
                      value={selectedEmployee.department || ""}
                      onChange={e => setSelectedEmployee({...selectedEmployee, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                    <input
                      type="text"
                      required
                      value={selectedEmployee.position || ""}
                      onChange={e => setSelectedEmployee({...selectedEmployee, position: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={selectedEmployee.salary || ""}
                      onChange={e => setSelectedEmployee({...selectedEmployee, salary: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Type</label>
                    <select
                      value={selectedEmployee.employeeType || "Employee"}
                      onChange={e => setSelectedEmployee({...selectedEmployee, employeeType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedEmployee.status || "Active"}
                      onChange={e => setSelectedEmployee({...selectedEmployee, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedEmployee(null); }} className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm">
                    Update Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {selectedEmployee && !isAddModalOpen && !isEditModalOpen && !isCredentialsModalOpen && !isTasksModalOpen && !isAttendanceModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedEmployee.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedEmployee.name}</h2>
                      <p className="text-blue-100">{selectedEmployee.position}</p>
                      <p className="text-blue-200 text-sm font-mono">Login ID: {selectedEmployee.loginId}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedEmployee(null)} className="text-white hover:text-blue-200">
                    <CloseIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-8 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selectedEmployee.email}</p></div>
                  <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{selectedEmployee.phone || "—"}</p></div>
                  <div><p className="text-sm text-gray-500">Department</p><p className="font-medium">{departments.find(d => d.id === selectedEmployee.department)?.name || "—"}</p></div>
                  <div><p className="text-sm text-gray-500">Position</p><p className="font-medium">{selectedEmployee.position}</p></div>
                  <div><p className="text-sm text-gray-500">Salary</p><p className="font-medium">₹{selectedEmployee.salary?.toLocaleString() || "0"}</p></div>
                  <div><p className="text-sm text-gray-500">Pending Salary</p><p className="font-medium">₹{selectedEmployee.pendingSalary?.toLocaleString() || "0"}</p></div>
                  <div><p className="text-sm text-gray-500">Paid Salary</p><p className="font-medium">₹{selectedEmployee.paidSalary?.toLocaleString() || "0"}</p></div>
                  <div><p className="text-sm text-gray-500">Joining Date</p><p className="font-medium">{selectedEmployee.joiningDate ? new Date(selectedEmployee.joiningDate).toLocaleDateString() : "—"}</p></div>
                  <div><p className="text-sm text-gray-500">Employee Type</p><p className="font-medium">{selectedEmployee.employeeType}</p></div>
                  <div><p className="text-sm text-gray-500">Status</p><p className="font-medium"><span className={`px-2 py-1 rounded-full text-xs ${selectedEmployee.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{selectedEmployee.status}</span></p></div>
                  <div><p className="text-sm text-gray-500">Performance</p><p className="font-medium">{selectedEmployee.performance || 0}%</p></div>
                  <div><p className="text-sm text-gray-500">Attendance</p><p className="font-medium">{selectedEmployee.attendance || 0}%</p></div>
                  <div><p className="text-sm text-gray-500">Tasks Completed</p><p className="font-medium">{selectedEmployee.completedTasks || 0}/{selectedEmployee.totalTasks || 0}</p></div>
                  <div>
                <p className="text-sm text-gray-500">Task Completion Rate</p>
                <p className="font-medium">
                  {calculateTaskCompletion(selectedEmployee.tasks || [])}%
                </p>
              </div>
                </div>
                
                {/* Tasks Section */}
                {Array.isArray(selectedEmployee.tasks) && selectedEmployee.tasks.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
                    <div className="space-y-3">
                      {selectedEmployee.tasks.slice(0, 5).map((task, index) => (
                        <div key={task._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-600">{task.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            (task.status === 'Completed' || task.status === 'completed') ? 'bg-green-100 text-green-800' : 
                            task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;