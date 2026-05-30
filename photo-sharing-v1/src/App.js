import './App.css';

import React, { useState, useEffect } from "react";
import { Grid, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/UserComments";
import LoginRegister from "./components/LoginRegister";

const App = () => {
  const [advancedFeatures, setAdvancedFeatures] = useState(false);
  const [topBarContext, setTopBarContext] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On mount, check if there's an existing session
  useEffect(() => {
    fetch("/loginUser")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data._id) setLoggedInUser(data);
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) return null; // wait for session check

  // Not logged in → show only login/register page
  if (!loggedInUser) {
    return (
      <Router>
        <div className="main-container">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TopBar
                advancedFeatures={advancedFeatures}
                setAdvancedFeatures={setAdvancedFeatures}
                topBarContext="Please Login"
                loggedInUser={null}
                setLoggedInUser={setLoggedInUser}
              />
            </Grid>
            <div className="main-topbar-buffer" />
            <Grid item xs={12}>
              <LoginRegister setLoggedInUser={setLoggedInUser} />
            </Grid>
          </Grid>
        </div>
      </Router>
    );
  }

  // Logged in → full app
  return (
    <Router>
      <div className="main-container">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TopBar
              advancedFeatures={advancedFeatures}
              setAdvancedFeatures={setAdvancedFeatures}
              topBarContext={topBarContext}
              loggedInUser={loggedInUser}
              setLoggedInUser={setLoggedInUser}
            />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item" elevation={0}>
              <UserList />
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item" elevation={0}>
              <Routes>
                <Route
                  path="/users/:userId"
                  element={<UserDetail setTopBarContext={setTopBarContext} />}
                />
                <Route
                  path="/photos/:userId"
                  element={<UserPhotos advancedFeatures={advancedFeatures} setTopBarContext={setTopBarContext} loggedInUser={loggedInUser} />}
                />
                <Route
                  path="/photos/:userId/:photoId"
                  element={<UserPhotos advancedFeatures={advancedFeatures} setTopBarContext={setTopBarContext} loggedInUser={loggedInUser} />}
                />
                <Route
                  path="/comments/:userId"
                  element={<UserComments setTopBarContext={setTopBarContext} />}
                />
                <Route path="/users" element={<UserList />} />
                <Route path="*" element={<Navigate to="/users" replace />} />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Router>
  );
};

export default App;
