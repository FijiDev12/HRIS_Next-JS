"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useEmployeeStore } from "@/app/store/useEmployee";
import { useScheduleStore } from "@/app/store/useSchedule";

interface EmployeeShiftTabProps {
  employeeId: number;
}

interface EmployeeShift {
  id: number;
  employeeId: number;
  shiftId: number;
  workDate: string;
  shift?: {
    shiftName: string;
    startTime: string;
    endTime: string;
  };
}

/* ===== Modal to show all shifts for a single employee ===== */
function EmployeeShiftsModal({
  open,
  onClose,
  shifts,
}: {
  open: boolean;
  onClose: () => void;
  shifts: EmployeeShift[];
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Employee Shifts</DialogTitle>
      <DialogContent dividers>
        {shifts.length === 0 ? (
          <Typography>No shifts found.</Typography>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {shifts.map((shift) => (
              <Paper
                key={shift.id}
                sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}
                elevation={2}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {new Date(shift.workDate).toLocaleDateString()}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Shift Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {shift.shift?.shiftName || "-"}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Start Time
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {shift.shift?.startTime || "-"}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  End Time
                </Typography>
                <Typography variant="body1">
                  {shift.shift?.endTime || "-"}
                </Typography>
              </Paper>
            ))}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

/* ===== Modal to assign a shift ===== */
function AssignShiftModal({
  open,
  onClose,
  preselectedEmployeeId,
}: {
  open: boolean;
  onClose: () => void;
  preselectedEmployeeId?: number;
}) {
  const { employees } = useEmployeeStore();
  const { schedules, fetchSchedules } = useScheduleStore();
  const { assignShift, fetchEmployeeShifts } = useEmployeeStore();

  const [employeeId, setEmployeeId] = useState<number | "">(preselectedEmployeeId || "");
  const [shiftId, setShiftId] = useState<number | "">("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    fetchSchedules();

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const formatDate = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;

    setStartDate(formatDate(today));
    setEndDate(formatDate(nextWeek));
  }, []);

  const handleAssign = async () => {
    if (!employeeId || !shiftId || !startDate || !endDate) return;

    await assignShift({ employeeId, shiftId, startDate, endDate });
    await fetchEmployeeShifts();
    onClose();
    setShiftId("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Shift</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={[12, 12, 12]}>
            <FormControl fullWidth>
              <InputLabel id="employee-label">Employee</InputLabel>
              <Select
                labelId="employee-label"
                value={employeeId}
                onChange={(e) => setEmployeeId(Number(e.target.value))}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.firstName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={[12, 12, 12]}>
            <FormControl fullWidth>
              <InputLabel id="shift-label">Shift</InputLabel>
              <Select
                labelId="shift-label"
                value={shiftId}
                onChange={(e) => setShiftId(Number(e.target.value))}
              >
                {schedules.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.shiftName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={[6, 6, 6]}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={[6, 6, 6]}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!employeeId || !shiftId || !startDate || !endDate}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ===== Employee Shift Tab Component ===== */
export default function EmployeeShiftTab({ employeeId }: EmployeeShiftTabProps) {
  const { employeeShifts, fetchEmployeeShifts } = useEmployeeStore();
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedEmployeeShifts, setSelectedEmployeeShifts] = useState<EmployeeShift[]>([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchEmployeeShifts();
  }, []);

  const handleOpenViewModal = (id: number) => {
    const shifts = employeeShifts
      .filter((s) => s.employeeId === id)
      .map((s) => ({ ...s, workDate: new Date(s.workDate).toISOString() }));
    setSelectedEmployeeShifts(shifts);
    setOpenViewModal(true);
  };

  const uniqueEmployeeIds = Array.from(new Set(employeeShifts.map((s) => s.employeeId)));

  return (
    <div>
      {/* Header */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={[6, 6, 6]}>
          <Typography variant="h6">Employee Shifts</Typography>
        </Grid>
        <Grid size={[6, 6, 6]} sx={{ textAlign: "right" }}>
          <Button variant="contained" onClick={() => setOpenAssignModal(true)}>
            Assign Shift
          </Button>
        </Grid>
      </Grid>

      {/* Desktop Table */}
      {!isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Shift Name</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {uniqueEmployeeIds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No shifts assigned
                  </TableCell>
                </TableRow>
              ) : (
                uniqueEmployeeIds.map((id) => {
                  const firstShift = employeeShifts.find((s) => s.employeeId === id);
                  return (
                    <TableRow key={id}>
                      <TableCell>{id}</TableCell>
                      <TableCell>{firstShift?.shift?.shiftName}</TableCell>
                      <TableCell>{firstShift?.shift?.startTime}</TableCell>
                      <TableCell>{firstShift?.shift?.endTime}</TableCell>
                      <TableCell>
                        <Button variant="outlined" onClick={() => handleOpenViewModal(id)}>
                          View All
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Mobile Grid (size preserved) */}
      {isMobile && (
        <Grid container spacing={2}>
          {uniqueEmployeeIds.length === 0 ? (
            <Grid size={[12, 12, 12]}>
              <Typography align="center">No shifts assigned</Typography>
            </Grid>
          ) : (
            uniqueEmployeeIds.map((id) => {
              const firstShift = employeeShifts.find((s) => s.employeeId === id);
              return (
                <Grid size={[12]} key={id}>
                  <Paper
                    sx={{ p: 2, cursor: "pointer" }}
                    onClick={() => handleOpenViewModal(id)}
                    elevation={3}
                  >
                    <Typography>Employee ID: {id}</Typography>
                    <Typography>Shift: {firstShift?.shift?.shiftName}</Typography>
                    <Typography>
                      Time: {firstShift?.shift?.startTime} - {firstShift?.shift?.endTime}
                    </Typography>
                    <Typography variant="caption">Tap for full schedule</Typography>
                  </Paper>
                </Grid>
              );
            })
          )}
        </Grid>
      )}

      {/* Modals */}
      <EmployeeShiftsModal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        shifts={selectedEmployeeShifts}
      />

      <AssignShiftModal
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        preselectedEmployeeId={employeeId}
      />
    </div>
  );
}