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
import HolidayCalendarPage from "@/app/(dashboard)/components/calendars/HolidayCalendar";
import PersonalCalendarPage from "@/app/(dashboard)/components/calendars/PersonalCalendar";
import HolidaySettingsPage from "@/app/(dashboard)/components/calendars/HolidaySettings";

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
          <Tab label="Holiday Calendar" />
          <Tab label="Personal Calendar" />
          <Tab label="Holiday Settings" />
        </Tabs>
      )}

      {/* Mobile Dropdown */}
      {isMobile && (
        <FormControl fullWidth sx={{  }}>
          <Select value={value} onChange={handleSelectChange}>
            <MenuItem value={0}>Holiday Calendar</MenuItem>
            <MenuItem value={1}>Personal Calendar</MenuItem>
            <MenuItem value={2}>Holiday Settings</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Render Active Component */}
      <Box sx={{  }}>
        {value === 0 && <HolidayCalendarPage />}
        {value === 1 && <PersonalCalendarPage />}
        {value === 2 && <HolidaySettingsPage />}
      </Box>
    </Box>
  );
}