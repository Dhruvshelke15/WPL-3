import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Box,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as api from "../../lib/api";
import useAppStore from "../../lib/store";

function PhotoUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const { loggedInUser, setAppContext } = useAppStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  React.useEffect(() => {
    setAppContext("Upload Photo");
  }, [setAppContext]);

  const uploadMutation = useMutation({
    mutationFn: api.uploadPhoto,
    onSuccess: () => {
      console.log("Photo uploaded successfully!");
      // Invalidate user's photos query
      queryClient.invalidateQueries({ queryKey: ['photosOfUser', loggedInUser._id] });
      // Navigate to the user's photo page
      navigate(`/photos/${loggedInUser._id}`);
    },
    onError: (error) => {
      console.error(`Upload failed: ${error.response?.data || error.message}`);
    },
  });

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      console.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    const uniquePhotoName = "p" + String(new Date().valueOf()) + ".jpg";

    formData.append('uploadedphoto', selectedFile, uniquePhotoName);
    
    uploadMutation.mutate(formData);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: 24, marginTop: 32 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Upload New Photo
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            type="file"
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
            onChange={handleFileChange}
            required
            inputProps={{ accept: "image/*" }} // Only accept images
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={uploadMutation.isPending || !selectedFile}
            sx={{ mt: 2 }}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default PhotoUpload;