// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";

/**
 * ProtectedRoute: returns children if logged-in and role allowed,
 * otherwise redirects to /login.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        {/* Only show the admin sidebar/drawer when an admin is logged in */}
        {currentUser && currentUser.role === 'admin' && <Navbar />}
        <Box component="main" sx={{ flexGrow: 1, p: 0, pl: 0 }}>
          <Routes>
        <Route
          path="/"
          element={
            currentUser
              ? currentUser.role === "admin"
                ? <Navigate to="/admin" replace />
                : <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}
