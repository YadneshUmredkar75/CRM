// src/pages/employee/TaskTracker.jsx
import React, { useState, useEffect } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { Plus, FileText, Check, Loader } from "lucide-react";
import TaskCard from "../components/TaskCard";
import { toast, Toaster } from "react-hot-toast";

const IST = "Asia/Kolkata";
const API_URL = "https://crm-c1y4.onrender.com/api";

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];
const TYPE_OPTIONS = ["Daily", "Weekly", "Monthly", "Project"];

const TaskTracker = ({ isManager = false }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "Daily",
    priority: "medium",
    progress: 0,
    notes: "",
  });
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("employeeToken");

  const ensureArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.task) return [data.task];
    if (data?.tasks && Array.isArray(data.tasks)) return data.tasks;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const getTaskId = (task) => task?._id ? String(task._id) : null;

  const generateTaskKey = (task) => {
    const id = getTaskId(task);
    if (id) return `task_${id}`;
    const hash = btoa(JSON.stringify({ title: task.title, type: task.type, createdAt: task.createdAt || Date.now() })).substring(0, 10);
    return `task_${hash}_${Date.now()}`;
  };

  // === FETCH TASKS ===
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/employee/task`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("employeeToken");
          localStorage.removeItem("currentEmployee");
          window.location.href = "/employee/login";
          return;
        }
        const err = await res.json();
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const tasksArray = ensureArray(data);
      setTasks(tasksArray);
      localStorage.setItem("employeeTasks", JSON.stringify(tasksArray));
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      try {
        const saved = localStorage.getItem("employeeTasks");
        if (saved) setTasks(ensureArray(JSON.parse(saved)));
      } catch { setTasks([]); }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
    else { setLoading(false); setError("Not authenticated"); }
  }, [token]);

  // === ADD TASK ===
  const handleAddTask = async () => {
    if (!newTask.title.trim()) return toast.error("Title is required");

    const payload = {
      title: newTask.title.trim(),
      description: newTask.description?.trim() || "",
      type: newTask.type,
      priority: newTask.priority,
      progress: parseInt(newTask.progress) || 0,
      notes: newTask.notes?.trim() || "",
      status: newTask.progress >= 100 ? "Completed" : "Pending",
    };

    try {
      const res = await fetch(`${API_URL}/employee/task`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add task");

      const added = data.task || data;
      setTasks(prev => {
        const updated = [added, ...ensureArray(prev)];
        localStorage.setItem("employeeTasks", JSON.stringify(updated));
        return updated;
      });

      setNewTask({ title: "", description: "", type: "Daily", priority: "medium", progress: 0, notes: "" });
      toast.success("Task added!");
    } catch (e) {
      toast.error(e.message);
    }
  };

  // === UPDATE TASK (Modal) ===
  const handleUpdateTask = async (task) => {
    const id = getTaskId(task);
    if (!id) return toast.error("Invalid task ID");

    const payload = {
      title: task.title?.trim(),
      description: task.description?.trim() || "",
      type: task.type,
      priority: task.priority,
      progress: parseInt(task.progress) || 0,
      notes: task.notes?.trim() || "",
      status: task.progress >= 100 ? "Completed" : "In Progress",
    };

    try {
      const res = await fetch(`${API_URL}/employee/task/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      const updatedTask = data.task || data;
      setTasks(prev => {
        const updated = ensureArray(prev).map(t => getTaskId(t) === id ? updatedTask : t);
        localStorage.setItem("employeeTasks", JSON.stringify(updated));
        return updated;
      });

      setEditTask(null);
      toast.success("Task updated!");
    } catch (e) {
      toast.error(e.message);
    }
  };

  // === DELETE TASK ===
  const handleDeleteTask = async (task) => {
    const id = getTaskId(task);
    if (!id) return toast.error("No task ID");

    if (!window.confirm(`Delete "${task.title}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/employee/task/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Delete failed");
      }

      setTasks(prev => {
        const updated = ensureArray(prev).filter(t => getTaskId(t) !== id);
        localStorage.setItem("employeeTasks", JSON.stringify(updated));
        return updated;
      });
      toast.success("Task deleted!");
    } catch (e) {
      toast.error(e.message);
    }
  };

  // === REPORT ===
  const generateReport = () => {
    const arr = ensureArray(tasks);
    const completed = arr.filter(t => (t.progress || 0) >= 100).length;
    const total = arr.length;
    const avg = total ? (arr.reduce((a, t) => a + (t.progress || 0), 0) / total).toFixed(1) : 0;

    const report = {
      date: formatInTimeZone(new Date(), IST, "yyyy-MM-dd h:mm:ss a z"),
      totalTasks: total,
      completed,
      pending: total - completed,
      averageProgress: `${avg}%`,
      tasksByType: {
        Daily: arr.filter(t => t.type === "Daily").length,
        Weekly: arr.filter(t => t.type === "Weekly").length,
        Monthly: arr.filter(t => t.type === "Monthly").length,
        Project: arr.filter(t => t.type === "Project").length,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `task-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  const tasksArray = ensureArray(tasks);
  const completedTasks = tasksArray.filter(t => (t.progress || 0) >= 100);
  const pendingTasks = tasksArray.filter(t => (t.progress || 0) < 100);
  const teamProgress = tasksArray.length > 0
    ? (tasksArray.reduce((a, t) => a + (t.progress || 0), 0) / tasksArray.length).toFixed(1)
    : 0;

  if (!token) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">Please log in.</p>
        <button onClick={() => (window.location.href = "/employee/login")} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-6 max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-600" />
            Task Tracker
            {isManager && <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Manager View</span>}
          </h2>
          {isManager && (
            <button onClick={generateReport} className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2">
              <Check className="w-5 h-5" /> Generate Report
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{tasksArray.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{pendingTasks.length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{teamProgress}%</div>
            <div className="text-sm text-gray-600">Avg Progress</div>
          </div>
        </div>

        {/* Add Task */}
        {!isManager && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Add New Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task Title *"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <button
                onClick={handleAddTask}
                className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Task
              </button>
            </div>
            <div className="space-y-4">
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Description (optional)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows="2"
              />
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress: {newTask.progress}%</label>
                  <input
                    type="range"
                    value={newTask.progress}
                    onChange={(e) => setNewTask({ ...newTask, progress: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    min="0"
                    max="100"
                  />
                </div>
                <input
                  type="number"
                  value={newTask.progress}
                  onChange={(e) => setNewTask({ ...newTask, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-20 p-2 border border-gray-300 rounded-lg text-center"
                  min="0"
                  max="100"
                />
              </div>
              <textarea
                value={newTask.notes}
                onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                placeholder="Notes (optional)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows="2"
              />
            </div>
          </div>
        )}

        {/* Task List */}
        {tasksArray.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasksArray.map(task => (
              <TaskCard
                key={generateTaskKey(task)}
                task={task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                isManager={isManager}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-4">
              {!isManager ? "Add your first task to get started" : "No tasks assigned"}
            </p>
            {!isManager && (
              <button
                onClick={() => document.querySelector('input[placeholder="Task Title *"]')?.focus()}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Create First Task
              </button>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Update Task</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editTask.title || ""}
                  onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <select
                  value={editTask.type || "Daily"}
                  onChange={(e) => setEditTask({ ...editTask, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={editTask.priority || "medium"}
                  onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress: {editTask.progress || 0}%</label>
                  <input
                    type="range"
                    value={editTask.progress || 0}
                    onChange={(e) => setEditTask({ ...editTask, progress: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    min="0"
                    max="100"
                  />
                  <input
                    type="number"
                    value={editTask.progress || 0}
                    onChange={(e) => setEditTask({ ...editTask, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg text-center"
                    min="0"
                    max="100"
                  />
                </div>
                <textarea
                  value={editTask.description || ""}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows="3"
                />
                <textarea
                  value={editTask.notes || ""}
                  onChange={(e) => setEditTask({ ...editTask, notes: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows="2"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button onClick={() => setEditTask(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button onClick={() => handleUpdateTask(editTask)} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TaskTracker;