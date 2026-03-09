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
  MenuItem,
  TablePagination,
} from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  useAttendanceCorrectionStore,
  AttendanceCorrection,
  CreateAttendanceCorrectionPayload,
} from "@/app/store/useACRequest";

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

export default function AttendanceCorrectionPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    attendanceCorrections,
    fetchAttendanceCorrections,
    fetchAttendanceCorrectionByEmpId,
    createAttendanceCorrection,
    approveAttendanceCorrection,
    rejectAttendanceCorrection,
    loading,
    error,
  } = useAttendanceCorrectionStore();

  const { employee } = useEmployeeInfoStore();

  // -------------------------
  // SESSION DATA
  // -------------------------
  const [sessionData, setSessionData] = useState<{ roleId?: number; id?: number }>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) setSessionData(JSON.parse(stored));
    }
  }, []);

  // -------------------------
  // MODAL STATES
  // -------------------------
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 4; // fixed
  const [currentCorrection, setCurrentCorrection] =
    useState<AttendanceCorrection | null>(null);

  const [newCorrection, setNewCorrection] =
    useState<CreateAttendanceCorrectionPayload & { remarks?: string }>({
      employeeNo: employee?.employeeNo || 0,
      employeeId: employee?.id || 0,
      type: "IN",
      logDate: "",
      shiftId: 1,
      correctedTime: "",
      reason: "",
      createdBy: employee?.id || 1,
      remarks: "",
    });

  // -------------------------
  // APPROVE/REJECT MODAL
  // -------------------------
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [actionCorrection, setActionCorrection] = useState<AttendanceCorrection | null>(null);
  const [actionRemarks, setActionRemarks] = useState<string>("");

  const handleActionOpen = (
    correction: AttendanceCorrection,
    type: "APPROVE" | "REJECT"
  ) => {
    setActionCorrection(correction);
    setActionType(type);
    setActionRemarks(type === "APPROVE" ? "Approved" : "Rejected");
    setActionModalOpen(true);
  };

  const handleActionClose = () => {
    setActionModalOpen(false);
    setActionCorrection(null);
    setActionType(null);
    setActionRemarks("");
  };

  const handleActionSubmit = async () => {
    if (!actionCorrection || !actionType) return;

    try {
      if (actionType === "APPROVE") {
        await approveAttendanceCorrection({
          correctionId: actionCorrection.id,
          approverId: employee?.id || 1,
          remarks: actionRemarks,
        });
        toast.success("Correction approved");
      } else {
        await rejectAttendanceCorrection({
          correctionId: actionCorrection.id,
          approverId: employee?.id || 1,
          remarks: actionRemarks,
        });
        toast.success("Correction rejected");
      }
      handleActionClose();
    } catch {
      toast.error("Failed to process action");
    }
  };

  // -------------------------
  // FETCH DATA BASED ON ROLE
  // -------------------------

  const sortedAC = [...attendanceCorrections].sort((a, b) => a.id - b.id);

  useEffect(() => {
    if (employee) {
      const fetchData = async () => {
        try {
          if (sessionData.roleId === 1) {
            // Role 1 = fetch all corrections
            await fetchAttendanceCorrections();
          } else if(employee) {
            // Other roles = fetch only user corrections
            await fetchAttendanceCorrectionByEmpId(employee?.id);
          }
        } catch (err) {
          toast.error("Failed to fetch attendance corrections");
        }
      };
      
      fetchData();
    }
  }, [employee, sessionData]);

  useEffect(() => {
    if (employee) {
      setNewCorrection((prev) => ({
        ...prev,
        employeeNo: employee.employeeNo,
        employeeId: employee.id,
        createdBy: employee.id,
      }));
    }
  }, [employee]);

  // -------------------------
  // VIEW MODAL
  // -------------------------
  const handleViewOpen = (correction: AttendanceCorrection) => {
    setCurrentCorrection(correction);
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setViewOpen(false);
    setCurrentCorrection(null);
  };

  // -------------------------
  // ADD MODAL
  // -------------------------
  const handleAddOpen = () => setAddOpen(true);

  const handleAddClose = () => {
    setAddOpen(false);
    setNewCorrection({
      employeeNo: employee ? employee.employeeNo : 0,
      employeeId: employee ? employee.id : 0,
      type: "IN",
      logDate: "",
      shiftId: 1,
      correctedTime: "",
      reason: "",
      createdBy: employee ? employee.id : 1,
      remarks: "",
    });
  };

  const handleAddChange = (
    field: keyof (CreateAttendanceCorrectionPayload & { remarks?: string }),
    value: any
  ) => {
    setNewCorrection({ ...newCorrection, [field]: value });
  };

  const handleAddSubmit = async () => {
    if (
      !newCorrection.employeeNo ||
      !newCorrection.logDate ||
      !newCorrection.correctedTime ||
      !newCorrection.reason
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createAttendanceCorrection(newCorrection as CreateAttendanceCorrectionPayload);
      toast.success("Attendance correction submitted successfully");
      handleAddClose();
    } catch {
      toast.error("Failed to submit correction");
    }
  };

    // Safe fallback
    const corrections = attendanceCorrections || [];

    // Real counts
    const totalCount = corrections.length;
    const pendingCount = corrections.filter(
    (item: any) => item?.status === "PENDING"
    ).length;

    const approvedCount = corrections.filter(
    (item: any) => item?.status === "APPROVED"
    ).length;

  return (
    <Box sx={{ p: 2 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">Attendance Corrections</Typography>
        <Button variant="contained" onClick={handleAddOpen}>
          Add Correction
        </Button>
      </Stack>

      {/* SUMMARY CARDS */}
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid size={[4, 4, 4]}>
          <Card>
          <CardContent>
              <Typography variant="h6">Total Requests</Typography>
              <Typography variant="h4">{totalCount}</Typography>
          </CardContent>
          </Card>
      </Grid>

      <Grid size={[4, 4, 4]}>
          <Card>
          <CardContent>
              <Typography variant="h6">Pending</Typography>
              <Typography variant="h4">{pendingCount}</Typography>
          </CardContent>
          </Card>
      </Grid>

      <Grid size={[4, 4, 4]}>
          <Card>
          <CardContent>
              <Typography variant="h6">Approved</Typography>
              <Typography variant="h4">{approvedCount}</Typography>
          </CardContent>
          </Card>
      </Grid>
    </Grid>

      {/* TABLE */}
      
      {isMobile ? (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {sortedAC.length === 0 ? (
            <Grid size={[12]}>
              <Typography align="center">No attendance corrections found</Typography>
            </Grid>
          ) : (
            sortedAC.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((correction) => (
              <Grid size={[12]} key={correction.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {correction.employee
                        ? `${correction.employee.firstName} ${correction.employee.lastName}`
                        : correction.employeeNo}
                    </Typography>
                    <Typography variant="body2">Type: {correction.type}</Typography>
                    <Typography variant="body2">Date: {correction.logDate}</Typography>
                    <Typography variant="body2">Corrected Time: {correction.correctedTime}</Typography>
                    <Typography variant="body2">Status: {correction.status}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewOpen(correction)}
                      >
                        View
                      </Button>
                      {sessionData.roleId === 1 && correction.status === "PENDING" && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleActionOpen(correction, "APPROVE")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleActionOpen(correction, "REJECT")}
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
          {sortedAC.length > rowsPerPage && (
            <Grid size={[12]} sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <TablePagination
                component="div"
                count={sortedAC.length}
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
                    <TableCell>Employee</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Corrected Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedAC?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">  No attendance corrections found</TableCell>
                    </TableRow>
                  ) : (
                      sortedAC.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((correction) => (
                        <TableRow key={correction.id}>
                          <TableCell>{correction.id}</TableCell>
                          <TableCell>
                            {correction.employee
                              ? `${correction.employee.firstName} ${correction.employee.lastName}`
                              : correction.employeeNo}
                          </TableCell>
                          <TableCell>{correction.type}</TableCell>
                          <TableCell>{correction.logDate}</TableCell>
                          <TableCell>{correction.correctedTime}</TableCell>
                          <TableCell>{correction.status}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleViewOpen(correction)}
                              >
                                View
                              </Button>
                              <Button
                                sx={{ display: sessionData.roleId === 1 ? 'block': 'none' }}
                                variant="contained"
                                size="small"
                                color="success"
                                disabled={correction.status !== "PENDING"}
                                onClick={() => handleActionOpen(correction, "APPROVE")}
                              >
                                Approve
                              </Button>
                              <Button
                              sx={{ display: sessionData.roleId === 1 ? 'block': 'none' }}
                                variant="outlined"
                                size="small"
                                color="error"
                                disabled={correction.status !== "PENDING"}
                                onClick={() => handleActionOpen(correction, "REJECT")}
                              >
                                Deny
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  }
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={sortedAC.length}
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
          <Typography variant="h6" gutterBottom>
            View Correction
          </Typography>
          {currentCorrection && (
            <Stack spacing={2}>
              <TextField
                label="Employee"
                value={
                  currentCorrection.employee
                    ? `${currentCorrection.employee.firstName} ${currentCorrection.employee.lastName}`
                    : currentCorrection.employeeNo
                }
                disabled
                fullWidth
              />
              <TextField label="Type" value={currentCorrection.type} disabled fullWidth />
              <TextField label="Date" value={currentCorrection.logDate} disabled fullWidth />
              <TextField
                label="Corrected Time"
                value={currentCorrection.correctedTime}
                disabled
                fullWidth
              />
              <TextField label="Status" value={currentCorrection.status} disabled fullWidth />
              <TextField
                label="Reason"
                value={currentCorrection.reason}
                disabled
                fullWidth
                multiline
              />
              <TextField
                label="Remarks"
                value={currentCorrection.remarks || ""}
                disabled
                fullWidth
                multiline
              />
            </Stack>
          )}
        </Box>
      </Modal>

      {/* ADD MODAL */}
      <Modal open={addOpen} onClose={handleAddClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Add Attendance Correction
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Type"
              select
              value={newCorrection.type}
              onChange={(e) => handleAddChange("type", e.target.value)}
              fullWidth
            >
              <MenuItem value="IN">IN</MenuItem>
              <MenuItem value="OUT">OUT</MenuItem>
            </TextField>

            <TextField
              label="Log Date"
              type="date"
              value={newCorrection.logDate}
              onChange={(e) => handleAddChange("logDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Corrected Time"
              type="time"
              value={newCorrection.correctedTime}
              onChange={(e) => handleAddChange("correctedTime", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Reason"
              value={newCorrection.reason}
              onChange={(e) => handleAddChange("reason", e.target.value)}
              fullWidth
              multiline
            />

            <Button variant="contained" onClick={handleAddSubmit}>
              Submit
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* APPROVE/REJECT MODAL */}
      <Modal open={actionModalOpen} onClose={handleActionClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            {actionType === "APPROVE" ? "Approve Correction" : "Reject Correction"}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Remarks"
              value={actionRemarks}
              onChange={(e) => setActionRemarks(e.target.value)}
              fullWidth
              multiline
            />
            <Button variant="contained" onClick={handleActionSubmit}>
              Submit
            </Button>
          </Stack>
        </Box>
      </Modal>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}