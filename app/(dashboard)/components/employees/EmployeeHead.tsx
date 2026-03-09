"use client";

import { useEffect } from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { useEmployeeStore } from "@/app/store/useEmployee";

export default function EmployeeSummary() {
  const { employees, fetchEmployees } = useEmployeeStore();

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={[4,4,4]}>
        <Card>
          <CardContent>
            <Typography variant="h6"
              sx={{
                fontSize: "clamp(0.8rem, 2vw, 1.5rem)", // min 1rem, scales with 2% of viewport width, max 1.5rem
                fontWeight: 600,
              }}
            >Employees</Typography>
            <Typography variant="h4">{employees.length}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={[4,4,4]}>
        <Card>
          <CardContent>
            <Typography variant="h6" 
              sx={{
                fontSize: "clamp(0.8rem, 2vw, 1.5rem)", // min 1rem, scales with 2% of viewport width, max 1.5rem
                fontWeight: 600,
              }}
            >Departments</Typography>
            <Typography variant="h4">
              {new Set(employees.map((e) => e.departmentId)).size}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={[4,4,4]}>
        <Card>
          <CardContent>
            <Typography 
            variant="h6"
              sx={{
                fontSize: "clamp(0.8rem, 2vw, 1.5rem)", // min 1rem, scales with 2% of viewport width, max 1.5rem
                fontWeight: 600,
              }}
            >Positions</Typography>
            <Typography variant="h4">
              {new Set(employees.map((e) => e.positionId)).size}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}