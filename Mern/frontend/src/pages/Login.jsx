// frontend/src/pages/Login.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { login as loginApi, me as meApi, saveToken } from "../services/authService";
import "../styles/login.css";

/**
 * Hardened Login page with robust Google Identity handling.
 *
 * Requirements:
 * - public/index.html must include:
 *     <script src="https://accounts.google.com/gsi/client" async defer></script>
 * - .env should contain VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
 */

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const googleContainerRef = useRef(null);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const redirectByRole = useCallback((u) => {
    const role = u?.role || "student";
    switch (role) {
      case "student":
        navigate("/dashboard/student");
        break;
      case "librarian":
        navigate("/dashboard/librarian");
        break;
      case "manager":
        navigate("/dashboard/manager");
        break;
      case "accountant":
        navigate("/dashboard/accountant");
        break;
      case "stock_manager":
        // you can later add a dedicated stock dashboard; for now reuse librarian view
        navigate("/dashboard/librarian");
        break;
      default:
        navigate("/");
        break;
    }
  }, [navigate]);

  // Google Identity handler (server-side should handle id_token)
  async function handleGoogleResponse(response) {
    console.debug("[GSI] handleGoogleResponse:", response && typeof response === "object" ? { hasCredential: !!response.credential } : response);
    if (!response?.credential) {
      setError("Google sign-in failed: no credential returned.");
      return;
    }
    setError("");
    try {
      setLoading(true);
      const res = await API.post("/auth/google", { id_token: response.credential });
      // server may return { token, user } or set cookie + return user/message
      if (res?.data?.token) {
        saveToken(res.data.token);
      }
      const u = res?.data?.user || res?.data;
      if (u) {
        setUser(u);
        redirectByRole(u);
      } else {
        setError(res?.data?.message || "Google login succeeded but no user info returned.");
      }
    } catch (err) {
      console.error("[GSI] backend /auth/google error:", err);
      setError(err?.response?.data?.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  }

  // Initialize GSI SDK and render invisible official button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let mounted = true;
    let tries = 0;
    const maxTries = 80;
    const pollInterval = 200;

    async function waitForSDK() {
      while (mounted && (!window.google || !window.google.accounts || !window.google.accounts.id) && tries < maxTries) {
        tries++;
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, pollInterval));
      }
      return mounted && !!(window.google && window.google.accounts && window.google.accounts.id);
    }

    async function init() {
      const ok = await waitForSDK();
      if (!ok) {
        console.warn("[GSI] SDK not available after polling.");
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          ux_mode: "popup",
          auto_select: false,
        });
      } catch (e) {
        console.error("[GSI] initialize threw:", e);
        return;
      }

      const target = googleContainerRef.current || document.getElementById("google-signin-official");
      if (!target) {
        console.warn("[GSI] render target not found");
        return;
      }

      requestAnimationFrame(() => {
        try {
          target.innerHTML = "";
          if (window.google?.accounts?.id?.renderButton) {
            window.google.accounts.id.renderButton(target, {
              type: "standard",
              theme: "outline",
              size: "large",
              width: 220,
            });
          }
        } catch (err) {
          console.error("[GSI] renderButton error:", err);
        }
      });
    }

    init();
    return () => { mounted = false; };
  }, [GOOGLE_CLIENT_ID]);

  function onClickGoogle() {
    setError("");
    if (window.google?.accounts?.id?.prompt) {
      try {
        window.google.accounts.id.prompt(() => { /* callback notifications logged in console by SDK */ });
        return;
      } catch (err) {
        console.warn("[GSI] prompt threw:", err);
      }
    }

    // fallback: try to click official button rendered into the hidden container
    try {
      const official = googleContainerRef.current || document.getElementById("google-signin-official");
      if (official) {
        const btn = official.querySelector("button");
        if (btn) { btn.click(); return; }
      }
    } catch (e) {
      console.warn("[GSI] fallback click error:", e);
    }

    setError("Google sign-in not available (check adblockers or console).");
  }

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      setLoading(true);
      // Use the centralized auth service via API wrapper
      const res = await loginApi({ email: form.email.trim(), password: form.password });
      // server may:
      // - set httpOnly cookie and return { message, user }
      // - OR return { token, user }
      // - OR return { success: true, token, user } or other shapes
      if (res?.data?.token) {
        // persist token so interceptor will send Authorization header on subsequent requests
        saveToken(res.data.token);
      }

      // Attempt to get user info via /auth/me (works with cookie or Authorization header)
      try {
        const meRes = await meApi();
        const u = meRes?.data?.user || meRes?.data;
        if (u) {
          setUser(u);
          redirectByRole(u);
          return;
        }
      } catch (meErr) {
        // /me might fail if cookie wasn't stored — fall through to check response body
        console.debug("[AUTH] /auth/me check failed:", meErr?.response?.data || meErr);
      }

      // fallback: if server returned user directly in login response, use it
      const userFromLogin = res?.data?.user || res?.data;
      if (userFromLogin && (userFromLogin.id || userFromLogin._id || userFromLogin.email)) {
        setUser(userFromLogin);
        redirectByRole(userFromLogin);
        return;
      }

      // no user found yet
      setError(res?.data?.message || "Login succeeded but user info not returned. Try refreshing.");
    } catch (err) {
      console.error("[AUTH] /auth/login error:", err);
      setError(err?.response?.data?.message || "Server unreachable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page fixed-bg" style={{ backgroundImage: `url('/cover.png')` }}>
      <div className="bg-overlay" aria-hidden />
      <main className="login-wrap">
        <section className="brand">
          <h1 className="brand-title">DigiLiB</h1>
          <p className="brand-sub">welcome to the digital library @ calcuuta uniiversity</p>
        </section>

        <form className="glass-card" onSubmit={submit} autoComplete="on" noValidate>
          <h2 className="form-title">Sign in</h2>

          <label className="input-label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            className="input-control"
            value={form.email}
            onChange={handleChange}
            placeholder="you@college.edu"
            autoComplete="email"
            type="email"
          />

          <label className="input-label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            className="input-control"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="password"
            autoComplete="current-password"
          />

          {error && <div className="error" role="alert">{error}</div>}

          <button className="btn primary glass-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="bottom-row">
            <Link to="/register" className="link-btn">Create account</Link>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                id="google-signin-official"
                ref={googleContainerRef}
                style={{ width: 1, height: 1, opacity: 0, position: "absolute", pointerEvents: "none", overflow: "hidden" }}
              />

              <button
                type="button"
                onClick={onClickGoogle}
                className="google-circle"
                title="Sign in with Google"
                aria-label="Sign in with Google"
              >
                <svg viewBox="0 0 533.5 544.3" width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path fill="#4285F4" d="M533.5 278.4c0-17.9-1.6-35.1-4.6-51.7H272v98h146.9c-6.4 34.7-25.4 64.1-54.2 83.8v69.9h87.5c51.2-47.2 80.3-116.7 80.3-199.9z"/>
                  <path fill="#34A853" d="M272 544.3c73.7 0 135.6-24.4 180.8-66.3l-87.5-69.9c-24.4 16.4-55.6 26-93.3 26-71.6 0-132.3-48.3-154-113.1H27.8v71.3C72 470 165 544.3 272 544.3z"/>
                  <path fill="#FBBC05" d="M118 322.9c-10.9-32.7-10.9-67.9 0-100.6V151h-90.2C9.8 206.2 0 239.6 0 273s9.8 66.8 27.8 122l90.2-72.1z"/>
                  <path fill="#EA4335" d="M272 106.1c39.9 0 75.8 13.7 104 40.7l78-78C407.6 24.9 344.8 0 272 0 165 0 72 74.3 27.8 173l90.2 72.1C139.7 154.4 200.4 106.1 272 106.1z"/>
                </svg>
              </button>
            </div>
          </div>
        </form>

        {user && (
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <strong>Logged in as:</strong>
            <div>{user.email}</div>
            <div>{user.role}</div>
          </div>
        )}
      </main>
    </div>
  );
}
