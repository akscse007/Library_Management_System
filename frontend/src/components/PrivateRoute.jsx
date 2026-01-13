// frontend/src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import useAuth from "../services/useAuth.jsx";
import { TOKEN_KEY } from "../services/api";

/**
 * PrivateRoute - Protects routes that require authentication
 * 
 * Logic:
 * 1. If token exists in localStorage → user is logged in (allow)
 * 2. If no token → user is not logged in (redirect)
 * 3. Show loading only during initial hydration
 */
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const hasToken = localStorage.getItem(TOKEN_KEY);

  // During initial hydration, show loading
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // After hydration: if token exists OR user loaded, allow access
  // Token in localStorage is source of truth for "logged in"
  if (hasToken || user) {
    return children;
  }

  // No token and no user → not logged in
  return <Navigate to="/login" replace />;
}
