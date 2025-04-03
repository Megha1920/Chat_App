import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const res = await axios.post("http://127.0.0.1:8000/auth/social/google/", {
        access_token: credential, // Send token to Django backend
      });

      // Store JWT token
      localStorage.setItem("token", res.data.key);
      navigate("/chat");
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 bg-light"
      style={{
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
      }}
    >
      <div
        className="card p-5 shadow-lg text-center"
        style={{
          width: "400px",
          borderRadius: "15px",
          background: "#fff",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2 className="mb-4 text-primary fw-bold">Welcome Back</h2>
        <p className="text-muted mb-4">
          Sign in to continue to <strong>ChatApp</strong>
        </p>

        {/* ✅ Styled Google Login Button */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.error("Google Login Failed")}
        />
      </div>
    </div>
  );
};

export default Login;
