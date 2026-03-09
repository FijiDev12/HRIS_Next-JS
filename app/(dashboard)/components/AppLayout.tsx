"use client";

import { Box } from "@mui/material";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <ToastContainer />
      <Sidebar />

      <Box
        sx={{
          flex: 1,
          minWidth: 0, // ⭐ allows shrinking in flexbox
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <Box
          sx={{
            flex: 1,
            width: "100%",
            bgcolor: "grey.50",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};