import React, { useEffect } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from "prop-types";
import { Typography, Button, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as api from "../../lib/api";
import { useAppStore } from "../../lib/store";

import "./styles.css";

function UserDetail({ userId }) {
  const setAppContext = useAppStore((state) => state.setAppContext);

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.fetchUser(userId),
  });

  // Effect to update the TopBar context
  useEffect(() => {
    if (user) {
      setAppContext(`${user.first_name} ${user.last_name}'s Details`);
    } else if (isError) {
      setAppContext("User not found");
    }
  }, [user, isError, setAppContext]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  if (!user) {
    return <Typography>User not found</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {user.first_name} {user.last_name}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Location:</strong> {user.location}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Occupation:</strong> {user.occupation}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Description:</strong> {user.description}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to={`/photos/${user._id}`}
        style={{ marginTop: 16 }}
      >
        View Photos
      </Button>
    </div>
  );
}

UserDetail.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default UserDetail;