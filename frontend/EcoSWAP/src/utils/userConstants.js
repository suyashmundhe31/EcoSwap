// User Dashboard Data
export const USER_DASHBOARD_DATA = {
  totalIssued: 2000,
  currentPrice: 28.91,
  
  issueHistory: [
    {
      id: 'ID-4345',
      date: '23-04-25',
      coins: 200,
      source: 'Solar Energy',
      verificationStatus: 'Verified',
      status: 'Verified'
    },
    {
      id: 'ID-4376',
      date: '24-09-20',
      coins: 400,
      source: 'Reforestation',
      verificationStatus: 'Not Verified',
      status: 'Completed'
    }
  ]
};

// User Navigation Items
export const USER_NAV_ITEMS = [
  { id: '/user', label: 'Dashboard' },
  { id: '/user/new-coins', label: 'New coins' },
  { id: '/user/history', label: 'History' }
];