"use client";

import {
  Box,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Divider,
  Stack,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLayout } from "../context/LayoutContext";
import { useEmployeeInfoStore } from "@/app/store/useEmployeeInfo";
import { usePositionStore } from "@/app/store/usePosition";
import { useDepartmentStore } from "@/app/store/useDepartments";
import { useSiteStore } from "@/app/store/useSites";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const Header = ({ children }: { children?: React.ReactNode }) => {
  const { employee, fetchEmployee, clearEmployee } = useEmployeeInfoStore();
  const { positions, position, fetchPositions, fetchPositionById } = usePositionStore();
  const { departments, department, fetchDepartments, fetchDepartmentById } = useDepartmentStore();
  const { sites, site, fetchSites, fetchSiteById } = useSiteStore();
  const { toggleSidebar } = useLayout();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<{ roleId?: number; id?: number }>({});

useEffect(() => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("user");
    if (stored) setSessionData(JSON.parse(stored));
  }
}, []);
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Profile modal state
  const [profileOpen, setProfileOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    clearEmployee();
    router.replace("/");
    handleClose();
  };

useEffect(() => {
  if (!sessionData?.id) return;

  const token = localStorage.getItem("accessToken");
  const id = localStorage.getItem("id");

  if (!token || !id) {
    localStorage.clear();
    clearEmployee();
    router.replace("/");
    return;
  }

  fetchEmployee(parseInt(id), token, () => {
    localStorage.clear();
    clearEmployee();
    router.replace("/");
  });

  if (sessionData.roleId === 1) {
    fetchPositions();
    fetchDepartments();
    fetchSites();
  } else {
    fetchPositionById(employee ? employee.positionId || 0 : sessionData.id || 0);
    fetchDepartmentById(employee ? employee.departmentId || 0 : sessionData.id || 0);
    fetchSiteById(employee ? employee.siteId || 0 : sessionData.id || 0);
  }
}, [fetchEmployee, fetchPositions, fetchDepartments, fetchSites, router, clearEmployee, sessionData]);
  // Map IDs to names
  const positionName = employee
    ? positions.find((p) => p.id === employee.positionId)?.positionName
      || position?.positionName
      || "Position"
    : "Position";

  const departmentName = employee
    ? departments.find((d) => d.id === employee.departmentId)?.departmentName
      || department?.departmentName
      || "Department"
    : "Department";

  const siteName = employee
    ? sites.find((s) => s.id === employee.siteId)?.siteName      
      || site?.siteName
      || "Site"
    : "Site";

  return (
    <Box
      sx={{
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2.5,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Left */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          onClick={toggleSidebar}
          size="small"
          sx={{ color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>

        <Typography variant="body1" fontWeight={600} color="text.primary">
          Dashboard
        </Typography>
      </Box>

      {/* Right */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          {employee ? `${employee.firstName} ${employee.lastName}` : "Guest"}
        </Typography>

        <Avatar
          sx={{ width: 32, height: 32, cursor: "pointer" }}
          onClick={handleClick}
          src={employee?.profilePhoto || undefined}
        >
          {employee
            ? `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
            : "G"}
        </Avatar>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem
            onClick={() => {
              setProfileOpen(true);
              handleClose();
            }}
          >
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>

      {/* Profile Modal */}
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {xs: '90%', sm : '90%', md: 500, lg: 500},
          }}
        >
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={2} alignItems="center">
              <Avatar
                sx={{ width: 64, height: 64 }}
                src={employee?.profilePhoto || undefined}
              >
                {employee
                  ? `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
                  : "G"}
              </Avatar>

              <Typography variant="h6" fontWeight={600}>
                {employee
                  ? `${employee.firstName} ${employee.middleName ? employee.middleName + " " : ""}${employee.lastName}${employee.suffix ? ", " + employee.suffix : ""}`
                  : "Guest"}
              </Typography>

              <Divider sx={{ width: "100%" }} />

              {employee && (
                <Stack spacing={1} sx={{ width: "100%" }}>
                  <Typography variant="body2">
                    <strong>Employee No:</strong> {employee.employeeNo}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {employee.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Contact No:</strong> {employee.contactNo}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Gender:</strong> {employee.gender}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Birth Date:</strong> {employee
                      ? new Date(employee.birthDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Position:</strong> {positionName ? positionName : "Test"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Department:</strong> {departmentName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Site:</strong> {siteName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Employment ID:</strong> {employee.employmentId}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date Hired:</strong> {employee
                      ? new Date(employee.dateHired).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Active:</strong> {employee.isActive ? "Yes" : "No"}
                  </Typography>
                  {employee.role && (
                    <Typography variant="body2">
                      <strong>Role:</strong> {employee.role.name}
                    </Typography>
                  )}
                </Stack>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={() => setProfileOpen(false)}
              >
                Close
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Modal>
    </Box>
  );
};
