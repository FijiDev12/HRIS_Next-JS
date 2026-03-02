"use client";
import { useEffect, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, Button,
  Modal, Box, Typography, TextField, Stack
} from "@mui/material";
import { useScheduleStore, Schedule } from "@/app/store/useSchedule";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

export default function ScheduleTab() {
  const { schedules, fetchSchedules, createSchedule, updateSchedule, deleteSchedule } = useScheduleStore();
  const [open, setOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [shiftName, setShiftName] = useState("");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleOpen = (schedule: Schedule | null = null, edit = false) => {
    setCurrentSchedule(schedule);
    setIsEdit(edit);
    setShiftName(schedule?.shiftName || "");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentSchedule(null);
    setIsEdit(false);
    setShiftName("");
  };

  const handleSave = async () => {
    if (!shiftName) return;

    if (isEdit && currentSchedule) {
      await updateSchedule(currentSchedule.id, { shiftName });
    } else {
      await createSchedule({ shiftName });
    }

    handleClose();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      await deleteSchedule(id);
    }
  };

  return (
    <>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => handleOpen(null, false)}>
        Create Schedule
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Shift Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { 
            schedules?.length === 0 ?
            <TableRow>
              <TableCell colSpan={3} align="center">  No schedule found</TableCell>
            </TableRow> :
            schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{schedule.id}</TableCell>
                <TableCell>{schedule.shiftName}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => handleOpen(schedule, false)}>
                      View
                    </Button>
                    <Button size="small" variant="contained" onClick={() => handleOpen(schedule, true)}>
                      Edit
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(schedule.id)}>
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
            }
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            {isEdit ? "Edit Schedule" : currentSchedule ? "View Schedule" : "Create Schedule"}
          </Typography>
          <TextField
            label="Shift Name"
            value={shiftName}
            onChange={(e) => setShiftName(e.target.value)}
            fullWidth
            disabled={isEdit}
            sx={{ mb: 2 }}
          />
          {(isEdit || !currentSchedule) && (
            <Button variant="contained" onClick={handleSave} fullWidth>
              {isEdit ? "Save Changes" : "Create"}
            </Button>
          )}
          <Button variant="outlined" onClick={handleClose} fullWidth sx={{ mt: 1 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
}