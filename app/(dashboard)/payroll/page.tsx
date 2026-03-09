"use client";

import React, { useEffect, useState } from "react";
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

export default function ResponsiveTabs() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [sessionData, setSessionData] = useState<{ roleId?: number; id?: number }>({});
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) setSessionData(JSON.parse(stored));
    }
  }, []);

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };

  const handleSelectChange = (event: any) => {
    setValue(Number(event.target.value));
  };

  // -------------------- Filtered Tabs --------------------
  const tabs = [
    { label: "Payroll Management", component: <ManagementPage />, roleRequired: 1 },
    { label: "Payroll Records", component: <RecordPage />, roleRequired: null },
    { label: "Gov Contribution", component: <GovContributionPage />, roleRequired: 1 },
  ].filter(tab => !tab.roleRequired || tab.roleRequired === sessionData.roleId);

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* Desktop Tabs */}
      {!isMobile && (
        <Tabs value={value} onChange={handleChange} textColor="primary" indicatorColor="primary">
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      )}

      {/* Mobile Dropdown */}
      {isMobile && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Select value={value} onChange={handleSelectChange}>
            {tabs.map((tab, index) => (
              <MenuItem key={index} value={index}>{tab.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Render Active Component */}
      <Box sx={{ mt: 3 }}>
        {tabs[value]?.component}
      </Box>
    </Box>
  );
}