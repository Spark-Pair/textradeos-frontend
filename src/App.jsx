import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext"; // 👈 import
import { LoaderProvider } from "./context/LoaderContext";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import Layout from "./layouts/Layout";
import Businesses from "./pages/Businesses/businesses";
import Customers from "./pages/Customers/customers";
import Articles from "./pages/Articles/articles";
import Invoices from "./pages/Invoices/invoices";
import Payments from "./pages/payments/payments";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <LoaderProvider> {/* ✅ wrap App with LoaderProvider */}
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route element={<Layout />}>
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/businesses"
                  element={
                    <PrivateRoute roles={["developer"]}>
                      <Businesses />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <PrivateRoute roles={["user"]}>
                      <Customers />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/articles"
                  element={
                    <PrivateRoute roles={["user"]}>
                      <Articles />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/invoices"
                  element={
                    <PrivateRoute roles={["user"]}>
                      <Invoices />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <PrivateRoute roles={["user"]}>
                      <Payments />
                    </PrivateRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </LoaderProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

