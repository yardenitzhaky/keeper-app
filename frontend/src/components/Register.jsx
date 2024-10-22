import React, { useState, useEffect } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useNavigate, Link } from "react-router-dom";
import LoadingButton from "./LoadingButton";

const API_URL = 'https://keeper-backend-kgj9.onrender.com';


function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
      }, { withCredentials: true });
      navigate("/verify-email", { state: { email } });
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      
      if (error.response?.status === 409) {
        // Handle conflict errors (username/email already exists)
        const { field, message } = error.response.data;
        setErrors(prev => ({
          ...prev,
          [field]: message
        }));
      } else if (error.response?.data?.message) {
        // Handle other specific error messages from the server
        setErrors(prev => ({
          ...prev,
          server: error.response.data.message
        }));
      } else {
        // Handle generic errors
        setErrors(prev => ({
          ...prev,
          server: "Registration failed. Please try again later."
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };


  const validateForm = () => {
    const errors = {};

    // Username validation
    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (!isStrongPassword(password)) {
      errors.password =
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character";
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const isStrongPassword = (password) => {
    // Regular expression for strong password
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleInputChange = (field, value) => {
    // Update the field value
    switch (field) {
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }

    // Clear the specific error when user types
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      delete newErrors.server;
      return newErrors;
    });
};

return (
  <div className="auth-container">
    <img src="/images/logo.PNG" alt="Logo" className="logo" />
    <h2>Register</h2>
    <form onSubmit={handleRegister}>
      <input
        type="text"
        id="username"
        name="username"
        placeholder="Username"
        value={username}
        onChange={(e) => handleInputChange('username', e.target.value)}
        required
      />
      {errors.username && <p className="error">{errors.username}</p>}

      <input
        type="text"
        id="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        required
      />
      {errors.email && <p className="error">{errors.email}</p>}

      <input
        type="password"
        id="password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        required
      />
      {errors.password && <p className="error">{errors.password}</p>}

      <input
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
        required
      />
      {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

      {/* Server Error */}
      {errors.server && <p className="error">{errors.server}</p>}

      <LoadingButton
        onClick={(e) => {
          e.preventDefault();
          handleRegister(e);
        }}
        loading={isLoading}
        className="w-full p-3 bg-[#f5ba13] text-white rounded hover:bg-[#e0a800] disabled:opacity-70"
      >
        Register
      </LoadingButton>
    </form>
    <p>
      Already have an account? <Link to="/Login">Login here</Link>
    </p>
  </div>
);
}


export default Register;
