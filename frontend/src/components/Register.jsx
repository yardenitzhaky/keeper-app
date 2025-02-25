/**
 * Register Component
 * Handles user registration with form validation and error handling
 * @component
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingButton from "./LoadingButton";
import PropTypes from 'prop-types';

// Configure axios
axios.defaults.withCredentials = true;

// API configuration
const API_URL = 'https://keeper-backend-kgj9.onrender.com';

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

/**
 * Form field configuration
 * Defines validation rules and error messages for each field
 */
const FORM_FIELDS = {
  username: {
    type: 'text',
    placeholder: 'Username',
    validate: (value) => {
      if (!value.trim()) return "Username is required";
      if (value.length < 3) return "Username must be at least 3 characters";
      return null;
    }
  },
  email: {
    type: 'email',
    placeholder: 'Email',
    validate: (value) => {
      if (!value.trim()) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid";
      return null;
    }
  },
  password: {
    type: 'password',
    placeholder: 'Password',
    validate: (value) => {
      if (!value) return "Password is required";
      if (!PASSWORD_REGEX.test(value)) return "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character";
      return null;
    }
  },
  confirmPassword: {
    type: 'password',
    placeholder: 'Confirm Password',
    validate: (value, formData) => {
      if (value !== formData.password) return "Passwords do not match";
      return null;
    }
  }
};

function Register() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ============================================================================
  // FORM VALIDATION
  // ============================================================================
  
  /**
   * Validates all form fields
   * @returns {Object} Validation errors
   */
  const validateForm = () => {
    const validationErrors = {};
    
    Object.entries(FORM_FIELDS).forEach(([field, config]) => {
      const error = config.validate(formData[field], formData);
      if (error) validationErrors[field] = error;
    });

    return validationErrors;
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles input field changes
   * @param {string} field - Field name
   * @param {string} value - New field value
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    setErrors(prev => {
      const { [field]: removed, server: removedServer, ...rest } = prev;
      return rest;
    });
  };

  /**
   * Handles form submission
   * @param {Event} e - Form submit event
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${API_URL}/register`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      handleRegistrationError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles registration error responses
   * @param {Error} error - Error object
   */
  const handleRegistrationError = (error) => {
    if (error.response?.status === 409) {
      const { field, message } = error.response.data;
      setErrors(prev => ({ ...prev, [field]: message }));
    } else if (error.response?.data?.message) {
      setErrors(prev => ({ ...prev, server: error.response.data.message }));
    } else {
      setErrors(prev => ({
        ...prev,
        server: "Registration failed. Please try again later."
      }));
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="auth-container" role="main" aria-labelledby="register-title">
      <img src="%PUBLIC_URL%/images/logo.PNG" alt="Application logo" className="logo" />
      <h2 id="register-title">Register</h2>
      
      <form onSubmit={handleRegister} noValidate>
        {Object.entries(FORM_FIELDS).map(([field, config]) => (
          <div key={field} className="form-field">
            <input
              type={config.type}
              id={field}
              name={field}
              placeholder={config.placeholder}
              value={formData[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              aria-invalid={!!errors[field]}
              aria-describedby={errors[field] ? `${field}-error` : undefined}
              required
            />
            {errors[field] && (
              <p 
                className="error" 
                id={`${field}-error`}
                role="alert"
              >
                {errors[field]}
              </p>
            )}
          </div>
        ))}

        {errors.server && (
          <p 
            className="error server-error" 
            role="alert"
          >
            {errors.server}
          </p>
        )}

        <LoadingButton
          onClick={handleRegister}
          loading={isLoading}
          className="w-full p-3 bg-[#f5ba13] text-white rounded hover:bg-[#e0a800] disabled:opacity-70"
          aria-label={isLoading ? "Registering..." : "Register"}
        >
          Register
        </LoadingButton>
      </form>

      <p className="auth-link">
        Already have an account?{' '}
        <Link to="/Login" className="link">
          Login here
        </Link>
      </p>
    </div>
  );
}

export default Register;