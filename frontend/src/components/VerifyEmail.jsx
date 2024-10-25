/**
 * VerifyEmail Component
 * Handles email verification process using a verification code
 * @component
 */

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingButton from "./LoadingButton";

// Configure axios
axios.defaults.withCredentials = true;

// API configuration 
const API_URL = 'https://keeper-backend-kgj9.onrender.com';

function VerifyEmail() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const [formState, setFormState] = useState({
    verificationCode: "",
    message: "",
    isLoading: false,
    error: "",
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles verification code input changes
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
   */
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    setFormState(prev => ({
      ...prev,
      verificationCode: value,
      error: "" // Clear error on input change
    }));
  };

  /**
   * Handles form submission for email verification
   * @param {React.FormEvent} e - Form submission event
   */
  const handleVerification = async (e) => {
    e.preventDefault();
    
    setFormState(prev => ({
      ...prev,
      isLoading: true,
      error: "",
      message: ""
    }));

    try {
      const response = await axios.post(`${API_URL}/verify-email`, {
        email,
        verificationCode: formState.verificationCode,
        withCredentials: true,
      });

      setFormState(prev => ({
        ...prev,
        message: response.data.message,
        isLoading: false
      }));

      // Redirect to login page after successful verification
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        error: error.response?.data?.message || "Verification failed. Please try again.",
        isLoading: false
      }));
    }
  };

  // Return null if no email is present (redirect will handle it)
  if (!email) return null;

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div 
      className="auth-container"
      role="main"
      aria-labelledby="verify-email-title"
    >
      <h2 id="verify-email-title">Email Verification</h2>
      
      {/* Status Messages */}
      {formState.message && (
        <p 
          className="success-message"
          role="alert"
        >
          {formState.message}
        </p>
      )}
      
      {formState.error && (
        <p 
          className="error-message"
          role="alert"
        >
          {formState.error}
        </p>
      )}

      {/* Verification Form */}
      <form 
        onSubmit={handleVerification}
        className="verification-form"
        noValidate
      >
        <div className="input-group">
          <label htmlFor="verification-code" className="sr-only">
            Verification Code
          </label>
          <input
            id="verification-code"
            type="text"
            placeholder="Enter verification code"
            value={formState.verificationCode}
            onChange={handleCodeChange}
            maxLength={5}
            pattern="[0-9]*"
            required
            aria-label="Enter verification code"
            aria-invalid={!!formState.error}
            aria-describedby={formState.error ? "error-message" : undefined}
          />
        </div>

        <LoadingButton
          type="submit"
          loading={formState.isLoading}
          disabled={!formState.verificationCode || formState.isLoading}
          className="verify-button"
        >
          {formState.isLoading ? "Verifying..." : "Verify Email"}
        </LoadingButton>
      </form>
    </div>
  );
}

export default VerifyEmail;