"use client";

import { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import EmployeeHead from "@/app/(dashboard)/components/employees/EmployeeHead";
import EmployeeTab from "@/app/(dashboard)/components/employees/EmployeeList";
import ShiftTab from "@/app/(dashboard)/components/employees/EmployeeShift";
import ScheduleTab from "@/app/(dashboard)/components/employees/EmployeeSchedule";
import TimeLogTab from "@/app/(dashboard)/components/employees/EmployeeTimelogs";
import DTRTab from "@/app/(dashboard)/components/employees/EmployeeDTR";

export default function ManageEmployeesPage() {
  const [tabIndex, setTabIndex] = useState(3);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Manage Employees
      </Typography>

      <EmployeeHead />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, v) => setTabIndex(v)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="List" />
          <Tab label="Schedule" />
          <Tab label="Shifts" />
          {/* <Tab label="Time Logs" /> */}
          <Tab label="DTR" />
        </Tabs>
      </Box>

      {tabIndex === 0 && <EmployeeTab />}
      {tabIndex === 1 && <ScheduleTab />}
      {tabIndex === 2 && <ShiftTab employeeId={1} />}
      {/* {tabIndex === 3 && <TimeLogTab />} */}
      {tabIndex === 3 && <DTRTab />}
    </Box>
  );
}