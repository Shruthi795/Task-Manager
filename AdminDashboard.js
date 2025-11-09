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
  Menu,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import Teams from "./Teams";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
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
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login", { replace: true });
      return;
    }
  }, [navigate, currentUser]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: [],
    dueDate: "",
    priority: "Medium",
    teamId: null,
    status: "To Do",
  });
  const [addMode, setAddMode] = useState(null); // null for individual | 'group' for team assignment
  const [newComment, setNewComment] = useState({});
  const location = useLocation();
  const [tab, setTab] = useState("tasks");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("tab");
    if (t) setTab(t);
  }, [location.search]);

  // Load all data initially + when updated
  const loadData = () => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const storedActivity = JSON.parse(localStorage.getItem("activity")) || [];
    const storedTeams = JSON.parse(localStorage.getItem("teams")) || [];
    setTasks(storedTasks);
    setUsers(storedUsers);
    setActivityLog(storedActivity);
    setTeams(storedTeams);
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

  // Menu state for showing overflow assignees per task
  const [assigneeMenuAnchor, setAssigneeMenuAnchor] = useState(null);
  const [assigneeMenuTaskId, setAssigneeMenuTaskId] = useState(null);

  const handleOpenAssigneeMenu = (e, taskId) => {
    setAssigneeMenuAnchor(e.currentTarget);
    setAssigneeMenuTaskId(taskId);
  };

  const handleCloseAssigneeMenu = () => {
    setAssigneeMenuAnchor(null);
    setAssigneeMenuTaskId(null);
  };

  // Today's date for date picker min
  const today = new Date().toISOString().split("T")[0];

  const handleLogout = () => {
    // clear session only (preserve stored users/tasks/activity so accounts persist)
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");

    // reset UI-only state
    setNewTask({ title: "", assignedTo: [], dueDate: "", priority: "Medium", status: "To Do" });
    setNewComment({});
    setAssigneeMenuAnchor(null);
    setAssigneeMenuTaskId(null);

    // navigate to login
    navigate("/login", { replace: true });

    // notify other components in case they listen for session changes
    window.dispatchEvent(new Event('custom_local_update'));
  };

  const handleAddTask = () => {
    // Basic validation
    if (!newTask.title || !newTask.dueDate) return;

    // For group mode, require team selection
    if (addMode === 'group' && !newTask.teamId) return;

    // Get team members if in group mode
    let assignees = [];
    if (addMode === 'group') {
      const team = teams.find(t => t.id === newTask.teamId);
      if (team) {
        assignees = users
          .filter(u => team.members?.includes(u.id))
          .map(u => u.email);
      }
      if (assignees.length === 0) return; // Require at least one team member
    } else {
      // Individual mode
      assignees = Array.isArray(newTask.assignedTo) ? newTask.assignedTo : (newTask.assignedTo ? [newTask.assignedTo] : []);
      if (assignees.length === 0) return; // Require assignee selection
    }

    const newTaskObj = {
      ...newTask,
      id: Date.now(),
      assignedTo: assignees,
      description: newTask.description || "",
      status: newTask.status || "To Do",
      comments: [],
      teamId: addMode === 'group' ? newTask.teamId : null,
    };
    const updated = [...tasks, newTaskObj];
    const logEntry = {
      id: Date.now(),
      message: addMode === 'group'
        ? `Task "${newTask.title}" assigned to group (${assignees.join(', ')})`
        : addMode === 'team'
          ? `Task "${newTask.title}" assigned to team ${teams.find(x => x.id === newTask.teamId)?.name || newTask.teamId}`
          : `Task "${newTask.title}" assigned to ${assignees.join(', ')}`,
      date: new Date().toLocaleString(),
    };
    localStorage.setItem("tasks", JSON.stringify(updated));
    localStorage.setItem("activity", JSON.stringify([...activityLog, logEntry]));
    setTasks(updated);
    setActivityLog((prev) => [...prev, logEntry]);
    // Reset task form
    setNewTask({
      title: "",
      description: "",
      assignedTo: [],
      dueDate: "",
      priority: "Medium",
      status: "To Do",
      teamId: null
    });
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

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
    // keep URL in sync so Navbar links can open the right panel
    navigate(`${location.pathname}?tab=${newValue}`, { replace: true });
  };

  // Group management helpers

  return (
  // make content flush with the permanent drawer: no left padding on md+
  <Box sx={{ pt: 4, pr: 4, pb: 4, pl: { md: 0, xs: 2 }, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Top header removed - sidebar provides navigation and logout */}

      {/* Header (title + logout) */}
      <Grid container justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary" sx={{ letterSpacing: 0.5 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">Overview of tasks, activity and quick actions</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Grid>

      {/* Panels (render only the selected tab) */}
      {tab === 'analytics' && (
        <Box id="analytics"
          sx={{
            mb: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <Card sx={{ p: 2, width: 340, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography align="center" fontWeight={700} sx={{ mb: 1 }}>
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

          <Card sx={{ p: 2, width: 260, textAlign: "center", borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6">Total Tasks</Typography>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
              {total}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography color="green" sx={{ fontWeight: 600 }}>Completed: {completed}</Typography>
            <Typography color="orange" sx={{ fontWeight: 600 }}>Pending: {pending}</Typography>
          </Card>
        </Box>
      )}

      {/* Add Task (render only when add-task tab selected) */}
      {tab === 'add-task' && (
        <Card id="add-task" sx={{ mb: 4, borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Assign New Task
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant={!addMode ? 'contained' : 'outlined'} onClick={() => {
                setAddMode(null);
                setNewTask(prev => ({ ...prev, teamId: null }));
              }}>Individual</Button>
              <Button variant={addMode === 'group' ? 'contained' : 'outlined'} onClick={() => {
                setAddMode('group');
                setNewTask(prev => ({ ...prev, assignedTo: [] }));
              }}>Team</Button>
            </Box>
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
                  label="Description"
                  fullWidth
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </Grid>
              {!addMode && (
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    label="Assign To"
                    fullWidth
                    value={newTask.assignedTo}
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) => (Array.isArray(selected) ? selected.join(', ') : selected)
                    }}
                    onChange={(e) => {
                      setNewTask({ ...newTask, assignedTo: e.target.value });
                    }}
                  >
                    {users.map((u) => (
                      <MenuItem key={u.email} value={u.email}>
                        {u.email}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              {addMode === 'group' && (
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    label="Select Team"
                    fullWidth
                    value={newTask.teamId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const team = teams.find(t => t.id.toString() === val);
                      if (team) {
                        const memberEmails = users.filter(u => team.members?.includes(u.id)).map(u => u.email);
                        setNewTask({ ...newTask, teamId: team.id, assignedTo: memberEmails });
                      }
                    }}
                  >
                    <MenuItem value="" disabled>Select a team</MenuItem>
                    {teams.map(t => (
                      <MenuItem key={t.id} value={t.id.toString()}>{t.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              <Grid item xs={12} sm={3}>
                <TextField
                  type="date"
                  label="Due Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
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
      )}

      {/* Tasks panel (render only when tasks tab selected) */}
      {tab === 'tasks' && (
        <Box id="tasks" sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
          <Grid container spacing={2} alignItems="stretch" justifyContent="center">
            {tasks.length === 0 ? (
              <Typography color="text.secondary" sx={{ ml: 2 }}>
                No tasks available.
              </Typography>
            ) : (
              tasks.map((t) => (
          <Grid item xs={12} sm={6} md={3} key={t.id} sx={{ display: 'flex' }}>
            <Card sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1, flex: 1, minHeight: 400, maxHeight: 400, borderRadius: 2, boxShadow: 2, transition: 'transform .15s', '&:hover': { transform: 'translateY(-4px)' } }}>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>{t.title}</Typography>
                    <Chip
                      label={t.priority}
                      sx={{ alignSelf: 'flex-start', borderRadius: 2, px: 1.2, fontWeight: 600 }}
                      color={
                        t.priority === "High"
                          ? "error"
                          : t.priority === "Medium"
                          ? "warning"
                          : "success"
                      }
                      size="small"
                    />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>Assigned to:</Typography>
                      {(() => {
                        const arr = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
                        if (arr.length === 0) return (<Typography variant="body2" color="text.secondary">Unassigned</Typography>);
                        const visible = arr.slice(0, 2);
                        const extra = arr.length - visible.length;
                        return (
                          <>
                            {visible.map(email => (
                              <Box key={email} sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f3f4', px: 1, borderRadius: 1, maxWidth: 140, overflow: 'hidden' }}>
                                <Typography variant="body2" noWrap sx={{ mr: 0.5, fontSize: '0.85rem' }}>{email}</Typography>
                                <IconButton size="small" onClick={() => {
                                  const updated = tasks.map(tt => tt.id === t.id ? { ...tt, assignedTo: Array.isArray(tt.assignedTo) ? tt.assignedTo.filter(a => a !== email) : (tt.assignedTo === email ? [] : tt.assignedTo) } : tt);
                                  localStorage.setItem('tasks', JSON.stringify(updated));
                                  setTasks(updated);
                                  window.dispatchEvent(new Event('custom_local_update'));
                                }}>
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                            {extra > 0 && (
                              <Button size="small" sx={{ minWidth: 'auto', px: 1 }} onClick={(e) => handleOpenAssigneeMenu(e, t.id)}>+{extra} more</Button>
                            )}
                          </>
                        );
                      })()}
                    </Box>
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

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1, overflow: 'auto' }}>
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
                    </Box>

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
                      <IconButton aria-label={`delete-task-${t.id}`} color="error" onClick={() => handleDeleteTask(t.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
          {/* Assignee overflow menu */}
          <Menu
            anchorEl={assigneeMenuAnchor}
            open={Boolean(assigneeMenuAnchor)}
            onClose={handleCloseAssigneeMenu}
          >
            {(() => {
              if (!assigneeMenuTaskId) return null;
              const task = tasks.find(tt => tt.id === assigneeMenuTaskId);
              const arr = task ? (Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : [])) : [];
              return arr.slice(2).map(email => (
                <MenuItem key={email} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{email}</span>
                  <Button size="small" color="error" onClick={() => {
                    // remove this assignee
                    const updated = tasks.map(tt => tt.id === assigneeMenuTaskId ? { ...tt, assignedTo: Array.isArray(tt.assignedTo) ? tt.assignedTo.filter(a => a !== email) : (tt.assignedTo === email ? [] : tt.assignedTo) } : tt);
                    localStorage.setItem('tasks', JSON.stringify(updated));
                    setTasks(updated);
                    window.dispatchEvent(new Event('custom_local_update'));
                    handleCloseAssigneeMenu();
                  }}>Remove</Button>
                </MenuItem>
              ));
            })()}
          </Menu>
        </Box>
      )}

      {/* Activity Log (render only when activity tab selected) */}
      {tab === 'activity' && (
        <Card id="activity" sx={{ mt: 5 }}>
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
      )}

    </Box>
  );
}
