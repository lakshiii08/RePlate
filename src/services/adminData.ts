export interface ConnectedPartner {
  id: string;
  name: string;
  category: 'Restaurant' | 'Grocery & Supermarket' | 'Bakery' | 'Hotel Catering' | 'Cafeteria';
  city: string;
  state: string;
  address: string;
  mealsSavedThisMonth: number;
  foodSavedKgThisMonth: number;
  totalRescues: number;
  status: 'ACTIVE' | 'ONBOARDING' | 'PAUSED';
  contactPerson: string;
  phone: string;
  verifiedSince: string;
}

export interface ConnectedNGO {
  id: string;
  name: string;
  type: 'Soup Kitchen' | 'Emergency Shelter' | 'Food Bank' | 'Youth Refuge' | 'Senior Center' | 'Community Pantry';
  city: string;
  state: string;
  address: string;
  dailyIntakeCapacity: number;
  currentIntakeDemand: number;
  mealsReceivedThisMonth: number;
  status: 'ACTIVE' | 'CAPACITY_CRITICAL' | 'EXPANDING';
  contactPerson: string;
  phone: string;
  operatingHours: string;
  verifiedSince: string;
}

export interface MonthlyFoodSaved {
  month: string;
  shortMonth: string;
  year: number;
  foodSavedKg: number;
  mealsRescued: number;
  co2PreventedKg: number;
  activePartners: number;
  successfulRescues: number;
}

export interface CityStateMetric {
  city: string;
  state: string;
  connectedRestaurants: number;
  connectedGroceries: number;
  connectedNGOs: number;
  foodSavedThisMonthKg: number;
  mealsRescuedThisMonth: number;
  activeCouriers: number;
  openComplaints: number;
  rescueSuccessRate: number; // e.g. 98.4%
}

export interface ComplaintTicket {
  id: string;
  title: string;
  reporterName: string;
  reporterType: 'Restaurant' | 'Grocery' | 'NGO' | 'Courier';
  category:
    | 'Delayed Pickup (>30m)'
    | 'Packaging Seal Breach'
    | 'Temperature Deviation'
    | 'Quantity Mismatch'
    | 'Unresponsive Recipient'
    | 'Off-Hour Drop Issue';
  city: string;
  state: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'ESCALATED';
  createdAt: string;
  targetEntity: string;
  description: string;
  resolutionNotes?: string;
  assignedManager: string;
}

export const MOCK_MONTHLY_SAVINGS: MonthlyFoodSaved[] = [
  { month: 'October 2025', shortMonth: 'Oct', year: 2025, foodSavedKg: 12400, mealsRescued: 27550, co2PreventedKg: 31000, activePartners: 112, successfulRescues: 740 },
  { month: 'November 2025', shortMonth: 'Nov', year: 2025, foodSavedKg: 14800, mealsRescued: 32880, co2PreventedKg: 37000, activePartners: 128, successfulRescues: 890 },
  { month: 'December 2025', shortMonth: 'Dec', year: 2025, foodSavedKg: 18200, mealsRescued: 40440, co2PreventedKg: 45500, activePartners: 145, successfulRescues: 1120 },
  { month: 'January 2026', shortMonth: 'Jan', year: 2026, foodSavedKg: 16100, mealsRescued: 35770, co2PreventedKg: 40250, activePartners: 152, successfulRescues: 980 },
  { month: 'February 2026', shortMonth: 'Feb', year: 2026, foodSavedKg: 17400, mealsRescued: 38660, co2PreventedKg: 43500, activePartners: 164, successfulRescues: 1040 },
  { month: 'March 2026', shortMonth: 'Mar', year: 2026, foodSavedKg: 19800, mealsRescued: 44000, co2PreventedKg: 49500, activePartners: 178, successfulRescues: 1210 },
  { month: 'April 2026', shortMonth: 'Apr', year: 2026, foodSavedKg: 21300, mealsRescued: 47330, co2PreventedKg: 53250, activePartners: 192, successfulRescues: 1340 },
  { month: 'May 2026', shortMonth: 'May', year: 2026, foodSavedKg: 23500, mealsRescued: 52220, co2PreventedKg: 58750, activePartners: 205, successfulRescues: 1460 },
  { month: 'June 2026', shortMonth: 'Jun', year: 2026, foodSavedKg: 25100, mealsRescued: 55770, co2PreventedKg: 62750, activePartners: 218, successfulRescues: 1580 },
  { month: 'July 2026', shortMonth: 'Jul', year: 2026, foodSavedKg: 26800, mealsRescued: 59550, co2PreventedKg: 67000, activePartners: 231, successfulRescues: 1710 },
  { month: 'August 2026', shortMonth: 'Aug', year: 2026, foodSavedKg: 28400, mealsRescued: 63110, co2PreventedKg: 71000, activePartners: 246, successfulRescues: 1840 },
  { month: 'September 2026', shortMonth: 'Sep', year: 2026, foodSavedKg: 31200, mealsRescued: 69330, co2PreventedKg: 78000, activePartners: 264, successfulRescues: 2020 },
];

