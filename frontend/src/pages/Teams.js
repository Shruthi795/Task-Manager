import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  Paper,
  MenuItem
} from '@mui/material';
import { Add, GroupAdd, PersonRemove, Delete as DeleteIcon } from '@mui/icons-material';
import { useTaskContext } from '../context/TaskContext';
import { useNavigate } from 'react-router-dom';

// Import storage constants from TaskContext
const STORAGE = {
  USERS: "users",
  TASKS: "tasks",
  USER: "user",
  TEAMS: "teams",
};

export default function Teams() {
  const navigate = useNavigate();
  const { teams, setTeams, users, currentUser, createTeam, addUserToTeam, deleteUser } = useTaskContext();
  const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));
  const [open, setOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]); // Array for multiple user selection
  const [newTeamName, setNewTeamName] = useState('');
  const [error, setError] = useState('');
  
  const handleAddMembers = () => {
    if (selectedUsers.length > 0 && selectedTeam) {
      // Add each selected user to the team
      selectedUsers.forEach(userId => {
        addUserToTeam(userId, selectedTeam.id);
      });
      setAddMemberOpen(false);
      setSelectedUsers([]);
      setSelectedTeam(null);
    }
  };

  // Check if user is admin
  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      setError('Please enter a team name');
      return;
    }
    createTeam(newTeamName.trim());
    setNewTeamName('');
    setOpen(false);
  };

  const handleRemoveFromTeam = (userId, teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      const updated = teams.map(t => 
        t.id === teamId 
          ? { ...t, members: t.members.filter(id => id !== userId) }
          : t
      );
      setTeams(updated);
      save(STORAGE.TEAMS, updated);
    }
  };

  const handleDeleteUser = (userId) => {
    const result = deleteUser(userId);
    if (!result.ok) {
      setError(result.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>Team Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Create Team
        </Button>
      </Box>

      <Grid container spacing={3}>
        {teams.map(team => {
          const teamMembers = users.filter(u => team.members?.includes(u.id));
          const availableUsers = users.filter(u => u.role === 'user' && !team.members?.includes(u.id));

          return (
            <Grid item xs={12} md={6} key={team.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{team.name}</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, height: '300px', display: 'flex', flexDirection: 'column' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1">Team Members ({teamMembers.length})</Typography>
                      <Button
                        size="small"
                        startIcon={<GroupAdd />}
                        onClick={() => {
                          setSelectedTeam(team);
                          setAddMemberOpen(true);
                        }}
                      >
                        Add Members
                      </Button>
                    </Box>
                    <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                      {teamMembers.map(member => (
                        <ListItem key={member.id} dense>
                          <ListItemText 
                            primary={member.name} 
                            secondary={member.email}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFromTeam(member.id, team.id)}
                              sx={{ mr: 1 }}
                            >
                              <PersonRemove fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              edge="end"
                              onClick={() => handleDeleteUser(member.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItem>
                      ))}
                      {teamMembers.length === 0 && (
                        <Typography color="text.secondary" variant="body2">No members yet</Typography>
                      )}
                    </List>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Team Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Team Name"
            fullWidth
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTeam} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog
        open={addMemberOpen}
        onClose={() => {
          setAddMemberOpen(false);
          setSelectedUsers([]);
          setSelectedTeam(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Team Members</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              label="Select Users"
              fullWidth
              SelectProps={{
                multiple: true,
                renderValue: (selected) => {
                  if (!Array.isArray(selected)) return '';
                  return selected
                    .map(id => users.find(u => u.id === parseInt(id))?.name)
                    .filter(Boolean)
                    .join(', ');
                }
              }}
              value={selectedUsers}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedUsers(Array.isArray(value) ? value : []);
              }}
            >
              {users
                .filter(user => user.role === 'user' && !selectedTeam?.members?.includes(user.id))
                .map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddMemberOpen(false);
            setSelectedUsers([]);
            setSelectedTeam(null);
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddMembers}
            color="primary"
            variant="contained"
            disabled={selectedUsers.length === 0}
          >
            Add Members
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}