import React, { useState } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;

const API_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:10000' : 'https://keeper-backend-kgj9.onrender.com';


function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/forgot-password`,
        { email },
        { withCredentials: true }
      );
      setMessage(response.data.message);
    } catch (error) {
      console.error("Forgot Password Error:", error.response?.data || error.message);
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleForgotPassword}>
        <input
          type="text"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
}

export default ForgotPassword;
