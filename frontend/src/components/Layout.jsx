import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../services/useAuth.jsx";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const token = localStorage.getItem("accessToken");

  // Show loading while hydrating
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Token exists OR user loaded = authenticated
  // If neither exists, redirect to login
  if (!token && !user) {
    navigate('/login', { replace: true });
    return null;
  }

  const role = user.role;

  const menuFor = {
    student: [
      { to: "/dashboard/student", label: "Dashboard" },
      { to: "/dashboard/student/books", label: "Browse Books" },
      { to: "/dashboard/student/borrows", label: "My Loans" },
      { to: "/dashboard/student/fines", label: "Fines & Payments" },
    ],
    librarian: [
      { to: "/dashboard/librarian", label: "Dashboard" },
      { to: "/dashboard/librarian/catalogue", label: "Catalogue" },
      { to: "/dashboard/librarian/orders", label: "Order History" },
      { to: "/dashboard/librarian/borrow-requests", label: "Borrow Requests" },
      { to: "/dashboard/librarian/returns", label: "Returns" },
      { to: "/dashboard/librarian/fines", label: "Fines" },
    ],
    manager: [
      { to: "/dashboard/manager", label: "Dashboard" },
      { to: "/dashboard/manager/requests", label: "Lend Requests" },
      { to: "/dashboard/manager/students", label: "Students" },
      { to: "/dashboard/manager/fines", label: "Fines" },
    ],
    accountant: [
      { to: "/dashboard/accountant", label: "Dashboard" },
      { to: "/dashboard/accountant/fines", label: "Fine Records" },
      { to: "/dashboard/accountant/reports", label: "Daily Report" },
    ],
    stock_manager: [
      { to: "/dashboard/stock-manager", label: "Dashboard" },
    ],
    supplier_contact: [
      { to: "/dashboard/supplier", label: "Dashboard" },
    ],
  };

  const menu = menuFor[role] || [];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-root">
      <div className="bg-overlay" aria-hidden />

      <header className="topbar">
        <div className="brand">
          Digi<span className="accent">LiB</span>
        </div>
        <nav className="top-actions">
          <button className="link-btn">Help</button>
          <button className="link-btn">About</button>
          <button className="link-btn">Contact</button>
          <button className="link-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <div className="main-area">
        <aside className="sidebar">
          <div className="menu-title">Menu</div>
          <ul className="menu-list">
            {menu.map((it) => (
              <li key={it.to}>
                <Link
                  to={it.to}
                  className={location.pathname === it.to ? "active" : ""}
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}
