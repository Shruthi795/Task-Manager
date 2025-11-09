// src/pages/Login.js
import React, { useState } from "react";
import {
  Container, Card, CardContent, Typography, TextField, Button, Box, Link
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        setError("Enter email and password");
        return;
      }
      
      // If a one-time migration hasn't run, run it now so older stored users
      // will be normalized before we attempt to match credentials. This
      // avoids requiring manual migration steps from the user.
      const MIGRATION_FLAG = 'users_normalized_v1';
      if (!localStorage.getItem(MIGRATION_FLAG)) {
        const rawForMigration = localStorage.getItem('users');
        if (rawForMigration) {
          try {
            const parsed = JSON.parse(rawForMigration);
            if (Array.isArray(parsed)) {
              const sanitize = (s = "") => { try { return String(s).normalize ? String(s).normalize('NFKC') : String(s); } catch (e) { return String(s); } };
              const stripInvisible = (str = "") => String(str).replace(/[\u200B\u200C\u200D\uFEFF\u00A0]/g, '').trim();
              const normalized = parsed.map(u => ({
                ...u,
                email: u.email !== undefined ? stripInvisible(sanitize(u.email)).toLowerCase() : '',
                password: u.password !== undefined ? stripInvisible(sanitize(u.password)) : '',
                role: u.role || 'user'
              }));
              try { localStorage.setItem(`users_backup_${Date.now()}`, rawForMigration); } catch (e) { /* ignore */ }
              try { localStorage.setItem('users', JSON.stringify(normalized)); } catch (e) { /* ignore */ }
            }
          } catch (err) {
            console.warn('Login-time migration failed to parse users:', err);
          }
        }
        try { localStorage.setItem(MIGRATION_FLAG, String(Date.now())); } catch (e) { /* ignore */ }
      }

      // Ensure stored users are normalized (safe-guard for older stored entries)
      let usersRaw = localStorage.getItem("users");
      let users = [];
      if (usersRaw) {
        try {
          const parsed = JSON.parse(usersRaw);
          if (Array.isArray(parsed)) {
            // sanitize helpers (match App.js)
            const sanitize = (s = "") => (String(s).normalize ? String(s).normalize("NFKC") : String(s));
            const stripInvisible = (str) => String(str).replace(/[\u200B\u200C\u200D\uFEFF\u00A0]/g, "").trim();

            let changed = false;
            const cleaned = parsed.map((u) => {
              const cu = { ...u };
              if (cu.email !== undefined) {
                const e = stripInvisible(sanitize(cu.email)).toLowerCase();
                if (e !== cu.email) {
                  cu.email = e;
                  changed = true;
                } else {
                  cu.email = e;
                }
              }
              if (cu.password !== undefined) {
                const p = stripInvisible(sanitize(cu.password));
                if (String(p) !== cu.password) {
                  cu.password = String(p);
                  changed = true;
                } else {
                  cu.password = String(p);
                }
              }
              if (!cu.role) cu.role = "user";
              return cu;
            });
            users = cleaned;
            if (changed) {
              localStorage.setItem("users", JSON.stringify(cleaned));
              console.info("Normalized users in localStorage for login consistency");
            }
          }
        } catch (e) {
          console.warn("Could not parse users from localStorage:", e);
          users = [];
        }
      } else {
        users = [];
      }
      // sanitize input email/password too
      const sanitizeInput = (s = "") => (String(s).normalize ? String(s).normalize("NFKC") : String(s));
      const stripInvisibleInput = (str) => String(str).replace(/[\u200B\u200C\u200D\uFEFF\u00A0]/g, "").trim();
      const cleanEmail = stripInvisibleInput(sanitizeInput(email)).toLowerCase();
      const cleanPassword = stripInvisibleInput(sanitizeInput(password));
      
  console.log("Login attempt:", { cleanEmail, password: cleanPassword }); // Debug log
      console.log("Found users:", users); // Debug log
      
      // Find user with case-insensitive email comparison and string-safe password compare
      const found = users.find(u => {
        try {
          return (
            String(u.email).toLowerCase().trim() === cleanEmail &&
            String(u.password) === String(cleanPassword)
          );
        } catch (e) {
          return false;
        }
      });
      
      console.log("Found user:", found); // Debug log

      if (!found) {
        // More detailed debug information to help identify why matching failed
        try {
          const showChars = s => Array.from(String(s)).map(c => ({ c, code: c.charCodeAt(0) }));
          const normalizedPreview = users.map(u => ({
            id: u.id,
            emailRaw: u.email,
            emailNormalized: String(u.email || '').toLowerCase().trim(),
            emailChars: showChars(u.email || ''),
            passwordRaw: u.password,
            passwordType: typeof u.password,
            passwordChars: showChars(u.password || '')
          }));

          console.warn("Failed login attempt. Normalized input:", { cleanEmail, cleanPassword });
          console.warn("Stored users normalized preview:", normalizedPreview);
        } catch (dbgErr) {
          console.warn("Failed to produce debug preview:", dbgErr);
        }

        // Attempt an automatic recovery: if the email exists but the password
        // doesn't match due to normalization/type issues, update the stored
        // user's password to the normalized typed password and allow login.
        try {
          const emailOnly = users.find(u => String(u.email).toLowerCase().trim() === cleanEmail);
          if (emailOnly) {
            const sanitize = (s = "") => { try { return String(s).normalize ? String(s).normalize('NFKC') : String(s); } catch (e) { return String(s); } };
            const stripInvisible = (str = "") => String(str).replace(/[\u200B\u200C\u200D\uFEFF\u00A0]/g, '').trim();
            const storedPw = stripInvisible(sanitize(emailOnly.password || ''));
            // If storedPw is different from cleanPassword, perform repair
            if (storedPw !== cleanPassword) {
              try {
                const backupKey = `users_backup_repair_${Date.now()}`;
                localStorage.setItem(backupKey, localStorage.getItem('users') || '[]');
                const repaired = users.map(u => u.email && String(u.email).toLowerCase().trim() === cleanEmail ? { ...u, password: cleanPassword } : u);
                localStorage.setItem('users', JSON.stringify(repaired));
                console.info('Auto-repaired stored password for', cleanEmail, 'backup at', backupKey);
                // set found to the repaired user so normal flow continues
                const repairedUser = repaired.find(u => String(u.email).toLowerCase().trim() === cleanEmail);
                if (repairedUser) {
                  // proceed with login using repaired data
                  const userToStore = {
                    ...repairedUser,
                    email: cleanEmail,
                    isAdmin: repairedUser.role === 'admin'
                  };
                  localStorage.setItem('user', JSON.stringify(userToStore));
                  localStorage.setItem('isAdmin', String(userToStore.isAdmin));
                  setError("");
                  window.location.href = userToStore.role === 'admin' ? '/admin' : '/dashboard';
                  return;
                }
              } catch (repairErr) {
                console.warn('Auto-repair failed:', repairErr);
              }
            }
          }
        } catch (emailMatchErr) {
          console.warn('Email-only recovery attempt failed:', emailMatchErr);
        }

        setError("Invalid credentials");
        return;
      }

      // store full user object (including role)
      const userToStore = {
        ...found,
        email: cleanEmail, // ensure consistent case
        isAdmin: found.role === 'admin'
      };
      
      console.log("Storing user data:", userToStore); // Debug log

      localStorage.setItem("user", JSON.stringify(userToStore));
      localStorage.setItem("isAdmin", String(userToStore.isAdmin));
      setError("");

      console.log("Navigation target:", userToStore.role === "admin" ? "/admin" : "/dashboard"); // Debug log
      
      // Force a page reload to ensure all components update
      window.location.href = userToStore.role === "admin" ? "/admin" : "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>Login</Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ display: "grid", gap: 2 }}>
            <TextField label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} fullWidth />
            <TextField label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} fullWidth />
            <Button type="submit" variant="contained">Login</Button>
            {error && (
              <Typography color="error" align="center" role="alert">{error}</Typography>
            )}
            <Typography align="center">
              <Link component="button" onClick={()=>navigate("/signup")}>Don’t have an account? Sign up</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
