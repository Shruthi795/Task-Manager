// src/pages/Signup.js
import React, { useState } from "react";
import {
  Container, Card, CardContent, Typography, TextField, Button, Box, MenuItem
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // "user" or "admin"
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    let users = [];
    let newUser = null;
    
    try {
      // Validate inputs
      if (!name || !email || !password) {
        setError("Please fill in all required fields");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

  // Clean input data
  const sanitize = (s = "") => (String(s).normalize ? String(s).normalize("NFKC") : String(s));
  const stripInvisible = (str = "") => String(str).replace(/[\u200B\u200C\u200D\uFEFF\u00A0]/g, "").trim();
  const cleanEmail = stripInvisible(sanitize(email)).toLowerCase();
  const cleanName = stripInvisible(sanitize(name));
  const cleanPassword = stripInvisible(sanitize(password));
      
      console.log("Signup attempt:", { cleanEmail, cleanName, role }); // Debug log

      // Check if user exists
      users = JSON.parse(localStorage.getItem("users")) || [];
      if (users.some(u => String(u.email || '').toLowerCase() === cleanEmail)) {
        setError("An account with this email already exists");
        return;
      }

      // Create new user with clean data
      newUser = { 
        id: Date.now(),
        name: cleanName, 
        email: cleanEmail,
        password: cleanPassword,
        role,
        isAdmin: role === 'admin',
        createdAt: new Date().toISOString()
      };
      
      console.log("Creating new user:", newUser); // Debug log

      // Save to localStorage
      const updatedUsers = [...users, newUser];
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      // Set up user session
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("isAdmin", String(role === "admin"));
      
      // Clear any errors
      setError("");

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");

      console.log("User created successfully:", newUser); // Debug log
      
      // create a session object without password
      const sessionUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isAdmin: newUser.isAdmin,
        createdAt: newUser.createdAt
      };

      // Store session and isAdmin flag
      localStorage.setItem("user", JSON.stringify(sessionUser));
      localStorage.setItem("isAdmin", String(newUser.isAdmin));

      // Clear any errors
      setError("");

      // Redirect to appropriate dashboard
      window.location.replace(role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred during signup. Please try again.");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>Sign up</Typography>
          <Box component="form" onSubmit={handleSignup} sx={{ display: "grid", gap: 2 }}>
            <TextField 
              label="Name" 
              value={name} 
              onChange={(e)=>setName(e.target.value)} 
              fullWidth 
              required
            />
            <TextField 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e)=>setEmail(e.target.value)} 
              fullWidth 
              required
            />
            <TextField 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e)=>setPassword(e.target.value)} 
              fullWidth 
              required
            />
            <TextField 
              select 
              label="Role" 
              value={role} 
              onChange={(e)=>setRole(e.target.value)} 
              fullWidth 
              required
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              fullWidth
            >
              Create account
            </Button>
            {error && (
              <Typography color="error" align="center" role="alert">{error}</Typography>
            )}
            <Box sx={{ textAlign: 'center' }}>
              <Button 
                variant="text" 
                onClick={() => window.location.href = "/login"}
              >
                Already have an account? Login
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