export const MOCK_CITY_STATE_METRICS: CityStateMetric[] = [
  {
    city: 'San Francisco',
    state: 'California',
    connectedRestaurants: 68,
    connectedGroceries: 28,
    connectedNGOs: 34,
    foodSavedThisMonthKg: 11450,
    mealsRescuedThisMonth: 25440,
    activeCouriers: 26,
    openComplaints: 2,
    rescueSuccessRate: 98.8,
  },
  {
    city: 'Oakland',
    state: 'California',
    connectedRestaurants: 34,
    connectedGroceries: 16,
    connectedNGOs: 18,
    foodSavedThisMonthKg: 5800,
    mealsRescuedThisMonth: 12880,
    activeCouriers: 14,
    openComplaints: 1,
    rescueSuccessRate: 97.5,
  },
  {
    city: 'San Jose',
    state: 'California',
    connectedRestaurants: 42,
    connectedGroceries: 22,
    connectedNGOs: 21,
    foodSavedThisMonthKg: 6900,
    mealsRescuedThisMonth: 15330,
    activeCouriers: 18,
    openComplaints: 1,
    rescueSuccessRate: 98.2,
  },
  {
    city: 'New York City',
    state: 'New York',
    connectedRestaurants: 92,
    connectedGroceries: 44,
    connectedNGOs: 48,
    foodSavedThisMonthKg: 16200,
    mealsRescuedThisMonth: 36000,
    activeCouriers: 38,
    openComplaints: 3,
    rescueSuccessRate: 97.9,
  },
  {
    city: 'Brooklyn',
    state: 'New York',
    connectedRestaurants: 46,
    connectedGroceries: 24,
    connectedNGOs: 26,
    foodSavedThisMonthKg: 7400,
    mealsRescuedThisMonth: 16440,
    activeCouriers: 19,
    openComplaints: 2,
    rescueSuccessRate: 98.1,
  },
  {
    city: 'Seattle',
    state: 'Washington',
    connectedRestaurants: 38,
    connectedGroceries: 18,
    connectedNGOs: 22,
    foodSavedThisMonthKg: 6200,
    mealsRescuedThisMonth: 13770,
    activeCouriers: 16,
    openComplaints: 1,
    rescueSuccessRate: 99.1,
  },
  {
    city: 'Austin',
    state: 'Texas',
    connectedRestaurants: 35,
    connectedGroceries: 15,
    connectedNGOs: 19,
    foodSavedThisMonthKg: 5300,
    mealsRescuedThisMonth: 11770,
    activeCouriers: 13,
    openComplaints: 2,
    rescueSuccessRate: 97.8,
  },
  {
    city: 'Chicago',
    state: 'Illinois',
    connectedRestaurants: 54,
    connectedGroceries: 26,
    connectedNGOs: 31,
    foodSavedThisMonthKg: 9100,
    mealsRescuedThisMonth: 20220,
    activeCouriers: 22,
    openComplaints: 2,
    rescueSuccessRate: 98.4,
  },
];

