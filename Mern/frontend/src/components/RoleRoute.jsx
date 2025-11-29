import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api/axios";

export default function RoleRoute({ allowed, children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    API.get("/auth/me")
      .then(res => {
        const role = res.data.user.role;
        if (allowed.includes(role)) setOk(true);
      })
      .catch(() => setOk(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!ok) return <Navigate to="/" replace />;

  return children;
}
