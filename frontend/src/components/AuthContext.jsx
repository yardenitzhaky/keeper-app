import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = 'https://keeper-backend-kgj9.onrender.com';
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // const login = async (identifier, password, rememberMe) => {
  //   try {
  //     const response = await axios.post(`${API_URL}/login`, { identifier, password, rememberMe }, {withCredentials: true,} );
  //     const user = response.data.user;
  //     console.log("User set in AuthContext:", user);
  //     setUser(user);
  //     return user;
  //   } catch (error) {
  //     console.error("Login failed:", error.response?.data || error.message);
  //     throw error;
  //   }
  // };

  const login = async (identifier, password, rememberMe) => {
    try {
      // Instead of using axios, we'll use fetch for this request
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password, rememberMe }),
        credentials: 'include',
        redirect: 'manual' // This is key: it allows us to handle redirects manually
      });
  
      if (response.type === 'opaqueredirect') {
        // This means a redirect happened, which is what we want
        console.log("Redirect detected, fetching user data");
        // Now fetch the user data
        const userResponse = await axios.get(`${API_URL}/api/user`, { withCredentials: true });
        if (userResponse.data.isAuthenticated) {
          setUser(userResponse.data.user);
          return userResponse.data.user;
        } else {
          throw new Error('Authentication failed after redirect');
        }
      } else {
        // If we don't get a redirect, something went wrong
        throw new Error('Login failed: No redirect occurred');
      }
    } catch (error) {
      console.error("Login failed:", error.message);
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

  // const checkAuthStatus = async () => {
  //   try {
  //     console.log("Checking auth status...");
  //     const response = await axios.get(`${API_URL}/check-session`, { withCredentials: true });
  //     console.log("Auth status check response:", response.data);
  //     if (response.data.isAuthenticated && response.data.user) {
  //       console.log("Setting user:", response.data.user);
  //       setUser(response.data.user);
  //     } else {
  //       console.log("No authenticated user found");
  //       setUser(null);
  //     }
  //   } catch (error) {
  //     console.log("Error checking auth status:", error.response?.data || error.message);
  //     setUser(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user`, { withCredentials: true });
      if (response.data.isAuthenticated) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
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