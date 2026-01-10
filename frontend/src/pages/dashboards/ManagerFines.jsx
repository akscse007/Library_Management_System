// frontend/src/pages/dashboards/ManagerFines.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import "../../styles/dashboard.css";

export default function ManagerFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/fines");
      setFines(res.data || []);
    } catch (err) {
      console.error("ManagerFines load error", err);
      setError(err?.response?.data?.message || "Failed to load fines");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <Layout role="manager">
      <div className="dashboard">
        <h1 className="page-title">All Fines</h1>
        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

        <section className="glass-panel">
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Issued</th>
                  <th>Paid date</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((f) => (
                  <tr key={f._id}>
                    <td>{f.userId?.name || f.userId?.email}</td>
                    <td>₹{f.amount}</td>
                    <td>{f.status || ""}</td>
                    <td>{f.issuedDate ? new Date(f.issuedDate).toISOString().slice(0, 10) : ""}</td>
                    <td>{f.paidDate ? new Date(f.paidDate).toISOString().slice(0, 10) : ""}</td>
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