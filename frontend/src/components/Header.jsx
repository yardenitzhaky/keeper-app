import React, { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import HighlightIcon from "@mui/icons-material/Highlight";
import LoadingButton from "./LoadingButton";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Header Component
 * Displays application header with logo and logout functionality
 */
const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handles the logout process
   */

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header>
      <h1>
        <span className="app-title">
          <HighlightIcon />
          Keeper App
        </span>
      </h1>
      {user && (
        <>
          <LoadingButton
            onClick={handleLogout}
            loading={isLoggingOut}
            className="logout-button"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </LoadingButton>
          {error && (
            <span className="error-message" role="alert">
              {error}
            </span>
          )}
        </>
      )}
    </header>
  );
};

export default Header;