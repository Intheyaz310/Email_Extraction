import React, { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import SummaryCards from './SummaryCards';
import AnalyticsStatistics from './AnalyticsStatistics';
import UserActivityTable from './UserActivityTable';
import UserRolesPieChart from './UserRolesPieChart';
import LoginTrendsChart from './LoginTrendsChart';
import Settings from './Settings';
import Profile from './Profile';
import Login from './Login';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  const handleProfile = () => {
    setCurrentView('profile');
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Box sx={{ p: 3 }}>
            <SummaryCards />
            <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <AnalyticsStatistics />
              <UserRolesPieChart />
            </Box>
            <Box sx={{ mt: 3 }}>
              <LoginTrendsChart />
            </Box>
            <Box sx={{ mt: 3 }}>
              <UserActivityTable />
            </Box>
          </Box>
        );
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <Box sx={{ p: 3 }}>
            <SummaryCards />
            <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <AnalyticsStatistics />
              <UserRolesPieChart />
            </Box>
            <Box sx={{ mt: 3 }}>
              <LoginTrendsChart />
            </Box>
            <Box sx={{ mt: 3 }}>
              <UserActivityTable />
            </Box>
          </Box>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar 
          open={sidebarOpen} 
          onToggle={handleSidebarToggle}
          onViewChange={setCurrentView}
          currentView={currentView}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Header 
            onLogout={handleLogout} 
            onProfile={handleProfile}
            onSidebarToggle={handleSidebarToggle}
          />
          <Box sx={{ 
            flexGrow: 1, 
            backgroundColor: 'background.default',
            minHeight: 'calc(100vh - 64px)'
          }}>
            {renderContent()}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
