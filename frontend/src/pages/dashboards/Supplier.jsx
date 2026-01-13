// frontend/src/pages/dashboards/Supplier.jsx
import React from "react";
import Layout from "../../components/Layout";
import "../../styles/dashboard.css";

export default function SupplierDashboard() {
  return (
    <Layout role="supplier_contact">
      <div className="dashboard">
        <h1 className="page-title">Supplier Dashboard</h1>

        <section className="glass-panel">
          <h2>Order Requests</h2>
          <p>
            View purchase orders raised by the library and manage deliveries.
          </p>
        </section>

        <section className="glass-panel">
          <h2>Delivery Actions</h2>
          <ul className="bullet-list">
            <li>Check pending orders</li>
            <li>Confirm dispatched orders</li>
            <li>View completed deliveries</li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}
