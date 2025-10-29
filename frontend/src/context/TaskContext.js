import React, { createContext, useContext, useState, useEffect } from "react";

const TaskContext = createContext();
const STORAGE = {
  USERS: "users",
  TASKS: "tasks",
    // Keep key consistent with other pages (Login/Signup use "user")
    USER: "user",
};

export const TaskProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Load on mount
  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem(STORAGE.USERS) || "[]"));
    setTasks(JSON.parse(localStorage.getItem(STORAGE.TASKS) || "[]"));
    setCurrentUser(JSON.parse(localStorage.getItem(STORAGE.USER) || "null"));
  }, []);

  // Helpers
  const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  const signup = ({ name, email, password, role }) => {
    if (!name || !email || !password) return { ok: false, message: "All fields required" };
    if (users.some((u) => u.email === email)) return { ok: false, message: "User exists" };
    const newUser = { id: Date.now(), name, email, password, role };
    const updated = [...users, newUser];
    setUsers(updated);
    save(STORAGE.USERS, updated);
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
    const newTask = { ...task, id: Date.now(), comments: [] };
    const updated = [...tasks, newTask];
    setTasks(updated);
    save(STORAGE.TASKS, updated);
  };

  const assignTask = (taskId, email) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, assignedTo: email } : t));
    setTasks(updated);
    save(STORAGE.TASKS, updated);
  };

  const addComment = (taskId, comment) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t
    );
    setTasks(updated);
    save(STORAGE.TASKS, updated);
  };

  return (
    <TaskContext.Provider
      value={{ users, tasks, currentUser, signup, login, logout, addTask, assignTask, addComment }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => useContext(TaskContext);
