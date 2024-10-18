import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;

const API_URL = 'https://keeper-backend-kgj9.onrender.com';


export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const login = async (identifier, password, rememberMe) => {
    try {
      const response = await axios.post(
        "${API_URL}/login",
        { identifier, password, rememberMe },
        { withCredentials: true }
      );
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "${API_URL}/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  const handleGoogleAuthSuccess = async () => {
    try {
      const response = await axios.get("${API_URL}/me", { withCredentials: true });
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user after Google auth:", error);
    }
  };

  useEffect(() => {
    console.log("Checking authentication status...");  // Add this log to check if useEffect runs
  
    axios
      .get("${API_URL}/me", { withCredentials: true })  // Add withCredentials to include session cookies
      .then((response) => {
        console.log("User authenticated:", response.data.user);  // Log the user data
        setUser(response.data.user); // Set the user state
      })
      .catch((error) => {
        console.log("User not authenticated:", error.response?.data || error.message);  // Log the error
        setUser(null); // Set user to null if not authenticated
      })
      .finally(() => {
        setLoading(false); // Loading state is complete
      });
  }, []);
  

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, handleGoogleAuthSuccess }}>
      {children}
    </AuthContext.Provider>
  );
}
