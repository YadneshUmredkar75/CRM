// src/admin/pages/ProjectManagement.jsx
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const api = axios.create({
  baseURL: "https://crm-c1y4.onrender.com/api",
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("adminToken");
      toast.error("Session expired!");
      setTimeout(() => (window.location.href = "/admin"), 1500);
    }
    return Promise.reject(err);
  }
);

// Icons
const ProjectIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

const CloseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UsersIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: "",
    startDate: "",
    endDate: "",
    budget: "",
    status: "Planning",
    priority: "Medium",
    teamMembers: [],
    progress: 0,
  });

  // Load all data
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/admin";
      return;
    }

    const loadData = async () => {
      try {
        const [projRes, clientRes, empRes] = await Promise.all([
          api.get("/projects"),
          api.get("/clients"),
          api.get("/employee/get/employee"),
        ]);

        setProjects(projRes.data.projects || []);
        setClients(clientRes.data.clients || []);
        setEmployees(empRes.data.employees || []);
      } catch (err) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        budget: Number(formData.budget),
        progress: Number(formData.progress),
      };

      if (isEditOpen && editingProject) {
        const res = await api.put(`/projects/${editingProject._id}`, payload);
        setProjects((prev) =>
          prev.map((p) => (p._id === res.data.project._id ? res.data.project : p))
        );
        toast.success("Project updated!");
      } else {
        const res = await api.post("/projects", payload);
        setProjects((prev) => [...prev, res.data.project]);
        toast.success("Project created!");
      }

      setIsAddOpen(false);
      setIsEditOpen(false);
      setFormData({
        name: "", description: "", client: "", startDate: "", endDate: "",
        budget: "", status: "Planning", priority: "Medium", teamMembers: [], progress: 0
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success("Project deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
      client: project.client?._id || "",
      startDate: project.startDate?.slice(0, 10) || "",
      endDate: project.endDate?.slice(0, 10) || "",
      budget: project.budget,
      status: project.status,
      priority: project.priority || "Medium",
      teamMembers: project.teamMembers?.map((m) => m._id || m) || [],
      progress: project.progress || 0,
    });
    setIsEditOpen(true);
  };

  const stats = projects.reduce(
    (acc, p) => {
      acc.total++;
      if (p.status === "In Progress") acc.inProgress++;
      if (p.status === "Completed") acc.completed++;
      acc.totalBudget += Number(p.budget || 0);
      return acc;
    },
    { total: 0, inProgress: 0, completed: 0, totalBudget: 0 }
  );

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Project Management</h1>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[
              { label: "Total Projects", value: stats.total, color: "blue" },
              { label: "In Progress", value: stats.inProgress, color: "green" },
              { label: "Completed", value: stats.completed, color: "purple" },
              { label: "Total Budget", value: `₹${stats.totalBudget.toLocaleString()}`, color: "orange" },
            ].map((s, i) => (
              <div key={i} className={`bg-white p-6 rounded-2xl shadow-lg border-l-4 border-${s.color}-600`}>
                <p className="text-gray-600">{s.label}</p>
                <p className="text-3xl font-bold mt-2">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Add Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => {
                setFormData({
                  name: "", description: "", client: "", startDate: "", endDate: "",
                  budget: "", status: "Planning", priority: "Medium", teamMembers: [], progress: 0
                });
                setIsAddOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
            >
              <ProjectIcon /> Add New Project
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {loading ? (
              <div className="p-20 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-indigo-600 rounded-full border-t-transparent mx-auto"></div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Project</th>
                    <th className="px-6 py-4 text-left">Client</th>
                    <th className="px-6 py-4 text-left">Team</th>
                    <th className="px-6 py-4 text-left">Budget</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projects.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold">{p.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">{p.client?.name || "N/A"}</td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-3">
                          {p.teamMembers?.slice(0, 5).map((member, i) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold border-4 border-white shadow"
                              title={member.name}
                            >
                              {member.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                          ))}
                          {p.teamMembers?.length > 5 && (
                            <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-bold border-4 border-white">
                              +{p.teamMembers.length - 5}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600">₹{Number(p.budget).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          p.status === "Completed" ? "bg-green-100 text-green-800" :
                          p.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                          p.status === "Planning" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-3">
                        <button
                          onClick={() => openEditModal(p)}
                          className="text-yellow-600 hover:bg-yellow-100 p-2 rounded-lg"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-red-600 hover:bg-red-100 p-2 rounded-lg"
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ADD / EDIT MODAL */}
        {(isAddOpen || isEditOpen) && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-8 py-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {isEditOpen ? "Edit Project" : "Add New Project"}
                </h2>
                <button onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
                    <select
                      required
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg"
                    >
                      <option value="">Select Client</option>
                      {clients.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg"
                    >
                      {["Planning", "In Progress", "On Hold", "Completed", "Cancelled"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      min={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                {/* TEAM MEMBERS */}
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <UsersIcon /> Assign Team Members
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                    {employees.length === 0 ? (
                      <p className="text-center text-gray-500">No employees available</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {employees.map((emp) => (
                          <label
                            key={emp._id}
                            className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:border-indigo-500 cursor-pointer transition"
                          >
                            <input
                              type="checkbox"
                              checked={formData.teamMembers.includes(emp._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    teamMembers: [...prev.teamMembers, emp._id],
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    teamMembers: prev.teamMembers.filter((id) => id !== emp._id),
                                  }));
                                }
                              }}
                              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {emp.name.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <div>
                                <div className="font-medium">{emp.name}</div>
                                <div className="text-xs text-gray-500">{emp.position || "Employee"}</div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                    className="px-6 py-3 border rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    {isEditOpen ? "Update Project" : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectManagement;