import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Configure axios to include credentials in requests
axios.defaults.withCredentials = true;

// API endpoint
const API_URL = 'https://keeper-app-bakcend-and-db.onrender.com';

// Create context for authentication
export const AuthContext = createContext();

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth-related functions to children
 */
export function AuthProvider({ children }) {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    const [user, setUser] = useState(null);        // Current user data
    const [loading, setLoading] = useState(true);  // Loading state for auth checks

    // ============================================================================
    // AUTHENTICATION FUNCTIONS
    // ============================================================================

    /**
     * Handles user login with email/username and password
     * @param {string} identifier - Username or email
     * @param {string} password - User password
     * @param {boolean} rememberMe - Whether to persist session
     * @returns {Object} Logged in user data
     */
    const login = async (identifier, password, rememberMe) => {
        try {
            const response = await axios.post(
                `${API_URL}/login`,
                { identifier, password, rememberMe },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
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

    /**
     * Handles user logout
     * Clears user session and local state
     */
    const logout = async () => {
        try {
            await axios.post(
                `${API_URL}/logout`, 
                {}, 
                { withCredentials: true }
            );
            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error.response?.data || error.message);
        }
    };

    /**
     * Handles successful Google OAuth authentication
     * Fetches and sets user data after Google auth
     * @returns {Object} Authenticated user data
     */
    const handleGoogleAuthSuccess = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/me`,
                { withCredentials: true }
            );
            setUser(response.data.user);
            return response.data.user;
        } catch (error) {
            console.error("Error fetching user after Google auth:", error.response?.data || error.message);
            throw error;
        }
    };

    /**
     * Checks current authentication status
     * Used to restore user session on page reload/revisit
     */
    const checkAuthStatus = async () => {
        try {
            console.log("Checking auth status...");
            const response = await axios.get(
                `${API_URL}/check-session`,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

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

    // ============================================================================
    // CONTEXT PROVIDER
    // ============================================================================
    
    return (
        <AuthContext.Provider 
            value={{ 
                // State
                user, 
                setUser, 
                loading,
                
                // Authentication functions
                login,
                logout,
                handleGoogleAuthSuccess,
                checkAuthStatus
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}