import React, { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import HighlightIcon from "@mui/icons-material/Highlight";
import LoadingButton from "./LoadingButton";

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
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
          loading={isLoading}
          className="logout-button"
          variant="contained"
          color="primary"
        >
          Logout
        </LoadingButton>
      )}
    </header>
  );
}

export default Header;