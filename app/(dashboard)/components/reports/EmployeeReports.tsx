"use client";
import { useTheme, useMediaQuery } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TablePagination
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

import { useEmployeeStore } from "@/app/store/useEmployee";
import { useDepartmentStore } from "@/app/store/useDepartments";
import { useSiteStore } from "@/app/store/useSites";
import { usePositionStore } from "@/app/store/usePosition";

const EmployeeReports = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { employees, fetchEmployees } = useEmployeeStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { sites, fetchSites } = useSiteStore();
  const { positions, fetchPositions } = usePositionStore();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchEmployees(), fetchDepartments(), fetchSites(), fetchPositions()]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const departmentMap = useMemo(() => Object.fromEntries(departments.map(d => [d.id, d.departmentName])), [departments]);
  const siteMap = useMemo(() => Object.fromEntries(sites.map(s => [s.id, s.siteName])), [sites]);
  const positionMap = useMemo(() => Object.fromEntries(positions.map(p => [p.id, p.positionName])), [positions]);
// export interface Employee {
//   id: number;
//   firstName: string;
//   lastName: string;
//   birthDate: string;
//   address: string;
//   email: string;
//   contactNo: string;
//   positionId: number;
//   departmentId: number;
//   siteId: number;
//   employmentId: number;
//   dateHired: string;
// }
const formatDate = (isoDate: string | undefined) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};
  const formattedEmployees = useMemo(() => {
    return employees.map(emp => ({
      fullName: `${emp.firstName} ${emp.lastName}`,
      birthDate: formatDate(emp.birthDate),
      address: emp.address,
      email: emp.email,
      contactNo: emp.contactNo,
      position: positionMap[emp.positionId] || emp.positionId,
      department: departmentMap[emp.departmentId] || emp.departmentId,
      site: siteMap[emp.siteId] || emp.siteId,
      employmentId: emp.employmentId
    }));
  }, [employees, departmentMap, siteMap, positionMap]);

  useEffect(() => setData(formattedEmployees), [formattedEmployees]);

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const headers = data.length ? Object.keys(data[0]) : [];

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
    link.download = `employees_report.csv`;
    link.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={loading || !data.length}
          onClick={() => downloadCSV(data)}
        >
          Download Full Report
        </Button>
      </Box>

      {isMobile ? (
        <Box display="flex" flexDirection="column" gap={2} p={2}>
          {paginatedData.map((row, i) => (
            <Paper key={i} sx={{ p: 2, borderRadius: 2 }}>
              {headers.map((h) => (
                <Box key={h} sx={{ mb: 1 }}>
                  <strong>{h}:</strong> {row[h]}
                </Box>
              ))}

              <Box textAlign="right" mt={2}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadCSV([row])}
                >
                  Download
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((row, i) => (
                <TableRow key={i}>
                  {headers.map((h) => (
                    <TableCell key={h}>{row[h]}</TableCell>
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
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={data.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </>
      )}
    </Box>
  );
};

export default EmployeeReports;