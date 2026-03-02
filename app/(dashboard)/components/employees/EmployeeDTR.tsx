"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Modal,
  Stack,
} from "@mui/material";
import { useSiteStore } from "@/app/store/useSites";
import { useTimelogStore, Timelog } from "@/app/store/useTimelogs";
import { toast } from "react-toastify";
import Image from "next/image";

export default function TimelogFilterTable() {
  const { sites, fetchSites } = useSiteStore();
  const timelogStore = useTimelogStore();

  const [selectedSite, setSelectedSite] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Timelog | null>(null);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const handleSubmit = async () => {
    if (!selectedSite || !dateFrom || !dateTo) {
      toast.warning("Please select site and both dates");
      return;
    }

    await timelogStore.getTimelogsBySite(selectedSite, dateFrom, dateTo);
    setPage(0); // reset pagination
  };

  // Pagination handlers
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Slice timelogs for pagination
  const paginatedTimelogs = timelogStore.timelogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle row click
  const handleRowClick = (log: Timelog) => {
    setSelectedLog(log);
    setOpenModal(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Daily Time Record by Site
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={[4,4,4]}>
          <FormControl fullWidth>
            <Select
              value={selectedSite}
              onChange={(e) => setSelectedSite(Number(e.target.value))}
              displayEmpty
            >
              <MenuItem value="">Select Site</MenuItem>
              {sites.map((site) => (
                <MenuItem key={site.id} value={site.id}>
                  {site.siteName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={[4,4,4]}>
          <TextField
            type="date"
            label="Date From"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={[4,4,4]}>
          <TextField
            type="date"
            label="Date To"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={[4,4,4]}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
<Paper>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>ID</TableCell>
        <TableCell>Employee No</TableCell>
        <TableCell>Log Date</TableCell>
        <TableCell>Type</TableCell>
        <TableCell>Selfie</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {timelogStore.timelogs.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} align="center">
            No attendance corrections found
          </TableCell>
        </TableRow>
      ) : (
        paginatedTimelogs.map((log, index) => (
          <TableRow
            key={log.id ?? index}
            hover
            sx={{ cursor: "pointer" }}
            onClick={() => handleRowClick(log)}
          >
            <TableCell>{log.id}</TableCell>
            <TableCell>{log.employeeId}</TableCell>
            <TableCell>{log.logDate}</TableCell>
            <TableCell>{log.type}</TableCell>
            <TableCell>
              {log.selfie && (
                <img
                  src=
                  {`data:image/jpeg;base64,${Buffer.from(log.selfie)}`}
                  height={20}
                />
              )}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>

  <TablePagination
    component="div"
    count={timelogStore.timelogs.length}
    page={page}
    onPageChange={handleChangePage}
    rowsPerPage={rowsPerPage}
    onRowsPerPageChange={handleChangeRowsPerPage}
    rowsPerPageOptions={[5, 10, 25, 50]}
  />
</Paper>

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 500, width: "90%" }}>
          {selectedLog && (
            <Stack spacing={2}>
              <Typography variant="h6">Timelog Details</Typography>
              {selectedLog.selfie && (
                <Image
                  src={`data:image/jpeg;base64,${Buffer.from(selectedLog.selfie)}`}
                  alt="user"
                  width={200}
                  height={200}
                  style={{ borderRadius: "10px", objectFit: "cover" }}
                />
              )}
              <Typography>ID: {selectedLog.id}</Typography>
              <Typography>Employee No: {selectedLog.employeeId}</Typography>
              <Typography>Log Date: {selectedLog.logDate}</Typography>
              <Typography>Type: {selectedLog.type}</Typography>
              <Typography>Status: {selectedLog.status}</Typography>
              <Button variant="contained" onClick={() => setOpenModal(false)}>
                Close
              </Button>
            </Stack>
          )}
        </Paper>
      </Modal>
    </Box>
  );
}