// UserRolesPieChart.jsx
import { Paper, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { userRoles } from './mockData';

const COLORS = ['#1976d2', '#00bcd4', '#43a047', '#ff9800'];

export default function UserRolesPieChart() {
  return (
    <Paper sx={{ p: 2, bgcolor: 'background.paper', boxShadow: 2, borderRadius: 2, height: 480, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="subtitle1" gutterBottom align="center">
        User Roles Distribution
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ResponsiveContainer width={400} height={400}>
          <PieChart>
            <Pie
              data={userRoles}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={170}
              label
            >
              {userRoles.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
} 