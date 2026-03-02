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
  MenuItem,
} from "@mui/material";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  useHolidayStore,
  Holiday,
  CreateHolidayPayload,
} from "@/app/store/useHoliday";

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

// -------------------- HELPER --------------------
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function HolidayPage() {
  const {
    holidays,
    fetchHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    loading,
    error,
  } = useHolidayStore();

  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [currentHoliday, setCurrentHoliday] = useState<Holiday | null>(null);
  const [editHoliday, setEditHoliday] = useState<Holiday | null>(null);

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const [newHoliday, setNewHoliday] = useState<CreateHolidayPayload>({
    holidayName: "",
    holidayDate: "",
    siteId: 1,
    createdBy: 1,
    type: "REGULAR",
  });

  // -------------------- FETCH HOLIDAYS --------------------
  useEffect(() => {
    fetchHolidays().catch(() => toast.error("Failed to fetch holidays"));
  }, []);

  // -------------------- VIEW --------------------
  const handleViewOpen = (holiday: Holiday) => {
    setCurrentHoliday(holiday);
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setCurrentHoliday(null);
    setViewOpen(false);
  };

  // -------------------- ADD --------------------
  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setNewHoliday({
      holidayName: "",
      holidayDate: "",
      siteId: 1,
      createdBy: 1,
      type: "REGULAR",
    });
    setAddOpen(false);
  };
  const handleAddChange = (field: keyof CreateHolidayPayload, value: any) => {
    setNewHoliday({ ...newHoliday, [field]: value });
  };
  const handleAddSubmit = async () => {
    if (!newHoliday.holidayName || !newHoliday.holidayDate) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await createHoliday(newHoliday);
      toast.success("Holiday created successfully!");
      handleAddClose();
    } catch {
      toast.error("Failed to create holiday");
    }
  };

  // -------------------- EDIT --------------------
  const handleEditOpen = (holiday: Holiday) => {
    setEditHoliday({
      ...holiday,
      holidayDate: holiday.holidayDate.split("T")[0], // for date input
    });
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditHoliday(null);
    setEditOpen(false);
  };
  const handleEditChange = (field: keyof Holiday, value: any) => {
    if (!editHoliday) return;
    setEditHoliday({ ...editHoliday, [field]: value });
  };
  const handleEditSubmit = async () => {
    if (!editHoliday) return;
    try {
      await updateHoliday({
        id: editHoliday.id,
        holidayName: editHoliday.holidayName,
        holidayDate: editHoliday.holidayDate,
        siteId: editHoliday.siteId,
        createdBy: editHoliday.createdBy,
        type: editHoliday.type,
      });
      toast.success("Holiday updated successfully!");
      handleEditClose();
    } catch {
      toast.error("Failed to update holiday");
    }
  };

  // -------------------- DELETE --------------------
  const handleDelete = async (id: number) => {
    try {
      await deleteHoliday(id);
      toast.success("Holiday deleted");
    } catch {
      toast.error("Failed to delete holiday");
    }
  };

  // -------------------- PAGINATION --------------------
  const displayedHolidays = holidays.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 2 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Holiday Management</Typography>
        <Button variant="contained" onClick={handleAddOpen}>Add Holiday</Button>
      </Stack>

      {/* SUMMARY CARDS */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Holidays</Typography>
              <Typography variant="h4">{holidays.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">Regular</Typography>
              <Typography variant="h4">{holidays.filter(h => h.type === "REGULAR").length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">Special</Typography>
              <Typography variant="h4">{holidays.filter(h => h.type === "SPECIAL").length}</Typography>
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
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedHolidays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No holidays found</TableCell>
              </TableRow>
            ) : (
              displayedHolidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell>{holiday.id}</TableCell>
                  <TableCell>{holiday.holidayName}</TableCell>
                  <TableCell>{formatDate(holiday.holidayDate)}</TableCell>
                  <TableCell>{holiday.type}</TableCell>
                  <TableCell>{holiday.siteId}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => handleViewOpen(holiday)}>View</Button>
                      <Button variant="contained" size="small" onClick={() => handleEditOpen(holiday)}>Update</Button>
                      <Button variant="outlined" size="small" color="error" onClick={() => handleDelete(holiday.id)}>Delete</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={holidays.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      </TableContainer>

      {/* VIEW MODAL */}
      <Modal open={viewOpen} onClose={handleViewClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>View Holiday</Typography>
          {currentHoliday && (
            <Stack spacing={2}>
              <TextField label="Holiday Name" value={currentHoliday.holidayName} disabled fullWidth />
              <TextField label="Holiday Date" value={formatDate(currentHoliday.holidayDate)} disabled fullWidth />
              <TextField label="Type" value={currentHoliday.type} disabled fullWidth />
              <TextField label="Site ID" value={currentHoliday.siteId} disabled fullWidth />
            </Stack>
          )}
        </Box>
      </Modal>

      {/* ADD MODAL */}
      <Modal open={addOpen} onClose={handleAddClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>Add Holiday</Typography>
          <Stack spacing={2}>
            <TextField label="Holiday Name" value={newHoliday.holidayName} onChange={(e) => handleAddChange("holidayName", e.target.value)} fullWidth />
            <TextField label="Holiday Date" type="date" value={newHoliday.holidayDate} onChange={(e) => handleAddChange("holidayDate", e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField select label="Type" value={newHoliday.type} onChange={(e) => handleAddChange("type", e.target.value)} fullWidth>
              <MenuItem value="REGULAR">REGULAR</MenuItem>
              <MenuItem value="SPECIAL">SPECIAL</MenuItem>
            </TextField>
            <Button variant="contained" onClick={handleAddSubmit}>Submit</Button>
          </Stack>
        </Box>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={editOpen} onClose={handleEditClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>Update Holiday</Typography>
          {editHoliday && (
            <Stack spacing={2}>
              <TextField label="Holiday Name" value={editHoliday.holidayName} onChange={(e) => handleEditChange("holidayName", e.target.value)} fullWidth />
              <TextField label="Holiday Date" type="date" value={editHoliday.holidayDate} onChange={(e) => handleEditChange("holidayDate", e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField select label="Type" value={editHoliday.type} onChange={(e) => handleEditChange("type", e.target.value)} fullWidth>
                <MenuItem value="REGULAR">REGULAR</MenuItem>
                <MenuItem value="SPECIAL">SPECIAL</MenuItem>
              </TextField>
              <Button variant="contained" onClick={handleEditSubmit}>Update</Button>
            </Stack>
          )}
        </Box>
      </Modal>

      {loading && <Typography sx={{ mt: 2 }}>Loading...</Typography>}
      {error && <Typography sx={{ mt: 2 }} color="error">{error}</Typography>}
    </Box>
  );
}