"use client";

import { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import EmployeeHead from "@/app/(dashboard)/components/employees/EmployeeHead";
import EmployeeTab from "@/app/(dashboard)/components/employees/EmployeeList";
import ShiftTab from "@/app/(dashboard)/components/employees/EmployeeShift";
import ScheduleTab from "@/app/(dashboard)/components/employees/EmployeeSchedule";
import TimeLogTab from "@/app/(dashboard)/components/employees/EmployeeTimelogs";
import DTRTab from "@/app/(dashboard)/components/employees/EmployeeDTR";

export default function ManageEmployeesPage() {
  const [tabIndex, setTabIndex] = useState(3);

  // Detect if mobile screen (≤600px)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ p: 2 }}>
      {/* Page Title */}
      <Typography
        variant="h4"
        sx={{ color: "gray", fontWeight: 700 }}
        gutterBottom
      >
        Manage Employees
      </Typography>

      {/* Employee Head */}
      <EmployeeHead />

      {/* Tabs or Dropdown */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        {isMobile ? (
          <FormControl fullWidth size="small">
            <InputLabel id="tab-select-label">Section</InputLabel>
            <Select
              labelId="tab-select-label"
              value={tabIndex}
              label="Section"
              onChange={(e) => setTabIndex(Number(e.target.value))}
            >
              <MenuItem value={0} sx={{ fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" } }}>List</MenuItem>
              <MenuItem value={1} sx={{ fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" } }}>Schedule</MenuItem>
              <MenuItem value={2} sx={{ fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" } }}>Shifts</MenuItem>
              <MenuItem value={3} sx={{ fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" } }}>DTR</MenuItem>
            </Select>
          </FormControl>
        ) : (
          <Tabs
            value={tabIndex}
            onChange={(e, v) => setTabIndex(v)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="List" />
            <Tab label="Schedule" />
            <Tab label="Shifts" />
            <Tab label="DTR" />
          </Tabs>
        )}
      </Box>

      {/* Tab Content */}
      {tabIndex === 0 && <EmployeeTab />}
      {tabIndex === 1 && <ScheduleTab />}
      {tabIndex === 2 && <ShiftTab employeeId={1} />}
      {tabIndex === 3 && <DTRTab />}
    </Box>
  );
}