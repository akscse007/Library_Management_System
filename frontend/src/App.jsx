// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/auth/Register";

import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";

// Student
import StudentDashboard from "./pages/dashboards/Student";
import StudentBooks from "./pages/dashboards/StudentBooks";
import StudentLoans from "./pages/dashboards/StudentLoans";
import StudentFines from "./pages/dashboards/StudentFines";

// Librarian
import LibrarianDashboard from "./pages/dashboards/Librarian";
import LibrarianStudents from "./pages/dashboards/LibrarianStudents";
import LibrarianCatalogue from "./pages/dashboards/LibrarianCatalogue";
import LibrarianOrders from "./pages/dashboards/LibrarianOrders";
import LibrarianBorrowRequests from "./pages/dashboards/LibrarianBorrowRequests";
import LibrarianReturns from "./pages/dashboards/LibrarianReturns";
import LibrarianFines from "./pages/dashboards/LibrarianFines";

// Manager
import ManagerDashboard from "./pages/dashboards/Manager";
import ManagerRequests from "./pages/dashboards/ManagerRequests";
import ManagerFines from "./pages/dashboards/ManagerFines";

// Accountant
import AccountantDashboard from "./pages/dashboards/Accountant";

// Stock Manager
import StockManagerDashboard from "./pages/dashboards/StockManager";

// Supplier
import SupplierDashboard from "./pages/dashboards/Supplier";

export default function App() {
  // useAuth hook doesn't need manual hydration in App
  // AuthProvider handles it automatically in useEffect
  
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* STUDENT */}
      <Route
        path="/dashboard/student"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["student"]}>
              <StudentDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/student/books"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["student"]}>
              <StudentBooks />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/student/borrows"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["student"]}>
              <StudentLoans />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/student/fines"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["student"]}>
              <StudentFines />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* LIBRARIAN */}
      <Route
        path="/dashboard/librarian"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["librarian"]}>
              <LibrarianDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/librarian/students"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["librarian"]}>
              <LibrarianStudents />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/librarian/catalogue"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["librarian"]}>
              <LibrarianCatalogue />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/librarian/orders"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["librarian"]}>
              <LibrarianOrders />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/librarian/borrow-requests"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["librarian", "manager"]}>
              <LibrarianBorrowRequests />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/librarian/returns"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["librarian", "manager"]}>
              <LibrarianReturns />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/librarian/fines"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["librarian"]}>
              <LibrarianFines />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* STOCK MANAGER */}
      <Route
        path="/dashboard/stock-manager"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["stock_manager"]}>
              <StockManagerDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* SUPPLIER */}
      <Route
        path="/dashboard/supplier"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["supplier_contact"]}>
              <SupplierDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* MANAGER */}
      <Route
        path="/dashboard/manager"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["manager"]}>
              <ManagerDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/manager/students"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["manager"]}>
              <ManagerDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/manager/requests"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["manager"]}>
              <ManagerRequests />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/manager/fines"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["manager"]}>
              <ManagerFines />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* ACCOUNTANT */}
      <Route
        path="/dashboard/accountant"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["accountant"]}>
              <AccountantDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/accountant/fines"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["accountant"]}>
              <AccountantDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/accountant/reports"
        element={
          <PrivateRoute>
            <RoleRoute allowed={["accountant"]}>
              <AccountantDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