export const MOCK_CONNECTED_PARTNERS: ConnectedPartner[] = [
  // Restaurants & Groceries in SF
  {
    id: 'pt-101',
    name: 'Grand Hyatt Hotel Catering & Banquets',
    category: 'Hotel Catering',
    city: 'San Francisco',
    state: 'California',
    address: '345 Embarcadero Plaza, Financial District',
    mealsSavedThisMonth: 1420,
    foodSavedKgThisMonth: 640,
    totalRescues: 48,
    status: 'ACTIVE',
    contactPerson: 'Executive Chef Julian Rossi',
    phone: '+1 (555) 234-5678',
    verifiedSince: 'Jan 2025',
  },
  {
    id: 'pt-102',
    name: 'Green Leaf Organic Supermarket',
    category: 'Grocery & Supermarket',
    city: 'San Francisco',
    state: 'California',
    address: '780 Stanyan St, Haight-Ashbury',
    mealsSavedThisMonth: 2890,
    foodSavedKgThisMonth: 1300,
    totalRescues: 72,
    status: 'ACTIVE',
    contactPerson: 'Store Manager Diane Morales',
    phone: '+1 (555) 432-8877',
    verifiedSince: 'Feb 2025',
  },
  {
    id: 'pt-103',
    name: 'Bella Vista Trattoria & Pizzeria',
    category: 'Restaurant',
    city: 'San Francisco',
    state: 'California',
    address: '1648 Stockton St, North Beach',
    mealsSavedThisMonth: 820,
    foodSavedKgThisMonth: 370,
    totalRescues: 29,
    status: 'ACTIVE',
    contactPerson: 'Marco Rossi',
    phone: '+1 (555) 789-0123',
    verifiedSince: 'Mar 2025',
  },
  {
    id: 'pt-104',
    name: 'Whole Harvest Grocers',
    category: 'Grocery & Supermarket',
    city: 'San Francisco',
    state: 'California',
    address: '399 4th St, SOMA',
    mealsSavedThisMonth: 3450,
    foodSavedKgThisMonth: 1550,
    totalRescues: 84,
    status: 'ACTIVE',
    contactPerson: 'Operations Lead Chris Vance',
    phone: '+1 (555) 654-9988',
    verifiedSince: 'Dec 2024',
  },
  {
    id: 'pt-105',
    name: 'Artisan Sourdough & Pastry Guild',
    category: 'Bakery',
    city: 'San Francisco',
    state: 'California',
    address: '512 Valencia St, Mission District',
    mealsSavedThisMonth: 1120,
    foodSavedKgThisMonth: 500,
    totalRescues: 62,
    status: 'ACTIVE',
    contactPerson: 'Head Baker Chloe Martin',
    phone: '+1 (555) 876-5432',
    verifiedSince: 'Jan 2025',
  },
  {
    id: 'pt-106',
    name: 'Metro Corporate Dining Cafeteria',
    category: 'Cafeteria',
    city: 'San Francisco',
    state: 'California',
    address: '100 Silicon Way, SOMA South',
    mealsSavedThisMonth: 1750,
    foodSavedKgThisMonth: 790,
    totalRescues: 41,
    status: 'ACTIVE',
    contactPerson: 'Sous Chef David Chang',
    phone: '+1 (555) 321-7788',
    verifiedSince: 'Mar 2025',
  },
  // Oakland
  {
    id: 'pt-107',
    name: 'East Bay Fresh Market',
    category: 'Grocery & Supermarket',
    city: 'Oakland',
    state: 'California',
    address: '3400 Telegraph Ave, Uptown',
    mealsSavedThisMonth: 2100,
    foodSavedKgThisMonth: 945,
    totalRescues: 51,
    status: 'ACTIVE',
    contactPerson: 'Produce Director Aaron Boyd',
    phone: '+1 (555) 887-2211',
    verifiedSince: 'Apr 2025',
  },
  {
    id: 'pt-108',
    name: 'Redwood Smokehouse Barbecue',
    category: 'Restaurant',
    city: 'Oakland',
    state: 'California',
    address: '1225 Broadway, Downtown',
    mealsSavedThisMonth: 780,
    foodSavedKgThisMonth: 350,
    totalRescues: 22,
    status: 'ACTIVE',
    contactPerson: 'Pitmaster Tyler Jackson',
    phone: '+1 (555) 441-9900',
    verifiedSince: 'Jun 2025',
  },
  // NYC
  {
    id: 'pt-109',
    name: 'Manhattan Prime Provisions & Groceries',
    category: 'Grocery & Supermarket',
    city: 'New York City',
    state: 'New York',
    address: '520 8th Ave, Midtown West',
    mealsSavedThisMonth: 4890,
    foodSavedKgThisMonth: 2200,
    totalRescues: 114,
    status: 'ACTIVE',
    contactPerson: 'General Manager Sarah Klein',
    phone: '+1 (555) 912-3456',
    verifiedSince: 'Nov 2024',
  },
  {
    id: 'pt-110',
    name: 'Hudson River Banquet Hall',
    category: 'Hotel Catering',
    city: 'New York City',
    state: 'New York',
    address: '12th Ave & 42nd St, Chelsea',
    mealsSavedThisMonth: 2340,
    foodSavedKgThisMonth: 1050,
    totalRescues: 56,
    status: 'ACTIVE',
    contactPerson: 'Catering Lead Anthony Russo',
    phone: '+1 (555) 774-8833',
    verifiedSince: 'Feb 2025',
  },
  {
    id: 'pt-111',
    name: 'SoHo Artisan Cucina',
    category: 'Restaurant',
    city: 'New York City',
    state: 'New York',
    address: '94 Prince St, SoHo',
    mealsSavedThisMonth: 1320,
    foodSavedKgThisMonth: 590,
    totalRescues: 37,
    status: 'ACTIVE',
    contactPerson: 'Chef Matteo Conti',
    phone: '+1 (555) 332-9901',
    verifiedSince: 'May 2025',
  },
  // Seattle
  {
    id: 'pt-112',
    name: 'Pike Place Organic Market Stall & Grocery',
    category: 'Grocery & Supermarket',
    city: 'Seattle',
    state: 'Washington',
    address: '85 Pike St, Downtown Seattle',
    mealsSavedThisMonth: 2650,
    foodSavedKgThisMonth: 1190,
    totalRescues: 68,
    status: 'ACTIVE',
    contactPerson: 'Coordinator Lisa Miller',
    phone: '+1 (555) 601-2299',
    verifiedSince: 'Jan 2025',
  },
  {
    id: 'pt-113',
    name: 'Emerald City Bistro & Catering',
    category: 'Restaurant',
    city: 'Seattle',
    state: 'Washington',
    address: '4th Ave & Union St',
    mealsSavedThisMonth: 950,
    foodSavedKgThisMonth: 425,
    totalRescues: 31,
    status: 'ACTIVE',
    contactPerson: 'Chef Nathan Clark',
    phone: '+1 (555) 701-4433',
    verifiedSince: 'Mar 2025',
  },
  // Austin
  {
    id: 'pt-114',
    name: 'Lone Star Organic Grocers',
    category: 'Grocery & Supermarket',
    city: 'Austin',
    state: 'Texas',
    address: '520 Lamar Blvd, Downtown',
    mealsSavedThisMonth: 2420,
    foodSavedKgThisMonth: 1090,
    totalRescues: 59,
    status: 'ACTIVE',
    contactPerson: 'Inventory Lead Ryan Scott',
    phone: '+1 (555) 512-8800',
    verifiedSince: 'Feb 2025',
  },
  {
    id: 'pt-115',
    name: 'Austin Cantina & Grill',
    category: 'Restaurant',
    city: 'Austin',
    state: 'Texas',
    address: '1400 Congress Ave',
    mealsSavedThisMonth: 1180,
    foodSavedKgThisMonth: 530,
    totalRescues: 38,
    status: 'ACTIVE',
    contactPerson: 'Rosa Gutierrez',
    phone: '+1 (555) 512-4411',
    verifiedSince: 'Apr 2025',
  },
  // Chicago
  {
    id: 'pt-116',
    name: 'Windy City Supermarket Co.',
    category: 'Grocery & Supermarket',
    city: 'Chicago',
    state: 'Illinois',
    address: '600 N Michigan Ave, Magnificent Mile',
    mealsSavedThisMonth: 3880,
    foodSavedKgThisMonth: 1745,
    totalRescues: 94,
    status: 'ACTIVE',
    contactPerson: 'Operations VP Kevin O’Connor',
    phone: '+1 (555) 312-8822',
    verifiedSince: 'Nov 2024',
  },
];

