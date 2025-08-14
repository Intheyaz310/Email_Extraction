import { Grid, Card, CardContent, Typography, Avatar, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { summary, userActivity } from './mockData';

const icons = [
  <PeopleIcon />, // Total Users
  <PersonAddIcon />, // Active Users Now
  <LoginIcon />, // Logins Today
  <LogoutIcon />, // Logouts Today
];

const iconColors = [
  '#1976d2', // blue
  '#43a047', // green
  '#ffb300', // yellow
  '#e53935', // red
];

export default function SummaryCards() {
  // Calculate expired users
  const now = new Date();
  const expiredCount = userActivity.filter(u => u.subscribed && u.expiryDate && new Date(u.expiryDate) < now).length;

  // Calculate users subscribed this month
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const subscribedThisMonth = userActivity.filter(u => {
    if (!u.subscribed || !u.startDate) return false;
    const start = new Date(u.startDate);
    return start.getMonth() === currentMonth && start.getFullYear() === currentYear;
  }).length;

  // Build new summary array with updated values and labels
  const updatedSummary = [
    { label: 'Total Users', value: summary[0]?.value ?? 0 },
    { label: 'Active Users Now', value: summary[1]?.value ?? 0 },
    { label: 'Subscription Expired', value: expiredCount },
    { label: 'Subscribed This Month', value: subscribedThisMonth },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {updatedSummary.map((item, idx) => (
        <Grid item xs={12} sm={6} md={3} key={item.label}>
          <Card sx={{
            bgcolor: 'background.paper',
            color: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            borderRadius: 3,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            minHeight: 120,
          }}>
            <CardContent sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2, p: 0 }}>
              <Avatar sx={{ bgcolor: iconColors[idx], width: 48, height: 48 }}>
                {icons[idx]}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                  {item.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
} 