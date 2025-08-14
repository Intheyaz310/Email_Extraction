import React, { useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Switch, FormControlLabel, Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { userActivity as initialUserActivity } from '../mockData';

function getSubscriptionStatus(user) {
  if (!user.subscribed) return 'Not Subscribed';
  if (!user.expiryDate) return 'Active';
  const now = new Date();
  const expiry = new Date(user.expiryDate);
  return expiry >= now ? 'Active' : 'Expired';
}

function getUserStatus(user) {
  // Show 'Active' if user is subscribed and not expired, else 'Inactive'
  if (user.subscribed && getSubscriptionStatus(user) === 'Active') return 'Active';
  return 'Inactive';
}

export default function UserActivityTable() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(initialUserActivity);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    id: '', name: '', role: '', login: '', logout: '', status: '', ip: '',
    subscribed: false, startDate: '', expiryDate: ''
  });

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (user) => {
    setSelectedUser(user);
    setViewOpen(true);
  };

  const handleEdit = (user) => {
    setEditUser({ ...user });
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUser({ ...editUser, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEditSave = () => {
    setUsers(users.map((u) => (u.id === editUser.id ? editUser : u)));
    setEditOpen(false);
  };

  const handleDelete = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  // Add User Handlers
  const handleAddOpen = () => {
    setNewUser({ id: '', name: '', company: '', login: '', logout: '', status: '', ip: '', subscribed: false, startDate: '', expiryDate: '' });
    setAddOpen(true);
  };
  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedUser = { ...newUser, [name]: type === 'checkbox' ? checked : value };
    if (name === 'subscribed' && checked) {
      // Set startDate to today and expiryDate to 30 days from today
      const today = new Date();
      const startDate = today.toISOString().slice(0, 10);
      const expiry = new Date(today);
      expiry.setDate(today.getDate() + 30);
      const expiryDate = expiry.toISOString().slice(0, 10);
      updatedUser.startDate = startDate;
      updatedUser.expiryDate = expiryDate;
    } else if (name === 'subscribed' && !checked) {
      updatedUser.startDate = '';
      updatedUser.expiryDate = '';
    }
    setNewUser(updatedUser);
  };
  const handleAddSave = () => {
    if (!newUser.id || !newUser.name) return; // Require at least ID and Name
    setUsers([...users, newUser]);
    setAddOpen(false);
  };

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddOpen}>
          Add User
        </Button>
        <TextField
          label="Search Users"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearch}
          sx={{ minWidth: 200 }}
        />
      </Stack>
      <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', boxShadow: 2, borderRadius: 2, maxHeight: 400, overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Subscribed</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Subscription Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.company}</TableCell>
                <TableCell>{row.subscribed ? 'Yes' : 'No'}</TableCell>
                <TableCell>{row.startDate}</TableCell>
                <TableCell>{row.expiryDate}</TableCell>
                <TableCell>
                  <Chip
                    label={getSubscriptionStatus(row)}
                    color={getSubscriptionStatus(row) === 'Active' ? 'success' : (getSubscriptionStatus(row) === 'Expired' ? 'error' : 'default')}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getUserStatus(row)}
                    color={getUserStatus(row) === 'Active' ? 'success' : 'default'}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell>{row.ip}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleView(row)} size="small" color="primary"><VisibilityIcon /></IconButton>
                  <IconButton onClick={() => handleEdit(row)} size="small" color="secondary"><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(row.id)} size="small" color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="User ID"
            name="id"
            value={newUser.id}
            onChange={handleAddChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={newUser.name}
            onChange={handleAddChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Company"
            name="company"
            value={newUser.company || ''}
            onChange={handleAddChange}
            fullWidth
          />
          <FormControlLabel
            control={<Switch checked={newUser.subscribed} onChange={handleAddChange} name="subscribed" />}
            label="Subscribed"
          />
          <TextField
            margin="dense"
            label="Start Date"
            name="startDate"
            type="date"
            value={newUser.startDate}
            onChange={handleAddChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={!newUser.subscribed}
          />
          <TextField
            margin="dense"
            label="Expiry Date"
            name="expiryDate"
            type="date"
            value={newUser.expiryDate}
            onChange={handleAddChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={!newUser.subscribed}
          />
          <TextField
            margin="dense"
            label="Status"
            name="status"
            value={newUser.status}
            onChange={handleAddChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="IP Address"
            name="ip"
            value={newUser.ip}
            onChange={handleAddChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSave} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)}>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <>
              <Typography><b>User ID:</b> {selectedUser.id}</Typography>
              <Typography><b>Name:</b> {selectedUser.name}</Typography>
              <Typography><b>Company:</b> {selectedUser.company}</Typography>
              <Typography><b>Subscribed:</b> {selectedUser.subscribed ? 'Yes' : 'No'}</Typography>
              <Typography><b>Start Date:</b> {selectedUser.startDate}</Typography>
              <Typography><b>Expiry Date:</b> {selectedUser.expiryDate}</Typography>
              <Typography><b>Subscription Status:</b> {getSubscriptionStatus(selectedUser)}</Typography>
              <Typography><b>Login Time:</b> {selectedUser.login}</Typography>
              <Typography><b>Logout Time:</b> {selectedUser.logout}</Typography>
              <Typography><b>Status:</b> {selectedUser.status}</Typography>
              <Typography><b>IP Address:</b> {selectedUser.ip}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {editUser && (
            <>
              <TextField
                margin="dense"
                label="Name"
                name="name"
                value={editUser.name}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                margin="dense"
                label="Company"
                name="company"
                value={editUser.company || ''}
                onChange={handleEditChange}
                fullWidth
              />
              <FormControlLabel
                control={<Switch checked={editUser.subscribed} onChange={handleEditChange} name="subscribed" />}
                label="Subscribed"
              />
              <TextField
                margin="dense"
                label="Start Date"
                name="startDate"
                type="date"
                value={editUser.startDate}
                onChange={handleEditChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={!editUser.subscribed}
              />
              <TextField
                margin="dense"
                label="Expiry Date"
                name="expiryDate"
                type="date"
                value={editUser.expiryDate}
                onChange={handleEditChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={!editUser.subscribed}
              />
              <TextField
                margin="dense"
                label="Login Time"
                name="login"
                value={editUser.login}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                margin="dense"
                label="Logout Time"
                name="logout"
                value={editUser.logout}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                margin="dense"
                label="Status"
                name="status"
                value={editUser.status}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                margin="dense"
                label="IP Address"
                name="ip"
                value={editUser.ip}
                onChange={handleEditChange}
                fullWidth
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 