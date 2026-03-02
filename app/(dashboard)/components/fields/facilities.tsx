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
  CircularProgress,
  Alert,
} from "@mui/material";

import { useSiteStore } from "@/app/store/useSites";
import { useAuthStore } from "@/app/store/useAuth";
import { useEmployeeStore } from "@/app/store/useEmployee"; // ✅ Import employee store
import { useEmployeeInfoStore } from "@/app/store/useEmployeeInfo";
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

export default function FacilitiesPage() {
  const { user } = useAuthStore();

  const {
    sites,
    loading,
    error,
    fetchSites,
    createSite,
    updateSite,
    deleteSite,
    clearError,
  } = useSiteStore();

  const { fetchEmployeeById } = useEmployeeStore();
const { employee } = useEmployeeInfoStore();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");
  const [form, setForm] = useState<any>(null);
  const [creators, setCreators] = useState<Record<number, string>>({}); // id → full name
  const [loadingCreators, setLoadingCreators] = useState(false);

  /* =========================
     Fetch Sites & Creators
  ========================= */
  useEffect(() => {
    const loadSites = async () => {
      await fetchSites();
    };
    loadSites();
  }, [fetchSites]);

  // Fetch creators only when sites change, but don’t call fetchSites again
  useEffect(() => {
    const loadCreators = async () => {
      setLoadingCreators(true);
      const creatorIds = Array.from(new Set(sites.map((s) => s.createdBy)));
      const creatorNames: Record<number, string> = {};

      await Promise.all(
        creatorIds.map(async (id) => {
          if (id) {
            const emp = await fetchEmployeeById(id);
            creatorNames[id] = emp ? `${emp.firstName} ${emp.lastName}` : "Unknown";
          }
        })
      );

      setCreators(creatorNames);
      setLoadingCreators(false);
    };

    if (sites.length > 0) {
      loadCreators();
    }
  }, [sites, fetchEmployeeById]);

  /* =========================
     Modal Handlers
  ========================= */
  const handleOpen = (site: any = null, type: "create" | "edit" | "view") => {
    clearError();

    if (type === "create") {
      setForm({
        siteName: "",
        createdBy: user?.id,
      });
    } else {
      setForm(site);
    }

    setMode(type);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(null);
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* =========================
     CRUD Actions
  ========================= */
  const handleSave = async () => {
    if (!form?.siteName?.trim() && !employee) return;

    if (mode === "edit" && form?.id) {
      await updateSite(form.id, {
        siteName: form.siteName,
        createdBy: form.createdBy,
      });
    } else {
      await createSite({
        siteName: form.siteName,
        createdBy: employee?.id ? employee?.id : 1,
      });
    }

    handleClose();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this facility?")) {
      await deleteSite(id);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Facilities
      </Typography>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Facilities</Typography>
              <Typography variant="h4">{sites.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">Unique Names</Typography>
              <Typography variant="h4">
                {new Set(sites.map((s) => s.siteName)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Records</Typography>
              <Typography variant="h4">{sites.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Button */}
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => handleOpen(null, "create")}>
          Add Facility
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Site Name</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading || loadingCreators ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : sites.length > 0 ? (
              sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell>{site.id}</TableCell>
                  <TableCell>{site.siteName}</TableCell>
                  <TableCell>
                    {creators[site.createdBy] || site.createdBy}
                  </TableCell>
                  <TableCell>
                    {new Date(site.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => handleOpen(site, "view")}>
                        View
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpen(site, "edit")}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(site.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No facilities found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            {mode === "view"
              ? "Facility Details"
              : mode === "edit"
              ? "Edit Facility"
              : "Create Facility"}
          </Typography>

          {form && (
            <Stack spacing={2}>
              <TextField
                label="Site Name"
                value={form.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                disabled={mode === "view"}
                fullWidth
              />

              {mode !== "view" && (
                <Button variant="contained" onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </Modal>
    </Box>
  );
}