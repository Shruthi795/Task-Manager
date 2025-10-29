

import React from "react";
import { Box, Typography, Divider } from "@mui/material";

export default function CommentSection({ comments }) {
  if (!comments || comments.length === 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 1 }} />
      <Typography variant="subtitle2">Comments:</Typography>
      {comments.map((c) => (
        <Box key={c.time} sx={{ pl: 1, mt: 0.5 }}>
          <Typography variant="body2">
            <strong>{c.author}</strong>: {c.text}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {c.time}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
