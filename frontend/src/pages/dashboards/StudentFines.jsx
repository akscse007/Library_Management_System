// frontend/src/pages/dashboards/StudentFines.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import "../../styles/dashboard.css";

export default function StudentFines() {
  const [user, setUser] = useState(null);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const meRes = await API.get("/auth/me");
      const meUser = meRes.data.user || meRes.data;
      setUser(meUser);
      const finesRes = await API.get("/fines", {
        params: { student: meUser.id || meUser._id },
      });
      setFines(finesRes.data || []);
    } catch (err) {
      console.error("StudentFines load error", err);
      setError(err?.response?.data?.message || "Failed to load fines");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function payFine(fineId) {
    try {
      setError("");
      await API.post("/payments", {
        fineId,
        provider: "manual",
        providerRef: "student-portal",
      });
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to pay fine");
    }
  }

  const pending = fines.filter((f) => f.status === "unpaid");
  const history = fines.filter((f) => f.status !== "unpaid");

  return (
    <Layout role="student">
      <div className="dashboard">
        <h1 className="page-title">Fines &amp; Payments</h1>
        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

        <section className="glass-panel">
          <h2>Pending fines</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Issued</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((f) => (
                  <tr key={f._id}>
                    <td>₹{f.amount}</td>
                    <td>{f.reason || (f.borrowId ? "Overdue" : "")}</td>
                    <td>{f.issuedDate ? new Date(f.issuedDate).toISOString().slice(0, 10) : ""}</td>
                    <td>{f.status}</td>
                    <td>
                      <button
                        className="link-btn"
                        disabled={loading}
                        onClick={() => payFine(f._id)}
                      >
                        Pay now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && <p style={{ marginTop: 8 }}>Loading...</p>}
        </section>

        <section className="glass-panel" style={{ marginTop: 16 }}>
          <h2>History</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Paid date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((f) => (
                  <tr key={f._id}>
                    <td>₹{f.amount}</td>
                    <td>{f.reason || (f.borrowId ? "Overdue" : "")}</td>
                    <td>{f.status || ""}</td>
                    <td>{f.paidDate ? new Date(f.paidDate).toISOString().slice(0, 10) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}
