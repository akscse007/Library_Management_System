// frontend/src/pages/dashboards/Accountant.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import "../../styles/dashboard.css";

export default function AccountantDashboard() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [dailyFines, setDailyFines] = useState([]);
  const [unpaidFines, setUnpaidFines] = useState([]);
  const [manual, setManual] = useState({ studentId: "", amount: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const [studentsRes, dailyRes, unpaidRes] = await Promise.all([
        API.get("/manager/students"),
        API.get("/fines/daily", { params: { date } }),
        API.get("/fines", { params: { paid: false } }),
      ]);
      setStudents(studentsRes.data || []);
      setDailyFines(dailyRes.data || []);
      setUnpaidFines(unpaidRes.data || []);
    } catch (err) {
      console.error("Accountant dashboard load error", err);
      setError(err?.response?.data?.message || "Failed to load accountant data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function createFine(e) {
    e.preventDefault();
    try {
      setError("");
      if (!manual.studentId || !manual.amount) {
        setError("Student and amount are required");
        return;
      }
      await API.post("/fines/manual", {
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

  async function markPaid(fineId) {
    try {
      setError("");
      await API.patch(`/fines/${fineId}/confirm`);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to mark fine as paid");
    }
  }

  return (
    <Layout role="accountant">
      <div className="dashboard">
        <h1 className="page-title">Accountant Dashboard</h1>

        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

        <section className="glass-panel">
          <h2>Daily fine records</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontSize: 13 }}>Date
              <input
                type="date"
                className="input-control"
                style={{ maxWidth: 180, marginLeft: 6 }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {dailyFines.map((f) => (
                  <tr key={f._id}>
                    <td>{f.userId?.name || f.userId?.email}</td>
                    <td>₹{f.amount}</td>
                    <td>{f.reason || (f.borrowId ? "Overdue" : "")}</td>
                    <td>{new Date(f.createdAt).toISOString().slice(0,10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
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
            <button className="btn primary" type="submit">Create fine</button>
          </form>
        </section>

        <section className="glass-panel" style={{ marginTop: 16, marginBottom: 40 }}>
          <h2>Unpaid fines</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {unpaidFines.map((f) => (
                  <tr key={f._id}>
                    <td>{f.userId?.name || f.userId?.email}</td>
                    <td>₹{f.amount}</td>
                    <td>{f.reason || (f.borrowId ? "Overdue" : "")}</td>
                    <td>{new Date(f.createdAt).toISOString().slice(0,10)}</td>
                    <td>
                      <button className="link-btn" onClick={() => markPaid(f._id)}>Mark paid</button>
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
