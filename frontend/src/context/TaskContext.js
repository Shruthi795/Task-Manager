import React, { createContext, useContext, useState, useEffect } from "react";

const TaskContext = createContext();
const STORAGE = {
  USERS: "users",
  TASKS: "tasks",
  // Keep key consistent with other pages (Login/Signup use "user")
  USER: "user",
  TEAMS: "teams",
};

export const TaskProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [teams, setTeams] = useState([]);

  // Load on mount
  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem(STORAGE.USERS) || "[]"));
    const loadedTasks = JSON.parse(localStorage.getItem(STORAGE.TASKS) || "[]");
    // Ensure all tasks have a members array
    const migratedTasks = loadedTasks.map(task => ({
      ...task,
      members: task.members || [],
      teamId: task.teamId || null
    }));
    setTasks(migratedTasks);
    save(STORAGE.TASKS, migratedTasks); // Save migrated tasks back to storage
    setCurrentUser(JSON.parse(localStorage.getItem(STORAGE.USER) || "null"));
    setTeams(JSON.parse(localStorage.getItem(STORAGE.TEAMS) || "[]"));
  }, []);

  // Helpers
  const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  const signup = ({ name, email, password, role, teamId }) => {
    if (!name || !email || !password) return { ok: false, message: "All fields required" };
    if (users.some((u) => u.email === email)) return { ok: false, message: "User exists" };
    const newUser = { 
      id: Date.now(), 
      name, 
      email, 
      password, 
      role,
      teamId: teamId || null,
      isTeamAdmin: false // Set to false by default, will be set to true when creating/managing a team
    };
    const updated = [...users, newUser];
    setUsers(updated);
    save(STORAGE.USERS, updated);
    // Automatically log in after signup
    setCurrentUser(newUser);
    save(STORAGE.USER, newUser);
    return { ok: true };
  };

  const login = ({ email, password }) => {
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { ok: false, message: "Invalid credentials" };
    setCurrentUser(found);
    save(STORAGE.USER, found);
    return { ok: true, user: found };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE.USER);
  };

  const addTask = (task) => {
    const newTask = { 
      ...task, 
      id: Date.now(), 
      comments: [],
      teamId: currentUser.teamId,
      members: [] // Initialize empty members array
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    save(STORAGE.TASKS, updated);
  };

  const assignTask = (taskId, emails) => {
    // emails can be a single email or an array of emails
    const assigneeList = Array.isArray(emails) ? emails : [emails];
    const updated = tasks.map((t) => 
      t.id === taskId 
        ? { 
            ...t, 
            assignedTo: assigneeList,
            assignedAt: new Date().toISOString()
          } 
        : t
    );
    setTasks(updated);
    save(STORAGE.TASKS, updated);
    // notify other parts of the app that localStorage was updated
    try { window.dispatchEvent(new Event('custom_local_update')); } catch (e) {}
  };

  const addComment = (taskId, comment) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t
    );
    setTasks(updated);
    save(STORAGE.TASKS, updated);
  };

  // Team management
  const createTeam = (name) => {
    const newTeam = {
      id: Date.now(),
      name,
      adminId: currentUser.id,
      createdBy: currentUser.id,
      members: [] // Initialize empty members array
    };
    const updated = [...teams, newTeam];
    setTeams(updated);
    save(STORAGE.TEAMS, updated);
    
    // Update the current user to be the team admin and add them as first member
    const updatedUsers = users.map(u => 
      u.id === currentUser.id 
        ? { ...u, isTeamAdmin: true }
        : u
    );
    setUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);
    
    // Update current user in storage
    const updatedCurrentUser = { ...currentUser, isTeamAdmin: true };
    setCurrentUser(updatedCurrentUser);
    save(STORAGE.USER, updatedCurrentUser);
    
    return newTeam;
  };

  const addUserToTeam = (userId, teamId) => {
    // Add userId to team's members array
    const updated = teams.map(team => 
      team.id === teamId
        ? { ...team, members: [...team.members, userId] }
        : team
    );
    setTeams(updated);
    save(STORAGE.TEAMS, updated);
  };

  const deleteUser = (userId) => {
    // Check if user is a team admin
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.isTeamAdmin) {
      return { ok: false, message: "Cannot delete a team admin" };
    }

    // Remove user from their team's tasks
    const updatedTasks = tasks.map(task => ({
      ...task,
      assignedTo: Array.isArray(task.assignedTo) 
        ? task.assignedTo.filter(email => email !== userToDelete.email)
        : task.assignedTo === userToDelete.email ? null : task.assignedTo,
      members: task.members.filter(memberId => memberId !== userId)
    }));
    setTasks(updatedTasks);
    save(STORAGE.TASKS, updatedTasks);

    // Remove user from users list
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    save(STORAGE.USERS, updatedUsers);

    return { ok: true };
  };

  const addTaskMember = (taskId, userId) => {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, members: [...t.members, userId] } : t
    );
    setTasks(updated);
    save(STORAGE.TASKS, updated);
    try { window.dispatchEvent(new Event('custom_local_update')); } catch (e) {}
  };

  const removeTaskMember = (taskId, userId) => {
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, members: t.members.filter(m => m !== userId) } : t
    );
    setTasks(updated);
    save(STORAGE.TASKS, updated);
    try { window.dispatchEvent(new Event('custom_local_update')); } catch (e) {}
  };

  const getTeamTasks = (teamId) => {
    return tasks.filter(t => t.teamId === teamId);
  };

  const getTeamMembers = (teamId) => {
    return users.filter(u => u.teamId === teamId);
  };

  return (
    <TaskContext.Provider
      value={{ 
        users, 
        tasks, 
        teams,
        currentUser, 
        signup, 
        login, 
        logout, 
        addTask, 
        assignTask, 
        addComment,
        createTeam,
        addUserToTeam,
        addTaskMember,
        removeTaskMember,
        getTeamTasks,
        getTeamMembers,
        deleteUser // Add the deleteUser function to the context
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => useContext(TaskContext);
