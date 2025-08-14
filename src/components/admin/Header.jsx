import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import React, { useState } from 'react';

export default function Header({ onLogout, onProfile }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleProfile = () => {
    handleClose();
    if (onProfile) onProfile();
  };
  const handleLogout = () => {
    handleClose();
    if (onLogout) onLogout();
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {`Welcome, ${(() => {
            try {
              const user = JSON.parse(localStorage.getItem('user') || 'null');
              return user?.name || user?.email || 'User';
            } catch { return 'User'; }
          })()}`}
        </Typography>
        {/* Removed Logout button */}
        <IconButton color="inherit" onClick={handleMenu}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <AccountCircleIcon />
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleProfile}>Profile</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
} 