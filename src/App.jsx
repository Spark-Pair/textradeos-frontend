import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext"; // 👈 import
import { LoaderProvider } from "./context/LoaderContext";
import Login from "./pages/Login";
import DeveloperDashboard from "./pages/Developer/DeveloperDashboard";
import PrivateRoute from "./routes/PrivateRoute";
import Layout from "./layouts/Layout";
import Businesses from "./pages/Businesses/businesses";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <LoaderProvider> {/* ✅ wrap App with LoaderProvider */}
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DeveloperDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/businesses"
                  element={
                    <PrivateRoute>
                      <Businesses />
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

