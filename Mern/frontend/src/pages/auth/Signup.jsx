// frontend/src/pages/auth/Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import useAuth from "../../stores/useAuth";

export default function Signup() {
  const nav = useNavigate();
  const { setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // basic client-side validation rules
  const validate = () => {
    if (!name.trim() || !email.trim() || !password) {
      setErr("Please fill all fields.");
      return false;
    }
    // simple email regex (good enough for basic validation)
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.trim())) {
      setErr("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setErr("Password should be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: "student",
      };

      const res = await api.post("/auth/signup", payload);

      // expected server response:
      // { access: "<jwt>", refresh: "<refresh>", user: { ... } }
      if (res?.data?.access && res?.data?.user) {
        // adapt this call to your store signature
        // many stores accept (user, accessToken, refreshToken)
        setUser(res.data.user, res.data.access, res.data.refresh);

        // use the dashboard route pattern from your project
        nav("/dashboard/student");
      } else if (res?.data?.message) {
        setErr(res.data.message);
      } else {
        setErr("Unexpected server response. Please try again.");
      }
    } catch (error) {
      // prefer server message when present
      const msg = error?.response?.data?.message || error?.message || "Network error";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-bg">
      <div className="hero-overlay" />
      <div className="container" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div style={{
          maxWidth: 680,
          margin: "0 auto",
          background: "rgba(255,255,255,0.02)",
          padding: 22,
          borderRadius: 12
        }}>
          <h2 style={{ color: "#fff" }}>Create an account</h2>

          <form onSubmit={submit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <label htmlFor="signup-name" style={{ color: "#fff", fontWeight: 600 }}>Full name</label>
            <input
              id="signup-name"
              className="gl-input"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              aria-required="true"
            />

            <label htmlFor="signup-email" style={{ color: "#fff', fontWeight: 600 }}>Email</label>
            <input
              id="signup-email"
              className="gl-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              type="email"
              aria-required="true"
            />

            <label htmlFor="signup-password" style={{ color: "#fff', fontWeight: 600 }}>Password</label>
            <input
              id="signup-password"
              className="gl-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              aria-required="true"
            />

            {err && <div style={{ color: "#ffd1d1" }} role="alert">{err}</div>}

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="gl-btn" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
