import React, { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import HighlightIcon from "@mui/icons-material/Highlight";

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        <LoadingButton
          onClick={handleLogout}
          loading={isLoggingOut}
          className="logout-button"
        >
          Logout
        </LoadingButton>
      )}
    </header>
  );
}

export default Header;
