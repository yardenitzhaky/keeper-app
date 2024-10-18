import React, { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useNavigate, Link } from "react-router-dom";

const API_URL = 'https://keeper-backend-kgj9.onrender.com';



function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { login, handleGoogleAuthSuccess } = useContext(AuthContext);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const googleAuth = queryParams.get('google_auth');

    if (googleAuth === 'success') {
      handleGoogleAuthSuccess();
      navigate('/'); // or wherever you want to redirect after successful login
    }
  }, [location, handleGoogleAuthSuccess, navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log("Login attempt started for user:", identifier, "and the remember me status is:", rememberMe);
    try {
      await login(identifier, password, rememberMe);
      console.log("User logged in successfully");
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      // Inside the catch block
      setErrors({
        server:
          error.response?.data.message ||
          error.response?.data ||
          error.message ||
          'Login failed',
  });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Identifier validation
    if (!identifier.trim()) {
      errors.identifier = "Username or email is required";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    }

    return errors;
  };

const handleGoogleSignIn = (e) => {
    e.preventDefault();
    window.location.href = `${API_URL}/auth/google`;
  };

  

  return (
    <div className="auth-container">
      <img src="/images/logo.PNG" alt="Logo" className="logo" />
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          id="identifier"
          name="identifier"
          placeholder="Username or Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        {errors.identifier && <p className="error">{errors.identifier}</p>}

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

        <label>
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember Me
        </label>

        {errors.server && (
  <p className="error" role="alert">
    {errors.server}
  </p>
)}


        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogleSignIn} className="social-login-button">
          <img src="/images/google_logo.png" alt="Google icon" />
          Sign in with Google
        </button>
            <p>
        Don't have an account? <Link to="/Register">Register here</Link>
      </p>
      <p>
        <Link to="/forgot-password">Forgot Password?</Link>
      </p>
    </div>
  );
}

export default Login;
