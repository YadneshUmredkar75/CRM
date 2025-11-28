// src/pages/employee/DashboardEmployee.jsx
import React, { useState, useEffect } from "react";
import { formatInTimeZone } from "date-fns-tz";
import {
  Calendar, Clock, CheckCircle, AlertCircle, BarChart3,
  User, Target, RefreshCw
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const IST = "Asia/Kolkata";
const API_BASE_URL = "https://crm-c1y4.onrender.com/api"; // Confirm this

const EmployeeData = () => {
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem('employeeToken');

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate('/employee/login', { replace: true });
    }
  }, [token, navigate]);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatInTimeZone(new Date(), IST, "h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // FETCH ALL DATA
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) return;

      setLoading(true);
      setError("");

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        // Parallel API calls
        const [attRes, taskRes, profileRes] = await Promise.all([
          fetch(`${API_BASE_URL}/attendance/history`, { headers }),
          fetch(`${API_BASE_URL}/employee/task`, { headers }),
          fetch(`${API_BASE_URL}/employee/profile`, { headers })
        ]);

        // === ATTENDANCE ===
        if (attRes.ok) {
          const res = await attRes.json();
          console.log("Attendance API:", res); // Debug
          setAttendance(res.data || res.attendance || []);
        } else {
          console.error("Attendance failed:", attRes.status);
          setAttendance([]);
        }

        // === TASKS ===
        if (taskRes.ok) {
          const res = await taskRes.json();
          console.log("Tasks API:", res);
          setTasks(res.data || res.tasks || []);
        } else {
          console.error("Tasks failed:", taskRes.status);
          setTasks([]);
        }

        // === PROFILE ===
        if (profileRes.ok) {
          const res = await profileRes.json();
          console.log("Profile API:", res);
          const emp = res.data || res.employee || {};
          setProfile(emp);
          localStorage.setItem("employeeData", JSON.stringify(emp));
        } else {
          console.error("Profile failed:", profileRes.status);
          const stored = localStorage.getItem("employeeData");
          if (stored) setProfile(JSON.parse(stored));
        }

      } catch (err) {
        console.error("Network error:", err);
        setError("Server not responding. Check backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  // RETRY
  const handleRetry = () => window.location.reload();

  // LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-gray-50 rounded-2xl p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-gray-50 rounded-2xl p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-800 mb-2">Connection Failed</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button onClick={handleRetry} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // === TODAY FILTER (IST) ===
  const today = formatInTimeZone(new Date(), IST, "yyyy-MM-dd");
  const todayRecords = attendance.filter(r => {
    if (!r.date) return false;
    try {
      const recDate = formatInTimeZone(new Date(r.date), IST, "yyyy-MM-dd");
      return recDate === today;
    } catch {
      return false;
    }
  });

  // === HOURS TODAY ===
  const totalMinsToday = todayRecords.reduce((acc, r) => {
    if (r.clockIn && r.clockOut) {
      const diff = (new Date(r.clockOut) - new Date(r.clockIn)) / 60000;
      return acc + Math.floor(diff);
    }
    return acc;
  }, 0);
  const hoursToday = Math.floor(totalMinsToday / 60);
  const minsToday = totalMinsToday % 60;

  // === MONTHLY HOURS ===
  const monthlyMins = attendance.reduce((acc, r) => {
    if (r.clockIn && r.clockOut) {
      const diff = (new Date(r.clockOut) - new Date(r.clockIn)) / 60000;
      return acc + Math.floor(diff);
    }
    return acc;
  }, 0);
  const totalHoursMonth = Math.floor(monthlyMins / 60);

  // === TASKS ===
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed" || t.progress === 100).length;
  const avgProgress = totalTasks > 0
    ? Math.round(tasks.reduce((acc, t) => acc + (t.progress || 0), 0) / totalTasks)
    : 0;

  // === PROFILE ===
  const { name = "Employee", email, employeeId, _id, department = "N/A", position = "Employee" } = profile;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <User className="w-8 h-8" />
              Welcome back, {name.split(" ")[0]}!
            </h1>
            <p className="text-purple-100 mt-1">{email}</p>
            <p className="text-purple-200 text-sm mt-1">
              Employee ID: {employeeId || _id || "N/A"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Today</p>
            <p className="text-2xl font-bold">
              {formatInTimeZone(new Date(), IST, "EEEE, MMM d, yyyy")}
            </p>
            <p className="text-lg opacity-90 flex items-center justify-end gap-1 mt-1">
              <Clock className="w-5 h-5" />
              {currentTime} IST
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Clock}
          title="Hours Today"
          value={`${hoursToday}h ${minsToday}m`}
          color="from-green-500 to-emerald-600"
          trend={todayRecords.length > 0 ? `${todayRecords.length} session(s)` : "Not clocked in"}
        />
        <StatCard
          icon={Calendar}
          title="Monthly Hours"
          value={`${totalHoursMonth}h`}
          color="from-blue-500 to-indigo-600"
          trend={`${attendance.length} days`}
        />
        <StatCard
          icon={Target}
          title="Tasks"
          value={`${completedTasks}/${totalTasks}`}
          color="from-purple-500 to-pink-600"
          trend={`${avgProgress}% progress`}
        />
      </div>

      {/* Attendance + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl shadow-lg p-6 border">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Today's Attendance
          </h3>
          {todayRecords.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No records yet</p>
              <p className="text-sm text-gray-400 mt-1">Click below to clock in</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayRecords.map((r, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                      {" → "}
                      {r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {r.clockOut ? `${Math.floor((new Date(r.clockOut) - new Date(r.clockIn)) / 60000)} mins` : "Active"}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${r.clockOut ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {r.clockOut ? "Done" : "Live"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link to="/employee/dashboard/attendance" className="mt-4 inline-block text-purple-600 hover:underline text-sm font-medium">
            View Full Log
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Task Progress
          </h3>
          {totalTasks === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No tasks assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall</span>
                  <span className="font-bold">{avgProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all" style={{ width: `${avgProgress}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                  <p className="text-xs text-gray-600">Done</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-2xl font-bold text-yellow-600">{totalTasks - completedTasks}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{totalTasks}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>
            </div>
          )}
          <Link to="/employee/dashboard/task" className="mt-4 inline-block text-purple-600 hover:underline text-sm font-medium">
            View All Tasks
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ActionButton to="/employee/dashboard/attendance" icon={Clock} label="Clock In/Out" color="bg-green-500 hover:bg-green-600" />
        <ActionButton to="/employee/dashboard/task" icon={Target} label="My Tasks" color="bg-purple-500 hover:bg-purple-600" />
        <ActionButton to="/employee/dashboard/studentform" icon={Calendar} label="Request Leave" color="bg-blue-500 hover:bg-blue-600" />
        <ActionButton to="/employee/dashboard/settings" icon={User} label="Profile" color="bg-gray-600 hover:bg-gray-700" />
      </div>
    </div>
  );
};

// Components
const StatCard = ({ icon: Icon, title, value, color, trend }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 border hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 rounded-xl bg-gradient-to-r ${color} text-white`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    <p className="text-xs text-gray-500 mt-2">{trend}</p>
  </div>
);

const ActionButton = ({ to, icon: Icon, label, color }) => (
  <Link to={to} className={`${color} text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all transform hover:-translate-y-1`}>
    <Icon className="w-6 h-6" />
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

export default EmployeeData;