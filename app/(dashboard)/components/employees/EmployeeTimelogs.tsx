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

export default function TimelogFilterTable() {
  const { sites, fetchSites } = useSiteStore();
  const timelogStore = useTimelogStore();

  const [selectedSite, setSelectedSite] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

    await timelogStore.getTimelogsBySite(
      selectedSite,
      dateFrom,
      dateTo
    );

    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) =>
    setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTimelogs = timelogStore.timelogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleRowClick = (log: Timelog) => {
    setSelectedLog(log);
    setOpenModal(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        DTR by Site
      </Typography>

      {/* FILTER SECTION */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={[4, 4, 4]}>
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

        <Grid size={[4, 4, 4]}>
          <TextField
            type="date"
            label="Date From"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={[4, 4, 4]}>
          <TextField
            type="date"
            label="Date To"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={[4, 4, 4]}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Grid>
      </Grid>

      {/* TABLE */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Work Date</TableCell>
              <TableCell>Time In</TableCell>
              <TableCell>Time Out</TableCell>
              <TableCell>Late (mins)</TableCell>
              <TableCell>OT (mins)</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {timelogStore.timelogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No DTR records found
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
                  <TableCell>{log.workDate}</TableCell>
                  <TableCell>
                    {log.timeIn
                      ? new Date(log.timeIn).toLocaleTimeString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {log.timeOut
                      ? new Date(log.timeOut).toLocaleTimeString()
                      : "-"}
                  </TableCell>
                  <TableCell>{log.lateMinutes}</TableCell>
                  <TableCell>{log.overtimeMinutes}</TableCell>
                  <TableCell>{log.status}</TableCell>
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

      {/* MODAL */}
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
              <Typography variant="h6">
                DTR Details
              </Typography>

              <Typography>ID: {selectedLog.id}</Typography>
              <Typography>
                Employee ID: {selectedLog.employeeId}
              </Typography>
              <Typography>
                Work Date: {selectedLog.workDate}
              </Typography>
              <Typography>
                Time In:{" "}
                {selectedLog.timeIn
                  ? new Date(selectedLog.timeIn).toLocaleString()
                  : "-"}
              </Typography>
              <Typography>
                Time Out:{" "}
                {selectedLog.timeOut
                  ? new Date(selectedLog.timeOut).toLocaleString()
                  : "-"}
              </Typography>
              <Typography>
                Late Minutes: {selectedLog.lateMinutes}
              </Typography>
              <Typography>
                Overtime Minutes: {selectedLog.overtimeMinutes}
              </Typography>
              <Typography>
                Undertime Minutes: {selectedLog.undertimeMinutes}
              </Typography>
              <Typography>
                Half Day: {selectedLog.isHalfDay ? "Yes" : "No"}
              </Typography>
              <Typography>Status: {selectedLog.status}</Typography>

              <Button
                variant="contained"
                onClick={() => setOpenModal(false)}
              >
                Close
              </Button>
            </Stack>
          )}
        </Paper>
      </Modal>
    </Box>
  );
}