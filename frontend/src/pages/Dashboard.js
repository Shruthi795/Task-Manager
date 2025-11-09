import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  TextField,
  Paper,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Comment,
  AssignmentTurnedIn,
  Logout,
  Assignment,
  Group,
  ViewList,
  Menu as MenuIcon,
} from "@mui/icons-material";
import TaskMembers from "../components/TaskMembers";
import { useNavigate, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 240;

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [view, setView] = useState("my");

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  useEffect(() => {
    const hash = location.hash.slice(1);
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setAllTasks(storedTasks);

    switch (hash) {
      case "group":
        setView("group");
        setTasks(
          storedTasks.filter(
            (t) =>
              Array.isArray(t.assignedTo) &&
              t.assignedTo.includes(currentUser.email) &&
              t.assignedTo.length >= 2
          )
        );
        break;
      case "all":
        setView("all");
        setTasks(storedTasks);
        break;
      default:
        setView("my");
        setTasks(
          storedTasks.filter((t) => {
            if (!t.assignedTo) return false;
            if (Array.isArray(t.assignedTo))
              return t.assignedTo.includes(currentUser.email);
            return t.assignedTo === currentUser.email;
          })
        );
        break;
    }
  }, [location.hash, currentUser?.email]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "user") {
      navigate("/login", { replace: true });
    }
  }, [navigate, currentUser]);

  const updateTasks = (next) => {
    try {
      const updatedAll = allTasks.map((t) => next.find((nt) => nt.id === t.id) || t);
      next.forEach((nt) => {
        if (!updatedAll.find((u) => u.id === nt.id)) updatedAll.push(nt);
      });

      setAllTasks(updatedAll);
      localStorage.setItem("tasks", JSON.stringify(updatedAll));

      if (view === "my") {
        setTasks(
          updatedAll.filter((t) => {
            if (!t.assignedTo) return false;
            if (Array.isArray(t.assignedTo))
              return t.assignedTo.includes(currentUser.email);
            return t.assignedTo === currentUser.email;
          })
        );
      } else if (view === "group") {
        setTasks(
          updatedAll.filter(
            (t) =>
              Array.isArray(t.assignedTo) &&
              t.assignedTo.includes(currentUser.email) &&
              t.assignedTo.length >= 2
          )
        );
      } else {
        setTasks(updatedAll);
      }
    } catch (e) {
      console.warn("updateTasks failed", e);
    }
  };

  const handleAddComment = (taskId, text) => {
    if (!text.trim()) return;
    const nextAll = allTasks.map((t) =>
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
          }
        : t
    );
    updateTasks(nextAll);
  };

  const handleStatusChange = (taskId, newStatus) => {
    const nextAll = allTasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    updateTasks(nextAll);
  };

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "Done").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const todo = tasks.filter((t) => t.status === "To Do").length;

  const drawer = (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Dashboard Menu
      </Typography>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => (window.location.hash = "#my")}
            selected={view === "my"}
          >
            <ListItemIcon>
              <Assignment />
            </ListItemIcon>
            <ListItemText primary="My Tasks" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => (window.location.hash = "#group")}
            selected={view === "group"}
          >
            <ListItemIcon>
              <Group />
            </ListItemIcon>
            <ListItemText primary="Group Tasks" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => (window.location.hash = "#all")}
            selected={view === "all"}
          >
            <ListItemIcon>
              <ViewList />
            </ListItemIcon>
            <ListItemText primary="All Tasks" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Container
      maxWidth="xl"
      disableGutters
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={2}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isMobile && (
            <IconButton color="primary" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}
          <Box>
            <Typography variant="h4" fontWeight={700}>
              My Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome, {currentUser?.name || currentUser?.email}
            </Typography>
          </Box>
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
      <Card sx={{ mb: 2, mx: 2, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip label={`Total: ${total}`} color="primary" />
            <Chip label={`To Do: ${todo}`} color="warning" />
            <Chip label={`In Progress: ${inProgress}`} color="info" />
            <Chip label={`Done: ${done}`} color="success" />
          </Stack>
        </CardContent>
      </Card>

      {/* Layout */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: 0 }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH },
            }}
          >
            {drawer}
          </Drawer>

          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
            overflowY: "auto",
            p: 0
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(auto-fill, 280px)"
              },
              gap: 2,
              alignItems: "start",
              justifyContent: "start",
              p: 2,
              pt: 0
            }}
          >
            {tasks.length === 0 ? (
              <Typography
                color="text.secondary"
                textAlign="center"
                sx={{ gridColumn: "1/-1", py: 6 }}
              >
                No tasks found for this view.
              </Typography>
            ) : (
              tasks.map((task) => (
                <Card
                  key={task.id}
                  sx={{
                    boxShadow: 2,
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform .15s",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={1}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, fontSize: "1rem" }}
                      >
                        {task.title}
                      </Typography>
                      <Chip
                        label={task.priority}
                        color={
                          task.priority === "High"
                            ? "error"
                            : task.priority === "Medium"
                            ? "warning"
                            : "success"
                        }
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>

                    <Typography color="text.secondary" gutterBottom>
                      {task.description || "No description available"}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Due:</strong> {task.dueDate || "No due date"}
                    </Typography>

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
                        variant={
                          task.status === "In Progress" ? "contained" : "outlined"
                        }
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

                    <TaskMembers task={task} />
                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
                      <Comment sx={{ mr: 0.5, verticalAlign: "middle" }} /> Comments
                    </Typography>

                    {(task.comments || []).map((c, i) => (
                      <Paper key={i} sx={{ p: 1, my: 0.5, bgcolor: "#f9f9f9" }}>
                        <Typography variant="body2">
                          <strong>{c.author}</strong>: {c.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.time}
                        </Typography>
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
              ))
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
