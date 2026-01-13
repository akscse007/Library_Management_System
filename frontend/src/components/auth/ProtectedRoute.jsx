import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../services/useAuth.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  // 🔑 critical: wait for auth hydration
  if (loading) {
    return null; // or a spinner, but null is fine
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
