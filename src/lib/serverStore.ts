import {
  Complaint,
  Donation,
  Driver,
  ImpactStats,
  NetworkPartner,
  RecoveryRecord,
  Shelter,
  User,
} from '@/types';
import { MOCK_DONATIONS, MOCK_SHELTERS, MOCK_DRIVERS, computeImpactStats } from '@/services/mockData';

const dateMonthsAgo = (monthsAgo: number, day: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo, day);
  date.setHours(10, 30, 0, 0);
  return date.toISOString();
};

// Shared in-memory store for Next.js API route handlers
export const globalServerStore = {
  donations: [...MOCK_DONATIONS] as Donation[],
  shelters: [...MOCK_SHELTERS] as Shelter[],
  drivers: [...MOCK_DRIVERS] as Driver[],
  users: [
    {
      id: 'user-donor-1',
      name: 'Sarah Jenkins',
      email: 'donor@replate.org',
      phone: '+1 (555) 234-5678',
      role: 'DONOR',
      organization: 'Grand Hyatt Hotel Catering',
      location: 'Financial District, SF',
      status: 'ACTIVE',
      activeRescueId: 'RP-1024',
    },
    {
      id: 'user-donor-2',
      name: 'Marco Rossi',
      email: 'trattoria@replate.org',
      phone: '+1 (555) 789-0123',
      role: 'DONOR',
      organization: 'Bella Vista Trattoria',
      location: 'North Beach, SF',
      status: 'ACTIVE',
      activeRescueId: 'RP-1027',
    },
    {
      id: 'user-shelter-1',
      name: 'Marcus Williams',
      email: 'shelter@replate.org',
      phone: '+1 (555) 876-5432',
      role: 'SHELTER',
      organization: 'Hope Community Shelter & Kitchen',
      location: 'Downtown, SF',
      status: 'ACTIVE',
      activeRescueId: 'RP-1024',
    },
    {
      id: 'user-driver-1',
      name: 'Aarav Patel',
      email: 'driver@replate.org',
      phone: '+1 (555) 111-2233',
      role: 'DRIVER',
      organization: 'Refrigerated Transport Volunteer',
      location: 'En Route Embarcadero',
      status: 'ACTIVE',
      activeRescueId: 'RP-1024',
    },
    {
      id: 'user-admin-1',
      name: 'Operations Dispatch Admin',
      email: 'admin@replate.org',
      phone: '+1 (555) 999-0000',
      role: 'ADMIN',
      organization: 'RePlate Regional Command',
      location: 'San Francisco Hub',
      status: 'ACTIVE',
    },
  ] as User[],
  safetyReviews: [
    {
      id: 'SR-201',
      donationId: 'RP-1029',
      donorName: 'Metro Express Deli',
      foodName: 'Artisan Turkey & Cheddar Baguette Boxes',
      category: 'Packaged Goods',
      storageMethod: 'refrigerated',
      pickupDeadline: new Date(Date.now() + 70 * 60000).toISOString(),
      flaggedReason: 'Dairy allergen affirmation requires food handling audit confirmation.',
      status: 'PENDING_REVIEW',
    },
    {
      id: 'SR-202',
      donationId: 'RP-1030',
      donorName: 'Pacific Culinary Institute',
      foodName: 'Herb Roasted Salmon & Wild Rice',
      category: 'Cooked Meal',
      storageMethod: 'hot_held',
      pickupDeadline: new Date(Date.now() + 19 * 60000).toISOString(),
      flaggedReason: 'Critical remaining time (<20 min) requires expedited thermal barrier confirmation.',
      status: 'PENDING_REVIEW',
    },
  ],
  partners: [
    { id: 'partner-01', name: 'Seasons Table', kind: 'RESTAURANT', state: 'Maharashtra', city: 'Mumbai', status: 'CONNECTED' },
    { id: 'partner-02', name: 'Harbour Kitchen', kind: 'RESTAURANT', state: 'Maharashtra', city: 'Mumbai', status: 'CONNECTED' },
    { id: 'partner-03', name: 'Saffron House', kind: 'RESTAURANT', state: 'Maharashtra', city: 'Pune', status: 'CONNECTED' },
    { id: 'partner-04', name: 'Mango Grove Cafe', kind: 'RESTAURANT', state: 'Karnataka', city: 'Bengaluru', status: 'CONNECTED' },
    { id: 'partner-05', name: 'Southern Spoon', kind: 'RESTAURANT', state: 'Tamil Nadu', city: 'Chennai', status: 'CONNECTED' },
    { id: 'partner-06', name: 'The Curry Leaf', kind: 'RESTAURANT', state: 'Telangana', city: 'Hyderabad', status: 'CONNECTED' },
    { id: 'partner-07', name: 'Civic Canteen', kind: 'RESTAURANT', state: 'Delhi', city: 'New Delhi', status: 'CONNECTED' },
    { id: 'partner-08', name: 'Riverfront Meals', kind: 'RESTAURANT', state: 'Gujarat', city: 'Ahmedabad', status: 'CONNECTED' },
    { id: 'partner-09', name: 'Fresh Basket Market', kind: 'GROCERY', state: 'Maharashtra', city: 'Mumbai', status: 'CONNECTED' },
    { id: 'partner-10', name: 'Daily Harvest', kind: 'GROCERY', state: 'Maharashtra', city: 'Pune', status: 'CONNECTED' },
    { id: 'partner-11', name: 'Neighbourhood Grocers', kind: 'GROCERY', state: 'Karnataka', city: 'Bengaluru', status: 'CONNECTED' },
    { id: 'partner-12', name: 'Green Cart', kind: 'GROCERY', state: 'Tamil Nadu', city: 'Chennai', status: 'CONNECTED' },
    { id: 'partner-13', name: 'Market Circle', kind: 'GROCERY', state: 'Telangana', city: 'Hyderabad', status: 'CONNECTED' },
    { id: 'partner-14', name: 'City Pantry', kind: 'GROCERY', state: 'Delhi', city: 'New Delhi', status: 'CONNECTED' },
    { id: 'partner-15', name: 'Asha Community Kitchen', kind: 'NGO', state: 'Maharashtra', city: 'Mumbai', status: 'CONNECTED' },
    { id: 'partner-16', name: 'Second Serve Foundation', kind: 'NGO', state: 'Maharashtra', city: 'Pune', status: 'CONNECTED' },
    { id: 'partner-17', name: 'Open Plate Trust', kind: 'NGO', state: 'Karnataka', city: 'Bengaluru', status: 'CONNECTED' },
    { id: 'partner-18', name: 'Namma Food Network', kind: 'NGO', state: 'Karnataka', city: 'Bengaluru', status: 'CONNECTED' },
    { id: 'partner-19', name: 'Chennai Food Collective', kind: 'NGO', state: 'Tamil Nadu', city: 'Chennai', status: 'CONNECTED' },
    { id: 'partner-20', name: 'Warmth Foundation', kind: 'NGO', state: 'Telangana', city: 'Hyderabad', status: 'CONNECTED' },
    { id: 'partner-21', name: 'Community Table Delhi', kind: 'NGO', state: 'Delhi', city: 'New Delhi', status: 'CONNECTED' },
  ] as NetworkPartner[],
  recoveryHistory: [
    { id: 'recovery-01', completedAt: dateMonthsAgo(5, 8), meals: 320, state: 'Maharashtra', city: 'Mumbai' },
    { id: 'recovery-02', completedAt: dateMonthsAgo(5, 19), meals: 180, state: 'Karnataka', city: 'Bengaluru' },
    { id: 'recovery-03', completedAt: dateMonthsAgo(4, 6), meals: 420, state: 'Maharashtra', city: 'Pune' },
    { id: 'recovery-04', completedAt: dateMonthsAgo(4, 22), meals: 260, state: 'Tamil Nadu', city: 'Chennai' },
    { id: 'recovery-05', completedAt: dateMonthsAgo(3, 11), meals: 510, state: 'Maharashtra', city: 'Mumbai' },
    { id: 'recovery-06', completedAt: dateMonthsAgo(3, 25), meals: 240, state: 'Delhi', city: 'New Delhi' },
    { id: 'recovery-07', completedAt: dateMonthsAgo(2, 9), meals: 380, state: 'Karnataka', city: 'Bengaluru' },
    { id: 'recovery-08', completedAt: dateMonthsAgo(2, 17), meals: 340, state: 'Telangana', city: 'Hyderabad' },
    { id: 'recovery-09', completedAt: dateMonthsAgo(1, 4), meals: 620, state: 'Maharashtra', city: 'Mumbai' },
    { id: 'recovery-10', completedAt: dateMonthsAgo(1, 21), meals: 290, state: 'Gujarat', city: 'Ahmedabad' },
    { id: 'recovery-11', completedAt: dateMonthsAgo(0, 7), meals: 480, state: 'Tamil Nadu', city: 'Chennai' },
    { id: 'recovery-12', completedAt: dateMonthsAgo(0, 18), meals: 560, state: 'Maharashtra', city: 'Pune' },
  ] as RecoveryRecord[],
  complaints: [
    { id: 'CMP-1042', reporterName: 'Asha Rao', organization: 'Seasons Table', subject: 'Pickup window was missed', details: 'The assigned pickup arrived after the confirmed handover window.', category: 'Pickup issue', priority: 'High', status: 'OPEN', state: 'Maharashtra', city: 'Mumbai', submittedAt: dateMonthsAgo(0, 18) },
    { id: 'CMP-1041', reporterName: 'Naveen Shah', organization: 'Open Plate Trust', subject: 'Temperature record needs review', details: 'The delivery record was submitted without the final temperature check.', category: 'Food safety', priority: 'High', status: 'UNDER_REVIEW', state: 'Karnataka', city: 'Bengaluru', submittedAt: dateMonthsAgo(0, 16) },
    { id: 'CMP-1039', reporterName: 'Meera Nair', organization: 'Fresh Basket Market', subject: 'Incorrect contact number', details: 'The coordinator contact number shown in the pickup record is outdated.', category: 'Account', priority: 'Medium', status: 'OPEN', state: 'Maharashtra', city: 'Mumbai', submittedAt: dateMonthsAgo(0, 13) },
    { id: 'CMP-1038', reporterName: 'Rohit Menon', organization: 'Chennai Food Collective', subject: 'Food category mismatch', details: 'A produce donation was listed as ready-to-eat food.', category: 'Other', priority: 'Medium', status: 'UNDER_REVIEW', state: 'Tamil Nadu', city: 'Chennai', submittedAt: dateMonthsAgo(0, 10) },
    { id: 'CMP-1035', reporterName: 'Sana Khan', organization: 'Community Table Delhi', subject: 'Courier did not call on arrival', details: 'The courier arrived at the building but did not use the agreed contact method.', category: 'Pickup issue', priority: 'Low', status: 'RESOLVED', state: 'Delhi', city: 'New Delhi', submittedAt: dateMonthsAgo(0, 4) },
    { id: 'CMP-1032', reporterName: 'Arjun Iyer', organization: 'Green Cart', subject: 'Listing needs to be removed', details: 'A duplicate donation listing is still visible in the partner account.', category: 'Account', priority: 'Low', status: 'RESOLVED', state: 'Telangana', city: 'Hyderabad', submittedAt: dateMonthsAgo(1, 28) },
  ] as Complaint[],
};

export function getImpactMetrics(): ImpactStats {
  return computeImpactStats(globalServerStore.donations, globalServerStore.shelters);
}
