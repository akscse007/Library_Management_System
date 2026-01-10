// frontend/src/pages/dashboards/StudentBooks.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import "../../styles/dashboard.css";

export default function StudentBooks() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const meRes = await API.get("/auth/me");
      const meUser = meRes.data.user || meRes.data;
      setUser(meUser);
      const booksRes = await API.get("/books");
      setBooks(booksRes.data || []);
    } catch (err) {
      console.error("StudentBooks load error", err);
      setError(err?.response?.data?.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function requestBorrow(bookId) {
    if (!user) return;
    try {
      setError("");
      await API.post("/lend-requests", { userId: user.id || user._id, bookId });
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not place borrow request");
    }
  }

  return (
    <Layout role="student">
      <div className="dashboard">
        <h1 className="page-title">Browse Books</h1>
        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

        <section className="glass-panel" style={{ marginTop: 8 }}>
          <p style={{ fontSize: 13, opacity: 0.9 }}>Click "Borrow" on a title to request a lend. You can hold up to 2 active loans.</p>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Available</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b._id}>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.availableCopies}</td>
                    <td>
                      <button
                        className="link-btn"
                        disabled={loading || b.availableCopies <= 0}
                        onClick={() => requestBorrow(b._id)}
                      >
                        Borrow
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
