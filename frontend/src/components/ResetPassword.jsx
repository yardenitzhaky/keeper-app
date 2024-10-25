/**
 * ResetPassword Component
 * Allows users to reset their password using a reset token
 * @component
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from 'prop-types';
import LoadingButton from "./LoadingButton";

// Configure axios
axios.defaults.withCredentials = true;

// API configuration
const API_URL = 'https://keeper-backend-kgj9.onrender.com';

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const ResetPassword = () => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [status, setStatus] = useState({
    success: "",
    errors: {},
    isLoading: false
  });

  // ============================================================================
  // VALIDATION
  // ============================================================================
  
  /**
   * Validates the password against security requirements
   * @param {string} password - Password to validate
   * @returns {boolean} Is password valid
   */
  const isStrongPassword = (password) => {
    return PASSWORD_REGEX.test(password);
  };

  /**
   * Validates the form input
   * @returns {Object} Validation errors
   */
  const validateForm = () => {
    const errors = {};

    if (!isStrongPassword(formData.password)) {
      errors.password = "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles input changes
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear related errors
    setStatus(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [name]: undefined,
        server: undefined
      }
    }));
  };

  /**
   * Handles form submission
   * @param {React.FormEvent} e - Form event
   */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setStatus(prev => ({
        ...prev,
        errors: validationErrors
      }));
      return;
    }

    // Reset state
    setStatus(prev => ({
      ...prev,
      isLoading: true,
      errors: {}
    }));

    try {
      const response = await axios.post(
        `${API_URL}/reset-password/${token}`,
        { password: formData.password },
        { withCredentials: true }
      );

      setStatus(prev => ({
        ...prev,
        success: response.data.message
      }));

      // Redirect after success
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      console.error("Reset Password Error:", error.response?.data || error.message);
      
      setStatus(prev => ({
        ...prev,
        errors: {
          server: error.response?.data?.message || "An error occurred. Please try again later."
        }
      }));
    } finally {
      setStatus(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="auth-container" role="main" aria-labelledby="reset-password-title">
      <h2 id="reset-password-title">Reset Password</h2>
      
      {status.success ? (
        <p 
          className="success-message" 
          role="alert"
        >
          {status.success}
        </p>
      ) : (
        <form onSubmit={handleResetPassword} noValidate>
          <div className="form-field">
            <input
              type="password"
              name="password"
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleInputChange}
              required
              aria-label="New password"
              aria-invalid={!!status.errors.password}
              aria-describedby={status.errors.password ? "password-error" : undefined}
            />
            {status.errors.password && (
              <p 
                id="password-error" 
                className="error" 
                role="alert"
              >
                {status.errors.password}
              </p>
            )}
          </div>

          <div className="form-field">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              aria-label="Confirm new password"
              aria-invalid={!!status.errors.confirmPassword}
              aria-describedby={status.errors.confirmPassword ? "confirm-password-error" : undefined}
            />
            {status.errors.confirmPassword && (
              <p 
                id="confirm-password-error" 
                className="error" 
                role="alert"
              >
                {status.errors.confirmPassword}
              </p>
            )}
          </div>

          {status.errors.server && (
            <p 
              className="error server-error" 
              role="alert"
            >
              {status.errors.server}
            </p>
          )}

          <LoadingButton
            type="submit"
            loading={status.isLoading}
            className="w-full p-3 bg-[#f5ba13] text-white rounded hover:bg-[#e0a800] disabled:opacity-70"
            disabled={status.isLoading}
            aria-label={status.isLoading ? "Resetting password..." : "Reset password"}
          >
            {status.isLoading ? "Resetting..." : "Reset Password"}
          </LoadingButton>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;