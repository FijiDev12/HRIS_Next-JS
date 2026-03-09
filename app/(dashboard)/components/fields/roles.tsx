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
  useTheme,
  useMediaQuery,
} from "@mui/material";

import { useRoleStore, Role } from "@/app/store/useRoles";

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

export default function RolesPage() {
  const { roles, fetchRoles, createRole, updateRole, deleteRole, loading, error } = useRoleStore();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  /* =========================
     Handlers
  ========================= */
  const handleAdd = async () => {
    if (!roleName) return alert("Role name required");
    await createRole({ roleName });
    setRoleName("");
    setAddOpen(false);
  };

  const handleUpdate = async () => {
    if (!currentRole) return;
    await updateRole(currentRole.id, { roleName });
    setEditOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure?")) {
      await deleteRole(id);
    }
  };

  /* =========================
     Pagination & Sorting
  ========================= */
  const sortedRoles = [...roles].sort((a, b) => a.id - b.id);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Roles Management</Typography>
        <Button variant="contained" onClick={() => setAddOpen(true)}>
          Add Role
        </Button>
      </Stack>

      {/* Summary Card */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={[12, 12, 12]}>
          <Card>
            <CardContent>
              <Typography>Total Roles</Typography>
              <Typography variant="h4">{roles.length}</Typography>
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
                <TableCell>Role Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No roles found
                  </TableCell>
                </TableRow>
              ) : (
                sortedRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.id}</TableCell>
                    <TableCell>{role.roleName}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => { setCurrentRole(role); setViewOpen(true); }}>
                          View
                        </Button>
                        <Button size="small" onClick={() => { setCurrentRole(role); setRoleName(role.roleName); setEditOpen(true); }}>
                          Edit
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDelete(role.id)}>
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Mobile Cards */}
      {isMobile && (
        <Grid container spacing={2}>
          {sortedRoles.length === 0 ? (
            <Grid size={[12, 12, 12]}>
              <Typography align="center">No roles found</Typography>
            </Grid>
          ) : (
            sortedRoles.map((role) => (
              <Grid size={[12, 12, 12]} key={role.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">{role.roleName}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button size="small" onClick={() => { setCurrentRole(role); setViewOpen(true); }}>View</Button>
                      <Button size="small" onClick={() => { setCurrentRole(role); setRoleName(role.roleName); setEditOpen(true); }}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(role.id)}>Delete</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6">Add Role</Typography>
          <Stack spacing={2} mt={2}>
            <TextField label="Role Name" value={roleName} onChange={(e) => setRoleName(e.target.value)} fullWidth />
            <Button variant="contained" onClick={handleAdd}>Submit</Button>
          </Stack>
        </Box>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6">Edit Role</Typography>
          <Stack spacing={2} mt={2}>
            <TextField label="Role Name" value={roleName} onChange={(e) => setRoleName(e.target.value)} fullWidth />
            <Button variant="contained" onClick={handleUpdate}>Update</Button>
          </Stack>
        </Box>
      </Modal>

      {/* View Modal */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)}>
        <Box sx={modalStyle}>
          {currentRole && (
            <Stack spacing={2}>
              <Typography variant="h6">View Role</Typography>
              <TextField label="Role ID" value={currentRole.id} disabled fullWidth />
              <TextField label="Role Name" value={currentRole.roleName} disabled fullWidth />
            </Stack>
          )}
        </Box>
      </Modal>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}