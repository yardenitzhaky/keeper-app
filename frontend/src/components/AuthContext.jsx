import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = 'https://keeper-backend-kgj9.onrender.com';
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (identifier, password, rememberMe) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { identifier, password, rememberMe });
      setUser(response.data.user);
      await checkAuthStatus();
      return response.data.user;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  const handleGoogleAuthSuccess = async () => {
    try {
      const response = await axios.get(`${API_URL}/me`);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("Error fetching user after Google auth:", error.response?.data || error.message);
      throw error;
    }
  };

  // Add this function
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/me`);
      console.log("User authenticated:", response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.log("User not authenticated:", error.response?.data || error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, handleGoogleAuthSuccess, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
}