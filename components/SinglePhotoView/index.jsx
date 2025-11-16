import React, { useState, useEffect } from "react";
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
  Button,
  CircularProgress,
} from "@mui/material";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as api from "../../lib/api";
import useAppStore from "../../lib/store";
import AddComment from "../AddComment";

import "./styles.css";

// Helper function
function formatDateTime(isoString) {
  if (!isoString) return "Unknown date";
  return new Date(isoString).toLocaleString("en-US", {
    
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SinglePhotoView() {
  const { userId, photoId } = useParams();
  const navigate = useNavigate();
  const setAppContext = useAppStore((state) => state.setAppContext);

  const [currentIndex, setCurrentIndex] = useState(-1);

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.fetchUser(userId),
  });

  // Fetch photos data
  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['photosOfUser', userId],
    queryFn: () => api.fetchPhotosOfUser(userId),
  });

  // Effect to find the current photo and index
  useEffect(() => {
    if (photos && photos.length > 0) {
      const index = photos.findIndex((p) => p._id === photoId);
      if (index !== -1) {
        setCurrentIndex(index);
        if (user) {
          setAppContext(`Photo ${index + 1} of ${photos.length} by ${user.first_name} ${user.last_name}`);
        }
      } else {
        navigate(`/users/${userId}`); // Invalid photoId
      }
    }
  }, [photos, photoId, user, setAppContext, navigate, userId]);

  if (userLoading || photosLoading || currentIndex === -1) {
    return <CircularProgress />;
  }
  
  const currentPhoto = photos[currentIndex];
  if (!currentPhoto || !user) {
    return <Typography>Loading photo...</Typography>;
  }

  const handleNavigation = (newIndex) => {
    if (newIndex >= 0 && newIndex < photos.length) {
      navigate(`/photos/${userId}/${photos[newIndex]._id}`);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardMedia
            component="img"
            image={`/images/${currentPhoto.file_name}`}
            alt={`Photo by ${user.first_name}`}
            style={{ maxHeight: 600, objectFit: "contain" }}
          />
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button variant="contained" onClick={() => handleNavigation(currentIndex - 1)} disabled={currentIndex === 0}>
                Previous
              </Button>
              <Typography variant="caption" color="textSecondary">
                Posted on: {formatDateTime(currentPhoto.date_time)}
              </Typography>
              <Button variant="contained" onClick={() => handleNavigation(currentIndex + 1)} disabled={currentIndex === photos.length - 1}>
                Next
              </Button>
            </Box>

            <Box mt={2}>
              <Typography variant="h6">Comments:</Typography>
              <List>
                {currentPhoto.comments && currentPhoto.comments.length > 0 ? (
                  currentPhoto.comments.map((comment, index) => (
                    <React.Fragment key={comment._id}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={<Typography>{comment.comment}</Typography>}
                          secondary={( 
                            <>
                              <Typography component="span" variant="body2" color="textPrimary">
                                &mdash;{" "}
                                <Link to={`/users/${comment.user._id}`}>
                                  {comment.user.first_name} {comment.user.last_name}
                                </Link>
                              </Typography>
                              {` on ${formatDateTime(comment.date_time)}`}
                            </>
                          )}
                        />
                      </ListItem>
                      {index < currentPhoto.comments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No comments yet." />
                  </ListItem>
                )}
              </List>
              {/* Add Comment Form */}
              <AddComment photoId={currentPhoto._id} userId={userId} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default SinglePhotoView;