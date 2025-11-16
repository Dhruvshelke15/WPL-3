import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import * as api from "../../lib/api";
import useAppStore from "../../lib/store";

function LoginRegister() {
  const login = useAppStore((state) => state.login);
  const [tabIndex, setTabIndex] = useState(0);

  // --- State for Login ---
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");

  // --- State for Register ---
  const [regLoginName, setRegLoginName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regLocation, setRegLocation] = useState("");
  const [regDescription, setRegDescription] = useState("");
  const [regOccupation, setRegOccupation] = useState("");

  // --- Mutations ---

  const loginMutation = useMutation({
    mutationFn: api.loginUser,
    onSuccess: (data) => {
      login(data); // Save user to Zustand store
    },
    onError: (error) => {
      console.error("Login failed:", error.response?.data || error.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: api.registerUser,
    onSuccess: () => {
      console.log("Registration successful! Please login.");
      setTabIndex(0); // Switch to login tab
      // Clear registration form
      setRegLoginName("");
      setRegPassword("");
      setRegPasswordConfirm("");
      setRegFirstName("");
      setRegLastName("");
      setRegLocation("");
      setRegDescription("");
      setRegOccupation("");
    },
    onError: (error) => {
      console.error("Registration failed:", error.response?.data || error.message);
    },
  });

  // --- Handlers ---

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ login_name: loginName, password: password });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (regPassword !== regPasswordConfirm) {
      console.error("Passwords do not match!");
      return;
    }
    registerMutation.mutate({
      login_name: regLoginName,
      password: regPassword,
      first_name: regFirstName,
      last_name: regLastName,
      location: regLocation,
      description: regDescription,
      occupation: regOccupation,
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: 24, marginTop: 32 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {/* --- Login Form (Tab 0) --- */}
        {tabIndex === 0 && (
          <Box component="form" onSubmit={handleLoginSubmit} sx={{ mt: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Login
            </Typography>
            <TextField
              label="Login Name"
              variant="outlined"
              fullWidth
              margin="normal"
              required
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loginMutation.isPending}
              sx={{ mt: 2 }}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </Box>
        )}

        {/* --- Register Form (Tab 1) --- */}
        {tabIndex === 1 && (
          <Box component="form" onSubmit={handleRegisterSubmit} sx={{ mt: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Register New User
            </Typography>
            <TextField label="Login Name*" fullWidth margin="normal" required value={regLoginName} onChange={(e) => setRegLoginName(e.target.value)} />
            <TextField label="Password*" type="password" fullWidth margin="normal" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
            <TextField label="Confirm Password*" type="password" fullWidth margin="normal" required value={regPasswordConfirm} onChange={(e) => setRegPasswordConfirm(e.target.value)} />
            <TextField label="First Name*" fullWidth margin="normal" required value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} />
            <TextField label="Last Name*" fullWidth margin="normal" required value={regLastName} onChange={(e) => setRegLastName(e.target.value)} />
            <TextField label="Location" fullWidth margin="normal" value={regLocation} onChange={(e) => setRegLocation(e.target.value)} />
            <TextField label="Description" fullWidth margin="normal" value={regDescription} onChange={(e) => setRegDescription(e.target.value)} />
            <TextField label="Occupation" fullWidth margin="normal" value={regOccupation} onChange={(e) => setRegOccupation(e.target.value)} />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={registerMutation.isPending}
              sx={{ mt: 2 }}
            >
              {registerMutation.isPending ? "Registering..." : "Register Me"}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default LoginRegister;