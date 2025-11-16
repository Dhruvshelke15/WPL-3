import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, TextField, Box } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../../lib/api";

function AddComment({ photoId, userId }) {
  const [commentText, setCommentText] = useState("");
  const queryClient = useQueryClient();

  const addCommentMutation = useMutation({
    mutationFn: api.addComment,
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['photosOfUser', userId] });
      queryClient.invalidateQueries({ queryKey: ['photo', photoId] });
      setCommentText(""); // Clear input field
    },
    onError: (error) => {
      console.error(`Failed to add comment: ${error.response?.data || error.message}`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim() === "") {
      console.error("Comment cannot be empty.");
      return;
    }
    addCommentMutation.mutate({ photoId, comment: commentText });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}
    >
      <TextField
        label="Add a comment..."
        variant="outlined"
        fullWidth
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={addCommentMutation.isPending}
        sx={{ mt: 1 }}
      >
        {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
      </Button>
    </Box>
  );
}

AddComment.propTypes = {
  photoId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
};

export default AddComment;