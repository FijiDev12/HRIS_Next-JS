"use client";

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ViewListIcon from '@mui/icons-material/ViewList';
import SendIcon from '@mui/icons-material/Send';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Assessment from '@mui/icons-material/Assessment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
// import Logo from "@/app/assets/general/Test_Logo.jpg";
import Link from "next/link";
import { useLayout } from "../context/LayoutContext";
import { usePathname } from "next/navigation"; // <--- import this
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";


export const Sidebar = () => {

  const { isSidebarCollapsed, toggleSidebar, setSidebarCollapsed   } = useLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // <=600px
  const pathname = usePathname(); // get current route
  const [sessionData, setSessionData] = useState<{ roleId?: number; id?: number }>({});
  const menuItems = [
    { label: "Dashboard", icon: <DashboardIcon />, href: "/dashboard", visibility: false },
    { label: "Manage Employees", icon: <PeopleIcon />, href: "/manage-employees", visibility: sessionData?.roleId !== 1 },
    { label: "Fields", icon: <ViewListIcon />, href: "/fields", visibility: sessionData?.roleId !== 1 },
    { label: "Requests", icon: <SendIcon />, href: "/requests", visibility: false },
    { label: "Calendar", icon: <CalendarMonth />, href: "/calendar", visibility: false },
    { label: "Reports", icon: <Assessment />, href: "/reports", visibility: sessionData?.roleId !== 1 },
    // { label: "Payroll", icon: <ReceiptLongIcon />, href: "/payroll", visibility: false },
 ];
    useEffect(() => {
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user");
        if (stored) setSessionData(JSON.parse(stored));
      }
    }, []);
    useEffect(() => {
      if (isMobile) {
        setSidebarCollapsed(true);  // close on mobile
      } else {
        setSidebarCollapsed(false); // open on desktop
      }
    }, [pathname, isMobile]);
  return (
    <Box
      sx={{
        // width: 220,
        width: !isMobile && isSidebarCollapsed ? 64 : 220,
        position: isMobile? 'absolute' : 'relative',
        height: isMobile? '100%' : "auto",
        zIndex: 10,
        display: isMobile && isSidebarCollapsed ? 'none' : 'flex',
        flexDirection: "column",
        transition: "width 0.25s ease",
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        px: 1.5,
        py: 2,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <IconButton onClick={toggleSidebar} size="small" sx={{ display: isMobile ? 'flex' : 'none' }}>
          <MenuIcon />
        </IconButton>
        {/* <Image
          src={Logo}
          alt="Logo"
          width={isSidebarCollapsed ? 50 : 120}
          height={isSidebarCollapsed ? 30 : 50} // adjust based on your logo ratio
          style={{
            opacity: 0.9,
            transition: "all 0.2s ease",
          }}
        /> */}
        <Typography sx={{ color:'gray' }}>CHSI</Typography>

      </Box>

      {/* Menu */}
      <List sx={{ px: 0.5 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href; // check if current route matches
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5, display: item.visibility ? "none" : "" }}>
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{
                  borderRadius: 2,
                  justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                  px: isSidebarCollapsed ? 1 : 2,
                  py: 1.25,
                  color: isActive ? "primary.main" : "text.secondary",
                  bgcolor: isActive ? "action.selected" : "inherit",
                  "&:hover": {
                    bgcolor: isActive ? "action.selected" : "action.hover",
                    color: "text.primary",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isSidebarCollapsed ? 0 : 2,
                    color: "inherit",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {!isSidebarCollapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
