import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTaskContext } from "../context/TaskContext";

export default function Navbar() {
  const { currentUser, logout } = useTaskContext();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerWidth = 240;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigateAndScroll = (route, id) => {
    // navigate first, then attempt to scroll to element by id after a short delay
    if (route) navigate(route);
    setTimeout(() => {
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  const toggleDrawer = (open) => () => {
    setMobileOpen(open);
  };

  const drawer = (
    <Box sx={{ width: drawerWidth }} role="presentation" onClick={toggleDrawer(false)}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Task Manager
      </Typography>
      <Divider />
      <List>
        {currentUser && (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigateAndScroll(currentUser.role === 'admin' ? '/admin' : '/dashboard')}>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigateAndScroll(currentUser.role === 'admin' ? '/admin' : '/dashboard', 'tasks')}>
                <ListItemText primary="Tasks" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigateAndScroll(currentUser.role === 'admin' ? '/admin' : '/dashboard', 'activity')}>
                <ListItemText primary="Activity" />
              </ListItemButton>
            </ListItem>
            {currentUser.role === 'admin' && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigateAndScroll('/admin', 'add-task')}>
                  <ListItemText primary="Add Task" />
                </ListItemButton>
              </ListItem>
            )}
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile floating menu button */}
      {!isDesktop && (
        <IconButton
          color="primary"
          onClick={toggleDrawer(true)}
          sx={{ position: 'fixed', top: 12, left: 12, zIndex: (theme) => theme.zIndex.drawer + 2, bgcolor: 'background.paper' }}
          aria-label="open navigation"
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Drawer container */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="navigation drawers">
        {/* Mobile temporary drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleDrawer(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {drawer}
        </Drawer>

        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}
