"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  TextField,
  Select,
  MenuItem,
  Stack,
  Pagination,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { toast } from "react-toastify";

import { useLeaveBalanceStore, LeaveBalance } from "@/app/store/useLeaveBalance";
import { useLeaveStore } from "@/app/store/useLeaveType";
import { useEmployeeStore } from "@/app/store/useEmployee";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {xs: '90%', sm : '90%', md: 500, lg: 500},
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function LeaveBalancePage() {
  const { balances, fetchAllBalances, createBalance, updateBalance, deleteBalance } =
    useLeaveBalanceStore();
  const { leaves, getLeaves } = useLeaveStore();
  const { employees, fetchEmployees } = useEmployeeStore();

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState<LeaveBalance | null>(null);
  const [form, setForm] = useState<LeaveBalance>({
    employeeId: 0,
    leaveTypeId: 0,
    totalDays: 0,
    remainingDays: 0,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch data
  useEffect(() => {
    fetchEmployees();
    fetchAllBalances();
    getLeaves();
  }, []);

  const handleOpenModal = (balance?: LeaveBalance) => {
    if (balance) {
      setEditingBalance(balance);
      setForm(balance);
    } else {
      setEditingBalance(null);
      setForm({ employeeId: 0, leaveTypeId: 0, totalDays: 0, remainingDays: 0 });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleFormChange = (field: keyof LeaveBalance, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.leaveTypeId || !form.totalDays || !form.remainingDays) {
      toast.warning("Please fill all fields");
      return;
    }
    if (editingBalance) {
      await updateBalance(editingBalance.id!, form);
    } else {
      await createBalance(form);
    }
    handleCloseModal();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this leave balance?")) {
      await deleteBalance(id);
    }
  };

  const totalPages = Math.ceil(balances.length / rowsPerPage);
  const displayedBalances = balances.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const getEmployeeName = (id: number) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `ID: ${id}`;
  };

  const getLeaveName = (id: number) => {
    const leave = leaves.find((l) => l.id === id);
    return leave ? leave.leaveName : `ID: ${id}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Leave Balances</Typography>
        <Button variant="contained" onClick={() => handleOpenModal()}>Add Balance</Button>
      </Stack>

      {/* Desktop Table */}
      {!isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Total Days</TableCell>
                <TableCell>Remaining Days</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedBalances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                displayedBalances.map((balance) => (
                  <TableRow key={balance.id}>
                    <TableCell>{getEmployeeName(balance.employeeId)}</TableCell>
                    <TableCell>{getLeaveName(balance.leaveTypeId)}</TableCell>
                    <TableCell>{balance.totalDays}</TableCell>
                    <TableCell>{balance.remainingDays}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => handleOpenModal(balance)}>Edit</Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(balance.id!)}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Mobile Grid */}
      {isMobile && (
        <Grid container spacing={2}>
          {balances.length === 0 ? (
            <Grid size={[12, 12, 12]}>
              <Typography align="center">No data available</Typography>
            </Grid>
          ) : (
            displayedBalances.map((balance) => (
              <Grid size={[12]} key={balance.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">{getEmployeeName(balance.employeeId)}</Typography>
                  <Typography variant="body2">Leave Type: {getLeaveName(balance.leaveTypeId)}</Typography>
                  <Typography variant="body2">Total Days: {balance.totalDays}</Typography>
                  <Typography variant="body2">Remaining Days: {balance.remainingDays}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => handleOpenModal(balance)}>Edit</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(balance.id!)}>Delete</Button>
                  </Stack>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Pagination */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
      </Box>

      {/* Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2}>
            {editingBalance ? "Edit Leave Balance" : "Add Leave Balance"}
          </Typography>
          <Stack spacing={2}>
            <Select
              value={form.employeeId || ""}
              onChange={(e) => handleFormChange("employeeId", Number(e.target.value))}
            >
              <MenuItem value="">Select Employee</MenuItem>
              {employees.map((e) => (
                <MenuItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</MenuItem>
              ))}
            </Select>

            <Select
              value={form.leaveTypeId || ""}
              onChange={(e) => handleFormChange("leaveTypeId", Number(e.target.value))}
            >
              <MenuItem value="">Select Leave Type</MenuItem>
              {leaves.map((l) => (
                <MenuItem key={l.id} value={l.id}>{l.leaveName}</MenuItem>
              ))}
            </Select>

            <TextField
              label="Total Days"
              type="number"
              value={form.totalDays || ""}
              onChange={(e) => handleFormChange("totalDays", Number(e.target.value))}
            />
            <TextField
              label="Remaining Days"
              type="number"
              value={form.remainingDays || ""}
              onChange={(e) => handleFormChange("remainingDays", Number(e.target.value))}
            />

            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button variant="contained" onClick={handleSubmit}>{editingBalance ? "Update" : "Add"}</Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}