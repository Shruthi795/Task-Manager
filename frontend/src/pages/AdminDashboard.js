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
import ActivityLog from "../components/ActivityLog";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate, useLocation } from "react-router-dom";
import {
  blue,
  green,
  orange,
  deepPurple,
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
  const [addMode, setAddMode] = useState(null);
  const [newComment, setNewComment] = useState({});
  const location = useLocation();
  const [tab, setTab] = useState("tasks");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("tab");
    if (t) setTab(t);
  }, [location.search]);

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

  const today = new Date().toISOString().split("T")[0];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    setNewTask({
      title: "",
      assignedTo: [],
      dueDate: "",
      priority: "Medium",
      status: "To Do",
    });
    setNewComment({});
    setAssigneeMenuAnchor(null);
    setAssigneeMenuTaskId(null);
    navigate("/login", { replace: true });
    window.dispatchEvent(new Event("custom_local_update"));
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate) return;
    if (addMode === "group" && !newTask.teamId) return;

    let assignees = [];
    if (addMode === "group") {
      const team = teams.find((t) => t.id === newTask.teamId);
      if (team) {
        assignees = users
          .filter((u) => team.members?.includes(u.id))
          .map((u) => u.email);
      }
      if (assignees.length === 0) return;
    } else {
      assignees = Array.isArray(newTask.assignedTo)
        ? newTask.assignedTo
        : newTask.assignedTo
        ? [newTask.assignedTo]
        : [];
      if (assignees.length === 0) return;
    }

    const newTaskObj = {
      ...newTask,
      id: Date.now(),
      assignedTo: assignees,
      description: newTask.description || "",
      status: newTask.status || "To Do",
      comments: [],
      teamId: addMode === "group" ? newTask.teamId : null,
    };
    const updated = [...tasks, newTaskObj];
    const logEntry = {
      id: Date.now(),
      message:
        addMode === "group"
          ? `Task "${newTask.title}" assigned to group (${assignees.join(", ")})`
          : `Task "${newTask.title}" assigned to ${assignees.join(", ")}`,
      date: new Date().toLocaleString(),
    };
    localStorage.setItem("tasks", JSON.stringify(updated));
    localStorage.setItem("activity", JSON.stringify([...activityLog, logEntry]));
    setTasks(updated);
    setActivityLog((prev) => [...prev, logEntry]);
    setNewTask({
      title: "",
      description: "",
      assignedTo: [],
      dueDate: "",
      priority: "Medium",
      status: "To Do",
      teamId: null,
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

  const total = tasks.length;
  const completed = tasks.filter(
    (t) => t.status === "Completed" || t.status === "Done"
  ).length;
  const pending = total - completed;
  const pieData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
  ];

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
    navigate(`${location.pathname}?tab=${newValue}`, { replace: true });
  };

  return (
    <Box sx={{ pt: 4, pr: 4, pb: 4, pl: { md: 0, xs: 2 }, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Header */}
      <Grid container justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary" sx={{ letterSpacing: 0.5 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of tasks, activity and quick actions
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
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

      {/* Tabs */}
      {tab === "analytics" && (
        <Box
          id="analytics"
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
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
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
            <Typography color="green" sx={{ fontWeight: 600 }}>
              Completed: {completed}
            </Typography>
            <Typography color="orange" sx={{ fontWeight: 600 }}>
              Pending: {pending}
            </Typography>
          </Card>
        </Box>
      )}

      {/* Add Task */}
      {tab === "add-task" && (
        <Card id="add-task" sx={{ mb: 4, borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Assign New Task
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                variant={!addMode ? "contained" : "outlined"}
                onClick={() => {
                  setAddMode(null);
                  setNewTask((prev) => ({ ...prev, teamId: null }));
                }}
              >
                Individual
              </Button>
              <Button
                variant={addMode === "group" ? "contained" : "outlined"}
                onClick={() => {
                  setAddMode("group");
                  setNewTask((prev) => ({ ...prev, assignedTo: [] }));
                }}
              >
                Team
              </Button>
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
                      renderValue: (selected) =>
                        Array.isArray(selected) ? selected.join(", ") : selected,
                    }}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  >
                    {users.map((u) => (
                      <MenuItem key={u.email} value={u.email}>
                        {u.email}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {addMode === "group" && (
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    label="Select Team"
                    fullWidth
                    value={newTask.teamId || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const team = teams.find((t) => t.id.toString() === val);
                      if (team) {
                        const memberEmails = users
                          .filter((u) => team.members?.includes(u.id))
                          .map((u) => u.email);
                        setNewTask({ ...newTask, teamId: team.id, assignedTo: memberEmails });
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select a team
                    </MenuItem>
                    {teams.map((t) => (
                      <MenuItem key={t.id} value={t.id.toString()}>
                        {t.name}
                      </MenuItem>
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
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
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

{/* Tasks Tab */}
      {tab === "activity" ? (
        <Box sx={{ maxWidth: "1200px", mx: "auto", width: "100%", p: 1 }}>
          <ActivityLog />
        </Box>
      ) : tab === "tasks" && (
        <Box id="tasks" sx={{ maxWidth: "1200px", mx: "auto", width: "100%", p: 1 }}>
          <Grid container alignItems="stretch" sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
            gap: 2,
            justifyItems: 'center',
            justifyContent: 'center'
          }}>
            {tasks.length === 0 ? (
              <Grid item xs={12}>
                <Typography color="text.secondary" sx={{ ml: 2 }}>
                  No tasks available.
                </Typography>
              </Grid>
            ) : (
              tasks.map((t) => (
                <Grid item key={t.id} sx={{ display: "flex", width: '100%', justifyContent: 'center' }}>
                  <Card
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      width: '360px',
                      minWidth: 'auto',
                      maxWidth: '360px',
                      height: 400,
                      borderRadius: 3,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      backgroundColor: "#ffffff",
                      transition: "transform .3s, box-shadow .3s",
                      "&:hover": { 
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.2)"
                      },
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          textTransform: "capitalize",
                          mb: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "100%",
                        }}
                      >
                        {t.title}
                      </Typography>
                      <Chip
                        label={t.priority}
                        sx={{ borderRadius: 2, px: 1.2, fontWeight: 600 }}
                        color={
                          t.priority === "High"
                            ? "error"
                            : t.priority === "Medium"
                            ? "warning"
                            : "success"
                        }
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Description:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          mb: 1,
                        }}
                      >
                        {t.description || "No description provided"}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: "auto" }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Assigned to:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                          maxHeight: 80,
                          overflowY: "auto",
                          '&::-webkit-scrollbar': {
                            width: '8px',
                          },
                          '&::-webkit-scrollbar-track': {
                            backgroundColor: '#f1f1f1',
                            borderRadius: '4px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#888',
                            borderRadius: '4px',
                            '&:hover': {
                              backgroundColor: '#666',
                            },
                          },
                        }}
                      >
                        {(() => {
                          const arr = Array.isArray(t.assignedTo)
                            ? t.assignedTo
                            : t.assignedTo
                            ? [t.assignedTo]
                            : [];
                          if (arr.length === 0)
                            return (
                              <Typography variant="body2" color="text.secondary">
                                Unassigned
                              </Typography>
                            );
                          const visible = arr.slice(0, 2);
                          const extra = arr.length - visible.length;
                          return (
                            <>
                              {visible.map((a) => (
                                <Chip
                                  key={a}
                                  label={a}
                                  size="small"
                                  variant="outlined"
                                  onDelete={() => {
                                    const updated = tasks.map((task) =>
                                      task.id === t.id
                                        ? {
                                            ...task,
                                            assignedTo: arr.filter((x) => x !== a),
                                          }
                                        : task
                                    );
                                    localStorage.setItem("tasks", JSON.stringify(updated));
                                    setTasks(updated);
                                    window.dispatchEvent(new Event("custom_local_update"));
                                  }}
                                  deleteIcon={<CloseIcon fontSize="small" />}
                                />
                              ))}
                              {extra > 0 && (
                                <Chip
                                  label={`+${extra} more`}
                                  size="small"
                                  onClick={(e) => handleOpenAssigneeMenu(e, t.id)}
                                />
                              )}
                            </>
                          );
                        })()}
                      </Box>
                      <Menu
                        anchorEl={assigneeMenuAnchor}
                        open={assigneeMenuTaskId === t.id}
                        onClose={handleCloseAssigneeMenu}
                      >
                        {Array.isArray(t.assignedTo) &&
                          t.assignedTo.slice(2).map((a) => (
                            <MenuItem key={a}>{a}</MenuItem>
                          ))}
                      </Menu>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Due: {t.dueDate}
                    </Typography>

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        color="error"
                        onClick={() => handleDeleteTask(t.id)}
                        size="small"
                        startIcon={<DeleteIcon />}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
