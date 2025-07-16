import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const API_URL = 'https://keeper-app-bakcend-and-db.onrender.com';


function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  console.log("PrivateRoute - User:", user);
  console.log("PrivateRoute - Loading:", loading);

  if (loading) {
    // Optionally, display a loading indicator
    return <LoadingSpinner />;
  }



  console.log("PrivateRoute - Rendering children");

  return user ? children : <Navigate to="/login" />;

}

export default PrivateRoute;
