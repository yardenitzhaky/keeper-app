import React from "react";
import { Navigate } from "react-router-dom";
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

  console.log("PrivateRoute - User:", user);


  if (!user) {
    console.log("PrivateRoute - Redirecting to login");

    // Redirect to login if the user is not authenticated
    return <Navigate to="/login" />;
  }
  console.log("PrivateRoute - Rendering children");

  return children;
}

export default PrivateRoute;
