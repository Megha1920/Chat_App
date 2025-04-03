import React, { useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  
const navigate=useNavigate()
  // ✅ Google Login Handler
  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        console.log("Google Login Successful:", codeResponse);

        // ✅ Send token to Django backend for authentication
        const res = await axios.post("http://localhost:8000/auth/social/google/", {
          access_token: codeResponse?.access_token, 
        });

        console.log("Backend Response:", res.data);

        // if (!res.data || !res.data.key) {
        //   console.error("No token received!");
        //   return;
        // }
    

        // ✅ Store JWT token
        localStorage.setItem("token", res.data);

        // ✅ Redirect to Chat Page
        navigate('/chat');
      } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed! Please try again.");
      }
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
      alert("Google login failed!");
    },
  });

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

        {/* ✅ Google Login Button */}
        <button
          onClick={() => login()}
          className="btn btn-primary"
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
