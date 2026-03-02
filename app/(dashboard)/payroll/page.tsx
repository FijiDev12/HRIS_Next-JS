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
import PayrollPage from "@/app/(dashboard)/components/payrolls/payroll";
import ManagementPage from "@/app/(dashboard)/components/payrolls/management";
import RecordPage from "@/app/(dashboard)/components/payrolls/records";
import GovContributionPage from "@/app/(dashboard)/components/payrolls/goveContribution";
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
          <Tab label="Payroll Management" />
          <Tab label="Payroll Records" />
          <Tab label="Gov Contribution" />
        </Tabs>
      )}

      {/* Mobile Dropdown */}
      {isMobile && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select value={value} onChange={handleSelectChange}>
            <MenuItem value={0}>Payroll Management</MenuItem>
            <MenuItem value={1}>Payroll Records</MenuItem>
            <MenuItem value={2}>Gov Contribution</MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Render Active Component */}
      <Box sx={{ mt: 3 }}>
        {value === 0 && <ManagementPage />}
        {value === 1 && <RecordPage />}
        {value === 2 && <GovContributionPage />}
      </Box>
    </Box>
  );
}