import { AppBar, Toolbar, Typography, IconButton, Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function Header() {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Admin Dashboard
        </Typography>
        <IconButton color="inherit">
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <AccountCircleIcon />
          </Avatar>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
} 