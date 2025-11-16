import React, { useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as api from "../../lib/api";
import { useAppStore } from "../../lib/store";
import AddComment from "../AddComment"; 

import "./styles.css";

// Helper function
function formatDateTime(isoString) {
  if (!isoString) return "Unknown date";
  return new Date(isoString).toLocaleString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function UserPhotos({ userId }) {
  const { advancedFeatures, setAppContext } = useAppStore();

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.fetchUser(userId),
  });

  // Fetch photos data
  const { data: photos, isLoading: photosLoading, isError } = useQuery({
    queryKey: ['photosOfUser', userId],
    queryFn: () => api.fetchPhotosOfUser(userId),
  });

  // Effect to update TopBar context
  useEffect(() => {
    if (user && !advancedFeatures) {
      setAppContext(`Photos of ${user.first_name} ${user.last_name}`);
    } else if (!user && !userLoading) {
      setAppContext("User not found");
    }
  }, [user, userLoading, advancedFeatures, setAppContext]);

  if (userLoading || photosLoading) {
    return <CircularProgress />;
  }

  if (isError || !user) {
    return <Typography>User or photos not found.</Typography>;
  }

  // Advanced Features Redirect
  if (advancedFeatures) {
    if (photos && photos.length > 0) {
      // redirect to the first photo in the stepper view
      return <Navigate to={`/photos/${userId}/${photos[0]._id}`} replace />;
    }
    return <Typography variant="body1">This user has not posted any photos.</Typography>;
  }

  // Original list view (if advanced features are off)
  if (!photos || photos.length === 0) {
    return <Typography variant="body1">This user has not posted any photos.</Typography>;
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
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="textPrimary">
                                  &mdash;{" "}
                                  <Link to={`/users/${comment.user._id}`}>
                                    {comment.user.first_name} {comment.user.last_name}
                                  </Link>
                                </Typography>
                                {` on ${formatDateTime(comment.date_time)}`}
                              </>
                            }
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
                {/* Add Comment Form */}
                <AddComment photoId={photo._id} userId={userId} />
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
};

export default UserPhotos;