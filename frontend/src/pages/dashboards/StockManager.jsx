// frontend/src/pages/dashboards/StockManager.jsx
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import "../../styles/dashboard.css";

export default function StockManagerDashboard() {
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [orderForm, setOrderForm] = useState({
    bookTitle: "",
    isbn: "",
    quantity: "1",
  });

  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    isbn: "",
    totalCopies: "",
  });

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [booksRes, ordersRes] = await Promise.all([
        api.get("/books"),
        api.get("/orders"),
      ]);

      setBooks(booksRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("StockManager load error", err);
      setError(err?.response?.data?.message || "Failed to load stock data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const stats = (() => {
    const totalTitles = books.length;
    const totalCopies = books.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
    const lowThreshold = 2;
    const alertThreshold = 1;
    const lowStock = books.filter((b) => (b.availableCopies || 0) <= lowThreshold);
    const alertStock = books.filter((b) => (b.availableCopies || 0) <= alertThreshold);
    return {
      totalTitles,
      totalCopies,
      lowCount: lowStock.length,
      alertCount: alertStock.length,
      lowStock,
      alertStock,
    };
  })();

  function onOrderChange(e) {
    setOrderForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submitOrder(e) {
    e.preventDefault();
    try {
      setError("");
      if (!orderForm.bookTitle || !orderForm.isbn || !orderForm.quantity) {
        setError("Title, ISBN and quantity are required for an order");
        return;
      }
      await api.post("/orders", {
        bookTitle: orderForm.bookTitle,
        isbn: orderForm.isbn,
        quantity: Number(orderForm.quantity) || 1,
      });
      setOrderForm({ bookTitle: "", isbn: "", quantity: "1" });
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create order");
    }
  }

  function onBookChange(e) {
    setBookForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submitBook(e) {
    e.preventDefault();
    try {
      setError("");
      if (!bookForm.title || !bookForm.author || !bookForm.isbn || !bookForm.totalCopies) {
        setError("All book fields are required");
        return;
      }
      await api.post("/books", {
        title: bookForm.title,
        author: bookForm.author,
        isbn: bookForm.isbn,
        totalCopies: Number(bookForm.totalCopies),
        availableCopies: Number(bookForm.totalCopies),
      });
      setBookForm({ title: "", author: "", isbn: "", totalCopies: "" });
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add book to catalogue");
    }
  }

  return (
    <Layout role="stock_manager">
      <div className="dashboard">
        <h1 className="page-title">Stock Manager Dashboard</h1>

        {error && (
          <div className="error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}

        <section className="glass-panel">
          <h2>Inventory Overview</h2>
          <div className="kpi-row">
            <div className="kpi">
              <div className="kpi-icon">📚</div>
              <div>
                <div className="kpi-number">{stats.totalTitles}</div>
                <div className="kpi-label">Titles</div>
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-icon">📦</div>
              <div>
                <div className="kpi-number">{stats.totalCopies}</div>
                <div className="kpi-label">Total Copies</div>
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-icon">⚠️</div>
              <div>
                <div className="kpi-number">{stats.alertCount}</div>
                <div className="kpi-label">Alert Stock (&lt;=1)</div>
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-icon">⬇️</div>
              <div>
                <div className="kpi-number">{stats.lowCount}</div>
                <div className="kpi-label">Low Stock (&lt;=2)</div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel" style={{ marginTop: 16 }}>
          <h2>Low / Alert stock</h2>
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
                {stats.lowStock.map((b) => (
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
          <h2>Raise supplier order (dummy)</h2>
          <form
            onSubmit={submitOrder}
            style={{ display: "flex", flexWrap: "wrap", gap: 12 }}
          >
            <input
              className="input-control"
              name="bookTitle"
              placeholder="Book title"
              value={orderForm.bookTitle}
              onChange={onOrderChange}
            />
            <input
              className="input-control"
              name="isbn"
              placeholder="ISBN"
              value={orderForm.isbn}
              onChange={onOrderChange}
            />
            <input
              className="input-control"
              style={{ maxWidth: 120 }}
              name="quantity"
              type="number"
              min="1"
              placeholder="Qty"
              value={orderForm.quantity}
              onChange={onOrderChange}
            />
            <button className="btn primary" type="submit">
              Place order
            </button>
          </form>
        </section>

        <section className="glass-panel" style={{ marginTop: 16, marginBottom: 32 }}>
          <h2>Order history</h2>
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
                    <td>
                      {o.createdAt
                        ? new Date(o.createdAt).toISOString().slice(0, 10)
                        : ""}
                    </td>
                    <td>
                      {o.deliveredAt
                        ? new Date(o.deliveredAt).toISOString().slice(0, 10)
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-panel" style={{ marginTop: 16, marginBottom: 40 }}>
          <h2>Add book to catalogue</h2>
          <form
            onSubmit={submitBook}
            style={{ display: "flex", flexWrap: "wrap", gap: 12 }}
          >
            <input
              className="input-control"
              name="title"
              placeholder="Title"
              value={bookForm.title}
              onChange={onBookChange}
            />
            <input
              className="input-control"
              name="author"
              placeholder="Author"
              value={bookForm.author}
              onChange={onBookChange}
            />
            <input
              className="input-control"
              name="isbn"
              placeholder="ISBN"
              value={bookForm.isbn}
              onChange={onBookChange}
            />
            <input
              className="input-control"
              style={{ maxWidth: 140 }}
              name="totalCopies"
              type="number"
              min="0"
              placeholder="Total copies"
              value={bookForm.totalCopies}
              onChange={onBookChange}
            />
            <button className="btn primary" type="submit">
              Add to catalogue
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
}
