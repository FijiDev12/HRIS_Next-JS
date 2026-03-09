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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  useTheme,
  useMediaQuery,
  TablePagination,
} from "@mui/material";

import { usePositionStore, Position } from "@/app/store/usePosition";
import { useDepartmentStore } from "@/app/store/useDepartments";

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function PositionsPage() {
  const {
    positions,
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition,
    loading,
    error,
  } = usePositionStore();

  const { departments, fetchDepartments } = useDepartmentStore();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 3;
  const [positionData, setPositionData] = useState({
    departmentId: 0,
    positionName: "",
    createdBy: 1,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchPositions();
    fetchDepartments();
  }, [fetchPositions, fetchDepartments]);

  const departmentNames: Record<number, string> = {};
  departments.forEach((d) => (departmentNames[d.id] = d.departmentName));

  const handleAdd = async () => {
    if (!positionData.positionName) return alert("Position name required");
    if (!positionData.departmentId) return alert("Please select a department");
    await createPosition(positionData);
    setPositionData({ departmentId: 0, positionName: "", createdBy: 1 });
    setAddOpen(false);
  };

  const handleUpdate = async () => {
    if (!currentPosition) return;
    if (!positionData.departmentId) return alert("Please select a department");
    await updatePosition(currentPosition.id, positionData);
    setEditOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure?")) {
      await deletePosition(id);
    }
  };

  const sortedPositions = [...positions].sort((a, b) => a.id - b.id);
  const displayedPositions = sortedPositions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Positions Management</Typography>
        <Button variant="contained" onClick={() => setAddOpen(true)}>Add Position</Button>
      </Stack>

      {/* Summary Card */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={[12, 12, 12]}>
          <Card>
            <CardContent>
              <Typography>Total Positions</Typography>
              <Typography variant="h4">{positions.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Desktop Table */}
      {!isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedPositions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No position found</TableCell>
                </TableRow>
              ) : (
                displayedPositions.map((pos) => (
                  <TableRow key={pos.id}>
                    <TableCell>{pos.id}</TableCell>
                    <TableCell>{departmentNames[pos.departmentId] || pos.departmentId}</TableCell>
                    <TableCell>{pos.positionName}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => { setCurrentPosition(pos); setViewOpen(true); }}>View</Button>
                        <Button size="small" onClick={() => { setCurrentPosition(pos); setPositionData({ departmentId: pos.departmentId, positionName: pos.positionName, createdBy: 1 }); setEditOpen(true); }}>Edit</Button>
                        <Button size="small" color="error" onClick={() => handleDelete(pos.id)}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={positions.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </TableContainer>
      )}

      {/* Mobile Cards */}
      {isMobile && (
        <Grid container spacing={2}>
          {displayedPositions.length === 0 ? (
            <Grid size={[12, 12, 12]}>
              <Typography align="center">No positions found</Typography>
            </Grid>
          ) : (
            displayedPositions.map((pos) => (
              <Grid size={[12]} key={pos.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">{pos.positionName}</Typography>
                    <Typography variant="body2">Department: {departmentNames[pos.departmentId] || pos.departmentId}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button size="small" onClick={() => { setCurrentPosition(pos); setViewOpen(true); }}>View</Button>
                      <Button size="small" onClick={() => { setCurrentPosition(pos); setPositionData({ departmentId: pos.departmentId, positionName: pos.positionName, createdBy: 1 }); setEditOpen(true); }}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(pos.id)}>Delete</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Add/Edit/View Modals */}
      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6">Add Position</Typography>
          <Stack spacing={2} mt={2}>
            <TextField label="Position Name" value={positionData.positionName} onChange={(e) => setPositionData({ ...positionData, positionName: e.target.value })} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="department-select-label">Department</InputLabel>
              <Select
                labelId="department-select-label"
                value={positionData.departmentId || ""}
                onChange={(e) => setPositionData({ ...positionData, departmentId: Number(e.target.value) })}
                label="Department"
              >
                {departments.length === 0 ? <MenuItem value=""><CircularProgress size={20} /></MenuItem> :
                  departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.departmentName}</MenuItem>)
                }
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleAdd}>Submit</Button>
          </Stack>
        </Box>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6">Edit Position</Typography>
          <Stack spacing={2} mt={2}>
            <TextField label="Position Name" value={positionData.positionName} onChange={(e) => setPositionData({ ...positionData, positionName: e.target.value })} fullWidth />
            <FormControl fullWidth>
              <InputLabel id="department-select-label-edit">Department</InputLabel>
              <Select
                labelId="department-select-label-edit"
                value={positionData.departmentId || ""}
                onChange={(e) => setPositionData({ ...positionData, departmentId: Number(e.target.value) })}
                label="Department"
              >
                {departments.length === 0 ? <MenuItem value=""><CircularProgress size={20} /></MenuItem> :
                  departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.departmentName}</MenuItem>)
                }
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleUpdate}>Update</Button>
          </Stack>
        </Box>
      </Modal>

      {/* View Modal */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)}>
        <Box sx={modalStyle}>
          {currentPosition && (
            <Stack spacing={2}>
              <Typography variant="h6">View Position</Typography>
              <TextField label="ID" value={currentPosition.id} disabled fullWidth />
              <TextField label="Department" value={departmentNames[currentPosition.departmentId] || currentPosition.departmentId} disabled fullWidth />
              <TextField label="Position Name" value={currentPosition.positionName} disabled fullWidth />
            </Stack>
          )}
        </Box>
      </Modal>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}