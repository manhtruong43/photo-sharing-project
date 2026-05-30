import React, { useState, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import LogoutIcon from "@mui/icons-material/Logout";

import "./styles.css";

/**
 * TopBar - handles login/logout display, Add Photo upload dialog.
 */
function TopBar({ advancedFeatures, setAdvancedFeatures, topBarContext, loggedInUser, setLoggedInUser }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleCheckboxChange = (event) => {
    setAdvancedFeatures(event.target.checked);
  };

  const handleLogout = () => {
    fetch("/admin/logout", { method: "POST" })
      .then(() => setLoggedInUser(null))
      .catch(() => setLoggedInUser(null));
  };

  const handleUploadOpen = () => {
    setUploadOpen(true);
    setUploadFile(null);
    setUploadError("");
    setUploadSuccess("");
  };

  const handleUploadClose = () => {
    setUploadOpen(false);
    setUploadFile(null);
    setUploadError("");
    setUploadSuccess("");
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0] || null);
    setUploadError("");
    setUploadSuccess("");
  };

  const handleUploadSubmit = () => {
    if (!uploadFile) {
      setUploadError("Please select a photo to upload.");
      return;
    }
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    const formData = new FormData();
    formData.append("uploadedphoto", uploadFile);

    fetch("/photos/new", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) return res.text().then((t) => { throw new Error(t); });
        return res.json();
      })
      .then(() => {
        setUploadSuccess("Photo uploaded successfully!");
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        window.dispatchEvent(new CustomEvent("refreshUserList"));
      })
      .catch((err) => {
        setUploadError(err.message || "Upload failed.");
      })
      .finally(() => setUploading(false));
  };

  return (
    <>
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar className="topbar-toolbar">
          {/* Left: Brand + context */}
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <Typography variant="h5" color="inherit" className="topbar-brand">
              PhotoShare
            </Typography>
            {topBarContext && (
              <Typography variant="subtitle1" color="inherit" className="topbar-context">
                {topBarContext}
              </Typography>
            )}
          </div>

          {/* Right: controls */}
          <div className="topbar-controls">
            {loggedInUser ? (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={advancedFeatures}
                      onChange={handleCheckboxChange}
                      color="secondary"
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        "&.Mui-checked": { color: "#ffffff" },
                      }}
                    />
                  }
                  label="Advanced Features"
                  componentsProps={{ typography: { className: "topbar-checkbox-label" } }}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddAPhotoIcon />}
                  onClick={handleUploadOpen}
                  className="topbar-btn topbar-btn-upload"
                  id="add-photo-btn"
                >
                  Add Photo
                </Button>
                <Typography variant="body1" className="topbar-greeting">
                  Hi {loggedInUser.first_name}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  className="topbar-btn topbar-btn-logout"
                  id="logout-btn"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Typography variant="body1" className="topbar-please-login">
                Please Login
              </Typography>
            )}
          </div>
        </Toolbar>
      </AppBar>

      {/* Upload Photo Dialog */}
      <Dialog open={uploadOpen} onClose={handleUploadClose} maxWidth="xs" fullWidth>
        <DialogTitle>Upload New Photo</DialogTitle>
        <DialogContent>
          {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}
          {uploadSuccess && <Alert severity="success" sx={{ mb: 2 }}>{uploadSuccess}</Alert>}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            id="photo-upload-input"
            style={{ marginTop: 8, width: "100%" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose} color="inherit">Cancel</Button>
          <Button
            onClick={handleUploadSubmit}
            variant="contained"
            disabled={uploading}
            id="photo-upload-submit"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TopBar;

