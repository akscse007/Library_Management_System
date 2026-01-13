// frontend/src/pages/dashboards/LibrarianAnalytics.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function LibrarianAnalytics() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAnalytics() {
      try {
        const res = await api.get("/analytics/most-borrowed-books");
        if (mounted) {
          setData(res.data?.data || []);
        }
      } catch (err) {
        console.error("[ANALYTICS ERROR]", err);
        if (mounted) {
          setError("Failed to load analytics data");
        }
        // 🚫 DO NOT logout
        // 🚫 DO NOT navigate
        // 🚫 DO NOT touch auth state
      } finally {
        mounted && setLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="glass-panel">
        <h2>📊 Most Borrowed Books</h2>
        <p>Loading analytics…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="glass-panel">
        <h2>📊 Most Borrowed Books</h2>
        <p className="error">{error}</p>
      </section>
    );
  }

  return (
    <section className="glass-panel">
      <h2>📊 Most Borrowed Books</h2>

      {data.length === 0 ? (
        <p>No borrowing data available yet.</p>
      ) : (
        <table className="glass-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Borrow Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((b) => (
              <tr key={b.bookId}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.borrowCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
