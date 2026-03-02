"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Modal,
  Button,
} from "@mui/material";
import { usePayrollStore } from "@/app/store/usePayroll";
import { useEmployeeStore } from "@/app/store/useEmployee";
import { format } from "date-fns";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxHeight: "80vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function PayrollRecordsPage() {
  const { payrolls, getPayrollByPeriod } = usePayrollStore();
  const { employees, fetchEmployees } = useEmployeeStore();

  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
    // optionally, fetch default payrolls for a period
    // getPayrollByPeriod(1);
  }, []);

  const handleRowClick = (payroll: any) => {
    setSelectedPayroll(payroll);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPayroll(null);
  };

  const getEmployeeName = (id: number) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `ID: ${id}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" mb={2}>
        Payroll Records
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Basic Salary</TableCell>
              <TableCell>Net Pay</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payrolls.map((p: any) => (
              <TableRow key={p.id} hover sx={{ cursor: "pointer" }} onClick={() => handleRowClick(p)}>
                <TableCell>{getEmployeeName(p.employeeId)}</TableCell>
                <TableCell>{p.basicSalary}</TableCell>
                <TableCell>{p.netPay}</TableCell>
                <TableCell>{p.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal showing payroll details */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {selectedPayroll && (
            <Stack spacing={2}>
              <Typography variant="h6" color="black">
                Payroll Details - {getEmployeeName(selectedPayroll.employeeId)}
              </Typography>
              <Typography color="black">Period ID: {selectedPayroll.payrollPeriodId}</Typography>
              <Typography color="black">Basic Salary: {selectedPayroll.basicSalary}</Typography>
              <Typography color="black">Total Allowance: {selectedPayroll.totalAllowance}</Typography>
              <Typography color="black">Total Deduction: {selectedPayroll.totalDeduction}</Typography>
              <Typography color="black">Net Pay: {selectedPayroll.netPay}</Typography>
              <Typography color="black">Status: {selectedPayroll.status}</Typography>

              <Typography variant="subtitle1" color="black">Payroll Items:</Typography>
              {selectedPayroll.items?.length ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPayroll.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography>No payroll items found</Typography>
              )}

              <Typography variant="subtitle1">DTR Records:</Typography>
              {selectedPayroll.dtrs?.length ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Time In</TableCell>
                      <TableCell>Time Out</TableCell>
                      <TableCell>Late</TableCell>
                      <TableCell>Undertime</TableCell>
                      <TableCell>Overtime</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPayroll.dtrs.map((dtr: any) => (
                      <TableRow key={dtr.id}>
                        <TableCell>{format(new Date(dtr.workDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{dtr.timeIn ? format(new Date(dtr.timeIn), "hh:mm a") : "-"}</TableCell>
                        <TableCell>{dtr.timeOut ? format(new Date(dtr.timeOut), "hh:mm a") : "-"}</TableCell>
                        <TableCell>{dtr.lateMinutes}</TableCell>
                        <TableCell>{dtr.undertimeMinutes}</TableCell>
                        <TableCell>{dtr.overtimeMinutes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography color="black">No DTR records found</Typography>
              )}

              <Stack direction="row" justifyContent="flex-end">
                <Button onClick={handleCloseModal}>Close</Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Modal>
    </Box>
  );
}