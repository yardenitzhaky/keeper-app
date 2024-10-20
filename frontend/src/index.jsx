import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { AuthProvider } from "./components/AuthContext";
import { Login } from "@mui/icons-material";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
    <Login />
    </AuthProvider>
  </React.StrictMode>
);
