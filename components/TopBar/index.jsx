import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Switch,
  FormControlLabel,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import * as api from "../../lib/api";
import { useAppStore } from "../../lib/store";

import "./styles.css";

function TopBar() {
  // Get state and actions from Zustand store
  const {
    loggedInUser,
    appContext,
    advancedFeatures,
    setAdvancedFeatures,
    logout,
  } = useAppStore();

  const handleFeatureToggle = (event) => {
    setAdvancedFeatures(event.target.checked);
  };

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: api.logoutUser,
    onSuccess: () => {
      logout(); // clear user from Zustand store
    },
    onError: (error) => {
      // Tmight fail if session is already expired, so we log out anyway
      console.error("Logout API call failed:", error);
      logout();
    }
  });

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit" style={{ flexGrow: 1 }}>
          Gemini&apos;s Photo App
        </Typography>

        {loggedInUser && (
          <FormControlLabel
            control={
              <Switch
                checked={advancedFeatures}
                onChange={handleFeatureToggle}
                color="default"
              />
            }
            label="Advanced Features"
            style={{ marginRight: 16 }}
          />
        )}
        
        {loggedInUser ? (
          <>
            <Typography variant="h5" color="inherit" style={{ marginRight: 16 }}>
              {appContext}
            </Typography>
            <Typography variant="h6" color="inherit" style={{ marginRight: 16 }}>
              Hi, {loggedInUser.first_name}
            </Typography>
            <Button
              color="inherit"
              component={Link}
              to="/photos/new"
              style={{ marginRight: 8 }}
            >
              Add Photo
            </Button>
            <Button color="inherit" onClick={() => logoutMutation.mutate()}>
              Logout
            </Button>
          </>
        ) : (
          <Typography variant="h5" color="inherit">
            Please Login
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;