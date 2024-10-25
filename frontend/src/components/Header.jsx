/**
 * Header Component
 * Displays application header with logo, user profile, and logout functionality
 * @component
 */

import React, { useContext, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Snackbar, Avatar, Tooltip } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import HighlightIcon from "@mui/icons-material/Highlight";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoadingButton from "./LoadingButton";
import LoadingSpinner from "./LoadingSpinner";
import { AuthContext } from "./AuthContext";

// Memoized Alert component
const Alert = memo(React.forwardRef((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
)));

// Memoized Logo component
const Logo = memo(() => (
  <span className="app-title" role="banner">
    <HighlightIcon aria-hidden="true" />
    <span aria-label="Keeper App">Keeper App</span>
  </span>
));

// Memoized UserProfile component
const UserProfile = memo(({ username, email }) => (
  <div className="user-profile" role="complementary" aria-label="User profile">
    <Tooltip title={`${username} (${email})`} arrow>
      <div className="profile-info">
        <Avatar className="user-avatar" aria-hidden="true">
          {username?.[0]?.toUpperCase() || <AccountCircleIcon />}
        </Avatar>
        <span className="username" aria-label={`Logged in as ${username}`}>
          {username}
        </span>
      </div>
    </Tooltip>
  </div>
));

const Header = () => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles user logout process with error handling and notifications
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);
    
    try {
      await logout();
      setNotification({
        open: true,
        message: "Successfully logged out. See you next time!",
        severity: "success"
      });
      setTimeout(() => navigate("/login"), 1500); // Delay navigation to show notification
    } catch (error) {
      console.error("Logout failed:", error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * Handles closing of notification snackbar
   */
  const handleNotificationClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification(prev => ({ ...prev, open: false }));
  };

  /**
   * Gets user-friendly error message based on error type
   */
  const getErrorMessage = (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          return "Session expired. Please log in again.";
        case 403:
          return "You don't have permission to perform this action.";
        case 500:
          return "Server error. Please try again later.";
        default:
          return "An unexpected error occurred. Please try again.";
      }
    }
    if (error.request) {
      return "Network error. Please check your connection.";
    }
    return "Failed to log out. Please try again.";
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <header role="banner" aria-label="Application header">
      <h1>
        <Logo />
      </h1>

      {user && (
        <div className="header-controls" role="navigation">
          <UserProfile 
            username={user.username} 
            email={user.email}
          />

          <LoadingButton
            onClick={handleLogout}
            loading={isLoggingOut}
            className="logout-button"
            disabled={isLoggingOut}
            aria-label={isLoggingOut ? "Logging out..." : "Log out of your account"}
            aria-busy={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </LoadingButton>

          {error && (
            <span 
              className="error-message" 
              role="alert" 
              aria-live="polite"
            >
              {error}
            </span>
          )}
        </div>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </header>
  );
};