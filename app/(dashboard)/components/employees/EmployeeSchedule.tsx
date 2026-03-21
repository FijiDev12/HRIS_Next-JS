"use client";
import { useEffect, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, Button,
  Modal, Box, Typography, TextField,
  Stack, Select, MenuItem, FormControl,
  InputLabel, Grid, useTheme, useMediaQuery
} from "@mui/material";
import { useScheduleStore, Schedule } from "@/app/store/useSchedule";
import { useBreaktimeStore, Breaktime } from "@/app/store/useBreakTIme";
const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {xs: '90%', sm : '90%', md: 500, lg: 500},
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

export default function ScheduleTab() {
  const { schedules, fetchSchedules, createSchedule, updateSchedule, deleteSchedule } = useScheduleStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [shiftName, setShiftName] = useState("");
  const [scheduleType, setScheduleType] = useState<"STANDARD" | "FLEX">("STANDARD");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const {
    breaktimes,
    fetchBreaktimes,
    createBreaktime,
    updateBreaktime,
    deleteBreaktime
  } = useBreaktimeStore();

  const [breakModalOpen, setBreakModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [currentBreak, setCurrentBreak] = useState<Breaktime | null>(null);

  const [bStart, setBStart] = useState("");
  const [bEnd, setBEnd] = useState("");
  const [isFlexible, setIsFlexible] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchBreaktimes();
  }, []);

  const handleOpen = (schedule: Schedule | null = null, edit = false) => {
    setCurrentSchedule(schedule);
    setIsEdit(edit);

    if (schedule) {
      setShiftName(schedule.shiftName);
      setStartTime(schedule.startTime || "");
      setEndTime(schedule.endTime || "");
      setScheduleType(!schedule.startTime && !schedule.endTime ? "FLEX" : "STANDARD");
    } else {
      setShiftName("");
      setStartTime("");
      setEndTime("");
      setScheduleType("STANDARD");
    }

    setOpen(true);
  };

  const handleOpenBreak = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setBreakModalOpen(true);
  };

  const handleCloseBreak = () => {
    setBreakModalOpen(false);
    setCurrentBreak(null);
    setBStart("");
    setBEnd("");
    setIsFlexible(false);
    setIsPaid(false);
  };

  const handleSaveBreak = async () => {
    if (!selectedSchedule) return;

    const payload = {
      shiftId: selectedSchedule.id,
      startTime: bStart,
      endTime: bEnd,
      isFlexible,
      isPaid
    };

    if (currentBreak) {
      await updateBreaktime({ id: currentBreak.id, ...payload });
    } else {
      await createBreaktime(payload);
    }

    handleCloseBreak();
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentSchedule(null);
    setIsEdit(false);
    setShiftName("");
    setStartTime("");
    setEndTime("");
    setScheduleType("STANDARD");
  };

  const handleSave = async () => {
    if (!shiftName) return;
    const payload = {
      shiftName,
      startTime: scheduleType === "STANDARD" ? startTime : "",
      endTime: scheduleType === "STANDARD" ? endTime : "",
      flexStart: "",
      flexEnd: ""
    };
    if (isEdit && currentSchedule) await updateSchedule(currentSchedule.id, payload);
    else await createSchedule(payload);
    handleClose();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this schedule?")) await deleteSchedule(id);
  };

  return (
    <>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => handleOpen(null, false)}>
        Create Schedule
      </Button>

      {/* Desktop Table */}
      {!isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Shift Name</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No schedule found</TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.id}</TableCell>
                    <TableCell>{schedule.shiftName}</TableCell>
                    <TableCell>{schedule.startTime || "FLEX"}</TableCell>
                    <TableCell>{schedule.endTime || "-"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => handleOpen(schedule, false)}>View</Button>
                        <Button size="small" variant="contained" onClick={() => handleOpen(schedule, true)}>Edit</Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(schedule.id)}>Delete</Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          onClick={() => handleOpenBreak(schedule)}
                        >
                          Breaks
                        </Button>
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
          {schedules?.length === 0 ? (
            <Grid size={[12]}>
              <Typography align="center">No schedule found</Typography>
            </Grid>
          ) : (
            schedules.map((schedule) => (
              <Grid size={[12]} key={schedule.id}>
                <Paper sx={{ p: 2 }} elevation={3}>
                  <Typography>ID: {schedule.id}</Typography>
                  <Typography>Shift: {schedule.shiftName}</Typography>
                  <Typography>Time: {schedule.startTime || "FLEX"} - {schedule.endTime || "-"}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => handleOpen(schedule, false)}>View</Button>
                    <Button size="small" variant="contained" onClick={() => handleOpen(schedule, true)}>Edit</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(schedule.id)}>Delete</Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      onClick={() => handleOpenBreak(schedule)}
                    >
                      Breaks
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Modal */}
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
  sx={{ mb: 2 }}
  disabled={!isEdit && !!currentSchedule}
/>

{(isEdit || !currentSchedule) && (
  <>
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Schedule Type</InputLabel>
      <Select
        value={scheduleType}
        label="Schedule Type"
        onChange={(e) =>
          setScheduleType(e.target.value as "STANDARD" | "FLEX")
        }
      >
        <MenuItem value="STANDARD">Standard Schedule</MenuItem>
        <MenuItem value="FLEX">Flex Schedule</MenuItem>
      </Select>
    </FormControl>

    {scheduleType === "STANDARD" && (
      <>
        <TextField
          label="Start Time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="End Time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ mb: 2 }}
        />
      </>
    )}
  </>
)}

          {(isEdit || !currentSchedule) && (
            <Button variant="contained" onClick={handleSave} fullWidth>{isEdit ? "Save Changes" : "Create"}</Button>
          )}

          <Button variant="outlined" onClick={handleClose} fullWidth sx={{ mt: 1 }}>Close</Button>
        </Box>
      </Modal>

      <Modal open={breakModalOpen} onClose={handleCloseBreak}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Manage Breaks - {selectedSchedule?.shiftName}
          </Typography>

          {/* Existing Break List */}
          {breaktimes
            .filter(b => b.shiftId === selectedSchedule?.id)
            .map((b) => (
              <Paper key={b.id} sx={{ p: 1, mb: 1 }}>
                <Typography>
                  {b.startTime} - {b.endTime} | {b.isPaid ? "Paid" : "Unpaid"}
                </Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Button size="small" onClick={() => {
                    setCurrentBreak(b);
                    setBStart(b.startTime);
                    setBEnd(b.endTime);
                    setIsFlexible(b.isFlexible);
                    setIsPaid(b.isPaid);
                  }}>
                    Edit
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    onClick={() => deleteBreaktime(b.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </Paper>
            ))}

          {/* Form */}
          <TextField
            label="Start Time"
            type="time"
            value={bStart}
            onChange={(e) => setBStart(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="End Time"
            type="time"
            value={bEnd}
            onChange={(e) => setBEnd(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Paid</InputLabel>
            <Select
              value={isPaid ? "yes" : "no"}
              label="Paid"
              onChange={(e) => setIsPaid(e.target.value === "yes")}
            >
              <MenuItem value="yes">Paid</MenuItem>
              <MenuItem value="no">Unpaid</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleSaveBreak}
          >
            {currentBreak ? "Update Break" : "Add Break"}
          </Button>

          <Button variant="outlined" fullWidth sx={{ mt: 1 }} onClick={handleCloseBreak}>
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
}