export const MOCK_CONNECTED_NGOS: ConnectedNGO[] = [
  // San Francisco
  {
    id: 'ngo-201',
    name: 'Hope Community Shelter & Kitchen',
    type: 'Emergency Shelter',
    city: 'San Francisco',
    state: 'California',
    address: '452 Elm Street, Tenderloin',
    dailyIntakeCapacity: 160,
    currentIntakeDemand: 135,
    mealsReceivedThisMonth: 3840,
    status: 'ACTIVE',
    contactPerson: 'Sister Mary Joseph',
    phone: '+1 (555) 234-5678',
    operatingHours: '6:00 AM - 10:00 PM (Daily)',
    verifiedSince: 'Oct 2024',
  },
  {
    id: 'ngo-202',
    name: 'Grace Haven Family Care Center',
    type: 'Emergency Shelter',
    city: 'San Francisco',
    state: 'California',
    address: '890 Mission Avenue, SOMA',
    dailyIntakeCapacity: 95,
    currentIntakeDemand: 80,
    mealsReceivedThisMonth: 2280,
    status: 'ACTIVE',
    contactPerson: 'Marcus Williams',
    phone: '+1 (555) 876-5432',
    operatingHours: '24/7 Residential Care',
    verifiedSince: 'Nov 2024',
  },
  {
    id: 'ngo-203',
    name: 'St. Vincent Dining Hall & Food Bank',
    type: 'Soup Kitchen',
    city: 'San Francisco',
    state: 'California',
    address: '1200 Market Street, Civic Center',
    dailyIntakeCapacity: 250,
    currentIntakeDemand: 220,
    mealsReceivedThisMonth: 5900,
    status: 'ACTIVE',
    contactPerson: 'Father David Morales',
    phone: '+1 (555) 345-6789',
    operatingHours: '10:00 AM - 8:00 PM (Mon-Sat)',
    verifiedSince: 'Sep 2024',
  },
  {
    id: 'ngo-204',
    name: 'Beacon Hill Youth Refuge',
    type: 'Youth Refuge',
    city: 'San Francisco',
    state: 'California',
    address: '742 Evergreen Terrace, North Beach',
    dailyIntakeCapacity: 50,
    currentIntakeDemand: 45,
    mealsReceivedThisMonth: 1250,
    status: 'ACTIVE',
    contactPerson: 'Counselor Maya Lin',
    phone: '+1 (555) 987-6543',
    operatingHours: '24/7 Youth Refuge',
    verifiedSince: 'Jan 2025',
  },
  {
    id: 'ngo-205',
    name: 'Mission Community Table & Pantry',
    type: 'Community Pantry',
    city: 'San Francisco',
    state: 'California',
    address: '2240 Mission St, Mission',
    dailyIntakeCapacity: 120,
    currentIntakeDemand: 110,
    mealsReceivedThisMonth: 2980,
    status: 'ACTIVE',
    contactPerson: 'Elena Vasquez',
    phone: '+1 (555) 312-9988',
    operatingHours: '11:00 AM - 7:00 PM',
    verifiedSince: 'Feb 2025',
  },
  {
    id: 'ngo-206',
    name: 'Bayview Seniors Nutrition Hub',
    type: 'Senior Center',
    city: 'San Francisco',
    state: 'California',
    address: '1580 Third Street, Bayview',
    dailyIntakeCapacity: 100,
    currentIntakeDemand: 95,
    mealsReceivedThisMonth: 2420,
    status: 'ACTIVE',
    contactPerson: 'Brenda Washington',
    phone: '+1 (555) 654-3210',
    operatingHours: '8:00 AM - 4:00 PM',
    verifiedSince: 'Jan 2025',
  },
  // Oakland
  {
    id: 'ngo-207',
    name: 'Oakland Unity Food Project',
    type: 'Soup Kitchen',
    city: 'Oakland',
    state: 'California',
    address: '1800 Adeline St, West Oakland',
    dailyIntakeCapacity: 180,
    currentIntakeDemand: 165,
    mealsReceivedThisMonth: 4120,
    status: 'ACTIVE',
    contactPerson: 'Pastor Jamar Harris',
    phone: '+1 (555) 772-1133',
    operatingHours: '9:00 AM - 6:00 PM',
    verifiedSince: 'Nov 2024',
  },
  // New York City
  {
    id: 'ngo-208',
    name: 'Bowery Mission Community Kitchen',
    type: 'Soup Kitchen',
    city: 'New York City',
    state: 'New York',
    address: '227 Bowery, Lower East Side',
    dailyIntakeCapacity: 350,
    currentIntakeDemand: 330,
    mealsReceivedThisMonth: 8900,
    status: 'ACTIVE',
    contactPerson: 'Director Robert Campbell',
    phone: '+1 (555) 678-1234',
    operatingHours: '6:30 AM - 9:00 PM (Daily)',
    verifiedSince: 'Aug 2024',
  },
  {
    id: 'ngo-209',
    name: 'City Harvest Brooklyn Hub',
    type: 'Food Bank',
    city: 'Brooklyn',
    state: 'New York',
    address: '150 52nd St, Sunset Park',
    dailyIntakeCapacity: 300,
    currentIntakeDemand: 280,
    mealsReceivedThisMonth: 7450,
    status: 'ACTIVE',
    contactPerson: 'Logistics Lead Maria Santos',
    phone: '+1 (555) 443-8899',
    operatingHours: '7:00 AM - 8:00 PM',
    verifiedSince: 'Sep 2024',
  },
  // Seattle
  {
    id: 'ngo-210',
    name: 'Seattle Community Table & Food Bank',
    type: 'Food Bank',
    city: 'Seattle',
    state: 'Washington',
    address: '2329 S Jackson St, Central District',
    dailyIntakeCapacity: 210,
    currentIntakeDemand: 190,
    mealsReceivedThisMonth: 4950,
    status: 'ACTIVE',
    contactPerson: 'Danielle Brooks',
    phone: '+1 (555) 206-8811',
    operatingHours: '8:00 AM - 6:00 PM',
    verifiedSince: 'Oct 2024',
  },
  // Austin
  {
    id: 'ngo-211',
    name: 'Austin Central Pantry & Shelter',
    type: 'Community Pantry',
    city: 'Austin',
    state: 'Texas',
    address: '8201 S Congress Ave',
    dailyIntakeCapacity: 170,
    currentIntakeDemand: 155,
    mealsReceivedThisMonth: 3950,
    status: 'ACTIVE',
    contactPerson: 'Carlos Delgado',
    phone: '+1 (555) 512-9922',
    operatingHours: '9:00 AM - 7:00 PM',
    verifiedSince: 'Jan 2025',
  },
  // Chicago
  {
    id: 'ngo-212',
    name: 'Greater Chicago Food Pantry Alliance',
    type: 'Food Bank',
    city: 'Chicago',
    state: 'Illinois',
    address: '4100 W Ann Lurie Pl',
    dailyIntakeCapacity: 320,
    currentIntakeDemand: 300,
    mealsReceivedThisMonth: 7850,
    status: 'ACTIVE',
    contactPerson: 'James Thornton',
    phone: '+1 (555) 312-4455',
    operatingHours: '7:00 AM - 7:00 PM',
    verifiedSince: 'Sep 2024',
  },
];

