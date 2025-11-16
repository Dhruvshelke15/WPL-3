import React, { useState, useEffect } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from "react-dom/client";
import { Grid, Typography, Paper } from "@mui/material";
import {
  BrowserRouter,
  Route,
  Routes,
  useParams,
  Navigate,
} from "react-router-dom";

import "./styles/main.css";
// Remove mock setup for Project 2
// import "./lib/mockSetup.js"; 
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
// Import new components
import SinglePhotoView from "./components/SinglePhotoView";
import CommentsOfUser from "./components/CommentsOfUser";

// Helper component to set context for Home
function Home({ setAppContext }) {
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

// Helper component to pass props and set context for UserDetail
function UserDetailRoute({ setAppContext }) {
  const { userId } = useParams();
  return <UserDetail userId={userId} setAppContext={setAppContext} />;
}

// Helper component to pass props and set context for UserPhotos
function UserPhotosRoute({ setAppContext, advancedFeatures }) {
  const { userId } = useParams();
  return (
    <UserPhotos
      userId={userId}
      setAppContext={setAppContext}
      advancedFeatures={advancedFeatures}
    />
  );
}

// Helper component for SinglePhotoView
function SinglePhotoRoute({ setAppContext }) {
  return <SinglePhotoView setAppContext={setAppContext} />;
}

// Helper component for CommentsOfUser
function CommentsOfUserRoute({ setAppContext }) {
  return <CommentsOfUser setAppContext={setAppContext} />;
}

// Helper component to set context for UserList
function UserListRoute({ setAppContext, advancedFeatures }) {
  useEffect(() => {
    setAppContext("User List");
  }, [setAppContext]);
  return <UserList advancedFeatures={advancedFeatures} />;
}

function PhotoShare() {
  const [appContext, setAppContext] = useState("Home");
  const [advancedFeatures, setAdvancedFeatures] = useState(false);

  return (
    <BrowserRouter basename="/photo-share.html">
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar
              appContext={appContext}
              advancedFeatures={advancedFeatures}
              setAdvancedFeatures={setAdvancedFeatures}
            />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserListRoute
                setAppContext={setAppContext}
                advancedFeatures={advancedFeatures}
              />
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                <Route
                  path="/"
                  element={<Home setAppContext={setAppContext} />}
                />
                <Route
                  path="/users/:userId"
                  element={<UserDetailRoute setAppContext={setAppContext} />}
                />
                <Route
                  path="/photos/:userId"
                  element={(
                    <UserPhotosRoute
                      setAppContext={setAppContext}
                      advancedFeatures={advancedFeatures}
                    />
                  )}
                />
                {/* proj 2 update*/}
                <Route
                  path="/photos/:userId/:photoId"
                  element={
                    advancedFeatures ? (
                      <SinglePhotoRoute setAppContext={setAppContext} />
                    ) : (
                      <Navigate to="/users" /> // Redirect if advanced features are off
                    )
                  }
                />
                {/* proj 2 new routes*/}
                <Route
                  path="/commentsOfUser/:userId"
                  element={
                    advancedFeatures ? (
                      <CommentsOfUserRoute setAppContext={setAppContext} />
                    ) : (
                      <Navigate to="/users" /> // Redirect if advanced features are off
                    )
                  }
                />
                <Route
                  path="/users"
                  element={(
                    <UserListRoute
                      setAppContext={setAppContext}
                      advancedFeatures={advancedFeatures}
                    />
                  )}
                />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);