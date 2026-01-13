// frontend/src/components/RoleRoute.jsx
import { Navigate } from "react-router-dom";
import useAuth from "../services/useAuth.jsx";

/**
 * RoleRoute - Validates user has correct role
 * Accepts either:
 *  - allowed (array of roles)
 *  - allowedRoles (array of roles)
 */
export default function RoleRoute({ allowed, allowedRoles, children }) {
  const { user, loading } = useAuth();

  // Show loading during hydration
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // No user logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roles = allowedRoles || allowed;

  if (!Array.isArray(roles)) {
    console.error("RoleRoute misconfigured: roles missing or not an array");
    return <Navigate to="/login" replace />;
  }

  // Check if user role is allowed
  if (!roles.includes(user.role)) {
    console.warn(`User role '${user.role}' not in allowed roles:`, roles);
    return <Navigate to="/login" replace />;
  }

  return children;
}
