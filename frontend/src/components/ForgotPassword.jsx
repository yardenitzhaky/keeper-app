import React, { useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const API_URL = 'https://keeper-backend-kgj9.onrender.com';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/forgot-password`,  // Fixed string interpolation
        { email },
        { withCredentials: true }
      );
      setMessage(response.data.message);
    } catch (error) {
      console.error("Forgot Password Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleForgotPassword}>
        <input
          type="text"  // Changed to email type for better validation
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;