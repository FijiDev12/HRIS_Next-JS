"use client";

import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Modal,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useDepartmentStore } from "@/app/store/useDepartments";
import { useSiteStore } from "@/app/store/useSites";
import { useEmployeeInfoStore } from "@/app/store/useEmployeeInfo";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function DepartmentPage() {
  const { departments, fetchDepartments, addDepartment, updateDepartment, deleteDepartment } =
    useDepartmentStore();
  const { sites, fetchSites, loading: sitesLoading } = useSiteStore();
  const { employee } = useEmployeeInfoStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ departmentName: "", siteId: 0, id: 0 });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchDepartments();
    fetchSites();
  }, [fetchDepartments, fetchSites]);

  const handleSubmit = async () => {
    if (!form.siteId) {
      alert("Please select a site");
      return;
    }

    if (form.id) {
      await updateDepartment(form.id, {
        departmentName: form.departmentName,
        siteId: form.siteId,
        createdBy: employee?.id,
      });
    } else {
      await addDepartment({
        departmentName: form.departmentName,
        siteId: form.siteId,
        createdBy: employee?.id,
      });
    }

    setModalOpen(false);
    setForm({ departmentName: "", siteId: 0, id: 0 });
    fetchDepartments();
  };

  const handleEdit = (dept: any) => {
    setForm({ departmentName: dept.departmentName, siteId: dept.siteId, id: dept.id });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this department?")) {
      await deleteDepartment(id);
      fetchDepartments();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Departments</Typography>
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          Add Department
        </Button>
      </Stack>

      {/* Desktop Table */}
      {!isMobile && (
        <Paper sx={{ mt: 2 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Department</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Site</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "16px" }}>
                    No departments found
                  </td>
                </tr>
              ) : (
                departments.map((dept) => {
                  const site = sites.find((s) => s.id === dept.siteId);
                  return (
                    <tr key={dept.id}>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{dept.departmentName}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {site ? site.siteName : dept.siteId}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        <Stack direction="row" spacing={1}>
                          <IconButton onClick={() => handleEdit(dept)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(dept.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Paper>
      )}

      {/* Mobile Grid */}
      {isMobile && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {departments.length === 0 ? (
            <Grid size={[12, 12, 12]}>
              <Typography align="center">No departments found</Typography>
            </Grid>
          ) : (
            departments.map((dept) => {
              const site = sites.find((s) => s.id === dept.siteId);
              return (
                <Grid size={[12]} key={dept.id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1">{dept.departmentName}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Site: {site ? site.siteName : dept.siteId}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => handleEdit(dept)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(dept.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })
          )}
        </Grid>
      )}

      {/* Modal for Add / Edit */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
          }}
        >
          <Stack spacing={2}>
            <TextField
              label="Department Name"
              value={form.departmentName}
              onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel id="site-select-label">Site</InputLabel>
              <Select
                labelId="site-select-label"
                value={form.siteId || ""}
                onChange={(e) => setForm({ ...form, siteId: Number(e.target.value) })}
                label="Site"
              >
                {sitesLoading ? (
                  <MenuItem value="">
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  sites.map((site) => (
                    <MenuItem key={site.id} value={site.id}>
                      {site.siteName}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Button variant="contained" onClick={handleSubmit}>
              {form.id ? "Update" : "Add"}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}