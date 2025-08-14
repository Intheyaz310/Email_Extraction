// Mock data for admin dashboard components

export const summary = {
  totalUsers: 1250,
  activeUsers: 890,
  newUsers: 45,
  totalExtractions: 5670,
  extractionsToday: 23,
  avgExtractionsPerUser: 4.5
};

export const userActivity = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    extractions: 15,
    subscribed: true,
    subscriptionType: 'Premium'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15T09:15:00Z',
    extractions: 8,
    subscribed: true,
    subscriptionType: 'Enterprise'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'user',
    status: 'inactive',
    lastLogin: '2024-01-10T14:20:00Z',
    extractions: 3,
    subscribed: false,
    subscriptionType: 'Free'
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'moderator',
    status: 'active',
    lastLogin: '2024-01-15T11:45:00Z',
    extractions: 12,
    subscribed: true,
    subscriptionType: 'Premium'
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'user',
    status: 'active',
    lastLogin: '2024-01-15T08:30:00Z',
    extractions: 6,
    subscribed: true,
    subscriptionType: 'Basic'
  }
];

export const userRoles = [
  { name: 'Users', value: 1050, color: '#1976d2' },
  { name: 'Admins', value: 15, color: '#d32f2f' },
  { name: 'Moderators', value: 35, color: '#ed6c02' }
];

export const loginTrends = [
  { date: '2024-01-09', logins: 45, registrations: 12 },
  { date: '2024-01-10', logins: 52, registrations: 8 },
  { date: '2024-01-11', logins: 38, registrations: 15 },
  { date: '2024-01-12', logins: 67, registrations: 22 },
  { date: '2024-01-13', logins: 89, registrations: 18 },
  { date: '2024-01-14', logins: 76, registrations: 25 },
  { date: '2024-01-15', logins: 94, registrations: 31 }
];

export const extractionStats = {
  total: 5670,
  today: 23,
  thisWeek: 156,
  thisMonth: 678,
  byDomain: [
    { domain: 'gmail.com', count: 2340, percentage: 41.3 },
    { domain: 'yahoo.com', count: 1234, percentage: 21.8 },
    { domain: 'outlook.com', count: 987, percentage: 17.4 },
    { domain: 'hotmail.com', count: 456, percentage: 8.0 },
    { domain: 'other', count: 653, percentage: 11.5 }
  ]
};

export const systemHealth = {
  status: 'healthy',
  uptime: '15 days, 8 hours, 32 minutes',
  memoryUsage: '67%',
  cpuUsage: '23%',
  databaseConnections: 12,
  activeUsers: 89,
  lastBackup: '2024-01-14T02:00:00Z'
}; 