export const MOCK_COMPLAINT_TICKETS: ComplaintTicket[] = [
  {
    id: 'CMP-4091',
    title: 'Courier 35 minutes late for hot holding pickup window',
    reporterName: 'Grand Hyatt Hotel Catering',
    reporterType: 'Restaurant',
    category: 'Delayed Pickup (>30m)',
    city: 'San Francisco',
    state: 'California',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    targetEntity: 'Courier Aarav Patel (Van-1)',
    description: 'Hot held curry trays were ready at 7:00 PM. Assigned courier encountered Market Street construction delays and arrived at 7:42 PM, reducing the safety buffer.',
    resolutionNotes: 'Courier routed through alternate Mission corridor. Automated alert threshold updated for Financial District construction zones.',
    assignedManager: 'Regional Dispatcher Mark T.',
  },
  {
    id: 'CMP-4092',
    title: 'Thermal barrier seal unsealed on secondary crate',
    reporterName: 'Hope Community Shelter',
    reporterType: 'NGO',
    category: 'Packaging Seal Breach',
    city: 'San Francisco',
    state: 'California',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    targetEntity: 'Donation #RP-1027 (Bella Vista Trattoria)',
    description: 'Secondary hotel pan lid clip was unclasped during van transit. Temperature tested at 61.2°C upon intake (within compliance), but donor reminded on latch protocol.',
    resolutionNotes: 'Verified temperature on delivery log. Donor training ticket created for packaging team.',
    assignedManager: 'Food Safety Officer Dr. Aris Thorne',
  },
  {
    id: 'CMP-4093',
    title: 'Produce count delivered was 8 crates instead of manifest 12',
    reporterName: 'Mission Community Table',
    reporterType: 'NGO',
    category: 'Quantity Mismatch',
    city: 'San Francisco',
    state: 'California',
    severity: 'MEDIUM',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    targetEntity: 'Green Leaf Organic Market',
    description: 'Manifest logged 12 crates of apples and stone fruit. Driver only loaded 8 crates due to van volume constraints. Remaining 4 crates still held at store.',
    resolutionNotes: '',
    assignedManager: 'Fleet Operations Supervisor Elena R.',
  },
  {
    id: 'CMP-4094',
    title: 'Delivery arrived after shelter kitchen intake cutoff',
    reporterName: 'Bowery Mission Community Kitchen',
    reporterType: 'NGO',
    category: 'Off-Hour Drop Issue',
    city: 'New York City',
    state: 'New York',
    severity: 'LOW',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    targetEntity: 'Courier Marcus Vance (Thermal Truck)',
    description: 'Driver arrived at 9:15 PM when kitchen closes intake at 9:00 PM. Night security accepted items into walk-in cooler, but request scheduling prior to 8:30 PM.',
    resolutionNotes: 'Updated Bowery Mission intake schedule rule in routing engine to cutoff dispatches after 8:15 PM.',
    assignedManager: 'NYC Hub Dispatcher Chloe S.',
  },
  {
    id: 'CMP-4095',
    title: 'Cold holding temperature test measured 6.8°C (threshold <4.5°C)',
    reporterName: 'City Harvest Brooklyn Hub',
    reporterType: 'NGO',
    category: 'Temperature Deviation',
    city: 'Brooklyn',
    state: 'New York',
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    targetEntity: 'Manhattan Prime Provisions',
    description: 'Chilled dairy and deli sandwich crates exceeded cold holding threshold upon arrival. Courier insulation bag was not zipped completely during multi-drop route.',
    resolutionNotes: 'Items quarantined and safe discard protocol triggered. Courier fleet equipped with continuous Bluetooth dataloggers.',
    assignedManager: 'Chief Safety Auditor Dr. Patel',
  },
  {
    id: 'CMP-4096',
    title: 'Intake staff unavailable at loading dock upon arrival',
    reporterName: 'Courier Sofia Chen',
    reporterType: 'Courier',
    category: 'Unresponsive Recipient',
    city: 'San Francisco',
    state: 'California',
    severity: 'LOW',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    targetEntity: 'Beacon Hill Youth Refuge',
    description: 'Courier waited 18 minutes at rear alley bay with bakery cartons. Phone line busy.',
    resolutionNotes: 'Backup direct cell number added to shelter profile. Shelter coordinator apologized for shift handover delay.',
    assignedManager: 'Operations Lead Chris Vance',
  },
  {
    id: 'CMP-4097',
    title: 'Allergen label missing for walnut pastry tray',
    reporterName: 'Seattle Community Table',
    reporterType: 'NGO',
    category: 'Packaging Seal Breach',
    city: 'Seattle',
    state: 'Washington',
    severity: 'HIGH',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 22 * 3600000).toISOString(),
    targetEntity: 'Pike Place Organic Bakery',
    description: 'Carton of artisanal fruit pastries contained chopped walnuts without allergen tag on box exterior. Shelter volunteer caught it during intake inspection.',
    resolutionNotes: '',
    assignedManager: 'Regional Safety Inspector Sarah Klein',
  },
];

export const adminDataService = {
  getPartners(): ConnectedPartner[] {
    return [...MOCK_CONNECTED_PARTNERS];
  },
  getNGOs(): ConnectedNGO[] {
    return [...MOCK_CONNECTED_NGOS];
  },
  getMonthlySavings(): MonthlyFoodSaved[] {
    return [...MOCK_MONTHLY_SAVINGS];
  },
  getCityStateMetrics(): CityStateMetric[] {
    return [...MOCK_CITY_STATE_METRICS];
  },
  getComplaints(): ComplaintTicket[] {
    return [...MOCK_COMPLAINT_TICKETS];
  },
  updateComplaintStatus(id: string, status: ComplaintTicket['status'], resolutionNotes?: string): ComplaintTicket | null {
    const ticket = MOCK_COMPLAINT_TICKETS.find((t) => t.id === id);
    if (!ticket) return null;
    ticket.status = status;
    if (resolutionNotes) {
      ticket.resolutionNotes = resolutionNotes;
    }
    return ticket;
  },
};
