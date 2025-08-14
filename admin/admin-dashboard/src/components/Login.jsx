import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Grid } from '@mui/material';

// SVG illustration (email themed, inline for easy animation)
const EmailSVG = () => (
  <svg width="320" height="240" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
    <g>
      <rect x="40" y="60" width="240" height="120" rx="16" fill="#1976d2" />
      <rect x="60" y="80" width="200" height="80" rx="8" fill="#fff" />
      <polyline points="60,80 160,150 260,80" fill="none" stroke="#1976d2" strokeWidth="4" />
      <circle cx="280" cy="60" r="12" fill="#43a047" />
      <circle cx="40" cy="180" r="8" fill="#ffb300" />
      <circle cx="280" cy="180" r="6" fill="#e53935" />
    </g>
  </svg>
);

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple mock authentication
    if (username === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Grid container sx={{ maxWidth: 900, boxShadow: 6, borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper', animation: 'fadeIn 1.2s' }}>
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#181C24', p: 4 }}>
          <Box sx={{ width: '100%', textAlign: 'center', animation: 'float 2.5s infinite ease-in-out' }}>
            <EmailSVG />
            <Typography variant="h5" sx={{ color: '#fff', mt: 2, fontWeight: 700 }}>
              Welcome to Email Extractor
            </Typography>
            <Typography variant="body1" sx={{ color: '#b0b8c1', mt: 1 }}>
              Securely extract and manage your emails with ease.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: 'background.paper' }}>
          <Paper sx={{ p: 4, width: '100%', maxWidth: 340, boxShadow: 0, animation: 'fadeInUp 1.2s' }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 700 }}>
              Admin Login
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {error && <Typography color="error" variant="body2">{error}</Typography>}
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.2, fontWeight: 700 }}>
                Login
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
      `}</style>
    </Box>
  );
} 