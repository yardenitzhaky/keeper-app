/**
 * ForgotPassword Component
 * Handles password reset requests through email
 * @component
 */

import React, { useState } from "react";
import axios from "axios";

// Configure axios for credentials
axios.defaults.withCredentials = true;

// API Configuration
const API_URL = 'https://keeper-backend-kgj9.onrender.com';

const ForgotPassword = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Form input
  const [email, setEmail] = useState("");
  
  // UI States
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles form submission for password reset request
   * @param {Event} e - Form submission event
   */
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    // Reset UI states
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      // Send password reset request
      const response = await axios.post(
        `${API_URL}/forgot-password`,
        { email },
        { withCredentials: true }
      );

      // Show success message
      setMessage(response.data.message);
      
      // Clear form
      setEmail("");
    } catch (error) {
      console.error("Forgot Password Error:", error.response?.data || error.message);
      
      // Show error message
      setError(
        error.response?.data?.message || 
        "An error occurred. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="auth-container">
      {/* Logo */}
      <img src="/images/logo.PNG" alt="Logo" className="logo" />
      
      {/* Header */}
      <h2>Forgot Password</h2>

      {/* Success/Error Messages */}
      {message && (
        <p className="success-message" role="alert">
          {message}
        </p>
      )}
      
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {/* Password Reset Form */}
      <form onSubmit={handleForgotPassword} noValidate>
        <input
          type="email"
          name="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
          autoComplete="email"
          aria-label="Email address"
          className={error ? 'error-input' : ''}
        />

        <button 
          type="submit" 
          disabled={isLoading || !email.trim()}
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;