"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useEmployeeStore } from "@/app/store/useEmployee";
import { usePositionStore } from "@/app/store/usePosition";
import { useDepartmentStore } from "@/app/store/useDepartments";
import { useSiteStore } from "@/app/store/useSites";
import { useUserStore } from "@/app/store/useUser";
// import { useEmploymentStore } from "@/app/store/useEmployment";

interface Props {
  open: boolean;
  onClose: () => void;
  employee?: any;
  isEdit?: boolean;
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {xs: '90%', sm : '90%', md: 500, lg: 500},
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function EmployeeModal({
  open,
  onClose,
  employee,
  isEdit = false,
}: Props) {
  const { createEmployee, updateEmployee, error } = useEmployeeStore();
  const { users, fetchUsers, createUser } = useUserStore();
  const { positions, fetchPositions } = usePositionStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { sites, fetchSites } = useSiteStore();
  // const { employments, fetchEmployments } = useEmploymentStore();

  const [formData, setFormData] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    dateHired: "",
    contactNo: "",
    address: "",
    positionId: "",
    departmentId: "",
    siteId: "",
    employmentId: "",
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    if (open) {
      fetchPositions();
      fetchDepartments();
      fetchSites();
      // fetchEmployments();
    }
  }, [open, fetchPositions, fetchDepartments, fetchSites]);

  useEffect(() => {
    if (isEdit && employee) {
      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        birthDate: employee.birthDate ? employee.birthDate.split("T")[0] : "",
        dateHired: employee.dateHired ? employee.dateHired.split("T")[0] : "",
        contactNo: employee.contactNo || "",
        address: employee.address || "",
        positionId: employee.positionId || "",
        departmentId: employee.departmentId || "",
        siteId: employee.siteId || "",
        employmentId: employee.employmentId || "",
      });

      if (employee.profilePhoto) setPreview(employee.profilePhoto);
      else setPreview(null);
    } else if (!isEdit) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        birthDate: "",
        dateHired: "",
        contactNo: "",
        address: "",
        positionId: "",
        departmentId: "",
        siteId: "",
        employmentId: "",
      });
      setProfilePhoto(null);
      setPreview(null);
    }
  }, [open, isEdit, employee]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      setProfilePhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const payload: any = { ...formData };
    if (profilePhoto) payload.profilePhoto = profilePhoto;

    try {
      if (isEdit && employee?.id) {
        await updateEmployee(employee.id, payload);
        setToast({ open: true, message: "Employee updated successfully!", severity: "success" });
      } else {
        await createEmployee(payload);
        // await createUser(payload)
        setToast({ open: true, message: "Employee created successfully!", severity: "success" });
      }
      setTimeout(() => onClose(), 800);
    } catch {
      setToast({ open: true, message: error || "Something went wrong", severity: "error" });
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            {isEdit ? "Edit Employee" : "Create Employee"}
          </Typography>

          <Grid container spacing={2}>
            {/* First Name */}
            <Grid size={[6, 6, 6]}>
              <TextField label="First Name" value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} fullWidth />
            </Grid>

            {/* Last Name */}
            <Grid size={[6, 6, 6]}>
              <TextField label="Last Name" value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} fullWidth />
            </Grid>

            {/* Email */}
            <Grid size={[6, 6, 6]}>
              <TextField label="Email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} fullWidth />
            </Grid>

            {/* Birth Date */}
            <Grid size={[6, 6, 6]}>
              <TextField
                type="date"
                label="Birth Date"
                value={formData.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Date Hired */}
            <Grid size={[6, 6, 6]}>
              <TextField
                type="date"
                label="Date Hired"
                value={formData.dateHired}
                onChange={(e) => handleChange("dateHired", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Contact No */}
            <Grid size={[6, 6, 6]}>
              <TextField label="Contact No" value={formData.contactNo} onChange={(e) => handleChange("contactNo", e.target.value)} fullWidth />
            </Grid>

            {/* Address */}
            <Grid size={[6, 6, 6]}>
              <TextField label="Address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} fullWidth />
            </Grid>

            {/* Position */}
            <Grid size={[6, 6, 6]}>
              <FormControl fullWidth>
                <InputLabel>Position</InputLabel>
                <Select value={formData.positionId || ""} onChange={(e) => handleChange("positionId", e.target.value)} label="Position">
                  {positions.map((pos) => (
                    <MenuItem key={pos.id} value={pos.id}>
                      {pos.positionName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Department */}
            <Grid size={[6, 6, 6]}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select value={formData.departmentId || ""} onChange={(e) => handleChange("departmentId", e.target.value)} label="Department">
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Site */}
            <Grid size={[6, 6, 6]}>
              <FormControl fullWidth>
                <InputLabel>Site</InputLabel>
                <Select value={formData.siteId || ""} onChange={(e) => handleChange("siteId", e.target.value)} label="Site">
                  {sites.map((site) => (
                    <MenuItem key={site.id} value={site.id}>
                      {site.siteName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Employment */}
            {/* Uncomment if you have EmploymentStore
            <Grid size={[6, 6, 6]}>
              <FormControl fullWidth>
                <InputLabel>Employment</InputLabel>
                <Select value={formData.employmentId || ""} onChange={(e) => handleChange("employmentId", e.target.value)} label="Employment">
                  {employments.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.employmentName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            */}

            {/* Upload Profile */}
            <Grid size={[12, 6, 6]}>
              <Button variant="contained" component="label" fullWidth>
                Upload Profile Photo
                <input type="file" hidden accept="image/*" onChange={(e) => handleImageChange(e.target.files?.[0] || null)} />
              </Button>
            </Grid>

            {/* Image Preview */}
            {preview && (
              <Grid size={[6, 6, 6]}>
                <Box component="img" src={preview} alt="Profile Preview" sx={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 2, border: "1px solid #ddd" }} />
              </Grid>
            )}

            {/* Save */}
            <Grid size={[12, 12, 12]}>
              <Button variant="contained" onClick={handleSave} fullWidth>
                {isEdit ? "Save Changes" : "Create Employee"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}