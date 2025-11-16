import React, { useState, useEffect } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from "prop-types";
import {
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

import "./styles.css";

function UserList({ advancedFeatures }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUserList = () => {
      // *** FIX 1: Send query param to server ***
      // If advancedFeatures is on, ask the server for the counts
      const url = advancedFeatures
        ? "http://localhost:3001/user/list?advanced=true"
        : "http://localhost:3001/user/list";

      axios
        .get(url)
        .then((response) => {
          setUsers(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user list:", error);
        });
    };

    fetchUserList();
    const intervalId = setInterval(fetchUserList, 10000); 

    return () => clearInterval(intervalId);
    
  // *** FIX 2: Add advancedFeatures as a dependency ***
  // This tells React to re-run the effect (and fetch new data) when the toggle changes
  }, [advancedFeatures]); 

  return (
    <div>
      <Typography variant="h6" style={{ paddingLeft: 16, paddingTop: 8 }}>
        Users
      </Typography>
      <List component="nav">
        {users.map((user) => (
          <React.Fragment key={user._id}>
            {/* *** FIX 3: Add bubble logic back and fix <a> in <a> warning *** */}
            <ListItemButton
              component={Link}
              to={`/users/${user._id}`}
              divider
            >
              <ListItemText
                primary={`${user.first_name} ${user.last_name}`}
              />
              {/* Only show bubbles if advanced features are on */}
              {advancedFeatures && (
                <Box sx={{ display: "flex", gap: 0.5, zIndex: 1 }}>
                  <Chip
                    // This will now work, but only when advancedFeatures is true
                    label={user.photoCount} 
                    color="success"
                    size="small"
                    title={`${user.photoCount} photos`}
                  />
                  <Chip
                    // This will now work, but only when advancedFeatures is true
                    label={user.commentCount} 
                    color="error"
                    size="small"
                    title={`${user.commentCount} comments`}
                    component={Link}
                    to={`/commentsOfUser/${user._id}`}
                    onClick={(e) => e.stopPropagation()} // Prevents navigating to user detail
                    clickable
                  />
                </Box>
              )}
            </ListItemButton>
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

UserList.propTypes = {
  advancedFeatures: PropTypes.bool.isRequired,
};

export default UserList;