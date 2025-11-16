import React from "react";
import {
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as api from "../../lib/api";
import useAppStore from "../../lib/store";

import "./styles.css";

function UserList() {
  const advancedFeatures = useAppStore((state) => state.advancedFeatures);

  // Fetch user list using React Query
  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['users', advancedFeatures], // Re-run query if advancedFeatures changes
    queryFn: () => api.fetchUserList(advancedFeatures),
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Typography color="error">Error fetching users: {error.message}</Typography>;
  }

  return (
    <div>
      <Typography variant="h6" style={{ paddingLeft: 16, paddingTop: 8 }}>
        Users
      </Typography>
      <List component="nav">
        {users && users.map((user) => (
          <React.Fragment key={user._id}>
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
                    label={user.photoCount}
                    color="success"
                    size="small"
                    title={`${user.photoCount} photos`}
                  />
                  <Chip
                    label={user.commentCount}
                    color="error"
                    size="small"
                    title={`${user.commentCount} comments`}
                    component={Link}
                    to={`/commentsOfUser/${user._id}`}
                    onClick={(e) => e.stopPropagation()}
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

export default UserList;