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
  Stack,
  TablePagination,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEmploymentStatusStore, EmploymentStatus } from "@/app/store/useEmployeeType";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function EmploymentStatusPage() {
  const { employmentStatuses, fetchEmploymentStatuses, createEmploymentStatus, updateEmploymentStatus, deleteEmploymentStatus } =
    useEmploymentStatusStore();

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const [currentStatus, setCurrentStatus] = useState<EmploymentStatus | null>(null);
  const [newStatus, setNewStatus] = useState<EmploymentStatus>({ employmentType: "", createdBy: 1 });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchEmploymentStatuses();
  }, []);

  // -------------------------
  // VIEW MODAL
  // -------------------------
  const handleViewOpen = (status: EmploymentStatus) => {
    setCurrentStatus(status);
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setViewOpen(false);
    setCurrentStatus(null);
  };

  // -------------------------
  // EDIT/CREATE MODAL
  // -------------------------
  const handleEditOpen = (status: EmploymentStatus | null = null) => {
    setCurrentStatus(status);
    setNewStatus(status || { employmentType: "", createdBy: 1 });
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setCurrentStatus(null);
    setNewStatus({ employmentType: "", createdBy: 1 });
  };

  const handleSave = async () => {
    if (!newStatus.employmentType) {
      toast.error("Employment type is required");
      return;
    }

    try {
      if (currentStatus) {
        await updateEmploymentStatus(currentStatus.id!, newStatus);
        toast.success("Employment status updated");
      } else {
        await createEmploymentStatus(newStatus);
        toast.success("Employment status created");
      }
      handleEditClose();
    } catch {
      toast.error("Failed to save employment status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employment status?")) return;
    try {
      await deleteEmploymentStatus(id);
      toast.success("Employment status deleted");
    } catch {
      toast.error("Failed to delete employment status");
    }
  };

  // Pagination slice
  const displayedStatuses = employmentStatuses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 2 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Employee Employment Status</Typography>
        <Button variant="contained" onClick={() => handleEditOpen(null)}>Add Status</Button>
      </Stack>

      {/* DESKTOP TABLE */}
      {!isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Employment Type</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedStatuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No employment statuses found</TableCell>
                </TableRow>
              ) : (
                displayedStatuses.map((status) => (
                  <TableRow key={status.id}>
                    <TableCell>{status.id}</TableCell>
                    <TableCell>{status.employmentType}</TableCell>
                    <TableCell>{status.createdBy}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => handleViewOpen(status)}>View</Button>
                        <Button size="small" variant="contained" onClick={() => handleEditOpen(status)}>Edit</Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(status.id!)}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={employmentStatuses.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </TableContainer>
      )}

      {/* MOBILE GRID */}
      {isMobile && (
        <Grid container spacing={2}>
          {employmentStatuses.length === 0 ? (
            <Grid size={[12, 12, 12]}>
              <Typography align="center">No employment statuses found</Typography>
            </Grid>
          ) : (
            employmentStatuses.map((status) => (
              <Grid size={[12]} key={status.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">{status.employmentType}</Typography>
                  <Typography variant="body2">ID: {status.id}</Typography>
                  <Typography variant="body2">Created By: {status.createdBy}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => handleViewOpen(status)}>View</Button>
                    <Button size="small" variant="contained" onClick={() => handleEditOpen(status)}>Edit</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(status.id!)}>Delete</Button>
                  </Stack>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* VIEW MODAL */}
      <Modal open={viewOpen} onClose={handleViewClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>View Employment Status</Typography>
          {currentStatus && (
            <Stack spacing={2}>
              <TextField label="ID" value={currentStatus.id} disabled fullWidth />
              <TextField label="Employment Type" value={currentStatus.employmentType} disabled fullWidth />
              <TextField label="Created By" value={currentStatus.createdBy} disabled fullWidth />
              <Button variant="outlined" onClick={handleViewClose}>Close</Button>
            </Stack>
          )}
        </Box>
      </Modal>

      {/* EDIT/CREATE MODAL */}
      <Modal open={editOpen} onClose={handleEditClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>{currentStatus ? "Edit Status" : "Add Status"}</Typography>
          <Stack spacing={2}>
            <TextField
              label="Employment Type"
              value={newStatus.employmentType}
              onChange={(e) => setNewStatus({ ...newStatus, employmentType: e.target.value })}
              fullWidth
            />
            <TextField
              sx={{ display: 'none' }}
              label="Created By"
              type="number"
              value={newStatus.createdBy}
              onChange={(e) => setNewStatus({ ...newStatus, createdBy: Number(e.target.value) })}
              fullWidth
            />
            <Button variant="contained" onClick={handleSave}>
              {currentStatus ? "Save Changes" : "Create"}
            </Button>
            <Button variant="outlined" onClick={handleEditClose}>Cancel</Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}