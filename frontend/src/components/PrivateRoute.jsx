import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const API_URL = 'https://keeper-backend-kgj9.onrender.com';


function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  console.log("PrivateRoute - User:", user);
  console.log("PrivateRoute - Loading:", loading);

  if (loading) {
    // Optionally, display a loading indicator
    return <div>Loading...</div>;
  }

  console.log("PrivateRoute - Rendering children");

  return user ? children : <Navigate to="/login" />;

}

export default PrivateRoute;
