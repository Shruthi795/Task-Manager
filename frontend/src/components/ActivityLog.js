import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

export default function ActivityLog() {
  const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
  // Gather all actions from task history
  const activities = [];

  allTasks.forEach((task) => {
    // Add task creation
    activities.push({
      type: "Task Created",
      title: task.title,
      user: task.createdBy || "Admin",
      time: new Date(task.id).toLocaleString(),
    });

    // Add all history items
    if (task.history && task.history.length > 0) {
      task.history.forEach((historyItem) => {
        activities.push({
          type: "Update",
          title: task.title,
          description: historyItem,
          time: new Date().toLocaleString(),
        });
      });
    }

    // Add comments as activities
    if (task.comments && task.comments.length > 0) {
      task.comments.forEach((comment) => {
        activities.push({
          type: "Comment",
          title: task.title,
          user: comment.author,
          description: comment.text,
          time: comment.time,
        });
      });
    }
  });

  // Sort activities by time, most recent first
  const sortedActivities = activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <Card sx={{ mt: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Activity Log
        </Typography>
        {activities.length === 0 ? (
          <Typography color="text.secondary">No activity yet.</Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {sortedActivities.map((activity, index) => (
              <Box key={index} sx={{ mb: 1.5, borderBottom: "1px solid #eee", pb: 1, "&:last-child": { borderBottom: 0 } }}>
                <Typography variant="subtitle2" color="primary">
                  {activity.type}: <strong>{activity.title}</strong>
                </Typography>
                {activity.description && (
                  <Typography variant="body2" color="text.secondary">
                    {activity.description}
                  </Typography>
                )}
                {activity.user && activity.type !== "Update" && (
                  <Typography variant="body2" color="text.secondary">
                    By: {activity.user}
                  </Typography>
                )}
                <Typography variant="caption" display="block" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}