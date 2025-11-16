import React, { useState, useEffect } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from "prop-types";
import { Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

import "./styles.css";

function UserDetail({ userId, setAppContext }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3001/user/${userId}`)
      .then((response) => {
        const userData = response.data;
        setUser(userData);
        setAppContext(`${userData.first_name} ${userData.last_name}'s Details`);
      })
      .catch((error) => {
        console.error(`Error fetching user details for ${userId}:`, error);
        setUser(null);
        setAppContext("User not found");
      });
  }, [userId, setAppContext]); // Rerun effect if userId or setAppContext changes

  if (!user) {
    return <Typography>Loading user details...</Typography>;
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
  setAppContext: PropTypes.func.isRequired,
};

export default UserDetail;
