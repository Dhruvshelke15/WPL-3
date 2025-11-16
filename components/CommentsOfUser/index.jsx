import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Typography,
  List,
  ListItemText,
  Paper,
  Grid,
  Avatar,
  Box,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
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

function CommentsOfUser({ setAppContext }) {
  const { userId } = useParams();
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user details
    axios
      .get(`http://localhost:3001/user/${userId}`)
      .then((response) => {
        const userData = response.data;
        setUser(userData);
        setAppContext(`Comments by ${userData.first_name} ${userData.last_name}`);
      })
      .catch((error) => {
        console.error(`Error fetching user details for ${userId}:`, error);
        setAppContext("User not found");
      });

    // Fetch user's comments
    axios
      .get(`http://localhost:3001/commentsOfUser/${userId}`)
      .then((response) => {
        setComments(response.data);
      })
      .catch((error) => {
        console.error(`Error fetching comments for ${userId}:`, error);
      });
  }, [userId, setAppContext]);

  if (!user) {
    return <Typography>Loading user data...</Typography>;
  }

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        All comments by {user.first_name} {user.last_name}
      </Typography>
      {comments.length === 0 ? (
        <Typography>This user has not made any comments yet.</Typography>
      ) : (
        <List>
          {comments.map((comment) => (
            <Paper
              key={comment._id}
              elevation={2}
              style={{ marginBottom: 16, padding: 16 }}
            >
              <Grid container wrap="nowrap" spacing={2}>
                <Grid item>
                  <Link
                    to={`/photos/${comment.photo_owner_id}/${comment.photo_id}`}
                  >
                    <Avatar
                      variant="square"
                      src={`/images/${comment.photo_file_name}`}
                      className="comments-thumbnail"
                    />
                  </Link>
                </Grid>
                <Grid item xs>
                  <ListItemText
                    primary={(
                      <Typography>
                        &quot;{comment.comment_text}&quot;
                      </Typography>
                    )}
                    secondary={(
                      <Box>
                        <Typography variant="caption" display="block">
                          Commented on: {formatDateTime(comment.date_time)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          <Link
                            to={`/photos/${comment.photo_owner_id}/${comment.photo_id}`}
                          >
                            View original photo
                          </Link>
                        </Typography>
                      </Box>
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </List>
      )}
    </div>
  );
}

CommentsOfUser.propTypes = {
  setAppContext: PropTypes.func.isRequired,
};

export default CommentsOfUser;