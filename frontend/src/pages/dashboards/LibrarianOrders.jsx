// frontend/src/pages/dashboards/LibrarianOrders.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "../../styles/dashboard.css";

export default function LibrarianOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("LibrarianOrders load error", err);
      setError(err?.response?.data?.message || "Failed to load orders");
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
        <h1 className="page-title">Order History</h1>
        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

        <section className="glass-panel">
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>ISBN</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Delivered</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>{o.bookTitle}</td>
                    <td>{o.isbn}</td>
                    <td>{o.quantity}</td>
                    <td>{o.status}</td>
                    <td>{o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : ""}</td>
                    <td>{o.deliveredAt ? new Date(o.deliveredAt).toISOString().slice(0, 10) : ""}</td>
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
