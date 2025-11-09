import React from "react";
import { Container, Typography, Box, Card, CardContent, Grid, Divider, Chip, Button, TextField, Paper, Stack } from "@mui/material";
import { Comment, AssignmentTurnedIn, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function AllTasks() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
  if (!currentUser) {
    navigate("/login", { replace: true });
    return null;
  }

  // Filter tasks to only show team tasks
  const tasks = allTasks.filter(task => task.teamId === currentUser.teamId);

  return (
    <Container maxWidth="lg" disableGutters sx={{ mt: 4, mb: 5, pt: 4, pr: 2, pb: 4, pl: { md: 0, xs: 2 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Team Tasks</Typography>
          <Typography variant="body2" color="text.secondary">All tasks for your team</Typography>
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

      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip label={`Total: ${tasks.length}`} color="primary" sx={{ fontWeight: 700 }} />
          </Stack>
        </CardContent>
      </Card>

      <Box id="tasks">
        <Grid container spacing={3}>
          {tasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, width: '100%' }}>
              <Typography color="text.secondary">No tasks available.</Typography>
            </Box>
          ) : (
            tasks.map(task => (
              <Grid item xs={12} md={6} key={task.id}>
                <Card sx={{ boxShadow: 3, height: '100%', borderRadius: 3, transition: 'transform .15s', '&:hover': { transform: 'translateY(-6px)' } }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>{task.title}</Typography>
                      <Chip
                        label={task.priority}
                        sx={{ alignSelf: 'flex-start', borderRadius: 2, px: 1.4, fontWeight: 700 }}
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

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Assigned to:</strong> {Array.isArray(task.assignedTo) ? task.assignedTo.join(', ') : (task.assignedTo || 'Unassigned')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Due:</strong> {task.dueDate || "No due date"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong> {task.status}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                      <Comment sx={{ mr: 0.5, verticalAlign: "middle" }} /> Comments
                    </Typography>
                    {(task.comments || []).map((c, i) => (
                      <Paper key={i} sx={{ p: 1, my: 0.5, bgcolor: "#f9f9f9" }}>
                        <Typography variant="body2">
                          <strong>{c.author}</strong>: {c.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{c.time || c.date}</Typography>
                      </Paper>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Container>
  );
}
