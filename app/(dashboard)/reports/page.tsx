"use client";

import React, { useEffect, useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useEmployeeStore } from "@/app/store/useEmployee"; // adjust path
import { useTimelogStore } from "@/app/store/useTimelogs"; // adjust path
import { useLeaveRequestStore } from "@/app/store/useLeaveRequest"; // adjust path

const ReportsPage = () => {
  const { employees, fetchEmployees } = useEmployeeStore();
  const { timelogs, getDTR } = useTimelogStore();
  const { leaveRequests, fetchLeaveRequests } = useLeaveRequestStore();

  const [loading, setLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await fetchEmployees();
      await getDTR(0, "", ""); // fetch all timelogs; adjust if API requires range
      await fetchLeaveRequests();
      setLoading(false);
    };
    fetchAll();
  }, [fetchEmployees, getDTR, fetchLeaveRequests]);

  // Convert array of objects to CSV string
  const arrayToCSV = (data: any[]) => {
    if (!data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => `"${String(row[h] ?? "")}"`).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  };

  const downloadCSV = (data: any[], filename: string) => {
    const csv = arrayToCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        HRIS Reports
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Download</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>All employee records</TableCell>
              <TableCell align="right">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  disabled={loading || !employees.length}
                  onClick={() => downloadCSV(employees, "employees.csv")}
                >
                  Download CSV
                </Button>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Attendance</TableCell>
              <TableCell>All timelogs / attendance records</TableCell>
              <TableCell align="right">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  disabled={loading || !timelogs.length}
                  onClick={() => downloadCSV(timelogs, "attendance.csv")}
                >
                  Download CSV
                </Button>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Leave Summary</TableCell>
              <TableCell>All leave requests</TableCell>
              <TableCell align="right">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  disabled={loading || !leaveRequests.length}
                  onClick={() => downloadCSV(leaveRequests, "leave_summary.csv")}
                >
                  Download CSV
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ReportsPage;