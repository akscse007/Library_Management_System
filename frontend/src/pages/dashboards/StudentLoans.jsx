// frontend/src/pages/dashboards/StudentLoans.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "../../styles/dashboard.css";

export default function StudentLoans() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const meRes = await api.get("/auth/me");
      const meUser = meRes.data.user || meRes.data;

      const borrowsRes = await api.get(
        `/borrows/history/${meUser.id || meUser._id}`
      );

      // Backend returns { borrows, pagination }
      setBorrows(borrowsRes.data?.borrows || []);
    } catch (err) {
      console.error("StudentLoans load error", err);
      setError(err?.response?.data?.message || "Failed to load loans");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <Layout role="student">
      <div className="dashboard">
        <h1 className="page-title">My Loans</h1>

        {error && (
          <div className="error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}

        <section className="glass-panel" style={{ marginTop: 8 }}>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {borrows.map((b) => (
                  <tr key={b._id}>
                    <td>{b.book?.title || ""}</td>
                    <td>
                      {b.issuedAt
                        ? new Date(b.issuedAt).toISOString().slice(0, 10)
                        : ""}
                    </td>
                    <td>
                      {b.dueAt
                        ? new Date(b.dueAt).toISOString().slice(0, 10)
                        : ""}
                    </td>
                    <td>
                      {b.status === "issued"
                        ? "Active"
                        : b.status === "returned"
                        ? "Returned"
                        : b.status}
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
