import React, { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";
import "./styles.css";

function LoginRegister({ setLoggedInUser }) {
  // Login state
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regForm, setRegForm] = useState({
    login_name: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    if (!loginName) {
      setLoginError("Please enter your login name.");
      return;
    }
    setLoginLoading(true);
    fetch("/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login_name: loginName, password: loginPassword }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((msg) => {
            throw new Error(msg || "Login failed. Check your credentials.");
          });
        }
        return res.json();
      })
      .then((data) => {
        setLoggedInUser(data);
      })
      .catch((err) => {
        setLoginError(err.message || "Login failed.");
      })
      .finally(() => setLoginLoading(false));
  };

  const handleRegChange = (field) => (e) => {
    setRegForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!regForm.login_name || !regForm.first_name || !regForm.last_name || !regForm.password) {
      setRegError("Login name, first name, last name, and password are required.");
      return;
    }
    if (regForm.password !== regForm.confirm_password) {
      setRegError("Passwords do not match.");
      return;
    }

    setRegLoading(true);
    fetch("/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login_name: regForm.login_name,
        password: regForm.password,
        first_name: regForm.first_name,
        last_name: regForm.last_name,
        location: regForm.location,
        description: regForm.description,
        occupation: regForm.occupation,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((msg) => {
            throw new Error(msg || "Registration failed.");
          });
        }
        return res.text();
      })
      .then(() => {
        setRegSuccess("Registration successful! You can now log in.");
        setRegForm({
          login_name: "",
          password: "",
          confirm_password: "",
          first_name: "",
          last_name: "",
          location: "",
          description: "",
          occupation: "",
        });
      })
      .catch((err) => {
        setRegError(err.message || "Registration failed.");
      })
      .finally(() => setRegLoading(false));
  };

  return (
    <div className="loginregister-container">
      {/* LOGIN SECTION */}
      <Paper className="loginregister-card" elevation={3}>
        <Typography variant="h5" className="loginregister-title">
          Welcome Back
        </Typography>
        <Typography variant="body2" className="loginregister-subtitle">
          Sign in to your account
        </Typography>

        {loginError && (
          <Alert severity="error" className="loginregister-alert">
            {loginError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} className="loginregister-form">
          <TextField
            label="Login Name"
            variant="outlined"
            fullWidth
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            className="loginregister-field"
            id="login-name-field"
            autoComplete="username"
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="loginregister-field"
            id="login-password-field"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            className="loginregister-btn"
            disabled={loginLoading}
            id="login-submit-btn"
          >
            {loginLoading ? <CircularProgress size={22} color="inherit" /> : "Login"}
          </Button>
        </Box>
      </Paper>

      <Divider className="loginregister-divider">
        <Typography variant="body2" color="textSecondary">
          OR
        </Typography>
      </Divider>

      {/* REGISTER SECTION */}
      <Paper className="loginregister-card" elevation={3}>
        <Typography variant="h5" className="loginregister-title">
          Create Account
        </Typography>
        <Typography variant="body2" className="loginregister-subtitle">
          Join the photo sharing community
        </Typography>

        {regError && (
          <Alert severity="error" className="loginregister-alert">
            {regError}
          </Alert>
        )}
        {regSuccess && (
          <Alert severity="success" className="loginregister-alert">
            {regSuccess}
          </Alert>
        )}

        <Box component="form" onSubmit={handleRegister} className="loginregister-form">
          <div className="loginregister-row">
            <TextField
              label="First Name *"
              variant="outlined"
              fullWidth
              value={regForm.first_name}
              onChange={handleRegChange("first_name")}
              className="loginregister-field"
              id="reg-first-name"
            />
            <TextField
              label="Last Name *"
              variant="outlined"
              fullWidth
              value={regForm.last_name}
              onChange={handleRegChange("last_name")}
              className="loginregister-field"
              id="reg-last-name"
            />
          </div>
          <TextField
            label="Login Name *"
            variant="outlined"
            fullWidth
            value={regForm.login_name}
            onChange={handleRegChange("login_name")}
            className="loginregister-field"
            id="reg-login-name"
            autoComplete="username"
          />
          <TextField
            label="Password *"
            type="password"
            variant="outlined"
            fullWidth
            value={regForm.password}
            onChange={handleRegChange("password")}
            className="loginregister-field"
            id="reg-password"
            autoComplete="new-password"
          />
          <TextField
            label="Confirm Password *"
            type="password"
            variant="outlined"
            fullWidth
            value={regForm.confirm_password}
            onChange={handleRegChange("confirm_password")}
            className="loginregister-field"
            id="reg-confirm-password"
            autoComplete="new-password"
          />
          <TextField
            label="Location"
            variant="outlined"
            fullWidth
            value={regForm.location}
            onChange={handleRegChange("location")}
            className="loginregister-field"
            id="reg-location"
          />
          <TextField
            label="Occupation"
            variant="outlined"
            fullWidth
            value={regForm.occupation}
            onChange={handleRegChange("occupation")}
            className="loginregister-field"
            id="reg-occupation"
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            value={regForm.description}
            onChange={handleRegChange("description")}
            className="loginregister-field"
            id="reg-description"
          />
          <Button
            type="submit"
            variant="outlined"
            fullWidth
            className="loginregister-btn-outline"
            disabled={regLoading}
            id="register-submit-btn"
          >
            {regLoading ? <CircularProgress size={22} color="inherit" /> : "Register Me"}
          </Button>
        </Box>
      </Paper>
    </div>
  );
}

export default LoginRegister;
