import React, { useEffect, useState } from "react";
import {
  Container, Typography, Box, Card, CardContent, Grid, Divider,
  Chip, Button, TextField, Paper, Stack
} from "@mui/material";
import { Logout, Comment, AssignmentTurnedIn } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "user") {
      navigate("/login", { replace: true });
      return;
    }
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const myTasks = storedTasks.filter(t => t.assignedTo === currentUser.email);
    setTasks(myTasks);
  }, [navigate, currentUser]);

  const updateTasks = (next) => {
    setTasks(next);
    const all = JSON.parse(localStorage.getItem("tasks")) || [];
    const updatedAll = all.map(t => next.find(nt => nt.id === t.id) || t);
    localStorage.setItem("tasks", JSON.stringify(updatedAll));
  };

  const handleAddComment = (taskId, text) => {
    if (!text.trim()) return;
    const next = tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            comments: [
              ...(t.comments || []),
              {
                text: text.trim(),
                author: currentUser.name || currentUser.email,
                time: new Date().toLocaleString(),
              },
            ],
            history: [
              ...(t.history || []),
              `${currentUser.name || currentUser.email} commented at ${new Date().toLocaleString()}`,
            ],
          }
        : t
    );
    updateTasks(next);
  };

  const handleStatusChange = (taskId, newStatus) => {
    const next = tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            status: newStatus,
            history: [
              ...(t.history || []),
              `${currentUser.name || currentUser.email} marked "${newStatus}" at ${new Date().toLocaleString()}`,
            ],
          }
        : t
    );
    updateTasks(next);
  };

  const total = tasks.length;
  const done = tasks.filter(t => t.status === "Done").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;
  const todo = tasks.filter(t => t.status === "To Do").length;

  return (
  // disable container gutters on desktop so content is flush with the sidebar
  <Container maxWidth="lg" disableGutters sx={{ mt: 4, mb: 5, pt: 4, pr: 2, pb: 4, pl: { md: 0, xs: 2 } }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>My Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome, {currentUser?.name || currentUser?.email}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Analytics */}
      <Stack direction="row" spacing={2} mb={3}>
        <Chip label={`Total: ${total}`} color="primary" sx={{ fontWeight: 700 }} />
        <Chip label={`To Do: ${todo}`} color="warning" sx={{ fontWeight: 700 }} />
        <Chip label={`In Progress: ${inProgress}`} color="info" sx={{ fontWeight: 700 }} />
        <Chip label={`Done: ${done}`} color="success" sx={{ fontWeight: 700 }} />
      </Stack>

  {/* Task List wrapped in scrollable container so page doesn't require long scroll */}
  <Box id="tasks" sx={{ maxHeight: { xs: '65vh', md: '60vh' }, overflowY: 'auto', pr: 1 }}>
        <Grid container spacing={3}>
          {tasks.length === 0 ? (
            <Typography color="text.secondary" sx={{ ml: 1 }}>No tasks assigned yet.</Typography>
          ) : (
            tasks.map(task => (
              <Grid item xs={12} md={6} key={task.id}>
                <Card sx={{ boxShadow: 3, height: '100%', borderRadius: 2, transition: 'transform .15s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>{task.title}</Typography>
                      <Chip
                        label={task.priority}
                        sx={{ alignSelf: 'flex-start', borderRadius: 2, px: 1.2, fontWeight: 600 }}
                        color={
                          task.priority === "High"
                            ? "error"
                            : task.priority === "Medium"
                            ? "warning"
                            : "success"
                        }
                        size="small"
                      />
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      {task.description || "No description available"}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Due:</strong> {task.dueDate || "No due date"}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Status:</strong> {task.status}
                    </Typography>

                    {/* Status Change Buttons */}
                    <Stack direction="row" spacing={1} mb={2}>
                      <Button
                        size="small"
                        variant={task.status === "To Do" ? "contained" : "outlined"}
                        onClick={() => handleStatusChange(task.id, "To Do")}
                      >
                        To Do
                      </Button>
                      <Button
                        size="small"
                        variant={task.status === "In Progress" ? "contained" : "outlined"}
                        color="info"
                        onClick={() => handleStatusChange(task.id, "In Progress")}
                      >
                        In Progress
                      </Button>
                      <Button
                        size="small"
                        variant={task.status === "Done" ? "contained" : "outlined"}
                        color="success"
                        onClick={() => handleStatusChange(task.id, "Done")}
                        startIcon={<AssignmentTurnedIn />}
                      >
                        Done
                      </Button>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {/* Comments Section */}
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                      <Comment sx={{ mr: 0.5, verticalAlign: "middle" }} /> Comments
                    </Typography>
                    {(task.comments || []).map((c, i) => (
                      <Paper key={i} sx={{ p: 1, my: 0.5, bgcolor: "#f9f9f9" }}>
                        <Typography variant="body2">
                          <strong>{c.author}</strong>: {c.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{c.time}</Typography>
                      </Paper>
                    ))}
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Add a comment and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          handleAddComment(task.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

  {/* Activity Log */}
  <Box id="activity" mt={5}>
        <Typography variant="h6" gutterBottom>Activity Log</Typography>
        {tasks.every(t => !(t.history && t.history.length)) ? (
          <Typography color="text.secondary">No activity yet.</Typography>
        ) : (
          tasks.flatMap(t => (t.history || []).map((h, i) => (
            <Typography key={`${t.id}-${i}`} variant="body2" sx={{ mb: 0.5 }}>
              <strong>{t.title}</strong> — {h}
            </Typography>
          )))
        )}
      </Box>
    </Container>
  );
}
