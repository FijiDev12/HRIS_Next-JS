"use client";

import React, { use, useEffect, useState } from "react";
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

import {
  useOfficialBusinessStore,
  OfficialBusinessRequest,
  CreateOfficialBusinessPayload,
} from "@/app/store/useOBRequest";
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

export default function OfficialBusinessPage() {
  const {
    officialBusinesses,
    fetchOfficialBusinesses,
    fetchOfficialBusinessesByEmpId,
    createOfficialBusiness,
    approveOfficialBusiness,
    rejectOfficialBusiness,
    loading,
    error,
    clearError,
  } = useOfficialBusinessStore();

  const { employee } = useEmployeeInfoStore();

  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [currentOB, setCurrentOB] = useState<OfficialBusinessRequest | null>(null);

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const [newOB, setNewOB] = useState<CreateOfficialBusinessPayload>({
    employeeId: employee?.id || 0,
    workDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
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
            await fetchOfficialBusinesses();
          } else {
            await fetchOfficialBusinessesByEmpId(employee.id);
          }
        } catch {
          toast.error("Failed to fetch official business requests");
        }
      };
      fetchData();
    }
  }, [employee, sessionData]);

  // -------------------- VIEW MODAL --------------------
  const handleViewOpen = (ob: OfficialBusinessRequest) => {
    setCurrentOB(ob);
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setCurrentOB(null);
    setViewOpen(false);
    clearError();
  };

  // -------------------- ADD MODAL --------------------
  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setNewOB({
      employeeId: employee?.id || 0,
      workDate: "",
      startTime: "",
      endTime: "",
      purpose: "",
      createdBy: employee?.id || 1,
    });
    setAddOpen(false);
    clearError();
  };

  const handleAddChange = (field: keyof CreateOfficialBusinessPayload, value: any) => {
    setNewOB({ ...newOB, [field]: value });
  };

  const handleAddSubmit = async () => {
    if (!newOB.workDate || !newOB.startTime || !newOB.endTime || !newOB.purpose) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await createOfficialBusiness(newOB);
      toast.success("Official Business request submitted successfully!");
      handleAddClose();
    } catch {
      toast.error("Failed to submit OB request");
    }
  };

  // -------------------- APPROVE / REJECT --------------------
  const handleApprove = async (ob: OfficialBusinessRequest) => {
    try {
      await approveOfficialBusiness(ob.id, { approverId: employee?.id || 1, remarks: "APPROVED" });
      toast.success("OB request approved");
    } catch {
      toast.error("Failed to approve OB request");
    }
  };
  const handleReject = async (ob: OfficialBusinessRequest) => {
    try {
      await rejectOfficialBusiness(ob.id, { approverId: employee?.id || 1, remarks: "REJECTED" });
      toast.success("OB request rejected");
    } catch {
      toast.error("Failed to reject OB request");
    }
  };

  useEffect(() => {
    if(employee){
        setNewOB({
        employeeId: employee?.id || 0,
        workDate: "",
        startTime: "",
        endTime: "",
        purpose: "",
        createdBy: employee?.id || 1,
        });
    }
  }, [employee]);

  // -------------------- PAGINATION --------------------
  const displayedOBs = officialBusinesses?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 2 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Official Business Requests</Typography>
        <Button variant="contained" onClick={handleAddOpen}>Add OB Request</Button>
      </Stack>

      {/* SUMMARY CARDS */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={[4, 4, 4]}>
            <Card>
            <CardContent>
                <Typography variant="h6">Total Requests</Typography>
                <Typography variant="h4">{officialBusinesses.length}</Typography>
            </CardContent>
            </Card>
        </Grid>
        <Grid size={[4, 4, 4]}>
            <Card>
            <CardContent>
                <Typography variant="h6">Pending</Typography>
                <Typography variant="h4">
                {officialBusinesses?.filter(o => o?.status === null || o?.status === "PENDING").length}
                </Typography>
            </CardContent>
            </Card>
        </Grid>
        <Grid size={[4, 4, 4]}>
            <Card>
            <CardContent>
                <Typography variant="h6">Approved</Typography>
                <Typography variant="h4">
                {officialBusinesses?.filter(o => o?.status === "APPROVED").length}
                </Typography>
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
              <TableCell>Employee ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedOBs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">No OB requests found</TableCell>
              </TableRow>
            ) : (
              displayedOBs.map((ob, index) => (
                <TableRow key={index}>
                  <TableCell>{ob?.id}</TableCell>
                  <TableCell>{ob?.employeeId}</TableCell>
                  <TableCell>{ob?.workDate}</TableCell>
                  <TableCell>{ob?.startTime}</TableCell>
                  <TableCell>{ob?.endTime}</TableCell>
                  <TableCell>{ob?.purpose}</TableCell>
                  <TableCell>{ob?.status}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => handleViewOpen(ob)}>View</Button>
                      <Button variant="contained" size="small" sx={{ display: sessionData.roleId === 1 ? 'block': 'none' }} color="success" disabled={ob?.status !== "PENDING"} onClick={() => handleApprove(ob)}>Approve</Button>
                      <Button variant="outlined" size="small" sx={{ display: sessionData.roleId === 1 ? 'block': 'none' }} color="error" disabled={ob?.status !== "PENDING"} onClick={() => handleReject(ob)}>Deny</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={officialBusinesses.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      </TableContainer>

      {/* VIEW MODAL */}
      <Modal open={viewOpen} onClose={handleViewClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>View OB Request</Typography>
          {currentOB && (
            <Stack spacing={2}>
              <TextField label="Employee ID" value={currentOB.employeeId} disabled fullWidth />
              <TextField label="Date" value={currentOB.workDate} disabled fullWidth />
              <TextField label="Start Time" value={currentOB.startTime} disabled fullWidth />
              <TextField label="End Time" value={currentOB.endTime} disabled fullWidth />
              <TextField label="Purpose" value={currentOB.purpose} disabled fullWidth multiline />
              <TextField label="Status" value={currentOB.status} disabled fullWidth />
            </Stack>
          )}
        </Box>
      </Modal>

      {/* ADD MODAL */}
      <Modal open={addOpen} onClose={handleAddClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>Add OB Request</Typography>
          <Stack spacing={2}>
            <TextField label="Employee ID" type="number" value={employee?.id || ""} disabled fullWidth />
            <TextField
              label="Work Date"
              type="date"
              value={newOB.workDate}
              onChange={(e) => handleAddChange("workDate", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Start Time"
              type="time"
              value={newOB.startTime}
              onChange={(e) => handleAddChange("startTime", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Time"
              type="time"
              value={newOB.endTime}
              onChange={(e) => handleAddChange("endTime", e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Purpose"
              value={newOB.purpose}
              onChange={(e) => handleAddChange("purpose", e.target.value)}
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