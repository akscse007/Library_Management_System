// frontend/src/pages/dashboards/LibrarianStudents.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "../../styles/dashboard.css";

export default function LibrarianStudents() {
  const [students, setStudents] = useState([]);
  const [manual, setManual] = useState({ studentId: "", amount: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/manager/students");
      setStudents(res.data || []);
    } catch (err) {
      console.error("LibrarianStudents load error", err);
      setError(err?.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function changeStatus(id, accountStatus) {
    try {
      setError("");
      await api.patch(`/manager/students/${id}/status`, { accountStatus });
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status");
    }
  }

  async function createFine(e) {
    e.preventDefault();
    try {
      setError("");
      if (!manual.studentId || !manual.amount) {
        setError("Student and amount are required");
        return;
      }
      await api.post("/fines/manual", {
        studentId: manual.studentId,
        amount: Number(manual.amount),
        reason: manual.reason,
      });
      setManual({ studentId: "", amount: "", reason: "" });
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create fine");
    }
  }

  return (
    <Layout role="librarian">
      <div className="dashboard">
        <h1 className="page-title">Students &amp; Account Status</h1>
        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

        <section className="glass-panel">
          <h2>Student accounts</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Account</th>
                  <th>Active borrows</th>
                  <th>Unpaid fines</th>
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

        <section className="glass-panel" style={{ marginTop: 16 }}>
          <h2>Impose fine</h2>
          <form onSubmit={createFine} style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <select
              className="input-control"
              style={{ minWidth: 220 }}
              value={manual.studentId}
              onChange={(e) => setManual((m) => ({ ...m, studentId: e.target.value }))}
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
            <input
              className="input-control"
              style={{ maxWidth: 140 }}
              type="number"
              min="0"
              placeholder="Amount"
              value={manual.amount}
              onChange={(e) => setManual((m) => ({ ...m, amount: e.target.value }))}
            />
            <input
              className="input-control"
              style={{ flex: 1, minWidth: 200 }}
              placeholder="Reason (optional)"
              value={manual.reason}
              onChange={(e) => setManual((m) => ({ ...m, reason: e.target.value }))}
            />
            <button className="btn primary" type="submit">
              Create fine
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
}
