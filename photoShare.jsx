import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Typography, Paper } from "@mui/material";
import {
  BrowserRouter,
  Route,
  Routes,
  useParams,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; 

import "./styles/main.css";
// Lib imports
import { useAppStore } from "./lib/store";
// Component imports
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import SinglePhotoView from "./components/SinglePhotoView";
import CommentsOfUser from "./components/CommentsOfUser";
import LoginRegister from "./components/LoginRegister";
import PhotoUpload from "./components/PhotoUpload";

// Create a client
const queryClient = new QueryClient();

// --- Helper Components for Routes ---

function Home() {
  const setAppContext = useAppStore((state) => state.setAppContext);
  useEffect(() => {
    setAppContext("Home");
  }, [setAppContext]);

  return (
    <Typography variant="body1">
      Welcome to your photosharing app! Please select a user from the list to
      see their details and photos.
    </Typography>
  );
}

function UserDetailRoute() {
  const { userId } = useParams();
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute() {
  const { userId } = useParams();
  return <UserPhotos userId={userId} />;
}

function SinglePhotoRoute() {
  return <SinglePhotoView />;
}

function CommentsOfUserRoute() {
  return <CommentsOfUser />;
}

function UserListRoute() {
  const setAppContext = useAppStore((state) => state.setAppContext);
  useEffect(() => {
    setAppContext("User List");
  }, [setAppContext]);
  return <UserList />;
}

// Main App Component 

function PhotoShare() {
  const { loggedInUser, advancedFeatures } = useAppStore();

  // Helper function for protected routes 
  const AdvancedRoute = ({ element }) => {
    if (!advancedFeatures) {
      return <Navigate to="/" />;
    }
    return element;
  };

  return (
    <BrowserRouter basename="/photo-share.html">
      <TopBar />
      <div className="main-topbar-buffer" />
      <Grid container spacing={2}>
        {/* User List only show if logged in */}
        {loggedInUser && (
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserListRoute />
            </Paper>
          </Grid>
        )}

        {/* Main Content Area */}
        <Grid item sm={loggedInUser ? 9 : 12}>
          <Paper className="main-grid-item">
            <Routes>
              {!loggedInUser ? (
                // If NOT logged in, all paths go to LoginRegister
                <Route path="/*" element={<LoginRegister />} />
              ) : (
                // If LOGGED IN, show protected routes
                <>
                  <Route path="/" element={<Home />} />
                  <Route path="/users/:userId" element={<UserDetailRoute />} />
                  <Route path="/photos/:userId" element={<UserPhotosRoute />} />
                  <Route path="/photos/new" element={<PhotoUpload />} />
                  
                  {/* Advanced Feature Routes */}
                  <Route
                    path="/photos/:userId/:photoId"
                    element={<AdvancedRoute element={<SinglePhotoRoute />} />}
                  />
                  <Route
                    path="/commentsOfUser/:userId"
                    element={<AdvancedRoute element={<CommentsOfUserRoute />} />}
                  />
                  
                  {/* Fallback: redirect to home */}
                  <Route path="*" element={<Navigate to="/" />} />
                </>
              )}
            </Routes>
          </Paper>
        </Grid>
      </Grid>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(
  <QueryClientProvider client={queryClient}>
    <PhotoShare />
  </QueryClientProvider>
);