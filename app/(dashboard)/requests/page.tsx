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
import AttendanceCorrectionPage from "@/app/(dashboard)/components/requests/attendanceCorrection";
import LeaveRequestPage from "@/app/(dashboard)/components/requests/leaves";
import OvertimeRequestPage from "@/app/(dashboard)/components/requests/overtime";
import OfficialBusinessPage from "@/app/(dashboard)/components/requests/officialBusiness";

/* ===============================
   MAIN COMPONENT
=============================== */

export default function ResponsiveTabs() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [value, setValue] = useState(1);

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
          <Tab label="Attendance Correction" />
          <Tab label="Leave Request" />
          <Tab label="Overtime Request" />
          <Tab label="Official Business" />
        </Tabs>
      )}

      {/* Mobile Dropdown */}
      {isMobile && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select value={value} onChange={handleSelectChange}>
            <MenuItem value={0}>Attendance Correction</MenuItem>
            <MenuItem value={1}>Leave Request</MenuItem>
            <MenuItem value={2}>Overtime Request</MenuItem>
            <MenuItem value={3}>Official Business</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Render Active Component */}
      <Box sx={{ mt: 3 }}>
        {value === 0 && <AttendanceCorrectionPage />}
        {value === 1 && <LeaveRequestPage />}
        {value === 2 && <OvertimeRequestPage />}
        {value === 3 && <OfficialBusinessPage />}
      </Box>
    </Box>
  );
}