"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuthStore } from "@/app/store/useAuth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError, loadFromStorage, user, accessToken } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  // Restore from storage on page load
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Redirect if already logged in
  useEffect(() => {
    // if (user && accessToken) {
    //   router.replace("/dashboard");
    // }
  }, [user, accessToken, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      alert("Please fill in all fields");
      return;
    }

    const result = await login(form.email, form.password);
    if (result) {
      router.push("/dashboard");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0f172a",
        px: 2,
      }}
    >
      <Paper elevation={6} sx={{ width: "100%", maxWidth: 400, p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={600} align="center" gutterBottom>
          Login
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Welcome back 👋
        </Typography>

        <TextField
          label="Email / Username"
          name="email"
          fullWidth
          variant="filled"
          value={form.email}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          fullWidth
          variant="filled"
          value={form.password}
          onChange={handleChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 1 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        <Button fullWidth variant="contained" sx={{ mt: 3, py: 1.2 }} onClick={handleLogin} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 2, color: "gray", cursor: "pointer" }}>
          Forgot password?
        </Typography>
      </Paper>
    </Box>
  );
}
