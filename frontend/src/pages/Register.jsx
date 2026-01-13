// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi } from "../services/authService";
import useAuth from "../stores/useAuth";
import { ROLES } from "../utils/roles";
import "../styles/login.css";

export default function Register() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "student",
    referralCode: ""
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const setUser = useAuth((s) => s.setUser);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!form.name || !form.email || !form.password || !form.referralCode) {
      setErr("Please fill all fields including referral code.");
      return;
    }
    setLoading(true);
    try {
      const res = await registerApi(form);
      
      // Extract user from response
      const user = res?.data?.user || res?.data;
      const token = res?.data?.accessToken || res?.data?.token || res?.data?.access;
      
      if (user && user.role) {
        console.log("[REGISTER SUCCESS] User:", user.email, "Role:", user.role, "token:", !!token);
        // Auto-login after registration
        setUser(user);
        // Redirect to appropriate dashboard
        switch (user.role) {
          case ROLES.STUDENT:
            navigate("/dashboard/student", { replace: true });
            break;
          case ROLES.LIBRARIAN:
            navigate("/dashboard/librarian", { replace: true });
            break;
          case ROLES.MANAGER:
            navigate("/dashboard/manager", { replace: true });
            break;
          default:
            navigate("/dashboard/student", { replace: true });
        }
      } else {
        // No user returned, just go to login
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("[REGISTER ERROR]", error);
      setErr(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page fixed-bg" style={{ backgroundImage: `url('/cover.png')` }}>
      <div className="bg-overlay" />
      <main className="login-wrap">
        <section className="brand">
          <h1 className="brand-title">DigiLiB</h1>
          <p className="brand-sub">welcome to the digital library @ calcuuta uniiversity</p>
        </section>

        <form className="glass-card" onSubmit={onSubmit} autoComplete="on">
          <h2 className="form-title">Create account</h2>

          <label className="input-label">Full name</label>
          <input className="input-control" name="name" value={form.name} onChange={onChange} required />

          <label className="input-label">Email</label>
          <input className="input-control" name="email" type="email" value={form.email} onChange={onChange} required />

          <label className="input-label">Password</label>
          <input className="input-control" name="password" type="password" value={form.password} onChange={onChange} required />

          <label className="input-label">Referral Code</label>
          <input className="input-control" name="referralCode" value={form.referralCode} onChange={onChange} required />

          <label className="input-label">Role</label>
          <select className="input-control" name="role" value={form.role} onChange={onChange}>
            <option value="student">Student</option>
            <option value="librarian">Librarian</option>
            <option value="manager">Manager</option>
          </select>

          {err && <div className="error" role="alert">{err}</div>}

          <button className="btn primary glass-btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>

          <div className="bottom-row">
            <Link to="/login" className="link-btn">Already have an account? Sign in</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
