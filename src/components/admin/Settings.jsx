import { Box, Typography, Tabs, Tab, Paper, Button, TextField, Alert, Stack, Switch, FormControlLabel } from '@mui/material';
import React, { useState } from 'react';

function TabPanel({ value, index, children }) {
  return value === index ? (
    <Box sx={{ p: 3 }}>
      {children}
    </Box>
  ) : null;
}

export default function Settings() {
  const [tab, setTab] = useState(0);
  // Profile state
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
  const [name, setName] = useState(storedUser?.name || '');
  const [email, setEmail] = useState(storedUser?.email || '');
  const [phone, setPhone] = useState('9876543210');
  const [address, setAddress] = useState('123 Main St, City');
  const [department, setDepartment] = useState('Admin');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: storedUser?.name || '', email: storedUser?.email || '', phone: '9876543210', address: '123 Main St, City', department: 'Admin' });
  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);

  const handleProfileEdit = () => {
    setProfileDraft({ name, email, phone, address, department });
    setEditingProfile(true);
  };
  const handleProfileCancel = () => {
    setEditingProfile(false);
    setProfileDraft({ name, email, phone, address, department });
  };
  const handleProfileDraftChange = (e) => {
    setProfileDraft({ ...profileDraft, [e.target.name]: e.target.value });
  };
  const handleProfileSave = (e) => {
    e.preventDefault();
    setName(profileDraft.name);
    setEmail(profileDraft.email);
    setPhone(profileDraft.phone);
    setAddress(profileDraft.address);
    setDepartment(profileDraft.department);
    setProfileSuccess(true);
    setEditingProfile(false);
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 2000);
    setOldPassword('');
    setNewPassword('');
  };

  const handlePrefSave = (e) => {
    e.preventDefault();
    setPrefSuccess(true);
    setTimeout(() => setPrefSuccess(false), 2000);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label="Profile" />
          <Tab label="Password" />
          <Tab label="Preferences" />
          <Tab label="About" />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <Typography variant="h6">Profile Settings</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Update your profile information here.</Typography>
          {!editingProfile ? (
            <>
              <TextField label="Name" fullWidth margin="normal" value={name} InputProps={{ readOnly: true }} />
              <TextField label="Email" fullWidth margin="normal" value={email} InputProps={{ readOnly: true }} />
              <TextField label="Phone" fullWidth margin="normal" value={phone} InputProps={{ readOnly: true }} />
              <TextField label="Address" fullWidth margin="normal" value={address} InputProps={{ readOnly: true }} />
              <TextField label="Department" fullWidth margin="normal" value={department} InputProps={{ readOnly: true }} />
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="contained" onClick={handleProfileEdit}>Edit</Button>
              </Box>
            </>
          ) : (
            <form onSubmit={handleProfileSave}>
              <TextField label="Name" name="name" fullWidth margin="normal" value={profileDraft.name} onChange={handleProfileDraftChange} />
              <TextField label="Email" name="email" fullWidth margin="normal" value={profileDraft.email} onChange={handleProfileDraftChange} />
              <TextField label="Phone" name="phone" fullWidth margin="normal" value={profileDraft.phone} onChange={handleProfileDraftChange} />
              <TextField label="Address" name="address" fullWidth margin="normal" value={profileDraft.address} onChange={handleProfileDraftChange} />
              <TextField label="Department" name="department" fullWidth margin="normal" value={profileDraft.department} onChange={handleProfileDraftChange} />
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                <Button type="submit" variant="contained">Save</Button>
                <Button variant="outlined" onClick={handleProfileCancel}>Cancel</Button>
              </Stack>
              {profileSuccess && <Alert severity="success" sx={{ mt: 2 }}>Profile updated!</Alert>}
            </form>
          )}
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <Typography variant="h6">Change Password</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Change your account password here.</Typography>
          <form onSubmit={handlePasswordChange}>
            <TextField label="Old Password" type="password" fullWidth margin="normal" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
            <TextField label="New Password" type="password" fullWidth margin="normal" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button type="submit" variant="contained">Save</Button>
            </Box>
            {passwordSuccess && <Alert severity="success" sx={{ mt: 2 }}>Password changed!</Alert>}
          </form>
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <Typography variant="h6">Preferences</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Set your notification and theme preferences here.</Typography>
          <form onSubmit={handlePrefSave}>
            <FormControlLabel control={<Switch checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} />} label="Email Notifications" />
            <FormControlLabel control={<Switch checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />} label="Dark Mode" />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button type="submit" variant="contained">Save Preferences</Button>
            </Box>
            {prefSuccess && <Alert severity="success" sx={{ mt: 2 }}>Preferences saved!</Alert>}
          </form>
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <Typography variant="h6">About</Typography>
          <Typography color="text.secondary">Admin Console v1.0.0</Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
} 