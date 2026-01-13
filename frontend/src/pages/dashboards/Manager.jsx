// frontend/src/pages/dashboards/Manager.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "../../styles/dashboard.css";

export default function ManagerDashboard() {
  const [students, setStudents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [finesOverview, setFinesOverview] = useState({ unpaid: { total: 0, count: 0 }, today: { total: 0, count: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const [studentsRes, finesRes, reqRes] = await Promise.all([
        api.get("/manager/students"),
        api.get("/manager/fines/overview"),
        api.get("/lend-requests", { params: { status: 'pending' } }),
      ]);
      setStudents(studentsRes.data || []);
      setFinesOverview(finesRes.data || { unpaid: { total: 0, count: 0 }, today: { total: 0, count: 0 } });
      setPendingRequests(reqRes.data || []);
    } catch (err) {
      console.error("Manager dashboard load error", err);
      setError(err?.response?.data?.message || "Failed to load manager data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function changeStatus(id, newStatus) {
    try {
      setError("");
      await api.patch(`/manager/students/${id}/status`, { accountStatus: newStatus });
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status");
    }
  }

  return (
    <Layout role="manager">
      <div className="dashboard">
        <h1 className="page-title">Manager Dashboard</h1>

        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-icon">💸</div>
            <div>
              <div className="kpi-number">₹{finesOverview.unpaid.total || 0}</div>
              <div className="kpi-label">Total Unpaid Fines</div>
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">📄</div>
            <div>
              <div className="kpi-number">{finesOverview.unpaid.count || 0}</div>
              <div className="kpi-label">Unpaid Fine Records</div>
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">📆</div>
            <div>
              <div className="kpi-number">₹{finesOverview.today.total || 0}</div>
              <div className="kpi-label">Fines Today</div>
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">📨</div>
            <div>
              <div className="kpi-number">{pendingRequests.length}</div>
              <div className="kpi-label">Pending Lend Requests</div>
            </div>
          </div>
        </div>

        <section className="glass-panel" style={{ marginTop: 16 }}>
          <h2>Students</h2>
          <p style={{ fontSize: 13, opacity: 0.8 }}>Control account status based on borrows and fines.</p>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Account</th>
                  <th>Active Borrows</th>
                  <th>Unpaid Fines</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.accountStatus}</td>
                    <td>{s.activeBorrows}</td>
                    <td>₹{s.unpaidFineAmount || 0}</td>
                    <td>
                      <select
                        className="input-control"
                        style={{ maxWidth: 140 }}
                        value={s.accountStatus}
                        onChange={(e) => changeStatus(s.id, e.target.value)}
                      >
                        <option value="active">active</option>
                        <option value="suspended">suspended</option>
                        <option value="inactive">inactive</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && <p style={{ marginTop: 8 }}>Loading...</p>}
        </section>
      </div>
    </Layout>
  );
}
