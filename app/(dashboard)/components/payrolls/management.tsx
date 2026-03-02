"use client";

import React, { useEffect, useState } from "react";
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
  Button,
  Modal,
  TextField,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import { usePayrollStore, PayrollPeriod } from "@/app/store/usePayroll";
import { format } from "date-fns";
import { useEmployeeInfoStore } from "@/app/store/useEmployeeInfo";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function PayrollManagementPage() {
  const {
    periods,
    fetchPeriods,
    createPayrollPeriod,
    approvePayroll,
    unlockPayroll,
    reversePayroll,
    deletePayrollByPeriod,
  } = usePayrollStore();
    const { employee } = useEmployeeInfoStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [newPeriod, setNewPeriod] = useState<PayrollPeriod>({
    startDate: "",
    endDate: "",
    siteId: 1,
  });

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  // Fetch periods on mount
  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleOpenModal = () => {
    setNewPeriod({ startDate: "", endDate: "", siteId: 1 });
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleCreatePeriod = async () => {
    if (!newPeriod.startDate || !newPeriod.endDate || !newPeriod.siteId)
      return;

    await createPayrollPeriod(newPeriod);
    await fetchPeriods(); // refresh table
    setModalOpen(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(periods.length / rowsPerPage);
  const displayedPeriods = periods.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        mb={2}
      >
        <Typography variant="h4">Payroll Period Management</Typography>

        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{ ml: { sm: "auto" } }}
        >
          Create Period
        </Button>
      </Stack>

      {/* Table */}
      {displayedPeriods.length === 0 ? (
        <Typography>No payroll periods found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Site ID</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedPeriods.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>
                    {p.startDate
                      ? format(new Date(p.startDate), "MMM dd, yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {p.endDate
                      ? format(new Date(p.endDate), "MMM dd, yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell>{p.siteId}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        disabled={p.status=== 'APPROVED'}
                        size="small"
                        color="success"
                        onClick={() => approvePayroll(p.id, employee?.id ? employee?.id : 1)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="warning"
                        onClick={() => unlockPayroll(p.id, employee?.id ? employee?.id : 1)}
                      >
                        Unlock
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => reversePayroll(p.id, employee?.id ? employee?.id : 1)}
                      >
                        Reverse
                      </Button>
                      <Button
                        size="small"
                        color="secondary"
                        onClick={() => deletePayrollByPeriod(p.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
          />
        </Box>
      )}

      {/* Create Period Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Stack spacing={2}>
            <TextField
              label="Start Date"
              type="date"
              value={newPeriod.startDate}
              onChange={(e) =>
                setNewPeriod((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={newPeriod.endDate}
              onChange={(e) =>
                setNewPeriod((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Site ID"
              type="number"
              value={newPeriod.siteId}
              onChange={(e) =>
                setNewPeriod((prev) => ({
                  ...prev,
                  siteId: Number(e.target.value),
                }))
              }
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button variant="contained" onClick={handleCreatePeriod}>
                Create
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}