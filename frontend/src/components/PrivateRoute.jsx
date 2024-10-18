import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const API_URL = 'https://keeper-backend-kgj9.onrender.com';


function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // Optionally, display a loading indicator
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to login if the user is not authenticated
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;
