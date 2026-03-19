"use client";

import { useEffect, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Pagination,
  CircularProgress,
  Stack,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useLeaveStore, Leave } from "@/app/store/useLeaveType";
import { useEmployeeStore, Employee } from "@/app/store/useEmployee";
import { toast } from "react-toastify";
import { format } from "date-fns";

export default function LeaveManagementPage() {
  const { leaves, loading, getLeaves, createLeave, updateLeave, deleteLeave } = useLeaveStore();
  const { employees, fetchEmployees } = useEmployeeStore();

  const [openModal, setOpenModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [leaveName, setLeaveName] = useState("");
  const [createdBy, setCreatedBy] = useState(1);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchEmployees();
    getLeaves();
  }, []);

  const handleOpenModal = (leave?: Leave) => {
    if (leave) {
      setEditingLeave(leave);
      setLeaveName(leave.leaveName);
      setCreatedBy(leave.createdBy);
    } else {
      setEditingLeave(null);
      setLeaveName("");
      setCreatedBy(1);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleSave = async () => {
    if (!leaveName) {
      toast.warning("Leave name is required");
      return;
    }

    try {
      if (editingLeave) {
        await updateLeave(editingLeave.id!, { leaveName, createdBy });
      } else {
        await createLeave({ leaveName, createdBy });
      }
      handleCloseModal();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this leave?")) {
      await deleteLeave(id);
    }
  };

  // Pagination
  const paginatedLeaves = leaves.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(leaves.length / rowsPerPage);

  const getEmployeeName = (id: number) => {
    const emp = employees.find((e: Employee) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `ID: ${id}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Leave Management
      </Typography>

      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpenModal()}>
        Add Leave
      </Button>

      {/* Desktop Table */}
      {!isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Leave Name</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.id}</TableCell>
                  <TableCell>{leave.leaveName}</TableCell>
                  <TableCell>{getEmployeeName(leave.createdBy)}</TableCell>
                  <TableCell>{leave.createdAt ? format(new Date(leave.createdAt), "PPpp") : "-"}</TableCell>
                  <TableCell>{leave.updatedAt ? format(new Date(leave.updatedAt), "PPpp") : "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenModal(leave)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(leave.id!)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedLeaves.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No leaves found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Mobile Grid */}
      {isMobile && (
        <Grid container spacing={2}>
          {paginatedLeaves.length === 0 ? (
            <Grid size={[12, 12, 12]}>
              <Typography align="center">No leaves found</Typography>
            </Grid>
          ) : (
            paginatedLeaves.map((leave) => (
              <Grid size={[12]} key={leave.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">{leave.leaveName}</Typography>
                  <Typography variant="body2">Created By: {getEmployeeName(leave.createdBy)}</Typography>
                  <Typography variant="body2">Created At: {leave.createdAt ? format(new Date(leave.createdAt), "PPpp") : "-"}</Typography>
                  <Typography variant="body2">Updated At: {leave.updatedAt ? format(new Date(leave.updatedAt), "PPpp") : "-"}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => handleOpenModal(leave)}>Edit</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(leave.id!)}>Delete</Button>
                  </Stack>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
        </Box>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} sx={{width: {xs: '90%', sm : '90%'},}}>
        <DialogTitle>{editingLeave ? "Edit Leave" : "Add Leave"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Leave Name"
            fullWidth
            margin="normal"
            value={leaveName}
            onChange={(e) => setLeaveName(e.target.value)}
          />
          <TextField
            label="Created By"
            type="text"
            fullWidth
            disabled
            margin="normal"
            value={getEmployeeName(createdBy)}
            onChange={(e) => setCreatedBy(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingLeave ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}