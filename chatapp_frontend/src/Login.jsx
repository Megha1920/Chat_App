import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    // Simulating Google sign-in and redirecting to chat page
    navigate("/chat");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light" style={{ background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)" }}>
      <div className="card p-5 shadow-lg text-center" style={{ width: "400px", borderRadius: "15px", background: "#fff", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}>
        <h2 className="mb-4 text-primary fw-bold">Welcome Back</h2>
        <p className="text-muted mb-4">Sign in to continue to <strong>ChatApp</strong></p>
        <button className="btn btn-danger w-100 py-2 d-flex align-items-center justify-content-center" onClick={handleGoogleSignIn}>
          <i className="bi bi-google me-2 fs-5"></i> <span className="fw-bold">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;