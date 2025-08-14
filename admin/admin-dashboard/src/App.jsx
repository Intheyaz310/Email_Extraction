import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Toolbar, Grid, Container, Button } from '@mui/material';
import theme from './theme';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import UserActivityTable from './components/UserActivityTable.jsx';
import LoginTrendsChart from './components/LoginTrendsChart.jsx';
import Login from './components/Login.jsx';
import Profile from './components/Profile.jsx';
import Settings from './components/Settings.jsx';
import AnalyticsStatistics from './components/AnalyticsStatistics.jsx';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [route, setRoute] = useState('dashboard');

  if (!authenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={() => setAuthenticated(true)} />
      </ThemeProvider>
    );
  }

  const handleLogout = () => {
    setAuthenticated(false);
    setRoute('dashboard');
  };
  const handleProfile = () => setRoute('profile');
  const handleBackToDashboard = () => setRoute('dashboard');
  const handleSidebarNav = (nav) => setRoute(nav);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar onNavigate={handleSidebarNav} />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header onLogout={handleLogout} onProfile={handleProfile} />
          {route === 'dashboard' && (
            <Container maxWidth="xl" sx={{ mt: 2 }}>
              <SummaryCards />
              <Grid container spacing={3} sx={{ mt: 1, mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <LoginTrendsChart />
                </Grid>
              </Grid>
              <AnalyticsStatistics />
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <UserActivityTable />
                </Grid>
              </Grid>
            </Container>
          )}
          {route === 'users' && (
            <>
              <Button variant="outlined" sx={{ mb: 2 }} onClick={handleBackToDashboard}>
                Back to Dashboard
              </Button>
              <UserActivityTable />
            </>
          )}
          {route === 'profile' && (
            <>
              <Button variant="outlined" sx={{ mb: 2 }} onClick={handleBackToDashboard}>
                Back to Dashboard
              </Button>
              <Profile />
            </>
          )}
          {route === 'settings' && (
            <>
              <Button variant="outlined" sx={{ mb: 2 }} onClick={handleBackToDashboard}>
                Back to Dashboard
              </Button>
              <Settings />
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
