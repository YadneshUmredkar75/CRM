// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import Counter from "./models/counter.js";

// Routes
import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import salaryRoute from "./routes/salaryRoute.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import studentRoutes from "./routes/student.routes.js";
import Course from "./routes/courses.js";
import clientRoutes from "./routes/clientRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";

dotenv.config();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB Connection
connectDB();

// Init Counter
const initCounter = async () => {
  try {
    const counter = await Counter.findOne({ _id: "client_project_number" });
    if (!counter) {
      await Counter.create({ _id: "client_project_number", seq: 1000 });
      console.log("Counter initialized → Next project: PROJ-000001");
    }
  } catch (err) {
    console.error("Counter initialization failed:", err);
  }
};
initCounter();

const app = express();

// JSON Middleware
app.use(express.json());

// Allowed Frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "https://crm-seven-jade.vercel.app",
  "https://crm-r214yejox-yadneshs-projects-d6a3e3e2.vercel.app",
  "https://crm-b4yic2hsr-yadneshs-projects-d6a3e3e2.vercel.app"
];

// Full Dynamic CORS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Express 5 Fix for wildcard OPTIONS
app.options("/*", cors());

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/salary", salaryRoute);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/courses", Course);
app.use("/api/expenses", expenseRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/leaves", leaveRoutes);

// Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "client/dist");
  app.use(express.static(frontendPath));

  // Handle React refresh route support
  app.get("/*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Default Route
app.get("/", (req, res) => {
  res.send("🚀 CRM Backend is Live!");
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
