// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import "../styles/login.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!form.name || !form.email || !form.password) {
      setErr("Please fill name, email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/register", form);
      // backend may return token+user or message. Redirect to login by default.
      navigate("/login", { replace: true });
    } catch (error) {
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

          <label className="input-label">Role</label>
          <select className="input-control" name="role" value={form.role} onChange={onChange}>
            <option value="student">Student</option>
            <option value="librarian">Librarian</option>
            <option value="admin">Admin</option>
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
