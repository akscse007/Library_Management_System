// frontend/src/pages/dashboards/LibrarianCatalogue.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "../../styles/dashboard.css";

export default function LibrarianCatalogue() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: "", author: "", isbn: "", totalCopies: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/books");
      setBooks(res.data || []);
    } catch (err) {
      console.error("LibrarianCatalogue load error", err);
      setError(err?.response?.data?.message || "Failed to load catalogue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function addBook(e) {
    e.preventDefault();
    try {
      setError("");
      if (!form.title || !form.author || !form.isbn || !form.totalCopies) {
        setError("All fields are required");
        return;
      }
      await api.post("/books", {
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        totalCopies: Number(form.totalCopies),
        availableCopies: Number(form.totalCopies),
      });
      setForm({ title: "", author: "", isbn: "", totalCopies: "" });
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add book");
    }
  }

  return (
    <Layout role="librarian">
      <div className="dashboard">
        <h1 className="page-title">Catalogue</h1>
        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

        <section className="glass-panel">
          <h2>Books</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Available</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b._id}>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.isbn}</td>
                    <td>{b.availableCopies}</td>
                    <td>{b.totalCopies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && <p style={{ marginTop: 8 }}>Loading...</p>}
        </section>

        <section className="glass-panel" style={{ marginTop: 16 }}>
          <h2>Add book</h2>
          <form onSubmit={addBook} style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <input
              className="input-control"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <input
              className="input-control"
              placeholder="Author"
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            />
            <input
              className="input-control"
              placeholder="ISBN"
              value={form.isbn}
              onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
            />
            <input
              className="input-control"
              style={{ maxWidth: 140 }}
              type="number"
              min="0"
              placeholder="Total copies"
              value={form.totalCopies}
              onChange={(e) => setForm((f) => ({ ...f, totalCopies: e.target.value }))}
            />
            <button className="btn primary" type="submit">
              Add
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
}
