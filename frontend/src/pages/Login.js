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

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      alert("Invalid credentials (or user not registered)");
      return;
    }
    // store full user object (including role)
    localStorage.setItem("user", JSON.stringify(found));
    // navigate to appropriate place
    if (found.role === "admin") navigate("/admin");
    else navigate("/dashboard");
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
            <Typography align="center">
              <Link component="button" onClick={()=>navigate("/signup")}>Don’t have an account? Sign up</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
