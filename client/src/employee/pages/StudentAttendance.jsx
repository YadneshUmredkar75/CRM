import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";

const StudentAttendance = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("daily"); // "daily" | "monthly"

  // ---- Google Sheet Config ----
  const SHEET_ID = "1W9Vs0fNDTvi9g3U8JOI2RVP_qor6YHTsmmxhjrDMPKY";
  const SHEET_NAME = "Attendance";
  const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

  // ---- CSV Parser ----
  const parseCSV = (text) => {
    const lines = text.split(/\r\n|\n|\r/);
    const result = [];
    if (lines.length <= 1) return result;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cleanLine = line.replace(/"/g, "");
      const columns = cleanLine.split(",").map((col) => col.trim());
      while (columns.length < 4) columns.push("");

      const [name, course, dateField, timestamp] = columns;
      let finalDate = dateField;

      if (!finalDate && timestamp) {
        const dateMatch = timestamp.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (dateMatch) {
          let [, first, second, year] = dateMatch;
          let month, day;
          if (parseInt(first) > 12) {
            day = first.padStart(2, "0");
            month = second.padStart(2, "0");
          } else {
            month = first.padStart(2, "0");
            day = second.padStart(2, "0");
          }
          finalDate = `${day}-${month}-${year}`;
        }
      }

      if (!finalDate && i >= 343 && i <= 369) {
        finalDate = i <= 354 ? "13-01-2026" : "19-01-2026";
      }

      if (name && finalDate) {
        result.push({ name, course, date: finalDate, timestamp });
      }
    }
    return result;
  };

  // ---- Fetch Data ----
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(CSV_URL + "&t=" + Date.now());
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const text = await response.text();
        if (!text || text.trim() === "") {
          setRawData([]);
          setError("No data found in the Google Sheet");
          return;
        }
        const data = parseCSV(text);
        if (data.length === 0) {
          setError("No valid attendance records found");
        } else {
          setRawData(data);
          setError("");
        }
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  // ---- Helper Functions ----
  const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes("-")) {
      const [day, month, year] = dateStr.split("-").map(Number);
      if (day && month && year) return new Date(year, month - 1, day);
    }
    return null;
  };

  const formatDisplayDate = (dateStr) => {
    const dateObj = parseDateString(dateStr);
    if (!dateObj) return dateStr || "Unknown Date";
    return dateObj.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestampStr) => {
    if (!timestampStr) return "-";
    const timeMatch = timestampStr.match(/(\d{1,2}):(\d{2}):?(\d{2})?/);
    if (!timeMatch) return "-";
    let hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2].padStart(2, "0");
    const lowerStr = timestampStr.toLowerCase();
    let isPM = lowerStr.includes("pm");
    if (!lowerStr.includes("am") && !lowerStr.includes("pm")) isPM = hour >= 12;
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${isPM ? "PM" : "AM"}`;
  };

  // ---- Monthly Helpers ----
  const getMonthKey = (dateStr) => {
    const d = parseDateString(dateStr);
    if (!d) return "Unknown";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const getMonthLabel = (monthKey) => {
    if (monthKey === "Unknown") return "Unknown";
    const [year, month] = monthKey.split("-");
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  };

  // ---- Monthly Stats ----
  const monthlyStats = useMemo(() => {
    const months = {};
    rawData.forEach((record) => {
      const mk = getMonthKey(record.date);
      if (!months[mk]) months[mk] = { records: [], classDays: new Set(), students: {} };
      months[mk].records.push(record);
      months[mk].classDays.add(record.date);

      const key = record.name?.toLowerCase().trim();
      if (key) {
        if (!months[mk].students[key]) {
          months[mk].students[key] = { name: record.name, course: record.course, days: new Set() };
        }
        months[mk].students[key].days.add(record.date);
      }
    });

    const sortedKeys = Object.keys(months)
      .filter((k) => k !== "Unknown")
      .sort()
      .reverse();
    if (months["Unknown"]) sortedKeys.push("Unknown");

    return sortedKeys.map((mk) => {
      const totalClassDays = months[mk].classDays.size;
      const studentList = Object.values(months[mk].students)
        .map((s) => ({
          name: s.name,
          course: s.course,
          daysPresent: s.days.size,
          totalClassDays,
          percentage: totalClassDays > 0 ? Math.round((s.days.size / totalClassDays) * 100) : 0,
        }))
        .sort((a, b) => b.percentage - a.percentage);

      return {
        monthKey: mk,
        label: getMonthLabel(mk),
        records: months[mk].records,
        totalClassDays,
        studentList,
        uniqueDates: [...months[mk].classDays].sort(),
      };
    });
  }, [rawData]);

  // ---- Excel Download ----
  const downloadExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((record) => ({
        "Student Name": record.name,
        Course: record.course,
        Date: record.date,
        "Check-in Time": formatTime(record.timestamp),
        "Full Timestamp": record.timestamp,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const downloadAllExcel = () =>
    downloadExcel(rawData, `Attendance_All_Records_${new Date().toISOString().split("T")[0]}`);

  const downloadDateExcel = (date) => {
    const dateData = rawData.filter((r) => r.date === date);
    if (!dateData.length) return;
    const displayDate = formatDisplayDate(date).replace(/[^a-zA-Z0-9]/g, "_");
    downloadExcel(dateData, `Attendance_${displayDate}`);
  };

  const downloadFilteredExcel = () => {
    const filtered = getFilteredData();
    if (!filtered.length) return;
    let filename = "Attendance_Filtered";
    if (selectedDate) filename += `_${selectedDate}`;
    if (selectedCourse) filename += `_${selectedCourse.replace(/[^a-zA-Z0-9]/g, "_")}`;
    if (searchQuery) filename += `_Search_${searchQuery}`;
    downloadExcel(filtered, filename);
  };

  // ---- Monthly Excel Downloads ----
  const downloadMonthlyAttendanceExcel = (monthData) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      monthData.records.map((r) => ({
        "Student Name": r.name,
        Course: r.course,
        Date: r.date,
        "Check-in Time": formatTime(r.timestamp),
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_${monthData.label.replace(/ /g, "_")}.xlsx`);
  };

  const downloadMonthlyPercentageReport = (monthData) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      monthData.studentList.map((s) => ({
        "Student Name": s.name,
        Course: s.course,
        Month: monthData.label,
        "Days Present": s.daysPresent,
        "Total Class Days": s.totalClassDays,
        "Attendance %": s.percentage + "%",
        Status:
          s.percentage >= 75 ? "✅ Good" : s.percentage >= 60 ? "⚠️ Average" : "❌ Low",
      }))
    );

    // Auto column widths
    const colWidths = [
      { wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 14 },
      { wch: 18 }, { wch: 15 }, { wch: 12 },
    ];
    ws["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Report");
    XLSX.writeFile(wb, `Monthly_Report_${monthData.label.replace(/ /g, "_")}.xlsx`);
  };

  const downloadAllMonthsReport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Combined summary
    const allRows = [];
    monthlyStats.forEach((md) => {
      md.studentList.forEach((s) => {
        allRows.push({
          Month: md.label,
          "Student Name": s.name,
          Course: s.course,
          "Days Present": s.daysPresent,
          "Total Class Days": s.totalClassDays,
          "Attendance %": s.percentage + "%",
          Status:
            s.percentage >= 75 ? "Good" : s.percentage >= 60 ? "Average" : "Low",
        });
      });
    });

    const summaryWs = XLSX.utils.json_to_sheet(allRows);
    summaryWs["!cols"] = [
      { wch: 18 }, { wch: 25 }, { wch: 15 }, { wch: 14 },
      { wch: 18 }, { wch: 15 }, { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, summaryWs, "All Months Summary");

    // One sheet per month
    monthlyStats.forEach((md) => {
      const ws = XLSX.utils.json_to_sheet(
        md.studentList.map((s) => ({
          "Student Name": s.name,
          Course: s.course,
          "Days Present": s.daysPresent,
          "Total Class Days": s.totalClassDays,
          "Attendance %": s.percentage + "%",
          Status: s.percentage >= 75 ? "Good" : s.percentage >= 60 ? "Average" : "Low",
        }))
      );
      ws["!cols"] = [
        { wch: 25 }, { wch: 15 }, { wch: 14 }, { wch: 18 }, { wch: 15 }, { wch: 10 },
      ];
      const sheetName = md.label.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, `Monthly_Attendance_Report_All_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // ---- Data Processing ----
  const getFilteredData = () => {
    let filtered = [...rawData];
    if (searchQuery) filtered = filtered.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCourse) filtered = filtered.filter((r) => r.course?.toLowerCase() === selectedCourse.toLowerCase());
    if (selectedDate) filtered = filtered.filter((r) => r.date === selectedDate);
    return filtered;
  };

  const groupedData = useMemo(() => {
    const filtered = getFilteredData();
    const groups = {};
    filtered.forEach((row) => {
      const dk = row.date || "Unknown Date";
      if (!groups[dk]) groups[dk] = [];
      groups[dk].push(row);
    });
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const da = parseDateString(a), db = parseDateString(b);
      if (!da || !db) return 0;
      return db.getTime() - da.getTime();
    });
    return sortedKeys.map((date) => ({ date, rows: groups[date] }));
  }, [rawData, selectedDate, selectedCourse, searchQuery]);

  const uniqueCourses = useMemo(() => {
    const courses = rawData.map((r) => r.course).filter(Boolean).map((c) => c.trim()).filter((c) => c.length > 0);
    return [...new Set(courses)].sort();
  }, [rawData]);

  const stats = useMemo(() => {
    const totalRecords = rawData.length;
    const uniqueStudents = new Set(rawData.map((r) => r.name?.toLowerCase().trim())).size;
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
    const todayRecords = rawData.filter((r) => r.date === todayStr).length;
    return { totalRecords, uniqueStudents, todayRecords };
  }, [rawData]);

  // ---- UI Handlers ----
  const handleDateChange = (e) => {
    const value = e.target.value;
    if (!value) { setSelectedDate(""); return; }
    const [year, month, day] = value.split("-");
    setSelectedDate(`${day}-${month}-${year}`);
  };

  const getInputDateValue = () => {
    if (!selectedDate) return "";
    const [day, month, year] = selectedDate.split("-");
    return `${year}-${month}-${day}`;
  };

  const clearFilters = () => { setSelectedDate(""); setSelectedCourse(""); setSearchQuery(""); };

  // ---- % Badge Color ----
  const getPercentageColor = (pct) => {
    if (pct >= 75) return { bg: "bg-green-100", text: "text-green-800", bar: "bg-green-500" };
    if (pct >= 60) return { bg: "bg-yellow-100", text: "text-yellow-800", bar: "bg-yellow-400" };
    return { bg: "bg-red-100", text: "text-red-700", bar: "bg-red-500" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">

        {/* ==== HEADER ==== */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Attendance</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track and manage student attendance records in real-time
          </p>
          {rawData.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {rawData.length} records loaded from Google Sheets
              </div>
            </div>
          )}
        </div>

        {/* ==== STATS CARDS ==== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueStudents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayRecords}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ==== VIEW MODE TABS ==== */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode("daily")}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition ${
              viewMode === "daily"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            📅 Daily View
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition ${
              viewMode === "monthly"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            📊 Monthly View & % Report
          </button>
        </div>

        {/* ==== DAILY VIEW ==== */}
        {viewMode === "daily" && (
          <>
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Enter student name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
                    <input
                      type="date"
                      value={getInputDateValue()}
                      onChange={handleDateChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Course</label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                    >
                      <option value="">All Courses</option>
                      {uniqueCourses.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={downloadAllExcel}
                  disabled={rawData.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download All Records
                </button>
                <button
                  onClick={downloadFilteredExcel}
                  disabled={getFilteredData().length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Download Filtered
                </button>
                {(selectedDate || selectedCourse || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Attendance Records</h3>
                <p className="text-gray-600">Fetching data from Google Sheets...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
                <h3 className="text-lg font-semibold text-red-800 mb-1">Data Loading Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* No Data */}
            {!loading && !error && rawData.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Attendance Records</h3>
                <p className="text-gray-600">No attendance data has been recorded yet.</p>
              </div>
            )}

            {/* Daily Table */}
            {!loading && !error && groupedData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {groupedData.map((group) => (
                  <div key={group.date} className="border-b border-gray-200 last:border-b-0">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
                          {formatDisplayDate(group.date)}
                        </h2>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {group.rows.length} student{group.rows.length > 1 ? "s" : ""}
                          </span>
                          <button
                            onClick={() => downloadDateExcel(group.date)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Excel
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Course</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Check-in Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {group.rows.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                    {row.name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "?"}
                                  </div>
                                  <span className="font-medium text-gray-900">{row.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {row.course || "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                {formatTime(row.timestamp)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ==== MONTHLY VIEW ==== */}
        {viewMode === "monthly" && (
          <>
            {/* Monthly Download Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-base font-semibold text-gray-800 mb-4">📥 Monthly Reports</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={downloadAllMonthsReport}
                  disabled={monthlyStats.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download All Months % Report (Excel)
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                This Excel will have one sheet per month + a combined summary sheet with attendance % for each student.
              </p>

              {/* Legend */}
              <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500">Attendance % Legend:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ ≥ 75% — Good</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⚠️ 60–74% — Average</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">❌ &lt; 60% — Low</span>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h3>
              </div>
            )}

            {/* Month Cards */}
            {!loading && monthlyStats.map((md) => (
              <div key={md.monthKey} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                {/* Month Header */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{md.label}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {md.totalClassDays} class day{md.totalClassDays !== 1 ? "s" : ""} &nbsp;·&nbsp; {md.studentList.length} student{md.studentList.length !== 1 ? "s" : ""}
                        &nbsp;·&nbsp; {md.records.length} total check-ins
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => downloadMonthlyAttendanceExcel(md)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs flex items-center gap-1.5 font-medium"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Attendance Excel
                      </button>
                      <button
                        onClick={() => downloadMonthlyPercentageReport(md)}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs flex items-center gap-1.5 font-medium"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        % Report Excel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Class Days Pills */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 font-medium self-center">Class Days:</span>
                  {md.uniqueDates.map((d) => (
                    <span key={d} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                      {formatDisplayDate(d).split(",")[0].trim() + " " + d.split("-")[0]}
                    </span>
                  ))}
                </div>

                {/* Student % Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days Present</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Attendance %</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {md.studentList.map((s, i) => {
                        const colors = getPercentageColor(s.percentage);
                        return (
                          <tr key={i} className="hover:bg-gray-50 transition duration-150">
                            <td className="px-6 py-3 text-sm text-gray-400">{i + 1}</td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                                  {s.name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "?"}
                                </div>
                                <span className="font-medium text-gray-900 text-sm">{s.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {s.course || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">
                              {s.daysPresent} / {s.totalClassDays}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${colors.bg} ${colors.text}`}>
                                {s.percentage}%
                              </span>
                            </td>
                            <td className="px-6 py-3 min-w-[140px]">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full ${colors.bar} transition-all duration-500`}
                                  style={{ width: `${s.percentage}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Month Footer Summary */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>
                    ✅ Good (≥75%): <strong className="text-green-700">{md.studentList.filter((s) => s.percentage >= 75).length}</strong>
                  </span>
                  <span>
                    ⚠️ Average (60–74%): <strong className="text-yellow-700">{md.studentList.filter((s) => s.percentage >= 60 && s.percentage < 75).length}</strong>
                  </span>
                  <span>
                    ❌ Low (&lt;60%): <strong className="text-red-700">{md.studentList.filter((s) => s.percentage < 60).length}</strong>
                  </span>
                  <span className="ml-auto">
                    Avg. Attendance: <strong>{md.studentList.length > 0 ? Math.round(md.studentList.reduce((a, s) => a + s.percentage, 0) / md.studentList.length) : 0}%</strong>
                  </span>
                </div>
              </div>
            ))}

            {!loading && monthlyStats.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Monthly Data</h3>
                <p className="text-gray-600">No attendance data found to generate monthly reports.</p>
              </div>
            )}
          </>
        )}

        {/* ==== FOOTER ==== */}
        <div className="mt-12 text-center">
          <div className="border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-600">
              System updated:{" "}
              {new Date().toLocaleString("en-IN", {
                weekday: "long", year: "numeric", month: "long",
                day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;