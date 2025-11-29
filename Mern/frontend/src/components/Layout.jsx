// frontend/src/components/Layout.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Layout({ children, role }) {
  const navigate = useNavigate();
  const menuFor = {
    student: [
      { to: "/dashboard/student", label: "Dashboard" },
      { to: "/dashboard/student/books", label: "Browse Books" },
      { to: "/dashboard/student/borrows", label: "My Loans" },
      { to: "/dashboard/student/fines", label: "Fines & Payments" },
    ],
    librarian: [
      { to: "/dashboard/librarian", label: "Dashboard" },
      { to: "/catalogue", label: "Catalogue" },
      { to: "/order-history", label: "Order History" },
      { to: "/borrow-requests", label: "Borrow Requests" },
      { to: "/returns", label: "Returns" },
      { to: "/fines", label: "Fines" },
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
    default: [
      { to: "/dashboard", label: "Dashboard" },
    ],
  };

  const menu = menuFor[role] || menuFor.default;

  function logout() {
    localStorage.removeItem("lms_token");
    navigate("/");
  }

  return (
    <div className="app-root">
      <div className="bg-overlay" aria-hidden />
      <header className="topbar">
        <div className="brand">Scholars' <span className="accent">Archive</span></div>
        <nav className="top-actions">
          <button className="link-btn">Help</button>
          <button className="link-btn">About</button>
          <button className="link-btn">Contact</button>
          <button className="link-btn" onClick={logout}>Logout</button>
        </nav>
      </header>

      <div className="main-area">
        <aside className="sidebar">
          <div className="menu-title">Menu</div>
          <ul className="menu-list">
            {menu.map(it => (
              <li key={it.to}>
                <Link to={it.to} className={window.location.pathname === it.to ? "active" : ""}>{it.label}</Link>
              </li>
            ))}
          </ul>
        </aside>

        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}
