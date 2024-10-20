import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:10000' : 'https://keeper-backend-kgj9.onrender.com';
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (identifier, password, rememberMe) => {
    try {
      const response = await axios.post(`${API_URL}/login`, 
      { identifier, password, rememberMe },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
      const user = response.data.user;
      console.log("User set in AuthContext:", user);
      setUser(user);
      return user;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };





  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {withCredentials: true,} );
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  const handleGoogleAuthSuccess = async () => {
    try {
      const response = await axios.get(`${API_URL}/me`, user, {withCredentials: true,} );
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("Error fetching user after Google auth:", error.response?.data || error.message);
      throw error;
    }
  };

  const checkAuthStatus = async () => {
    try {
      console.log("Checking auth status...");
      const response = await axios.get(`${API_URL}/check-session`, { withCredentials: true });
      console.log("Auth status check response:", response.data);
      if (response.data.isAuthenticated && response.data.user) {
        console.log("Setting user:", response.data.user);
        setUser(response.data.user);
      } else {
        console.log("No authenticated user found");
        setUser(null);
      }
    } catch (error) {
      console.log("Error checking auth status:", error.response?.data || error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, handleGoogleAuthSuccess, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
}