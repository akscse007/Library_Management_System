import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../stores/useAuth";

/**
 * PrivateRoute
 * - Waits for auth hydration
 * - Prevents redirect loops
 */
export default function PrivateRoute({ children }) {
  const user = useAuth((s) => s.user);
  const hydrate = useAuth((s) => s.hydrate);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // if user already exists (login just happened)
        if (user) {
          if (mounted) setReady(true);
          return;
        }

        // try restoring from backend
        await hydrate();
      } catch {
        // ignore — user stays null
      } finally {
        if (mounted) setReady(true);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  // ⏳ wait before deciding
  if (!ready) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
