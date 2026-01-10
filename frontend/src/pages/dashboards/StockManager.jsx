// frontend/src/pages/dashboards/StockManager.jsx
import React from "react";
import Layout from "../../components/Layout";
import "../../styles/dashboard.css";

export default function StockManagerDashboard() {
  return (
    <Layout role="stock_manager">
      <div className="dashboard">
        <h1 className="page-title">Stock Manager Dashboard</h1>

        <section className="glass-panel">
          <h2>Inventory Overview</h2>
          <p>
            Manage book stock, review low inventory alerts, and raise supplier
            orders.
          </p>
        </section>

        <section className="glass-panel">
          <h2>Pending Actions</h2>
          <ul className="bullet-list">
            <li>Review low stock alerts</li>
            <li>Confirm incoming orders</li>
            <li>Update stock quantities</li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}
