export const summary = [
  { label: 'Total Users', value: 1240 },
  { label: 'Active Users Now', value: 87 },
  { label: 'Logins Today', value: 312 },
  { label: 'Logouts Today', value: 198 },
];

export const userActivity = [
  {
    id: 'U001', name: 'Alice Smith', company: 'Acme Corp', login: '09:12', logout: '17:30', status: 'Online', ip: '192.168.1.2',
    subscribed: true, startDate: '2024-07-01', expiryDate: '2024-08-01'
  },
  {
    id: 'U002', name: 'Bob Lee', company: 'Globex Inc', login: '08:45', logout: '16:50', status: 'Offline', ip: '192.168.1.3',
    subscribed: false, startDate: '', expiryDate: ''
  },
  // ...add more mock users with company field
  // Added mock subscribers for testing
  ...Array.from({ length: 100 }).map((_, i) => {
    // Distribute over last 6 months
    const now = new Date();
    const monthOffset = i % 6;
    const start = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1 + (i % 28));
    const expiry = new Date(start);
    expiry.setMonth(start.getMonth() + 1);
    return {
      id: `U${(i+3).toString().padStart(3, '0')}`,
      name: `Subscriber ${i+1}`,
      company: `Company ${((i%10)+1)}`,
      login: '09:00',
      logout: '17:00',
      status: 'Online',
      ip: `192.168.1.${i+4}`,
      subscribed: true,
      startDate: start.toISOString().slice(0,10),
      expiryDate: expiry.toISOString().slice(0,10)
    };
  })
];

export const loginTrends = [
  { day: 'Mon', logins: 40 },
  { day: 'Tue', logins: 55 },
  { day: 'Wed', logins: 60 },
  { day: 'Thu', logins: 70 },
  { day: 'Fri', logins: 90 },
  { day: 'Sat', logins: 50 },
  { day: 'Sun', logins: 30 },
];

export const userRoles = [
  { name: 'Admin', value: 10 },
  { name: 'HR', value: 20 },
  { name: 'Recruiter', value: 30 },
  { name: 'Candidate', value: 40 },
]; 