import React from "react";
import Layout from "../../components/Layout";
import LibrarianAnalytics from "./LibrarianAnalytics";
import "../../styles/dashboard.css";

export default function LibrarianDashboard() {
  const stats = {
    titles: 5,
    pendingRequests: 2,
    activeLoans: 2,
    outstandingFines: "₹370",
  };

  return (
    <Layout>
      <div className="dashboard">
        <h1 className="page-title">Librarian Dashboard</h1>

        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-icon">📚</div>
            <div>
              <div className="kpi-number">{stats.titles}</div>
              <div className="kpi-label">Titles in Catalogue</div>
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-icon">⏳</div>
            <div>
              <div className="kpi-number">{stats.pendingRequests}</div>
              <div className="kpi-label">Pending Requests</div>
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-icon">🔁</div>
            <div>
              <div className="kpi-number">{stats.activeLoans}</div>
              <div className="kpi-label">Active Loans</div>
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-icon">💳</div>
            <div>
              <div className="kpi-number">{stats.outstandingFines}</div>
              <div className="kpi-label">Outstanding Fines</div>
            </div>
          </div>
        </div>

        <section className="glass-panel">
          <h2>Alerts</h2>
          <ul className="bullet-list">
            <li>2 borrow requests awaiting decision.</li>
            <li>2 active loans to track for due dates.</li>
          </ul>
        </section>

        <section className="glass-panel">
          <h2>Recent Activity</h2>
          <ul className="bullet-list">
            <li>Borrow request received for "The Clean Coder" — A. Sharma</li>
            <li>Low stock: "Clean Code" (1 available, min 3)</li>
          </ul>
        </section>

        {/* Analytics must NEVER force logout */}
        <LibrarianAnalytics />
      </div>
    </Layout>
  );
}
