// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AllTasks from "./pages/AllTasks";
import Teams from "./pages/Teams";
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
  // Normalize stored users on app load so older entries match login checks
  useEffect(() => {
    try {
      // Run a one-time normalization/migration for stored users so login
      // works even if older entries contain invisible characters, different
      // unicode normalization, or non-string passwords. This will back up
      // the original value once and then write a cleaned array.
      const MIGRATION_FLAG = 'users_normalized_v1';
      if (!localStorage.getItem(MIGRATION_FLAG)) {
        const raw = localStorage.getItem("users");
        if (raw) {
          try {
            const users = JSON.parse(raw);
            if (Array.isArray(users)) {
              // helper to remove invisible / zero-width chars and normalize
              const sanitize = (s = "") => {
                try { return String(s).normalize ? String(s).normalize("NFKC") : String(s); } catch (e) { return String(s); }
              };

              const stripInvisible = (str = "") =>
                String(str).replace(/[\u200B\u200C\u200D\uFEFF\u00A0]/g, "").trim();

              const normalized = users.map((u) => {
                const cu = { ...u };
                if (cu.email !== undefined) cu.email = stripInvisible(sanitize(cu.email)).toLowerCase();
                if (cu.password !== undefined) cu.password = stripInvisible(sanitize(cu.password));
                else cu.password = '';
                if (!cu.role) cu.role = 'user';
                return cu;
              });

              // backup original before overwriting
              const backupKey = `users_backup_${Date.now()}`;
              try { localStorage.setItem(backupKey, raw); } catch (e) { /* ignore */ }
              try { localStorage.setItem('users', JSON.stringify(normalized)); } catch (e) { /* ignore */ }
              console.info('Normalized and backed up users to', backupKey);
            }
          } catch (e) {
            // parsing failed; skip migration but mark flag so we don't repeatedly try
            console.warn('Failed to parse stored users during migration:', e);
          }
        }

        // also normalize current session if present
        try {
          const rawSession = localStorage.getItem('user');
          if (rawSession) {
            const sess = JSON.parse(rawSession);
            const sanitize = (s = "") => { try { return String(s).normalize ? String(s).normalize('NFKC') : String(s); } catch (e) { return String(s); } };
            const stripInvisible = (str = "") => String(str).replace(/[\u200B\u200C\u200D\uFEFF\u00A0]/g, '').trim();
            if (sess && sess.email !== undefined) {
              sess.email = stripInvisible(sanitize(sess.email)).toLowerCase();
              localStorage.setItem('user', JSON.stringify(sess));
            }
          }
        } catch (e) {
          console.warn('Failed to normalize session user:', e);
        }

        try { localStorage.setItem(MIGRATION_FLAG, String(Date.now())); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.warn("User normalization failed:", err);
    }
  }, []);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
  {/* Show the sidebar/drawer when a user or admin is logged in */}
  {currentUser && <Navbar />}
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
            path="/all-tasks"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <AllTasks />
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

        <Route
          path="/teams"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Teams />
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
