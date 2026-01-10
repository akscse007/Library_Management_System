import { Navigate } from "react-router-dom";
import useAuth from "../stores/useAuth";

/**
 * Role-based route guard
 * Accepts either:
 *  - allowed
 *  - allowedRoles
 * (defensive to avoid silent lockouts)
 */
export default function RoleRoute({ allowed, allowedRoles, children }) {
  const user = useAuth((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roles = allowedRoles || allowed;

  if (!Array.isArray(roles)) {
    console.error("RoleRoute misconfigured: roles missing");
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    console.warn(
      "RoleRoute blocked access:",
      user.role,
      "not in",
      roles
    );
    return <Navigate to="/login" replace />;
  }

  return children;
}
