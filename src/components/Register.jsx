import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      await axios.post("http://localhost:3000/register", {
        username,
        email,
        password,
      }, { withCredentials: true });
      navigate("/login"); // Redirect to login page after registration
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      // Handle server-side errors
      setErrors({ server: error.response?.data || "Registration failed" });
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

  return (
    <div className="auth-container">
      <img src="../logo.PNG" alt="Logo" className="logo" />
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {errors.username && <p className="error">{errors.username}</p>}

        <input
          type="text"
          id="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <input
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

        {/* Server Error */}
        {errors.server && <p className="error">{errors.server}</p>}

        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/Login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
