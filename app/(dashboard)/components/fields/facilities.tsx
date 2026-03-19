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
  useTheme,
  useMediaQuery,
} from "@mui/material";

import { useSiteStore } from "@/app/store/useSites";
import { useAuthStore } from "@/app/store/useAuth";
import { useEmployeeStore } from "@/app/store/useEmployee";
import { useEmployeeInfoStore } from "@/app/store/useEmployeeInfo";

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {xs: '90%', sm : '90%', md: 500, lg: 500},
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function FacilitiesPage() {
  const { user } = useAuthStore();
  const { employee } = useEmployeeInfoStore();
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
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "view">("create");
  const [form, setForm] = useState<any>(null);
  const [creators, setCreators] = useState<Record<number, string>>({});
  const [loadingCreators, setLoadingCreators] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* =========================
     Fetch Sites & Creators
  ========================= */
  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

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

    if (sites.length > 0) loadCreators();
  }, [sites, fetchEmployeeById]);

  /* =========================
     Modal Handlers
  ========================= */
  const handleOpen = (site: any = null, type: "create" | "edit" | "view") => {
    clearError();

    if (type === "create") {
      setForm({
        siteName: "",
        latitude: "",
        longitude: "",
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
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  /* =========================
     CRUD Actions
  ========================= */
  const handleSave = async () => {
    if (!form?.siteName?.trim()) return;

    const payload = {
      siteName: form.siteName,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      createdBy: employee?.id ?? 1,
    };

    if (mode === "edit" && form?.id) {
      await updateSite(form.id, payload);
    } else {
      await createSite(payload);
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
              <Typography sx={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)" }} variant="h6">Total Facilities</Typography>
              <Typography variant="h4">{sites.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography sx={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)" }} variant="h6">Unique Names</Typography>
              <Typography variant="h4">{new Set(sites.map((s) => s.siteName)).size}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography sx={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)" }} variant="h6">Active Records</Typography>
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

      {/* Desktop Table */}
      {!isMobile && (
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
                    <TableCell>{creators[site.createdBy] || site.createdBy}</TableCell>
                    <TableCell>{new Date(site.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => handleOpen(site, "view")}>
                          View
                        </Button>
                        <Button variant="contained" size="small" onClick={() => handleOpen(site, "edit")}>
                          Edit
                        </Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(site.id)}>
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
      )}

      {/* Mobile Grid */}
      {isMobile && (
        <Grid container spacing={2}>
          {sites.length === 0 ? (
            <Grid size={[12, 12, 12]}>
              <Typography align="center">No facilities found</Typography>
            </Grid>
          ) : (
            sites.map((site) => (
              <Grid size={[12]} key={site.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">{site.siteName}</Typography>
                  <Typography variant="body2">ID: {site.id}</Typography>
                  <Typography variant="body2">Created By: {creators[site.createdBy] || site.createdBy}</Typography>
                  <Typography variant="body2">
                    Created At: {new Date(site.createdAt).toLocaleDateString()}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" onClick={() => handleOpen(site, "view")}>View</Button>
                    <Button size="small" variant="contained" onClick={() => handleOpen(site, "edit")}>Edit</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(site.id)}>
                      Delete
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            {mode === "view" ? "Facility Details" : mode === "edit" ? "Edit Facility" : "Create Facility"}
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
              <TextField
                label="Latitude"
                type="float"
                value={form.latitude || ""}
                onChange={(e) => handleChange("latitude", e.target.value)}
                disabled={mode === "view"}
                fullWidth
              />

              <TextField
                label="Longitude"
                type="float"
                value={form.longitude || ""}
                onChange={(e) => handleChange("longitude", e.target.value)}
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