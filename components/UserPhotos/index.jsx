import React, { useState, useEffect } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from "prop-types";
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Box,
} from "@mui/material";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";

import "./styles.css";

// Helper function to format date/time strings
function formatDateTime(isoString) {
  if (!isoString) return "Unknown date";
  try {
    return new Date(isoString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.warn(`Could not parse date: ${isoString}`);
    return isoString;
  }
}

function UserPhotos({ userId, setAppContext, advancedFeatures }) {
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effect to fetch user details (for the name in TopBar)
  useEffect(() => {
    axios
      .get(`http://localhost:3001/user/${userId}`)
      .then((response) => {
        const userData = response.data;
        setUser(userData);
        if (!advancedFeatures) {
          setAppContext(`Photos of ${userData.first_name} ${userData.last_name}`);
        }
      })
      .catch((error) => {
        console.error(
          `Error fetching user details for photos page ${userId}:`,
          error
        );
        setAppContext("User not found");
      });
  }, [userId, setAppContext, advancedFeatures]);

  // Effect to fetch photos
  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:3001/photosOfUser/${userId}`)
      .then((response) => {
        setPhotos(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(`Error fetching photos for ${userId}:`, error);
        setPhotos([]);
        setLoading(false);
      });
  }, [userId]);

  if (loading || !user) {
    return <Typography>Loading user data...</Typography>;
  }

  // Part 2: Advanced Features Redirect
  if (advancedFeatures) {
    if (photos.length > 0) {
      // Redirect to the first photo in the stepper view
      return <Navigate to={`/photos/${userId}/${photos[0]._id}`} replace />;
    }
    return (
      <Typography variant="body1">
        This user has not posted any photos yet.
      </Typography>
    );
  }

  // Original list view (if advanced features are off)
  if (photos.length === 0) {
    return (
      <Typography variant="body1">
        This user has not posted any photos yet.
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {photos.map((photo) => (
        <Grid item xs={12} key={photo._id}>
          <Card>
            <CardMedia
              component="img"
              image={`/images/${photo.file_name}`}
              alt={`Photo by ${user.first_name}`}
              style={{ maxHeight: 600, objectFit: "contain" }}
            />
            <CardContent>
              <Typography variant="caption" color="textSecondary">
                Posted on: {formatDateTime(photo.date_time)}
              </Typography>
              <Box mt={2}>
                <Typography variant="h6">Comments:</Typography>
                <List>
                  {photo.comments && photo.comments.length > 0 ? (
                    photo.comments.map((comment, index) => (
                      <React.Fragment key={comment._id}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={<Typography>{comment.comment}</Typography>}
                            secondary={(
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textPrimary"
                                >
                                  &mdash;{" "}
                                  <Link to={`/users/${comment.user._id}`}>
                                    {comment.user.first_name}{" "}
                                    {comment.user.last_name}
                                  </Link>
                                </Typography>
                                {` on ${formatDateTime(comment.date_time)}`}
                              </>
                            )}
                          />
                        </ListItem>
                        {index < photo.comments.length - 1 && <Divider />}
                      </React.Fragment>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No comments yet." />
                    </ListItem>
                  )}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

UserPhotos.propTypes = {
  userId: PropTypes.string.isRequired,
  setAppContext: PropTypes.func.isRequired,
  advancedFeatures: PropTypes.bool.isRequired,
};

export default UserPhotos;