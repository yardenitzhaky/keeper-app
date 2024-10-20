import React, { useState } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useParams, useNavigate } from "react-router-dom";

const API_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:10000' : 'https://keeper-backend-kgj9.onrender.com';


function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate passwords
    const validationErrors = {};

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    // Optional: Add client-side password strength validation here
    // For example, you can use a regex or a library like validator.js

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/reset-password/${token}`,
        { password },
        { withCredentials: true }
      );
      setSuccessMessage(response.data.message);
      // Optionally redirect to login page after a delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset Password Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "An error occurred. Please try again later.";
      setErrors({ server: errorMessage });
    }
  };

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      {successMessage && <p>{successMessage}</p>}
      {!successMessage && (
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <input
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

          {errors.server && <p className="error">{errors.server}</p>}

          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
}

export default ResetPassword;
