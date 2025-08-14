import React from 'react';
import { Box, Paper, Typography, Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function Profile() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Paper sx={{ p: 4, minWidth: 320, boxShadow: 3, textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
          <AccountCircleIcon sx={{ fontSize: 48 }} />
        </Avatar>
        <Typography variant="h5" gutterBottom>Profile</Typography>
        <Typography variant="body1"><b>Username:</b> admin</Typography>
        <Typography variant="body1"><b>Role:</b> Admin</Typography>
        <Typography variant="body1"><b>Email:</b> admin@example.com</Typography>
        <Typography variant="body1"><b>Joined:</b> Jan 1, 2024</Typography>
      </Paper>
    </Box>
  );
} 