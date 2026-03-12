"use client";

import React, { useEffect, useState } from "react";
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
  TablePagination,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

import { useTimelogStore, Timelog } from "@/app/store/useTimelogs";
import { useSiteStore } from "@/app/store/useSites";
import { useEmployeeStore, Employee } from "@/app/store/useEmployee";

interface TimelogRow {
  id: number;
  employeeName: string;
  siteName: string;
  latitude: number;
  longitude: number;
  logDate: string;
  loggedAt: string;
  type: string;
  // selfie?: string; // keep commented
}

const AttendanceReports = () => {
  const { timelogs, getTimelogsBySite } = useTimelogStore();
  const { sites, fetchSites } = useSiteStore();
  const { employees, fetchEmployees } = useEmployeeStore();

  const [siteId, setSiteId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // Fetch sites and employees on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchSites();
      await fetchEmployees();
    };
    loadData();
  }, [fetchSites, fetchEmployees]);

  // Set default site and date range
  useEffect(() => {
    if (sites.length && !siteId) {
      const firstSiteId = sites.reduce((min, s) => (s.id < min ? s.id : min), sites[0].id);
      setSiteId(firstSiteId);

      const today = new Date();
      const from = new Date(today);
      const to = new Date(today);
      to.setDate(to.getDate() + 7);

      setDateFrom(from.toISOString().slice(0, 10));
      setDateTo(to.toISOString().slice(0, 10));
    }
  }, [sites, siteId]);

  // Fetch timelogs when site or date range changes
  useEffect(() => {
    if (!siteId || !dateFrom || !dateTo) return;

    const fetchLogs = async () => {
      setLoading(true);
      await getTimelogsBySite(siteId, dateFrom, dateTo);
      setLoading(false);
    };
    fetchLogs();
  }, [siteId, dateFrom, dateTo, getTimelogsBySite]);

  // Map timelogs to readable table rows
  const tableData: TimelogRow[] = timelogs.map((tl: Timelog) => {
    const employee: Employee | undefined = employees.find(e => e.id === (tl as any).employeeId);
    const site = sites.find(s => s.id === tl.siteId);

    return {
      id: tl.id,
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : `Employee #${(tl as any).employeeId}`,
      siteName: site ? site.siteName : `Site #${tl.siteId}`,
      latitude: tl.latitude ?? 0,
      longitude: tl.longitude ?? 0,
      logDate: tl.logDate ?? "",
      loggedAt: tl.loggedAt ?? "",
      type: tl.type ?? "",
      // selfie: tl.selfie ?? "",
    };
  });

  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const headers = tableData.length ? Object.keys(tableData[0]) : [];

  const arrayToCSV = (data: TimelogRow[]) => {
    if (!data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => `"${(row as any)[h] ?? ""}"`).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  };

  const downloadCSV = (rows: TimelogRow[]) => {
    const csv = arrayToCSV(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_report.csv`;
    link.click();
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Select
          value={siteId ?? ""}
          onChange={e => setSiteId(Number(e.target.value))}
        >
          {sites.map(site => (
            <MenuItem key={site.id} value={site.id}>
              {site.siteName}
            </MenuItem>
          ))}
        </Select>

        <TextField
          label="From"
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="To"
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={loading || !tableData.length}
          onClick={() => downloadCSV(tableData)}
        >
          Download Full Report
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map(h => <TableCell key={h}>{h}</TableCell>)}
              {headers.length > 0 ? <TableCell align="right">Action</TableCell> : ''}
            </TableRow>
          </TableHead>
          
        
<TableBody>
  {paginatedData.length > 0 ? (
    paginatedData.map((row, i) => (
      <TableRow key={i}>
        {headers.map(h => (
          <TableCell key={h}>{(row as any)[h]}</TableCell>
        ))}

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
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={headers.length + 1} align="center">
        No data
      </TableCell>
    </TableRow>
  )}
</TableBody>
        </Table>

        <TablePagination
          component="div"
          count={tableData.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default AttendanceReports;