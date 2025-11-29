// src/pages/DashboardAdmin.jsx
import React, { useState } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import ClientManagement from "../pages/ClientManagement";
import { PiCoins } from "react-icons/pi";
import { IoLocationSharp } from "react-icons/io5";
import { GiExitDoor } from "react-icons/gi";
// Import your components
import StudentManagement from "../pages/StudentManagement";
import EmployeeManagement from "../pages/EmployeeManagement";
import CourseManagement from "../pages/CourseManagement";
import AttendanceManagement from "../pages/AttendanceManagement";
import ProjectManagement from "../pages/ProjectManagement";
import LeadInsensitiveManagement from "../pages/LeadInsensitiveManagement";
import Dashboard from "../pages/Dashboard ";
import ExpenseManagement from "../pages/ExpenseManagement";
import EmployeeLiveStatus from "../pages/EmployeeLiveStatus";
import AdminLeaveDashboard from "../pages/AdminLeaveDashboard";
import TaskAdmin from "../pages/TaskAdmin"

// SVG Icons
const DashboardIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10" />
  </svg>
);

const StudentIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5m-9 5v10" />
  </svg>
);

const EmployeeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CourseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const AttendanceIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const ProjectIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

const ClientIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const LeadIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ReportIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SettingsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const MenuIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/* ----------  MAIN DASHBOARD LAYOUT  ---------- */
const DashboardAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userRole");
    navigate("/admin");
  };


  const menuItems = [
    { path: ".", label: "Dashboard", icon: DashboardIcon }, // Relative path
    { path: "student-management", label: "Student Management", icon: StudentIcon },
    { path: "employees", label: "Employee Management", icon: EmployeeIcon },
    { path: "monitoring-task", label: "Monitoring Task", icon: EmployeeIcon },

    { path: "courses", label: "Course Management", icon: CourseIcon },
    { path: "attendance", label: "Attendance", icon: AttendanceIcon },
    { path: "employeeLeaveStatus", label: "Leave Request", icon: GiExitDoor },
    { path: "project-management", label: "Project Management", icon: ProjectIcon },
    { path: "employeeLiveStatus", label: "Employee Live Status", icon: IoLocationSharp },
    { path: "client-management", label: "Client Management", icon: ClientIcon },
    { path: "expense-management", label: "Expense Management", icon: PiCoins },
    { path: "leadinsensitivemanagement", label: "Lead Management", icon: LeadIcon },
    { path: "reports", label: "Reports & Analytics", icon: ReportIcon },
    { path: "settings", label: "Settings", icon: SettingsIcon },
  ];

  /* ----  PROTECTED ROUTE CHECK  ---- */
  // Moved to App.jsx, but keeping this as a fallback
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  // Determine active item based on relative path
  const basePath = "/admin/dashboard";
  const cleanPath = location.pathname.startsWith(basePath)
    ? location.pathname.slice(basePath.length) || "/"
    : "/";
  const isActive = (item) =>
    item.path === "." ? cleanPath === "/" : cleanPath === `/${item.path}`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ----------  SIDEBAR  ---------- */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 
          ${sidebarOpen ? "w-64" : "w-20"} 
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-gradient-to-b from-blue-900 to-blue-800 text-white 
          transition-all duration-300 flex flex-col transform`}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between border-b border-blue-700">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <DashboardIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-white">SS Group</h2>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors hidden lg:block"
          >
            {sidebarOpen ? <CloseIcon className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors lg:hidden"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path === "." ? "/admin/dashboard" : `/admin/dashboard/${item.path}`}
                className={`flex items-center p-3 rounded-xl transition-all duration-200 group
                  ${isActive(item)
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  }`}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <IconComponent
                  className={`w-5 h-5 transition-colors
                    ${isActive(item) ? "text-blue-600" : "text-blue-300 group-hover:text-white"}`}
                />
                {sidebarOpen && (
                  <span className={`ml-3 font-medium transition-colors
                    ${isActive(item) ? "text-blue-600" : "text-blue-100 group-hover:text-white"}`}>
                    {item.label}
                  </span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-14 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-blue-700">
          <div className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"}`}>
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Admin User</p>
                  <p className="text-xs text-blue-200 truncate">Administrator</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg hover:bg-red-600 transition-colors group
                ${sidebarOpen ? "text-red-300 hover:text-white" : "text-blue-300"}`}
              title="Logout"
            >
              <LogoutIcon className="w-5 h-5" />
              {!sidebarOpen && (
                <div className="absolute left-14 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ----------  MAIN CONTENT  ---------- */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <MenuIcon className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                {menuItems.find((i) => isActive(i))?.label || "Admin Dashboard"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-7.11 1 1 0 00-.68-1.15 1 1 0 00-1.22.7A7.97 7.97 0 008 12a7.97 7.97 0 004.38 7.13 1 1 0 001.35-.63 1 1 0 00-.56-1.3 5.99 5.99 0 01-3.93-8.64z" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="student-management" element={<StudentManagement />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="monitoring-task" element={<TaskAdmin />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="project-management" element={<ProjectManagement />} />
            <Route path="client-management" element={<ClientManagement />} />
            <Route path="expense-management" element={<ExpenseManagement />} />
            <Route path="employeeLiveStatus" element={<EmployeeLiveStatus />} />
            <Route path="employeeLeaveStatus" element={<AdminLeaveDashboard />} />
            <Route path="leadinsensitivemanagement" element={<LeadInsensitiveManagement />} />
            <Route path="reports" element={<div className="bg-white rounded-xl shadow-sm p-6"><h2 className="text-2xl font-bold text-gray-800 mb-4">Reports & Analytics</h2><p className="text-gray-600">Comprehensive reports and analytics will appear here...</p></div>} />
            <Route path="settings" element={<div className="bg-white rounded-xl shadow-sm p-6"><h2 className="text-2xl font-bold text-gray-800 mb-4">System Settings</h2><p className="text-gray-600">System configuration and settings will appear here...</p></div>} />
            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;