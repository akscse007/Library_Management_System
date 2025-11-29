// frontend/src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { TOKEN_KEY } from "../api/axios";

/**
 * Simple PrivateRoute that checks for access token in localStorage.
 * Works as a wrapper: <PrivateRoute><YourComponent/></PrivateRoute>.
 */
export default function PrivateRoute({ children, redirectTo = "/login" }) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
}
