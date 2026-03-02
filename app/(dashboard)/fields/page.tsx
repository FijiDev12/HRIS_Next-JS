"use client";

import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import FacilitiesPage from "@/app/(dashboard)/components/fields/facilities";
import RolesPage from "@/app/(dashboard)/components/fields/roles";
import DepartmentsPage from "@/app/(dashboard)/components/fields/departments";
import PositionsPage from "@/app/(dashboard)/components/fields/positions";
import EmployeeTypePage from "@/app/(dashboard)/components/fields/employeeTypes";
import LeaveTypePage from "@/app/(dashboard)/components/fields/leaveType";
import LeaveBalancePage from "@/app/(dashboard)/components/fields/leaveBalance";
/* ===============================
   TAB COMPONENTS
=============================== */

function TabOne() {
  return <Typography variant="h6">Component One Content</Typography>;
}

function TabTwo() {
  return <Typography variant="h6">Component Two Content</Typography>;
}

function TabThree() {
  return <Typography variant="h6">Component Three Content</Typography>;
}

/* ===============================
   MAIN COMPONENT
=============================== */

export default function ResponsiveTabs() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [value, setValue] = useState(0);

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };

  const handleSelectChange = (event: any) => {
    setValue(Number(event.target.value));
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* Desktop Tabs */}
      {!isMobile && (
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Facilities" />
          <Tab label="Roles" />
          <Tab label="Departments" />
          <Tab label="Positions" />
          <Tab label="Employee Type" />
          <Tab label="Leave Type" />
          <Tab label="Leave Balance" />
        </Tabs>
      )}

      {/* Mobile Dropdown */}
      {isMobile && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select value={value} onChange={handleSelectChange}>
            <MenuItem value={0}>Facilities</MenuItem>
            <MenuItem value={1}>Roles</MenuItem>
            <MenuItem value={2}>Departments</MenuItem>
            <MenuItem value={3}>Positions</MenuItem>
            <MenuItem value={4}>Employee Type</MenuItem>
            <MenuItem value={5}>Leave Type</MenuItem>
            <MenuItem value={6}>Leave Balance</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Render Active Component */}
      <Box sx={{ mt: 3 }}>
        {value === 0 && <FacilitiesPage />}
        {value === 1 && <RolesPage />}
        {value === 2 && <DepartmentsPage />}
        {value === 3 && <PositionsPage />}
        {value === 4 && <EmployeeTypePage />}
        {value === 5 && <LeaveTypePage />}
        {value === 6 && <LeaveBalancePage />}
      </Box>
    </Box>
  );
}