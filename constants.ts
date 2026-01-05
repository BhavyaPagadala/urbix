
export const ADMIN_SECRET_KEY = 'bhavya';

export const CIVIC_CATEGORIES = [
  'Roads & Infrastructure',
  'Water Supply',
  'Sanitation & Waste',
  'Electricity',
  'Public Safety',
  'Environment',
  'Transportation',
  'Public Parks',
  'Healthcare',
  'Other'
];

export const MOCK_REPORTS_INITIAL = [
  {
    id: 'rep-1',
    reporter: 'city_watcher',
    title: 'Large Pothole on Main St',
    description: 'There is a massive pothole near the intersection of 5th and Main. It is dangerous for cyclists.',
    category: 'Roads & Infrastructure',
    sentiment: 'negative',
    status: 'pending',
    location: { locality: 'Downtown' },
    createdAt: Date.now() - 86400000 * 2,
    aiInsights: 'High priority due to safety risk for non-motorized transport.'
  },
  {
    id: 'rep-2',
    reporter: 'green_citizen',
    title: 'Beautiful New Park Equipment',
    description: 'The new swings at Sunnydale Park are fantastic! Kids love them.',
    category: 'Public Parks',
    sentiment: 'positive',
    status: 'resolved',
    location: { locality: 'Sunnydale' },
    createdAt: Date.now() - 86400000 * 5,
    aiInsights: 'Community satisfaction is high in the Sunnydale locality.'
  }
];
