"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
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
  Grid,
  TablePagination,
} from "@mui/material";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useLeaveRequestStore, LeaveRequest, CreateLeaveRequestPayload } from "@/app/store/useLeaveRequest";
import { useEmployeeInfoStore } from "@/app/store/useEmployeeInfo";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function LeaveRequestPage() {
  const {
    leaveRequests,
    fetchLeaveRequests,
    fetchLeaveRequestsByEmployee,
    createLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    loading,
    error,
    clearError,
  } = useLeaveRequestStore();

  const { employee } = useEmployeeInfoStore();

  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [currentLeave, setCurrentLeave] = useState<LeaveRequest | null>(null);

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const [newLeave, setNewLeave] = useState<CreateLeaveRequestPayload>({
    employeeId: employee?.id || 0,
    leaveTypeId: 1,
    fromDate: "",
    toDate: "",
    totalDays: 0,
    reason: "",
    createdBy: employee?.id || 1,
  });

  const [sessionData, setSessionData] = useState<{ roleId?: number; id?: number }>({});

  // -------------------- FETCH SESSION --------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) setSessionData(JSON.parse(stored));
    }
  }, []);

  // -------------------- FETCH DATA --------------------
  useEffect(() => {
    if (employee) {
        const fetchData = async () => {
            try {
            if (sessionData.roleId === 1) {
                await fetchLeaveRequests();
            } else {
                await fetchLeaveRequestsByEmployee(employee.id);
            }
            } catch {
            toast.error("Failed to fetch leave requests");
            }
        };
        fetchData();
        setNewLeave({
            employeeId: employee?.id || 0,
            leaveTypeId: 1,
            fromDate: "",
            toDate: "",
            totalDays: 0,
            reason: "",
            createdBy: employee?.id || 1,
        });
    }
  }, [employee, sessionData]);

  // -------------------- VIEW MODAL --------------------
  const handleViewOpen = (leave: LeaveRequest) => {
    setCurrentLeave(leave);
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setCurrentLeave(null);
    setViewOpen(false);
    clearError();
  };

  // -------------------- ADD MODAL --------------------
  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setNewLeave({
      employeeId: employee?.id || 0,
      leaveTypeId: 1,
      fromDate: "",
      toDate: "",
      totalDays: 0,
      reason: "",
      createdBy: employee?.id || 1,
    });
    setAddOpen(false);
    clearError();
  };

  const handleAddChange = (field: keyof CreateLeaveRequestPayload, value: any) => {
    const updatedLeave = { ...newLeave, [field]: value };

    if (field === "fromDate" || field === "toDate") {
      const from = new Date(updatedLeave.fromDate);
      const to = new Date(updatedLeave.toDate);
      updatedLeave.totalDays = from && to && to >= from ? Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
    }

    setNewLeave(updatedLeave);
  };

  const handleAddSubmit = async () => {
    if (!newLeave.employeeId || !newLeave.leaveTypeId || !newLeave.fromDate || !newLeave.toDate || !newLeave.totalDays || !newLeave.reason) {
      toast.error("Please fill in all fields correctly");
      return;
    }
    try {
      await createLeaveRequest(newLeave);
      toast.success("Leave request submitted successfully!");
      handleAddClose();
    } catch {
      toast.error("Failed to submit leave request");
    }
  };

  // -------------------- APPROVE / REJECT --------------------
  const handleApprove = async (leave: LeaveRequest) => {
    await approveLeaveRequest(leave.id, { approverId: employee?.id || 1, remarks: "APPROVED" });
  };
  const handleReject = async (leave: LeaveRequest) => {
    await rejectLeaveRequest(leave.id, { approverId: employee?.id || 1, remarks: "REJECTED" });
  };

  // -------------------- PAGINATION --------------------
  const displayedLeaves = leaveRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 2 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Leave Requests</Typography>
        <Button variant="contained" onClick={handleAddOpen}>Add Leave Request</Button>
      </Stack>

      {/* SUMMARY CARDS */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Requests</Typography>
              <Typography variant="h4">{leaveRequests.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pending</Typography>
              <Typography variant="h4">{leaveRequests.filter(l => l.status === "PENDING").length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">Approved</Typography>
              <Typography variant="h4">{leaveRequests.filter(l => l.status === "APPROVED").length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Total Days</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedLeaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No leave requests found
                </TableCell>
              </TableRow>
            ) : (
              displayedLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.id}</TableCell>
                  <TableCell>{leave.employeeId}</TableCell>
                  <TableCell>{leave.leaveTypeId}</TableCell>
                  <TableCell>{leave.fromDate}</TableCell>
                  <TableCell>{leave.toDate}</TableCell>
                  <TableCell>{leave.totalDays}</TableCell>
                  <TableCell>{leave.status}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => handleViewOpen(leave)}>View</Button>
                      <Button variant="contained" size="small" sx={{ display: sessionData.roleId === 1 ? 'block': 'none' }} color="success" disabled={leave.status !== "PENDING"} onClick={() => handleApprove(leave)}>Approve</Button>
                      <Button variant="outlined" size="small" sx={{ display: sessionData.roleId === 1 ? 'block': 'none' }} color="error" disabled={leave.status !== "PENDING"} onClick={() => handleReject(leave)}>Deny</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={leaveRequests.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      </TableContainer>

      {/* VIEW MODAL */}
      <Modal open={viewOpen} onClose={handleViewClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>View Leave Request</Typography>
          {currentLeave && (
            <Stack spacing={2}>
              <TextField label="Employee ID" value={currentLeave.employeeId} disabled fullWidth />
              <TextField label="Leave Type" value={currentLeave.leaveTypeId} disabled fullWidth />
              <TextField label="Start Date" value={currentLeave.fromDate} disabled fullWidth />
              <TextField label="End Date" value={currentLeave.toDate} disabled fullWidth />
              <TextField label="Total Days" value={currentLeave.totalDays} disabled fullWidth />
              <TextField label="Status" value={currentLeave.status} disabled fullWidth />
              <TextField label="Reason" value={currentLeave.reason} disabled fullWidth multiline />
            </Stack>
          )}
        </Box>
      </Modal>

      {/* ADD MODAL */}
      <Modal open={addOpen} onClose={handleAddClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>Add Leave Request</Typography>
          <Stack spacing={2}>
            <TextField label="Employee ID" type="number" value={employee?.id || ""} disabled fullWidth />
            <TextField
              label="Leave Type"
              type="number"
              value={newLeave.leaveTypeId}
              onChange={(e) => handleAddChange("leaveTypeId", Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Start Date"
              type="date"
              value={newLeave.fromDate}
              onChange={(e) => handleAddChange("fromDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={newLeave.toDate}
              onChange={(e) => handleAddChange("toDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Total Days"
              type="number"
              value={newLeave.totalDays}
              disabled
              fullWidth
            />
            <TextField
              label="Reason"
              value={newLeave.reason}
              onChange={(e) => handleAddChange("reason", e.target.value)}
              fullWidth
              multiline
            />
            <Button variant="contained" onClick={handleAddSubmit}>Submit</Button>
          </Stack>
        </Box>
      </Modal>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}