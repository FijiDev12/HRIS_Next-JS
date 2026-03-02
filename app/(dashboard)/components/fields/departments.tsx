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
    const {employee} = useEmployeeInfoStore()
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ departmentName: "", siteId: 0, id: 0 });

  useEffect(() => {
    fetchDepartments();
    fetchSites(); // fetch sites for dropdown
  }, [fetchDepartments, fetchSites]);

  const handleSubmit = async () => {
    if (!form.siteId) {
      alert("Please select a site");
      return;
    }

    if (form.id) {
      await updateDepartment(form.id, { departmentName: form.departmentName, siteId: form.siteId, createdBy: employee?.id });
    } else {
      await addDepartment({ departmentName: form.departmentName, siteId: form.siteId, createdBy: employee?.id });
    }

    setModalOpen(false);
    setForm({ departmentName: "", siteId: 0, id: 0 });
    fetchDepartments();
  };

  const handleEdit = (dept: any) => {
    setForm({ departmentName: dept.departmentName, siteId: dept.siteId, id: dept.id });
    setModalOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Departments</Typography>
        <Button variant="contained" onClick={() => setModalOpen(true)}>
          Add Department
        </Button>
      </Stack>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {departments.map((dept) => {
          const site = sites.find((s) => s.id === dept.siteId);
          return (
            <Paper key={dept.id} sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
              <Typography>
                {dept.departmentName} (Site: {site ? site.siteName : dept.siteId})
              </Typography>
              <Box>
                <IconButton onClick={() => handleEdit(dept)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => deleteDepartment(dept.id).then(fetchDepartments)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          );
        })}
      </Stack>

      {/* Modal for Add / Edit */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
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

            {/* Site Dropdown */}
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
