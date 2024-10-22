import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;
const API_URL = 'https://keeper-backend-kgj9.onrender.com';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/reset-password/${token}`,
        { password },
        { withCredentials: true }
      );
      setSuccessMessage(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Reset Password Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "An error occurred. Please try again later.";
      setErrors({ server: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      {successMessage && <p className="success-message">{successMessage}</p>}
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default ResetPassword;