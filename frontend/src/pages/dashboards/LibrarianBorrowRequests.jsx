import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "../../styles/dashboard.css";

export default function LibrarianBorrowRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      // Load requested borrows using unified listAllBorrows ({ borrows, pagination })
      const res = await api.get("/borrows", {
        params: { status: "requested" },
      });

      const rows = res.data?.borrows || res.data || [];
      setRequests(rows);
    } catch (err) {
      console.error("BorrowRequests load error", err);
      setError(err?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function approve(borrowId) {
    try {
      setError("");

      await api.post("/borrows/issue", {
        borrowId,
      });

      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve request");
    }
  }

  async function reject(borrowId) {
    try {
      setError("");

      await api.post(`/borrows/reject/${borrowId}`);

      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reject request");
    }
  }

  return (
    <Layout role="librarian">
      <div className="dashboard">
        <h1 className="page-title">Borrow Requests</h1>

        {error && (
          <div className="error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}

        <section className="glass-panel">
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Book</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id}>
                    <td>{r.student?.email || r.student?.name}</td>
                    <td>{r.book?.title}</td>
                    <td>
                      {r.createdAt
                        ? new Date(r.createdAt).toISOString().slice(0, 10)
                        : ""}
                    </td>
                    <td>{r.status}</td>
                    <td>
                      <button
                        className="link-btn"
                        disabled={loading}
                        onClick={() => approve(r._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="link-btn"
                        disabled={loading}
                        onClick={() => reject(r._id)}
                      >
                        Reject
                      </button>
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
