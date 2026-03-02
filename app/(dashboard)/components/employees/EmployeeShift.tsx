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
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Shift Name</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{new Date(shift.workDate).toLocaleDateString()}</TableCell>
                  <TableCell>{shift.shift?.shiftName}</TableCell>
                  <TableCell>{shift.shift?.startTime}</TableCell>
                  <TableCell>{shift.shift?.endTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
  preselectedEmployeeId?: number; // optional pre-fill
}) {
  const { employees } = useEmployeeStore(); // array of {id, fullName}
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

    await assignShift({
      employeeId,
      shiftId,
      startDate,
      endDate,
    });

    await fetchEmployeeShifts(); // refresh table
    onClose();
    setShiftId("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Shift</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {/* Employee dropdown */}
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
                    {emp.firstName} {/* Show full name */}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Shift dropdown */}
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

          {/* Start date */}
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

          {/* End date */}
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
      {/* Header with Assign Shift button */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={[6, 6, 6]}>
          <Typography variant="h6">Employee Shifts</Typography>
        </Grid>
        <Grid size={[6, 6, 6]} style={{ textAlign: "right" }}>
          <Button variant="contained" onClick={() => setOpenAssignModal(true)}>
            Assign Shift
          </Button>
        </Grid>
      </Grid>

      {/* Employee Shifts Table */}
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

      {/* Modals */}
      <EmployeeShiftsModal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        shifts={selectedEmployeeShifts}
      />

      <AssignShiftModal
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        preselectedEmployeeId={employeeId} // pre-fill employee
      />
    </div>
  );
}