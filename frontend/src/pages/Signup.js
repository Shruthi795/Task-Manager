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

  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert("Fill all fields");
      return;
    }
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(u => u.email === email)) {
      alert("User already exists. Please login.");
      navigate("/login");
      return;
    }
    const newUser = { name, email, password, role };
    const updated = [...users, newUser];
    localStorage.setItem("users", JSON.stringify(updated));
    // auto-login
    localStorage.setItem("user", JSON.stringify(newUser));
    // navigate based on role
    if (role === "admin") navigate("/admin");
    else navigate("/dashboard");
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>Sign up</Typography>
          <Box component="form" onSubmit={handleSignup} sx={{ display: "grid", gap: 2 }}>
            <TextField label="Name" value={name} onChange={(e)=>setName(e.target.value)} fullWidth />
            <TextField label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} fullWidth />
            <TextField label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} fullWidth />
            <TextField select label="Role" value={role} onChange={(e)=>setRole(e.target.value)} fullWidth>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <Button type="submit" variant="contained">Create account</Button>
            <Typography align="center">
              Already have an account? <Button variant="text" onClick={()=>navigate("/login")}>Login</Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
