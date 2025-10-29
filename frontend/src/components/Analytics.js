import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTaskContext } from "../context/TaskContext";

const COLORS = ["#7b6cff", "#6ec6ff", "#a3a0fb", "#b0bec5"];

export default function Analytics() {
  const { tasks, users } = useTaskContext();

  // Tasks per user (assigned)
  const userTaskData = users.map((u) => ({
    name: u.name,
    count: tasks.filter((t) => t.assignedTo === u.email).length,
  }));

  // Assigned vs Unassigned
  const statusData = [
    { name: "Assigned", value: tasks.filter((t) => t.assignedTo).length },
    { name: "Unassigned", value: tasks.filter((t) => !t.assignedTo).length },
  ];

  return (
    <Card sx={{ mt: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Task Analytics
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Tasks per User
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={userTaskData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#7b6cff" />
          </BarChart>
        </ResponsiveContainer>

        <Typography variant="subtitle1" sx={{ mt: 3 }}>
          Assignment Status
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              label
            >
              {statusData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
