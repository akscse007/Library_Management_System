// frontend/src/pages/dashboards/LibrarianBorrowRequests.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import "../../styles/dashboard.css";

export default function LibrarianBorrowRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/lend-requests", { params: { status: "pending" } });
      setRequests(res.data || []);
    } catch (err) {
      console.error("LibrarianBorrowRequests load error", err);
      setError(err?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function act(id, action) {
    try {
      setError("");
      await API.post(`/lend-requests/${id}/${action}`);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${action} request`);
    }
  }

  return (
    <Layout role="librarian">
      <div className="dashboard">
        <h1 className="page-title">Borrow Requests</h1>
        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

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
                    <td>{r.userId?.name || r.userId?.email}</td>
                    <td>{r.bookId?.title}</td>
                    <td>{r.requestDate ? new Date(r.requestDate).toISOString().slice(0, 10) : ""}</td>
                    <td>{r.status}</td>
                    <td>
                      <button
                        className="link-btn"
                        disabled={loading}
                        onClick={() => act(r._id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="link-btn"
                        disabled={loading}
                        onClick={() => act(r._id, "reject")}
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
