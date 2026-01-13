import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { login as loginApi } from "../services/authService";
import useAuth from "../services/useAuth.jsx";
import { ROLES } from "../utils/roles";
import "../styles/login.css";

/**
 * Login page
 * - UI preserved
 * - Google preserved
 * - Zustand is source of truth
 * - NO hydrate on initial login
 */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use login from context, not setUser

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const googleContainerRef = useRef(null);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const redirectByRole = useCallback(
    (user) => {
      switch (user.role) {
        case ROLES.STUDENT:
          navigate("/dashboard/student");
          break;
        case ROLES.LIBRARIAN:
          navigate("/dashboard/librarian");
          break;
        case ROLES.MANAGER:
          navigate("/dashboard/manager");
          break;
        case ROLES.ACCOUNTANT:
          navigate("/dashboard/accountant");
          break;
        case ROLES.STOCK_MANAGER:
          navigate("/dashboard/stock-manager");
          break;
        case ROLES.SUPPLIER:
          navigate("/dashboard/supplier");
          break;
        default:
          setError("Unauthorized role");
      }
    },
    [navigate]
  );

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  /**
   * Email / password login
   */
  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await loginApi({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      // Extract user from response
      const user = res?.data?.user || res?.data;

      if (!user || !user.role) {
        console.error("Invalid login response:", res?.data);
        throw new Error("Invalid login response - missing user or role");
      }

      // Token is already saved by loginApi, just get it from localStorage
      const token = localStorage.getItem("accessToken");

      console.log("[LOGIN SUCCESS] User:", user.email, "Role:", user.role, "Has token:", !!token);

      if (!token) {
        throw new Error("Token not found after login");
      }

      // ✅ CALL CONTEXT LOGIN - saves token to localStorage and queues user state update
      // Token is ALREADY in localStorage (saved synchronously), so we can navigate immediately
      console.log("[LOGIN] Updating auth context...");
      login(user, token);
      
      // DON'T wait - token is already in localStorage, PrivateRoute will see it
      console.log("[LOGIN] Redirecting to dashboard for role:", user.role);
      redirectByRole(user);
    } catch (err) {
      console.error("[LOGIN ERROR]", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Invalid credentials";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Google login
   */
  async function handleGoogleResponse(response) {
    if (!response?.credential) {
      setError("Google sign-in failed.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/google", {
        id_token: response.credential,
      });

      const user = res?.data?.user || res?.data;

      if (!user || !user.role) {
        throw new Error("Invalid Google login response");
      }

      // Save token from response
      const token = res?.data?.token || res?.data?.accessToken || res?.data?.access;
      if (token) {
        localStorage.setItem("accessToken", token);
        login(user, token);
        console.log("[GOOGLE LOGIN SUCCESS] User:", user.email, "Role:", user.role);
      } else {
        throw new Error("No token in Google login response");
      }

      // Token is already saved, navigate immediately
      redirectByRole(user);
    } catch (err) {
      console.error("[GOOGLE LOGIN ERROR]", err);
      setError("Google login failed.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Google SDK bootstrap (unchanged)
   */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let mounted = true;

    async function init() {
      while (mounted && !window.google?.accounts?.id) {
        await new Promise((r) => setTimeout(r, 200));
      }
      if (!mounted) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        ux_mode: "popup",
      });

      const target = googleContainerRef.current;
      if (target) {
        target.innerHTML = "";
        window.google.accounts.id.renderButton(target, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: 220,
        });
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [GOOGLE_CLIENT_ID]);

  return (
    <div
      className="login-page fixed-bg"
      style={{ backgroundImage: `url('/cover.png')` }}
    >
      <div className="bg-overlay" aria-hidden />

      <main className="login-wrap">
        <section className="brand">
          <h1 className="brand-title">DigiLiB</h1>
          <p className="brand-sub">
            welcome to the digital library @ calcutta university
          </p>
        </section>

        <form className="glass-card" onSubmit={submit} noValidate>
          <h2 className="form-title">Sign in</h2>

          <label className="input-label">Email</label>
          <input
            name="email"
            className="input-control"
            value={form.email}
            onChange={handleChange}
            type="email"
          />

          <label className="input-label">Password</label>
          <input
            name="password"
            className="input-control"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          {error && <div className="error">{error}</div>}

          <button className="btn primary glass-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="bottom-row">
            <Link to="/register" className="link-btn">
              Create account
            </Link>

            <div ref={googleContainerRef} />
          </div>
        </form>
      </main>
    </div>
  );
}
