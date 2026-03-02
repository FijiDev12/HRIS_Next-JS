"use client";

import React, { useState } from "react";
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
} from "@mui/material";

// Sample accounts data
const initialAccounts = [
  { id: 1, username: "johndoe", email: "john@example.com", role: "Admin" },
  { id: 2, username: "janesmith", email: "jane@example.com", role: "User" },
  { id: 3, username: "alicej", email: "alice@example.com", role: "HR" },
  { id: 4, username: "boblee", email: "bob@example.com", role: "Finance" },
];

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [open, setOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);

  const handleOpen = (account: any, edit = false) => {
    setCurrentAccount(account);
    setIsEdit(edit);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentAccount(null);
    setIsEdit(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this account?")) {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleChange = (field: string, value: string) => {
    setCurrentAccount((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === currentAccount.id ? currentAccount : a))
    );
    handleClose();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Accounts
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Accounts</Typography>
              <Typography variant="h4">{accounts.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={[4, 4, 4]}>
          <Card>
            <CardContent>
              <Typography variant="h6">Roles</Typography>
              <Typography variant="h4">{new Set(accounts.map(a => a.role)).size}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Accounts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.id}</TableCell>
                <TableCell>{a.username}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell>{a.role}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpen(a, false)}
                    >
                      View
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpen(a, true)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(a.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            {isEdit ? "Edit Account" : "View Account"}
          </Typography>
          {currentAccount && (
            <Stack spacing={2}>
              <TextField
                label="Username"
                value={currentAccount.username}
                onChange={(e) => handleChange("username", e.target.value)}
                disabled={!isEdit}
                fullWidth
              />
              <TextField
                label="Email"
                value={currentAccount.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={!isEdit}
                fullWidth
              />
              <TextField
                label="Role"
                value={currentAccount.role}
                onChange={(e) => handleChange("role", e.target.value)}
                disabled={!isEdit}
                fullWidth
              />
              {isEdit && (
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
