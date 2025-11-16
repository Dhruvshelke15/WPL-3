import React, { useState, useEffect } from "react";
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
  Button,
} from "@mui/material";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

// Helper function to format date/time strings (from UserPhotos)
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

function SinglePhotoView({ setAppContext }) {
  const { userId, photoId } = useParams();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Effect to fetch user details (for the name in TopBar)
  useEffect(() => {
    axios
      .get(`http://localhost:3001/user/${userId}`)
      .then((response) => {
        const userData = response.data;
        setUser(userData);
      })
      .catch((error) => {
        console.error(`Error fetching user details ${userId}:`, error);
      });
  }, [userId]);

  // Effect to fetch all photos for the user
  useEffect(() => {
    axios
      .get(`http://localhost:3001/photosOfUser/${userId}`)
      .then((response) => {
        setPhotos(response.data);
      })
      .catch((error) => {
        console.error(`Error fetching photos for ${userId}:`, error);
        setPhotos([]);
      });
  }, [userId]);

  // Effect to find the current photo and index when photos or photoId change
  useEffect(() => {
    if (photos.length > 0) {
      const index = photos.findIndex((p) => p._id === photoId);
      if (index !== -1) {
        setCurrentIndex(index);
        setCurrentPhoto(photos[index]);
        if (user) {
          setAppContext(`Photo ${index + 1} of ${photos.length} by ${user.first_name} ${user.last_name}`);
        }
      } else {
        // If photoId is invalid, navigate back to user details
        navigate(`/users/${userId}`);
      }
    }
  }, [photos, photoId, user, setAppContext, navigate, userId]);

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
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                variant="contained"
                onClick={() => handleNavigation(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              <Typography variant="caption" color="textSecondary">
                Posted on: {formatDateTime(currentPhoto.date_time)}
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleNavigation(currentIndex + 1)}
                disabled={currentIndex === photos.length - 1}
              >
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
                      {index < currentPhoto.comments.length - 1 && <Divider />}
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
    </Grid>
  );
}

SinglePhotoView.propTypes = {
  setAppContext: PropTypes.func.isRequired,
};

export default SinglePhotoView;