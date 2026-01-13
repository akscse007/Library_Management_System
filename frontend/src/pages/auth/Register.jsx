// frontend/src/pages/auth/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import useAuth from "../../services/useAuth.jsx";
import "../../styles/login.css";    // re-use login glass styles
import "../../styles/dashboard.css"; // if you prefer dashboard palettes

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login from context
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    referralCode: "",
    role: "student", // allow selecting any role for testing dashboards
    phone: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    if (!form.name.trim()) return "Name is required.";
    if (!form.email.trim()) return "Email is required.";
    const re = /\S+@\S+\.\S+/;
    if (!re.test(form.email)) return "Enter a valid email.";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters.";
    if (!form.referralCode.trim()) return "Referral code is required.";
    // exact referral value is validated securely on the server using an env var
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) { setError(v); return; }

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        referralCode: form.referralCode.trim(),
        role: form.role,
        phone: form.phone || undefined,
        address: form.address || undefined
      };
      const res = await api.post("/auth/register", payload);
      if (res?.data?.success) {
        // Extract user and token from response
        const { token, user } = res.data;
        if (token && user) {
          // Save token to localStorage first
          localStorage.setItem("accessToken", token);
          login(user, token); // Use context login method
          
          console.log("[REGISTER SUCCESS] User:", user.email, "Role:", user.role);
          
          // Wait for state update before navigating
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Navigate based on role
          const role = user?.role || "student";
          if (role === "student") navigate("/dashboard/student");
          else if (role === "librarian") navigate("/dashboard/librarian");
          else if (role === "manager") navigate("/dashboard/manager");
          else if (role === "accountant") navigate("/dashboard/accountant");
          else if (role === "stock-manager") navigate("/dashboard/stock-manager");
          else if (role === "supplier") navigate("/dashboard/supplier");
          else navigate("/dashboard");
        } else {
          setError("Invalid registration response - missing user or token");
        }
      } else {
        setError(res?.data?.message || "Registration failed");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Server error during registration");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="login-page fixed-bg"
      role="application"
      aria-label="Register"
      style={{ backgroundImage: "url('/cover.png')" }}
    >
      <div className="bg-overlay" aria-hidden />

      <main className="login-wrap" role="main" style={{ maxWidth: 920 }}>
        <section className="brand">
          <h1 className="brand-title">Create account</h1>
          <p className="brand-sub">Join the Library LMS — select your role & sign up.</p>
        </section>

        <form className="glass-card" onSubmit={onSubmit} noValidate>
          <h2>Sign up</h2>

          <label className="input-label">Full name</label>
          <input name="name" className="input-control" value={form.name} onChange={onChange} placeholder="Your full name" autoFocus />

          <label className="input-label">Email</label>
          <input name="email" className="input-control" value={form.email} onChange={onChange} placeholder="you@college.edu" type="email" />

          <label className="input-label">Password</label>
          <input name="password" className="input-control" value={form.password} onChange={onChange} placeholder="At least 6 characters" type="password" />

          <label className="input-label">Referral code</label>
          <input
            name="referralCode"
            className="input-control"
            value={form.referralCode}
            onChange={onChange}
            placeholder="Enter referral code to create an account"
          />

          <label className="input-label">Role (for testing dashboards)</label>
          <select
            name="role"
            className="input-control"
            value={form.role}
            onChange={onChange}
          >
            <option value="student">Student</option>
            <option value="librarian">Librarian</option>
            <option value="manager">Manager</option>
            <option value="accountant">Accountant</option>
            <option value="stock_manager">Stock Manager</option>
            <option value="admin">Admin</option>
          </select>

          <label className="input-label">Phone (optional)</label>
          <input name="phone" className="input-control" value={form.phone} onChange={onChange} placeholder="9999999999" />

          <label className="input-label">Address (optional)</label>
          <input name="address" className="input-control" value={form.address} onChange={onChange} placeholder="Hostel / Office" />

          {error && <div className="error" role="alert">{error}</div>}

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <Link to="/" className="link-btn">Back to login</Link>
            <span style={{ alignSelf: "center", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Already have an account? <Link to="/">Sign in</Link></span>
          </div>
        </form>
      </main>
    </div>
  );
}
