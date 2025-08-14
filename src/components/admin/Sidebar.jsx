import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, Typography, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, nav: 'dashboard' },
  { text: 'Users', icon: <PeopleIcon />, nav: 'users' },
  { text: 'Settings', icon: <SettingsIcon />, nav: 'settings' },
];

export default function Sidebar({ open, onToggle, onViewChange, currentView }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 220,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 220,
          boxSizing: 'border-box',
          background: '#232936',
          color: '#fff',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mb: 1 }}>
          <EmailIcon fontSize="large" />
        </Avatar>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
          Email Extractor
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => onViewChange && onViewChange(item.nav)}
            selected={currentView === item.nav}
          >
            <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
} 