import React from "react";
import { Navigate } from "react-router-dom";



const PrivateRoute = ({ children }) => {
  console.log("PrivateRoute rendered");
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Unauthorized! Please log in first.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;