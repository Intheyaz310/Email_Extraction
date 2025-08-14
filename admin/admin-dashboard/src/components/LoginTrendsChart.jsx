import { Paper, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { loginTrends } from '../mockData';
import { userActivity } from '../mockData';

function getMonthlySubscriptions(users) {
  // Map: { 'YYYY-MM': count }
  const monthly = {};
  users.forEach(u => {
    if (u.subscribed && u.startDate) {
      const date = new Date(u.startDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + 1;
    }
  });
  // Convert to array sorted by date
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

export default function LoginTrendsChart() {
  const monthlyData = getMonthlySubscriptions(userActivity);
  // Show only the last 5 months
  const lastMonths = monthlyData.slice(-5);
  return (
    <Paper sx={{ p: 2, bgcolor: 'background.paper', boxShadow: 2, borderRadius: 2, height: 600, minWidth: 700, width: '100%' }}>
      <Typography variant="subtitle1" gutterBottom>
        Monthly Subscriptions (Last 5 Months)
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={lastMonths} width={640} height={500} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="month" stroke="#b0b8c1" tick={{ fontSize: 18, fontWeight: 600 }} />
          <YAxis stroke="#b0b8c1" tick={{ fontSize: 18, fontWeight: 600 }} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#1976d2" strokeWidth={4} dot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
} 