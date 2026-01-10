// frontend/src/pages/dashboards/LibrarianReturns.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import "../../styles/dashboard.css";

export default function LibrarianReturns() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/borrows", { params: { status: "returned" } });
      setBorrows(res.data || []);
    } catch (err) {
      console.error("LibrarianReturns load error", err);
      setError(err?.response?.data?.message || "Failed to load returns");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <Layout role="librarian">
      <div className="dashboard">
        <h1 className="page-title">Returns</h1>
        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

        <section className="glass-panel">
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Book</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Returned</th>
                </tr>
              </thead>
              <tbody>
                {borrows.map((b) => (
                  <tr key={b._id}>
                    <td>{b.student?.name || b.student?.email}</td>
                    <td>{b.book?.title}</td>
                    <td>{b.issuedAt ? new Date(b.issuedAt).toISOString().slice(0, 10) : ""}</td>
                    <td>{b.dueAt ? new Date(b.dueAt).toISOString().slice(0, 10) : ""}</td>
                    <td>{b.returnedAt ? new Date(b.returnedAt).toISOString().slice(0, 10) : ""}</td>
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
