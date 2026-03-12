"use client";

import React, { useState } from "react";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

import EmployeeReports from "@/app/(dashboard)/components/reports/EmployeeReports";
import AttendanceReports from "@/app/(dashboard)/components/reports/AttendanceReports";
import LeaveReports from "@/app/(dashboard)/components/reports/LeaveReports";

const ReportsPage = () => {
  const [reportType, setReportType] = useState("attendance");

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        HRIS Reports
      </Typography>

      {/* Dropdown to select report */}
      <FormControl sx={{ mb: 3, minWidth: 220 }}>
        <InputLabel>Select Report</InputLabel>
        <Select
          value={reportType}
          label="Select Report"
          onChange={(e) => setReportType(e.target.value)}
        >
          <MenuItem value="employees">Employees</MenuItem>
          <MenuItem value="attendance">Attendance</MenuItem>
          <MenuItem value="leave">Leave Requests</MenuItem>
        </Select>
      </FormControl>

      {/* Render the selected report */}
      <Box sx={{ mt: 2 }}>
        {reportType === "employees" && <EmployeeReports />}
        {reportType === "attendance" && <AttendanceReports />}
        {reportType === "leave" && <LeaveReports />}
      </Box>
    </Box>
  );
};

export default ReportsPage;