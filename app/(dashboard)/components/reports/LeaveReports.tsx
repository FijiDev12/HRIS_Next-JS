"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

import { useLeaveRequestStore } from "@/app/store/useLeaveRequest";
import { useEmployeeStore } from "@/app/store/useEmployee";
import { useLeaveStore } from "@/app/store/useLeaveType";
import { useDepartmentStore } from "@/app/store/useDepartments";
import { useSiteStore } from "@/app/store/useSites";
import { usePositionStore } from "@/app/store/usePosition";

// Helper to format date
const formatDate = (isoDate: string | undefined) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const LeaveReports = () => {
  const { leaveRequests, fetchLeaveRequests } = useLeaveRequestStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { leaves, getLeaves } = useLeaveStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { sites, fetchSites } = useSiteStore();
  const { positions, fetchPositions } = usePositionStore();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // Fetch all stores
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchLeaveRequests(),
        fetchEmployees(),
        getLeaves(),
        fetchDepartments(),
        fetchSites(),
        fetchPositions()
      ]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Create lookup maps
  const employeeMap = useMemo(() => {
    const map: Record<number, string> = {};
    employees.forEach(emp => {
      map[emp.id] = `${emp.firstName} ${emp.lastName}`;
    });
    return map;
  }, [employees]);

  const leaveTypeMap = useMemo(() => {
    const map: Record<number, string> = {};
    leaves.forEach(leave => {
      if (leave.id) map[leave.id] = leave.leaveName;
    });
    return map;
  }, [leaves]);

  const departmentMap = useMemo(() => {
    const map: Record<number, string> = {};
    departments.forEach(d => (map[d.id] = d.departmentName));
    return map;
  }, [departments]);

  const siteMap = useMemo(() => {
    const map: Record<number, string> = {};
    sites.forEach(s => (map[s.id] = s.siteName));
    return map;
  }, [sites]);

  const positionMap = useMemo(() => {
    const map: Record<number, string> = {};
    positions.forEach(p => (map[p.id] = p.positionName));
    return map;
  }, [positions]);

  // Flatten leave request
  const flattenLeaveRequest = (lr: any) => {
    return {
      id: lr.id,
      employeeName: lr.employeeId ? employeeMap[lr.employeeId] : "",
      leaveType: lr.leaveTypeId ? leaveTypeMap[lr.leaveTypeId] : "",
      fromDate: formatDate(lr.fromDate),
      toDate: formatDate(lr.toDate),
      totalDays: lr.totalDays,
      reason: lr.reason,
      status: lr.status,
      isHalfDay: lr.isHalfDay,
      createdAt: formatDate(lr.createdAt),
      updatedAt: formatDate(lr.updatedAt),

      // Employee details
      employeeNo: lr.employee?.employeeNo ?? "",
      employeeEmail: lr.employee?.email ?? "",
      employeeContact: lr.employee?.contactNo ?? "",
      position: positionMap[lr.employee?.positionId ?? 0] || "",
      department: departmentMap[lr.employee?.departmentId ?? 0] || "",
      site: siteMap[lr.employee?.siteId ?? 0] || "",
      employmentId: lr.employee?.employmentId ?? "",

      // Leave creator & approver
      creatorEmail: lr.creator?.email ?? "",
      approverEmail: lr.approver?.email ?? ""
    };
  };

  const flattenedData = useMemo(
    () => leaveRequests.map(flattenLeaveRequest),
    [leaveRequests, employeeMap, leaveTypeMap, departmentMap, siteMap, positionMap]
  );

  const paginatedData = flattenedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const headers = flattenedData.length ? Object.keys(flattenedData[0]) : [];

  // CSV export
  const arrayToCSV = (data: any[]) => {
    if (!data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => `"${row[h] ?? ""}"`).join(","));
    return [headers.join(","), ...rows].join("\n");
  };

  const downloadCSV = (rows: any[]) => {
    const csv = arrayToCSV(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leave_report.csv`;
    link.click();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={loading || !flattenedData.length}
          onClick={() => downloadCSV(flattenedData)}
        >
          Download Full Report
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map(h => <TableCell key={h}>{h}</TableCell>)}
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, i) => (
              <TableRow key={i}>
                {headers.map(h => <TableCell key={h}>{(row as any)[h]}</TableCell>)}
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadCSV([row])}
                  >
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={flattenedData.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </TableContainer>
    </Box>
  );
};

export default LeaveReports;