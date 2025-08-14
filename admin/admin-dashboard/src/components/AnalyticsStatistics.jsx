// AnalyticsStatistics.jsx
import React from 'react';
import { Paper, Grid, Typography, Box, Chip, Stack, Card, CardContent, Avatar, useTheme } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Placeholder/mock data for demonstration
const totalEmailsExtracted = 5234;
const activeRecruiters = 18;
const companiesContacted = [
  { domain: 'acme.com', count: 120 },
  { domain: 'globex.com', count: 95 },
  { domain: 'initech.com', count: 80 },
  { domain: 'umbrella.com', count: 60 },
];
const attachmentsDownloaded = 342;
const commonJobTitles = [
  { title: 'Software Engineer', count: 45 },
  { title: 'Data Analyst', count: 32 },
  { title: 'HR Manager', count: 28 },
  { title: 'Recruiter', count: 25 },
  { title: 'Product Manager', count: 20 },
];
const emailsOverTime = [
  { month: '2024-03', emails: 800 },
  { month: '2024-04', emails: 1200 },
  { month: '2024-05', emails: 950 },
  { month: '2024-06', emails: 1100 },
  { month: '2024-07', emails: 1184 },
];

const statCards = [
  {
    label: 'Total Emails Extracted',
    value: totalEmailsExtracted,
    icon: <EmailIcon fontSize="large" />, color: 'primary.main',
    bg: 'linear-gradient(135deg, #1976d2 30%, #64b5f6 100%)',
  },
  {
    label: 'Active Recruiters',
    value: activeRecruiters,
    icon: <GroupIcon fontSize="large" />, color: 'secondary.main',
    bg: 'linear-gradient(135deg, #9c27b0 30%, #ce93d8 100%)',
  },
  {
    label: 'Attachments Downloaded',
    value: attachmentsDownloaded,
    icon: <AttachFileIcon fontSize="large" />, color: 'success.main',
    bg: 'linear-gradient(135deg, #43a047 30%, #a5d6a7 100%)',
  },
  {
    label: 'Companies Contacted',
    value: companiesContacted.reduce((a, c) => a + c.count, 0),
    icon: <BusinessIcon fontSize="large" />, color: 'warning.main',
    bg: 'linear-gradient(135deg, #ff9800 30%, #ffe0b2 100%)',
  },
];

export default function AnalyticsStatistics() {
  const theme = useTheme();
  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, mt: 2, borderRadius: 4, boxShadow: 6, background: theme.palette.background.default }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>Analytics & Statistics</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ overflowX: { xs: 'auto', md: 'visible' }, mb: 3 }}>
            <Grid container spacing={3} wrap="nowrap" sx={{ minWidth: 900 }}>
              {statCards.map((card, idx) => (
                <Grid item xs={12} sm={6} md={3} lg={3} xl={3} key={card.label} sx={{ minWidth: 240 }}>
                  <Card sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 3,
                    boxShadow: 3,
                    background: card.bg,
                    color: '#fff',
                    minHeight: 120,
                    p: 1.5,
                  }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', width: 56, height: 56, mr: 2 }}>
                      {card.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>{card.label}</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>{card.value}</Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
        {/* Most Common Job Titles (Tag cloud/Table) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2, minHeight: 180, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}><WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Most Common Job Titles</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
              {commonJobTitles.map(j => (
                <Chip key={j.title} label={`${j.title} (${j.count})`} size="medium" color="info" sx={{ fontSize: 16, m: 0.5, fontWeight: 600 }} />
              ))}
            </Stack>
          </Card>
        </Grid>
        {/* Companies Contacted (by sender domain) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2, minHeight: 180, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'warning.main' }}><BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Companies Contacted</Typography>
            <Stack direction="column" spacing={1} alignItems="flex-start" sx={{ mt: 1 }}>
              {companiesContacted.map(c => (
                <Chip key={c.domain} label={`${c.domain} (${c.count})`} color="warning" sx={{ fontWeight: 600, fontSize: 15 }} />
              ))}
            </Stack>
          </Card>
        </Grid>
        {/* Emails Received Over Time (Line/Bar Chart) */}
        <Grid item xs={12}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2, minHeight: 260, mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'info.main' }}><BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Emails Received Over Time</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={emailsOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#8884d8" tick={{ fontWeight: 600 }} />
                <YAxis stroke="#8884d8" tick={{ fontWeight: 600 }} />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }} />
                <Legend />
                <Bar dataKey="emails" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
} 