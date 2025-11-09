import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Delete, PersonAdd } from '@mui/icons-material';
import { useTaskContext } from '../context/TaskContext';

export default function TaskMembers({ task, onClose }) {
  const { users, currentUser, addTaskMember, removeTaskMember } = useTaskContext();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  // Get team members (excluding current task members)
  const teamMembers = users.filter(user => 
    user.teamId === currentUser.teamId && 
    !(task.members || []).includes(user.id)
  );

  // Get current task members
  const taskMembers = users.filter(user => (task.members || []).includes(user.id));

  const handleAddMember = () => {
    if (selectedUser) {
      addTaskMember(task.id, selectedUser);
      setSelectedUser('');
      setOpen(false);
    }
  };

  const handleRemoveMember = (userId) => {
    removeTaskMember(task.id, userId);
  };

  return (
    <>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Task Members</Typography>
          <IconButton color="primary" onClick={() => setOpen(true)}>
            <PersonAdd />
          </IconButton>
        </Box>

        <List>
          {taskMembers.map(member => (
            <ListItem key={member.id}>
              <ListItemText primary={member.name} secondary={member.email} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleRemoveMember(member.id)}>
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {taskMembers.length === 0 && (
            <Typography color="text.secondary" align="center">
              No members added yet
            </Typography>
          )}
        </List>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Member</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="Select Member"
            >
              {teamMembers.map(member => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMember} variant="contained" disabled={!selectedUser}>
            Add Member
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}