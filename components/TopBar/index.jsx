import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from "prop-types";

import "./styles.css";

function TopBar({ appContext, advancedFeatures, setAdvancedFeatures }) {
  const handleFeatureToggle = (event) => {
    setAdvancedFeatures(event.target.checked);
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit" style={{ flexGrow: 1 }}>
          Gemini&apos;s Photo App
        </Typography>

        <FormControlLabel
          control={(
            <Switch
              checked={advancedFeatures}
              onChange={handleFeatureToggle}
              color="default"
            />
          )}
          label="Enable Advanced Features"
          style={{ marginRight: 16 }}
        />

        <Typography variant="h5" color="inherit">
          {appContext}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

TopBar.propTypes = {
  appContext: PropTypes.string.isRequired,
  advancedFeatures: PropTypes.bool.isRequired,
  setAdvancedFeatures: PropTypes.func.isRequired,
};

export default TopBar;