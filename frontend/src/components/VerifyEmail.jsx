import React, { useState } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useLocation, useNavigate } from "react-router-dom";

function VerifyEmail() {
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    // Redirect to register page if email is not provided
    navigate("/register");
    return null;
  }

  const handleVerification = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/verify-email", {
        email,
        verificationCode,
      });
      setMessage(response.data.message);
      // Optionally redirect to login page after verification
      navigate("/login");
    } catch (error) {
      setMessage(error.response?.data?.message || "Verification failed. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Email Verification</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleVerification}>
        <input
          type="text"
          placeholder="Enter verification code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          required
        />
        <button type="submit">Verify Email</button>
      </form>
    </div>
  );
}

export default VerifyEmail;
