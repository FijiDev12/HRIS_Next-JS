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
import { useMediaQuery, useTheme } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useOTRequestStore, OTRequest, CreateOTPayload } from "@/app/store/useOTRequest";
import { useEmployeeInfoStore } from "@/app/store/useEmployeeInfo";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {xs: '90%', sm : '90%', md: 500, lg: 500},
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

// -------------------- APPROVE / REJECT PAYLOAD TYPE --------------------
interface ApproveRejectPayload {
  approverId: number;
  remarks: string;
  employeeId: number;
  workDate: string;
}

export default function OTRequestPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    otRequests,
    fetchOTRequests,
    fetchOTRequestByEmpId,
    createOTRequest,
    approveOTRequest,
    rejectOTRequest,
    loading,
    error,
    clearError,
  } = useOTRequestStore();

  const { employee } = useEmployeeInfoStore();

  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [currentOT, setCurrentOT] = useState<OTRequest | null>(null);

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const [newOT, setNewOT] = useState<CreateOTPayload>({
    employeeId: employee?.id || 0,
    workDate: "",
    startTime: "",
    endTime: "",
    totalMinutes: 0,
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
            await fetchOTRequests();
          } else {
            await fetchOTRequestByEmpId(employee.id);
          }
        } catch {
          toast.error("Failed to fetch OT requests");
        }
      };
      fetchData();
    }
  }, [employee, sessionData]);

  // -------------------- VIEW MODAL --------------------
  const handleViewOpen = (ot: OTRequest) => {
    setCurrentOT(ot);
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setCurrentOT(null);
    setViewOpen(false);
    clearError();
  };

  // -------------------- ADD MODAL --------------------
  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setAddOpen(false);
    setNewOT({
      employeeId: employee?.id || 0,
      workDate: "",
      startTime: "",
      endTime: "",
      totalMinutes: 0,
      reason: "",
      createdBy: employee?.id || 1,
    });
    clearError();
  };

  const handleAddChange = (field: keyof CreateOTPayload, value: any) => {
    const updatedOT = { ...newOT, [field]: value };

    // Auto-calculate totalMinutes if start/end time changes
    if (field === "startTime" || field === "endTime") {
      if (updatedOT.startTime && updatedOT.endTime) {
        const [startH, startM] = updatedOT.startTime.split(":").map(Number);
        const [endH, endM] = updatedOT.endTime.split(":").map(Number);
        const start = new Date();
        start.setHours(startH, startM, 0, 0);
        const end = new Date();
        end.setHours(endH, endM, 0, 0);
        updatedOT.totalMinutes = end > start ? Math.round((end.getTime() - start.getTime()) / 60000) : 0;
      }
    }

    setNewOT(updatedOT);
  };

  const handleAddSubmit = async () => {
    if (!newOT.employeeId || !newOT.workDate || !newOT.startTime || !newOT.endTime || !newOT.totalMinutes || !newOT.reason) {
      toast.error("Please fill in all fields correctly");
      return;
    }
    try {
      await createOTRequest(newOT);
      toast.success("OT request submitted successfully!");
      handleAddClose();
    } catch {
      toast.error("Failed to submit OT request");
    }
  };

  // -------------------- APPROVE / REJECT --------------------
  const handleApprove = async (ot: OTRequest) => {
    try {
      const payload: ApproveRejectPayload = {
        approverId: employee?.id ?? 1,
        remarks: "APPROVED",
        employeeId: ot.employeeId,
        workDate: ot.workDate,
      };
      await approveOTRequest(ot.id, payload);
      toast.success("OT request approved");
    } catch {
      toast.error("Failed to approve OT request");
    }
  };

  const handleReject = async (ot: OTRequest) => {
    try {
      const payload: ApproveRejectPayload = {
        approverId: employee?.id ?? 1,
        remarks: "REJECTED",
        employeeId: ot.employeeId,
        workDate: ot.workDate,
      };
      await rejectOTRequest(ot.id, payload);
      toast.success("OT request rejected");
    } catch {
      toast.error("Failed to reject OT request");
    }
  };

  // -------------------- PAGINATION --------------------
  const displayedOTs = otRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 2 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">OT Requests</Typography>
        <Button variant="contained" onClick={handleAddOpen}>Add OT Request</Button>
      </Stack>

      {/* SUMMARY CARDS */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography sx={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)" }} variant="h6">Total Requests</Typography>
              <Typography variant="h4">{otRequests.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography sx={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)" }} variant="h6">Pending</Typography>
              <Typography variant="h4">{otRequests.filter(o => o.status === "PENDING").length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography sx={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)" }} variant="h6">Approved</Typography>
              <Typography variant="h4">{otRequests.filter(o => o.status === "APPROVED").length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* TABLE */}

{isMobile ? (
  <Grid container spacing={2} sx={{ mb: 2 }}>
    {displayedOTs.length === 0 ? (
      <Grid size={[12]}>
        <Typography align="center">No OT requests found</Typography>
      </Grid>
    ) : (
      displayedOTs.map((ot) => (
        <Grid size={[12]} key={ot.id}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">OT ID: {ot.id}</Typography>
              <Typography variant="body2">Employee: {ot.employeeId}</Typography>
              <Typography variant="body2">Date: {ot.workDate}</Typography>
              <Typography variant="body2">Start: {ot.startTime}</Typography>
              <Typography variant="body2">End: {ot.endTime}</Typography>
              <Typography variant="body2">Total Minutes: {ot.totalMinutes}</Typography>
              <Typography variant="body2">Status: {ot.status}</Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleViewOpen(ot)}
                >
                  View
                </Button>

                {sessionData.roleId === 1 && ot.status === "PENDING" && (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(ot)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(ot)}
                    >
                      Deny
                    </Button>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))
    )}

    {/* Optional: Pagination for mobile */}
    {displayedOTs.length > rowsPerPage && (
      <Grid size={[12]} sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <TablePagination
          component="div"
          count={otRequests.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      </Grid>
    )}
  </Grid>
):(
        <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Work Date</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Total Minutes</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedOTs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">No OT requests found</TableCell>
              </TableRow>
            ) : (
              displayedOTs.map((ot) => (
                <TableRow key={ot.id}>
                  <TableCell>{ot.id}</TableCell>
                  <TableCell>{ot.employeeId}</TableCell>
                  <TableCell>{ot.workDate}</TableCell>
                  <TableCell>{ot.startTime}</TableCell>
                  <TableCell>{ot.endTime}</TableCell>
                  <TableCell>{ot.totalMinutes}</TableCell>
                  <TableCell>{ot.status}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => handleViewOpen(ot)}>View</Button>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ display: sessionData.roleId === 1 ? 'block': 'none' }}
                        color="success"
                        disabled={ot.status !== "PENDING"}
                        onClick={() => handleApprove(ot)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ display: sessionData.roleId === 1 ? 'block': 'none' }}
                        color="error"
                        disabled={ot.status !== "PENDING"}
                        onClick={() => handleReject(ot)}
                      >
                        Deny
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
          count={otRequests.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      </TableContainer>
)}
      {/* VIEW MODAL */}
      <Modal open={viewOpen} onClose={handleViewClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>View OT Request</Typography>
          {currentOT && (
            <Stack spacing={2}>
              <TextField label="Employee ID" value={currentOT.employeeId} disabled fullWidth />
              <TextField label="Work Date" value={currentOT.workDate} disabled fullWidth />
              <TextField label="Start Time" value={currentOT.startTime} disabled fullWidth />
              <TextField label="End Time" value={currentOT.endTime} disabled fullWidth />
              <TextField label="Total Minutes" value={currentOT.totalMinutes} disabled fullWidth />
              <TextField label="Status" value={currentOT.status} disabled fullWidth />
              <TextField label="Reason" value={currentOT.reason} disabled fullWidth multiline />
            </Stack>
          )}
        </Box>
      </Modal>

      {/* ADD MODAL */}
      <Modal open={addOpen} onClose={handleAddClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>Add OT Request</Typography>
          <Stack spacing={2}>
            <TextField label="Employee ID" type="number" value={employee?.id || ""} disabled fullWidth />
            <TextField
              label="Work Date"
              type="date"
              value={newOT.workDate}
              onChange={(e) => handleAddChange("workDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Start Time"
              type="time"
              value={newOT.startTime}
              onChange={(e) => handleAddChange("startTime", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Time"
              type="time"
              value={newOT.endTime}
              onChange={(e) => handleAddChange("endTime", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Total Minutes"
              type="number"
              value={newOT.totalMinutes}
              disabled
              fullWidth
            />
            <TextField
              label="Reason"
              value={newOT.reason}
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