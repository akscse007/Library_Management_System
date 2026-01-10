// frontend/src/pages/dashboards/Student.jsx
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import "../../styles/dashboard.css";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [fines, setFines] = useState([]);
  const [requests, setRequests] = useState([]);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      // 1) who am I
      const meRes = await API.get("/auth/me");
      const meUser = meRes.data.user || meRes.data;
      setUser(meUser);

      // 2) books catalogue
      const booksRes = await API.get("/books");

      // 3) borrow history (pass studentId explicitly because /history/:id doesn't rely on auth middleware)
      const borrowsRes = await API.get(`/borrows/history/${meUser.id || meUser._id}`);

      // 4) fines for this student
      const finesRes = await API.get("/fines", { params: { student: meUser.id || meUser._id } });

      // 5) lend requests for this student
      const reqRes = await API.get("/lend-requests", { params: { student: meUser.id || meUser._id } });

      setBooks(booksRes.data || []);
      setBorrows(borrowsRes.data || []);
      setFines(finesRes.data || []);
      setRequests(reqRes.data || []);
    } catch (err) {
      console.error("Student dashboard load error", err);
      setError(err?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const stats = useMemo(() => {
    const activeLoans = borrows.filter(b => !b.returnedAt).length;
    const unpaid = fines.filter(f => f.status === 'unpaid');
    const unpaidTotal = unpaid.reduce((sum, f) => sum + (f.amount || 0), 0);
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const nextDue = (() => {
      const active = borrows.filter(b => !b.returnedAt && b.dueAt);
      if (!active.length) return "—";
      const soonest = active.reduce((min, b) => (new Date(b.dueAt) < new Date(min.dueAt) ? b : min));
      return new Date(soonest.dueAt).toISOString().slice(0, 10);
    })();
    return {
      booksOnLoan: activeLoans,
      reserved: pendingRequests,
      unpaidFines: `₹${unpaidTotal}`,
      lastLogin: "—",
      nextDue,
      holdsPending: 0,
      accountStatus: user?.accountStatus || "active",
    };
  }, [borrows, fines, requests, user]);

  // detailed actions (borrow / return / payment) live on dedicated pages now

  return (
    <Layout role="student">
      <div className="dashboard">
        <h1 className="page-title">User Dashboard</h1>

        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-icon">📚</div>
            <div>
              <div className="kpi-number">{stats.booksOnLoan}</div>
              <div className="kpi-label">Books on Loan</div>
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-icon">⏳</div>
            <div>
              <div className="kpi-number">{stats.reserved}</div>
              <div className="kpi-label">Reserved (Pending)</div>
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-icon">💰</div>
            <div>
              <div className="kpi-number">{stats.unpaidFines}</div>
              <div className="kpi-label">Unpaid Fines</div>
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-icon">👤</div>
            <div>
              <div className="kpi-number">{user?.name || ""}</div>
              <div className="kpi-label">{user?.email}</div>
            </div>
          </div>
        </div>

        <section className="glass-panel">
          <h2>At a glance</h2>
          <div className="kpi-row small">
            <div className="kpi small">
              <div className="kpi-icon">📅</div>
              <div>
                <div className="kpi-number">{stats.nextDue}</div>
                <div className="kpi-label">Next Due Date</div>
              </div>
            </div>

            <div className="kpi small">
              <div className="kpi-icon">📎</div>
              <div>
                <div className="kpi-number">{stats.holdsPending}</div>
                <div className="kpi-label">Holds Pending</div>
              </div>
            </div>

            <div className="kpi small">
              <div className="kpi-icon">🏛️</div>
              <div>
                <div className="kpi-number">"Open 9:00–18:00"</div>
                <div className="kpi-label">Library Hours Today</div>
              </div>
            </div>
          </div>

          <div className="notice">
            <strong>Action Needed</strong>
            <div>Account Status: {stats.accountStatus}</div>
          </div>
        </section>

        {/* Detailed actions (browse books, loans, fines) live under separate menu routes now */}
      </div>
    </Layout>
  );
}
