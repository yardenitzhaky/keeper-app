import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useNavigate } from "react-router-dom";


const API_URL = 'https://keeper-backend-kgj9.onrender.com';


export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();


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
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/me`);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);
  

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, checkAuth}}>
      {children}
    </AuthContext.Provider>
  );
}
