import React, { useState } from "react";
import { Card, CardContent, Typography, TextField, Button, MenuItem } from "@mui/material";
import CommentSection from "./CommentSection";
import { useTaskContext } from "../context/TaskContext";

export default function TaskCard({ task, isAdmin }) {
  const { users, assignTask, addComment, currentUser } = useTaskContext();
  const [comment, setComment] = useState("");

  const handleAssign = (e) => assignTask(task.id, e.target.value);
  const handleAddComment = () => {
    if (!comment) return;
    addComment(task.id, { text: comment, author: currentUser.email, time: new Date().toLocaleString() });
    setComment("");
  };

  return (
    <Card sx={{ mb: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6">{task.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {task.description}
        </Typography>

        {isAdmin && (
          <TextField
            select
            label="Assign To"
            fullWidth
            size="small"
            value={task.assignedTo || ""}
            onChange={handleAssign}
            sx={{ mt: 2 }}
          >
            <MenuItem value="">Unassigned</MenuItem>
            {users.map((u) => (
              <MenuItem key={u.email} value={u.email}>
                {u.name} ({u.email})
              </MenuItem>
            ))}
          </TextField>
        )}

        <CommentSection comments={task.comments || []} />

        <TextField
          label="Add comment"
          fullWidth
          size="small"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mt: 1 }}
        />
        <Button variant="contained" sx={{ mt: 1 }} onClick={handleAddComment}>
          Add
        </Button>
      </CardContent>
    </Card>
  );
}
