import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { useTaskContext } from "../context/TaskContext";

export default function ActivityLog() {
  const { tasks } = useTaskContext();

  // Gather all actions: task created, assigned, commented
  const activities = [];

  tasks.forEach((t) => {
    activities.push({
      type: "Task Created",
      title: t.title,
      user: t.createdBy || "Admin",
      time: new Date(t.id).toLocaleString(),
    });

    if (t.assignedTo)
      activities.push({
        type: "Assigned",
        title: t.title,
        user: t.assignedTo,
        time: new Date(t.id).toLocaleString(),
      });

    if (t.comments?.length)
      t.comments.forEach((c) =>
        activities.push({
          type: "Comment",
          title: t.title,
          user: c.author,
          time: c.time,
        })
      );
  });

  return (
    <Card sx={{ mt: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Activity Log
        </Typography>
        {activities.length === 0 ? (
          <Typography color="text.secondary">No activity yet.</Typography>
        ) : (
          activities
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .map((a, i) => (
              <Box key={i} sx={{ mb: 1.5, borderBottom: "1px solid #eee", pb: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  {a.type}
                </Typography>
                <Typography variant="body2">
                  {a.title} – <strong>{a.user}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {a.time}
                </Typography>
              </Box>
            ))
        )}
      </CardContent>
    </Card>
  );
}
