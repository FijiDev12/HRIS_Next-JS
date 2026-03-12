"use client";

import { useEffect, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper,
  Button, Stack, TablePagination,
  FormControl, InputLabel, Select, MenuItem,
  Grid, Typography, useTheme, useMediaQuery,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useEmployeeStore } from "@/app/store/useEmployee";
import { usePositionStore } from "@/app/store/usePosition";
import EmployeeModal from "@/app/(dashboard)/components/employees/EmployeeModal";

export default function EmployeeListTab() {
  const { employees, fetchEmployees, deleteEmployee, bulkUploadEmployees } = useEmployeeStore();
  const { positions, fetchPositions } = usePositionStore();

  const [open, setOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 4;
  const [positionFilter, setPositionFilter] = useState<number | "all">("all");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchEmployees();
    fetchPositions();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Delete employee?")) await deleteEmployee(id);
  };

const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const result = await bulkUploadEmployees(file); // returns BulkUploadResponse["data"]

    if (result.successCount > 0) {
      toast.success(`${result.successCount} employees uploaded successfully!`);
    }

    if (result.errorCount > 0) {
      result.errors.forEach((err) => {
        toast.error(`There are ${result.errorCount} Unsuccessful which were ${err.email}`);
      });
    }

    e.target.value = ""; // reset input
  } catch (err: any) {
    toast.error(err?.message || "Failed to upload employees");
  }
};

  const sortedEmployees = [...employees].sort((a, b) => a.id - b.id);
  const filteredEmployees = sortedEmployees.filter(emp => {
    if (positionFilter === "all") return true;
    return emp.positionId === positionFilter;
  });

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Button
          variant="contained"
          onClick={() => {
            setCurrentEmployee(null);
            setIsEdit(false);
            setOpen(true);
          }}
        >
          Create Employee
        </Button>

        {/* Bulk Upload Button */}
        <Button variant="outlined" component="label">
          Upload CSV
          <input type="file" accept=".csv" hidden onChange={handleBulkUpload} />
        </Button>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Position</InputLabel>
          <Select
            value={positionFilter}
            label="Filter by Position"
            onChange={(e) => setPositionFilter(e.target.value as number | "all")}
          >
            <MenuItem value="all">All Positions</MenuItem>
            {positions.map((pos) => (
              <MenuItem key={pos.id} value={pos.id}>
                {pos.positionName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Desktop Table */}
      {!isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No employee found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.id}</TableCell>
                      <TableCell>{emp.firstName}</TableCell>
                      <TableCell>{emp.lastName}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.contactNo}</TableCell>
                      <TableCell>
                        {positions.find((p) => p.id === emp.positionId)?.positionName || "—"}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              setCurrentEmployee(emp);
                              setIsEdit(true);
                              setOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button size="small" color="error" onClick={() => handleDelete(emp.id)}>
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredEmployees.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </TableContainer>
      )}

      {/* Mobile Grid */}
      {isMobile && (
        <Grid container spacing={2}>
          {filteredEmployees?.length === 0 ? (
            <Grid size={[12]}>
              <Typography align="center">No employee found</Typography>
            </Grid>
          ) : (
            filteredEmployees
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((emp) => (
                <Grid size={[12]} key={emp.id}>
                  <Paper sx={{ p: 2 }} elevation={3}>
                    <Typography>ID: {emp.id}</Typography>
                    <Typography>Name: {emp.firstName} {emp.lastName}</Typography>
                    <Typography>Email: {emp.email}</Typography>
                    <Typography>Contact: {emp.contactNo}</Typography>
                    <Typography>
                      Position: {positions.find((p) => p.id === emp.positionId)?.positionName || "—"}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setCurrentEmployee(emp);
                          setIsEdit(true);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(emp.id)}>
                        Delete
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              ))
          )}
        </Grid>
      )}

      <EmployeeModal
        open={open}
        onClose={() => setOpen(false)}
        employee={currentEmployee}
        isEdit={isEdit}
      />

      {/* Toastify Container */}
      <ToastContainer position="top-right" autoClose={4000} />
    </>
  );
}