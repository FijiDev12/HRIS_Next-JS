"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  TextField,
  Stack,
  Grid,
  MenuItem,
  TablePagination,
} from "@mui/material";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  useGovContributionStore,
  GovContribution,
} from "@/app/store/useGovContribution";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function GovContributionPage() {
  const {
    contributions,
    getContributions,
    createContribution,
    updateContribution,
    deleteContribution,
    loading,
    error,
  } = useGovContributionStore();

  // -------------------------
  // SESSION DATA
  // -------------------------
  const [sessionData, setSessionData] = useState<{ roleId?: number }>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) setSessionData(JSON.parse(stored));
    }
  }, []);

  // -------------------------
  // FETCH DATA
  // -------------------------
  useEffect(() => {
    getContributions();
  }, []);

  // -------------------------
  // STATES
  // -------------------------
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const [currentContribution, setCurrentContribution] =
    useState<GovContribution | null>(null);

  const [formData, setFormData] = useState<Omit<GovContribution, "id">>({
    type: "SSS",
    minSalary: 0,
    maxSalary: 0,
    employeeShare: 0,
    employerShare: 0,
  });

  // -------------------------
  // SUMMARY COUNTS
  // -------------------------
  const totalCount = contributions.length;

  const sssCount = contributions.filter(c => c.type === "SSS").length;
  const philhealthCount = contributions.filter(c => c.type === "PhilHealth").length;
  const pagibigCount = contributions.filter(c => c.type === "Pagibig").length;

  // -------------------------
  // HANDLERS
  // -------------------------
  const handleViewOpen = (contribution: GovContribution) => {
    setCurrentContribution(contribution);
    setViewOpen(true);
  };

  const handleAddOpen = () => {
    setEditMode(false);
    setFormData({
      type: "SSS",
      minSalary: 0,
      maxSalary: 0,
      employeeShare: 0,
      employerShare: 0,
    });
    setAddOpen(true);
  };

  const handleEditOpen = (contribution: GovContribution) => {
    setEditMode(true);
    setCurrentContribution(contribution);
    setFormData({
      type: contribution.type,
      minSalary: contribution.minSalary,
      maxSalary: contribution.maxSalary,
      employeeShare: contribution.employeeShare,
      employerShare: contribution.employerShare,
    });
    setAddOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteContribution(id);
      toast.success("Contribution deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSubmit = async () => {
    try {
      if (editMode && currentContribution) {
        await updateContribution(currentContribution.id, formData);
        toast.success("Contribution updated");
      } else {
        await createContribution(formData);
        toast.success("Contribution created");
      }
      setAddOpen(false);
    } catch {
      toast.error("Failed to save contribution");
    }
  };

  const sortedData = [...contributions].sort((a, b) => a.id - b.id);

  return (
    <Box sx={{ p: 2 }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Government Contributions</Typography>

        {sessionData.roleId === 1 && (
          <Button variant="contained" onClick={handleAddOpen}>
            Add Contribution
          </Button>
        )}
      </Stack>

      {/* SUMMARY CARDS */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={[4,4,4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h4">{totalCount}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={[4,4,4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">SSS</Typography>
              <Typography variant="h4">{sssCount}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={[4,4,4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">PhilHealth</Typography>
              <Typography variant="h4">{philhealthCount + pagibigCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Min Salary</TableCell>
              <TableCell>Max Salary</TableCell>
              <TableCell>Employee Share</TableCell>
              <TableCell>Employer Share</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No contributions found
                </TableCell>
              </TableRow>
            ) : (
              sortedData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell>{contribution.id}</TableCell>
                    <TableCell>{contribution.type}</TableCell>
                    <TableCell>{contribution.minSalary}</TableCell>
                    <TableCell>{contribution.maxSalary}</TableCell>
                    <TableCell>{contribution.employeeShare}</TableCell>
                    <TableCell>{contribution.employerShare}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewOpen(contribution)}
                        >
                          View
                        </Button>

                        {sessionData.roleId === 1 && (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleEditOpen(contribution)}
                            >
                              Edit
                            </Button>

                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => handleDelete(contribution.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={sortedData.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      </TableContainer>

      {/* VIEW MODAL */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6">View Contribution</Typography>
          {currentContribution && (
            <Stack spacing={2} mt={2}>
              <TextField label="Type" value={currentContribution.type} disabled fullWidth />
              <TextField label="Min Salary" value={currentContribution.minSalary} disabled fullWidth />
              <TextField label="Max Salary" value={currentContribution.maxSalary} disabled fullWidth />
              <TextField label="Employee Share" value={currentContribution.employeeShare} disabled fullWidth />
              <TextField label="Employer Share" value={currentContribution.employerShare} disabled fullWidth />
            </Stack>
          )}
        </Box>
      </Modal>

      {/* ADD / EDIT MODAL */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6">
            {editMode ? "Edit Contribution" : "Add Contribution"}
          </Typography>

          <Stack spacing={2} mt={2}>
            <TextField
              label="Type"
              select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="SSS">SSS</MenuItem>
              <MenuItem value="PhilHealth">PhilHealth</MenuItem>
              <MenuItem value="Pagibig">Pagibig</MenuItem>
            </TextField>

            <TextField
              label="Min Salary"
              type="number"
              value={formData.minSalary}
              onChange={(e) =>
                setFormData({ ...formData, minSalary: Number(e.target.value) })
              }
              fullWidth
            />

            <TextField
              label="Max Salary"
              type="number"
              value={formData.maxSalary}
              onChange={(e) =>
                setFormData({ ...formData, maxSalary: Number(e.target.value) })
              }
              fullWidth
            />

            <TextField
              label="Employee Share"
              type="number"
              value={formData.employeeShare}
              onChange={(e) =>
                setFormData({ ...formData, employeeShare: Number(e.target.value) })
              }
              fullWidth
            />

            <TextField
              label="Employer Share"
              type="number"
              value={formData.employerShare}
              onChange={(e) =>
                setFormData({ ...formData, employerShare: Number(e.target.value) })
              }
              fullWidth
            />

            <Button variant="contained" onClick={handleSubmit}>
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}