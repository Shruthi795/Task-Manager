import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {
  blue,
  green,
  orange,
  deepPurple,
  indigo,
} from "@mui/material/colors";

const COLORS = [blue[400], green[400], orange[400], deepPurple[400]];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
    status: "To Do",
  });
  const [newComment, setNewComment] = useState({});

  // Load all data initially + when updated
  const loadData = () => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const storedActivity = JSON.parse(localStorage.getItem("activity")) || [];
    setTasks(storedTasks);
    setUsers(storedUsers);
    setActivityLog(storedActivity);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("custom_local_update", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("custom_local_update", handleUpdate);
    };
  }, []);

  const handleLogout = () => {
    // Login/Signup use the key 'user' so remove that on logout
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    navigate("/login", { replace: true });
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.dueDate) return;
    const newTaskObj = {
      ...newTask,
      id: Date.now(),
      // default to the chosen status or To Do to match user dashboard
      status: newTask.status || "To Do",
      comments: [],
    };
    const updated = [...tasks, newTaskObj];
    const logEntry = {
      id: Date.now(),
      message: `Task "${newTask.title}" assigned to ${newTask.assignedTo}`,
      date: new Date().toLocaleString(),
    };
    localStorage.setItem("tasks", JSON.stringify(updated));
    localStorage.setItem("activity", JSON.stringify([...activityLog, logEntry]));
    setTasks(updated);
    setActivityLog((prev) => [...prev, logEntry]);
  setNewTask({ title: "", assignedTo: "", dueDate: "", priority: "Medium", status: "To Do" });
    window.dispatchEvent(new Event("custom_local_update"));
  };

  const handleDeleteTask = (taskId) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    const logEntry = {
      id: Date.now(),
      message: `Admin deleted task ID ${taskId}`,
      date: new Date().toLocaleString(),
    };
    localStorage.setItem("tasks", JSON.stringify(updated));
    localStorage.setItem("activity", JSON.stringify([...activityLog, logEntry]));
    setTasks(updated);
    setActivityLog((p) => [...p, logEntry]);
    window.dispatchEvent(new Event("custom_local_update"));
  };

  const handleAddComment = (taskId) => {
    if (!newComment[taskId]?.trim()) return;
    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            comments: [
              ...(t.comments || []),
              {
                text: newComment[taskId],
                date: new Date().toLocaleString(),
                author: "Admin",
              },
            ],
          }
        : t
    );
    const logEntry = {
      id: Date.now(),
      message: `Admin commented on task ID ${taskId}`,
      date: new Date().toLocaleString(),
    };
    localStorage.setItem("tasks", JSON.stringify(updated));
    localStorage.setItem("activity", JSON.stringify([...activityLog, logEntry]));
    setTasks(updated);
    setActivityLog((p) => [...p, logEntry]);
    setNewComment({ ...newComment, [taskId]: "" });
    window.dispatchEvent(new Event("custom_local_update"));
  };

  // Analytics
  const total = tasks.length;
  // Treat both "Done" (user dashboard) and "Completed" (admin) as completed
  const completed = tasks.filter((t) => t.status === "Completed" || t.status === "Done").length;
  // Pending = not completed
  const pending = total - completed;
  const pieData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Header */}
      <Grid container justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Grid>

      {/* Analytics Centered */}
      <Box
        sx={{
          mb: 5,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        <Card sx={{ p: 2, width: 300 }}>
          <CardContent>
            <Typography align="center" fontWeight="bold">
              Task Analytics
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card sx={{ p: 2, width: 250, textAlign: "center" }}>
          <Typography variant="h6">Total Tasks</Typography>
          <Typography variant="h4" color="primary">
            {total}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography color="green">Completed: {completed}</Typography>
          <Typography color="orange">Pending: {pending}</Typography>
        </Card>
      </Box>

      {/* Add Task */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Assign New Task
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Title"
                fullWidth
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Assign To"
                fullWidth
                value={newTask.assignedTo}
                onChange={(e) =>
                  setNewTask({ ...newTask, assignedTo: e.target.value })
                }
              >
                {users.map((u) => (
                  <MenuItem key={u.email} value={u.email}>
                    {u.email}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="Due Date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                select
                label="Priority"
                fullWidth
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleAddTask}
                sx={{ height: "100%" }}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tasks 4 per row */}
      <Grid container spacing={3}>
        {tasks.length === 0 ? (
          <Typography color="text.secondary" sx={{ ml: 2 }}>
            No tasks available.
          </Typography>
        ) : (
          tasks.map((t) => (
            <Grid item xs={12} sm={6} md={3} key={t.id}>
              <Card sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="h6">{t.title}</Typography>
                <Chip
                  label={t.priority}
                  color={
                    t.priority === "High"
                      ? "error"
                      : t.priority === "Medium"
                      ? "warning"
                      : "success"
                  }
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Assigned to: {t.assignedTo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Due: {t.dueDate}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: t.status === "Completed" || t.status === "Done" ? "green" : "orange",
                    fontWeight: 600,
                  }}
                >
                  Status: {t.status}
                </Typography>
                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2">Comments:</Typography>
                {t.comments?.length ? (
                  t.comments.map((c, i) => (
                    <Box key={i} sx={{ mb: 0.5 }}>
                      <Typography variant="body2">💬 {c.text}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.author} • {c.date}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No comments yet.
                  </Typography>
                )}

                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Add comment..."
                    value={newComment[t.id] || ""}
                    onChange={(e) =>
                      setNewComment({ ...newComment, [t.id]: e.target.value })
                    }
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleAddComment(t.id)}
                  >
                    Post
                  </Button>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <IconButton color="error" onClick={() => handleDeleteTask(t.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Activity Log */}
      <Card sx={{ mt: 5 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activity Log
          </Typography>
          {activityLog.length === 0 ? (
            <Typography color="text.secondary">No recent activity</Typography>
          ) : (
            activityLog
              .slice()
              .reverse()
              .map((a) => (
                <Box
                  key={a.id}
                  sx={{
                    p: 1,
                    mb: 1,
                    bgcolor: "#f8f9fb",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">{a.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {a.date}
                  </Typography>
                </Box>
              ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
