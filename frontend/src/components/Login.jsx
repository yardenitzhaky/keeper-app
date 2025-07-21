
// export default Login;

import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import LoadingButton from "./LoadingButton";
import LoadingSpinner from "./LoadingSpinner";

// Configure axios defaults
axios.defaults.withCredentials = true;

// Constants
const API_URL = 'https://keeper-app-bakcend-and-db.onrender.com';

/**
 * Login Component
 * Handles user authentication through email/username or Google OAuth
 * @component
 */
function Login() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Form state
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    login, 
    handleGoogleAuthSuccess, 
    user, 
    checkAuthStatus 
  } = useContext(AuthContext);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Handle Google OAuth redirect
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const googleAuth = queryParams.get('google_auth');
    
    if (googleAuth === 'success') {
      handleGoogleAuthSuccess()
        .then(() => navigate('/notes'))
        .catch(error => {
          console.error("Google auth error:", error);
          setErrors({ 
            server: "Failed to authenticate with Google. Please try again." 
          });
        });
    }
  }, [location, handleGoogleAuthSuccess, navigate]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handles input field changes
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear related error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Validates form inputs
   * @returns {Object} Validation errors
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Username or email is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  /**
   * Handles form submission
   * @param {React.FormEvent} e - Form event
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const loggedInUser = await login(
        formData.identifier, 
        formData.password, 
        formData.rememberMe
      );
      navigate("/");
    } catch (error) {
      setErrors({
        server: error.response?.data?.message || 
                error.response?.data || 
                error.message || 
                'Login failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initiates Google OAuth flow
   * @param {React.MouseEvent} e - Click event
   */
  const handleGoogleSignIn = (e) => {
    e.preventDefault();
    window.location.href = `${API_URL}/auth/google`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="auth-container">
      <img src={`${process.env.PUBLIC_URL}/images/logo.PNG`} alt="App Logo"  className="logo" />
      <h2>Login</h2>
      
      <form onSubmit={handleLogin} noValidate>
        {/* Username/Email Input */}
        <div className="form-group">
          <input
            type="text"
            id="identifier"
            name="identifier"
            placeholder="Username or Email"
            value={formData.identifier}
            onChange={handleInputChange}
            aria-label="Username or Email"
            aria-invalid={errors.identifier ? "true" : "false"}
            required
          />
          {errors.identifier && (
            <p className="error" role="alert">{errors.identifier}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="form-group">
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            aria-label="Password"
            aria-invalid={errors.password ? "true" : "false"}
            required
          />
          {errors.password && (
            <p className="error" role="alert">{errors.password}</p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <label className="remember-me">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
          />
          <span>Remember Me</span>
        </label>

        {/* Server Error Message */}
        {errors.server && (
          <p className="error server-error" role="alert">
            {errors.server}
          </p>
        )}

        {/* Login Button */}
        <LoadingButton
          loading={isLoading}
          type="submit"
          className="w-full p-3 bg-[#f5ba13] text-white rounded hover:bg-[#e0a800] disabled:opacity-70"
          aria-label={isLoading ? "Logging in..." : "Login"}
        >
          Login
        </LoadingButton>
      </form>

      {/* Google Sign In */}
      <LoadingButton 
        onClick={handleGoogleSignIn} 
        className="social-login-button"
        aria-label="Sign in with Google"
      >
        <img src={`${process.env.PUBLIC_URL}/images/google_logo.png`} alt="Google"  aria-hidden="true" />
        <span>Sign in with Google</span>
      </LoadingButton>

      {/* Links */}
      <div className="auth-links">
        <p>
          Don't have an account? <Link to="/Register">Register here</Link>
        </p>
        <p>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;