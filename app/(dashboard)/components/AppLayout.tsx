"use client";

import { Box } from "@mui/material";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <ToastContainer />
      <Sidebar />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />

        <Box
          sx={{
            flex: 1,
            bgcolor: "grey.50",
            p: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
