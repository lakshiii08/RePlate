import { FoodType, FoodCategory, Shelter, FeasibilityBreakdown } from '@/types';

export interface RestaurantLocation {
  id: string;
  name: string;
  category: string;
  address: string;
  coords: [number, number]; // [lat, lng]
  cityZone: string;
  phone?: string;
  operatingHours?: string;
  defaultFoodType?: FoodType;
}

/**
 * Verified Restaurant & Dining Donor Partners with precise geographic coordinates
 */
export const RESTAURANT_LOCATIONS: RestaurantLocation[] = [
  // --- SAN FRANCISCO & BAY AREA ---
  {
    id: 'rest-sf-1',
    name: 'Grand Hyatt Hotel Catering & Banquets',
    category: 'Hotel / Fine Banquet',
    address: '345 Embarcadero Plaza, Financial District, SF, CA 94111',
    coords: [37.7940, -122.3960],
    cityZone: 'San Francisco - Embarcadero',
    phone: '+1 (415) 555-0192',
    operatingHours: '06:00 AM - 11:30 PM',
    defaultFoodType: 'Veg',
  },
  {
    id: 'rest-sf-2',
    name: 'Tartine Bakery & Artisan Café',
    category: 'Bakery / Café',
    address: '512 Valencia St, Mission District, SF, CA 94110',
    coords: [37.7640, -122.4220],
    cityZone: 'San Francisco - Mission',
    phone: '+1 (415) 555-0144',
    operatingHours: '07:30 AM - 07:00 PM',
    defaultFoodType: 'Veg',
  },
  {
    id: 'rest-sf-3',
    name: 'Salesforce Tower Executive Dining',
    category: 'Corporate Cafeteria',
    address: '415 Mission St, SOMA, SF, CA 94105',
    coords: [37.7810, -122.3990],
    cityZone: 'San Francisco - SOMA',
    phone: '+1 (415) 555-0188',
    operatingHours: '08:00 AM - 08:00 PM',
    defaultFoodType: 'Non-Veg',
  },
  {
    id: 'rest-sf-4',
    name: 'Trattoria Contadina Ristorante',
    category: 'Italian Fine Dining',
    address: '1648 Stockton St, North Beach, SF, CA 94133',
    coords: [37.8010, -122.4085],
    cityZone: 'San Francisco - North Beach',
    phone: '+1 (415) 555-0165',
    operatingHours: '12:00 PM - 10:30 PM',
    defaultFoodType: 'Non-Veg',
  },
  {
    id: 'rest-sf-5',
    name: 'Whole Foods Fresh Market',
    category: 'Grocery & Organic Deli',
    address: '780 Stanyan St, Haight-Ashbury, SF, CA 94117',
    coords: [37.7680, -122.4530],
    cityZone: 'San Francisco - Haight',
    phone: '+1 (415) 555-0177',
    operatingHours: '08:00 AM - 10:00 PM',
    defaultFoodType: 'Veg',
  },
  {
    id: 'rest-sf-6',
    name: 'LinkedIn City Center Canteen',
    category: 'Corporate Kitchen',
    address: '201 2nd St, Financial District, SF, CA 94105',
    coords: [37.7885, -122.3995],
    cityZone: 'San Francisco - Financial District',
    phone: '+1 (415) 555-0133',
    operatingHours: '07:00 AM - 05:00 PM',
    defaultFoodType: 'Non-Veg',
  },
  {
    id: 'rest-sf-7',
    name: 'Bay Cuisine Banquet Hall & Events',
    category: 'Event Banquets',
    address: '600 Townsend St, Design District, SF, CA 94103',
    coords: [37.7715, -122.4035],
    cityZone: 'San Francisco - Design District',
    phone: '+1 (415) 555-0122',
    operatingHours: '10:00 AM - 11:00 PM',
    defaultFoodType: 'Non-Veg',
  },
  {
    id: 'rest-sf-8',
    name: "Fisherman's Grotto Seafood Kitchen",
    category: 'Seafood Restaurant',
    address: 'Pier 39, Fisherman Wharf, SF, CA 94133',
    coords: [37.8087, -122.4098],
    cityZone: 'San Francisco - Waterfront',
    phone: '+1 (415) 555-0155',
    operatingHours: '11:00 AM - 10:00 PM',
    defaultFoodType: 'Non-Veg',
  },
  {
    id: 'rest-sf-9',
    name: 'UCSF Medical Campus Dining Hall',
    category: 'Institutional Catering',
    address: '500 Parnassus Ave, Inner Sunset, SF, CA 94143',
    coords: [37.7630, -122.4580],
    cityZone: 'San Francisco - Inner Sunset',
    phone: '+1 (415) 555-0111',
    operatingHours: '24 Hours',
    defaultFoodType: 'Veg',
  },
  {
    id: 'rest-sf-10',
    name: 'The Ferry Building Artisan Deli',
    category: 'Market Deli & Bakery',
    address: '1 Ferry Building, The Embarcadero, SF, CA 94111',
    coords: [37.7955, -122.3937],
    cityZone: 'San Francisco - Embarcadero',
    phone: '+1 (415) 555-0199',
    operatingHours: '07:00 AM - 08:00 PM',
    defaultFoodType: 'Veg',
  },
  {
    id: 'rest-sf-11',
    name: 'Nopa Wood-Fired Grill & Bistro',
    category: 'Fine Dining Bistro',
    address: '560 Divisadero St, Western Addition, SF, CA 94117',
    coords: [37.7749, -122.4376],
    cityZone: 'San Francisco - Western Addition',
    phone: '+1 (415) 555-0149',
    operatingHours: '05:00 PM - 12:00 AM',
    defaultFoodType: 'Non-Veg',
  },

  // --- DELHI NCR LOCATIONS ---
  {
    id: 'rest-del-1',
    name: 'Taj Palace Banquet & Heritage Kitchen',
    category: 'Luxury Hotel / Banquets',
    address: '2 Sardar Patel Marg, Diplomatic Enclave, New Delhi 110021',
    coords: [28.5960, 77.1720],
    cityZone: 'New Delhi - Chanakyapuri',
    phone: '+91 11 2611 0202',
    operatingHours: '24 Hours',
    defaultFoodType: 'Veg',
  },
  {
    id: 'rest-del-2',
    name: 'ITC Maurya Gourmet Kitchen',
    category: 'Luxury Dining & Banquets',
    address: 'Diplomatic Enclave, Chanakyapuri, New Delhi 110021',
    coords: [28.5975, 77.1745],
    cityZone: 'New Delhi - Chanakyapuri',
    phone: '+91 11 2611 2233',
    operatingHours: '24 Hours',
    defaultFoodType: 'Non-Veg',
  },
  {
    id: 'rest-del-3',
    name: 'Connaught Clubhouse & Kitchen',
    category: 'Restaurant & Bar Kitchen',
    address: 'Radial Road 3, Inner Circle, Connaught Place, New Delhi 110001',
    coords: [28.6315, 77.2167],
    cityZone: 'Central Delhi - Connaught Place',
    phone: '+91 11 4355 6677',
    operatingHours: '11:30 AM - 11:30 PM',
    defaultFoodType: 'Veg',
  },
  {
    id: 'rest-del-4',
    name: 'Pullman & Novotel Aerocity Banquet Hub',
    category: 'Hotel Mega Catering',
    address: 'Asset No 2, Hospitality District, Aerocity, New Delhi 110037',
    coords: [28.5520, 77.1210],
    cityZone: 'South West Delhi - Aerocity',
    phone: '+91 11 4608 0808',
    operatingHours: '24 Hours',
    defaultFoodType: 'Non-Veg',
  },
  {
    id: 'rest-del-5',
    name: 'Hauz Khas Village Social Diner',
    category: 'Artisan Café & Bar',
    address: '9A & 12, Hauz Khas Village, New Delhi 110016',
    coords: [28.5535, 77.1945],
    cityZone: 'South Delhi - Hauz Khas',
    phone: '+91 99 9900 1234',
    operatingHours: '11:00 AM - 12:00 AM',
    defaultFoodType: 'Veg',
  },
  {
    id: 'rest-del-6',
    name: 'Cyber Hub Food Studio',
    category: 'Corporate Food Court',
    address: 'Building 10, DLF Cyber City, Phase 2, Gurugram 122002',
    coords: [28.4950, 77.0890],
    cityZone: 'NCR - Gurugram Cyber City',
    phone: '+91 124 456 7890',
    operatingHours: '10:00 AM - 11:00 PM',
    defaultFoodType: 'Non-Veg',
  },
  {
    id: 'rest-del-7',
    name: "Haldiram's Mega Kitchen",
    category: 'Vegetarian Sweets & Thali Dining',
    address: 'Central Market, Lajpat Nagar II, New Delhi 110024',
    coords: [28.5670, 77.2430],
    cityZone: 'South Delhi - Lajpat Nagar',
    phone: '+91 11 2984 5566',
    operatingHours: '08:30 AM - 10:30 PM',
    defaultFoodType: 'Veg',
  },
];

/**
 * Verified Shelters, Food Banks & Community Kitchens with precise geographic coordinates
 */
export const VERIFIED_SHELTERS_DATA: Shelter[] = [
  // --- SAN FRANCISCO & BAY AREA SHELTERS ---
  {
    id: 'shelter-sf-1',
    name: 'Hope Community Shelter & Kitchen',
    address: '452 Elm Street, Tenderloin / Civic Center, SF, CA 94102',
    coords: [37.7749, -122.4194],
    capacityMeals: 140,
    currentNeeds: ['Cooked Meal', 'Fresh Produce', 'Dairy & Refrigerated', 'Meal'],
    distanceKm: 2.1,
    etaMinutes: 10,
    contactPhone: '+1 (415) 555-2345',
  },
  {
    id: 'shelter-sf-2',
    name: 'Grace Haven Family Care Center',
    address: '890 Mission Avenue, SOMA District, SF, CA 94103',
    coords: [37.7833, -122.4167],
    capacityMeals: 85,
    currentNeeds: ['Cooked Meal', 'Bakery & Bread', 'Packaged Goods', 'Bakery'],
    distanceKm: 3.4,
    etaMinutes: 14,
    contactPhone: '+1 (415) 555-8765',
  },
  {
    id: 'shelter-sf-3',
    name: 'St. Vincent Dining Hall & Food Bank',
    address: '1200 Market Street, Civic Center, SF, CA 94102',
    coords: [37.7695, -122.4269],
    capacityMeals: 220,
    currentNeeds: ['Catered Buffet', 'Fresh Produce', 'Cooked Meal', 'Meal'],
    distanceKm: 4.8,
    etaMinutes: 18,
    contactPhone: '+1 (415) 555-3456',
  },
  {
    id: 'shelter-sf-4',
    name: 'Beacon Hill Youth Refuge',
    address: '742 Evergreen Terrace, North Beach, SF, CA 94133',
    coords: [37.7900, -122.4050],
    capacityMeals: 45,
    currentNeeds: ['Bakery & Bread', 'Dairy & Refrigerated', 'Packaged Goods', 'Bakery'],
    distanceKm: 5.7,
    etaMinutes: 22,
    contactPhone: '+1 (415) 555-9876',
  },
  {
    id: 'shelter-sf-5',
    name: 'Mission Community Table',
    address: '2240 Mission St, Mission Corridor, SF, CA 94110',
    coords: [37.7605, -122.4190],
    capacityMeals: 110,
    currentNeeds: ['Cooked Meal', 'Catered Buffet', 'Bakery & Bread', 'Meal'],
    distanceKm: 3.9,
    etaMinutes: 15,
    contactPhone: '+1 (415) 555-3129',
  },
  {
    id: 'shelter-sf-6',
    name: 'Bayview Seniors Nutrition Hub',
    address: '1580 Third Street, Bayview, SF, CA 94124',
    coords: [37.7420, -122.3890],
    capacityMeals: 95,
    currentNeeds: ['Fresh Produce', 'Packaged Goods', 'Cooked Meal', 'Fruits'],
    distanceKm: 6.8,
    etaMinutes: 24,
    contactPhone: '+1 (415) 555-6543',
  },
  {
    id: 'shelter-sf-7',
    name: 'Compass Family Outreach Center',
    address: '37 Grove Street, Central Plaza, SF, CA 94102',
    coords: [37.7785, -122.4180],
    capacityMeals: 60,
    currentNeeds: ['Cooked Meal', 'Dairy & Refrigerated', 'Meal'],
    distanceKm: 2.8,
    etaMinutes: 12,
    contactPhone: '+1 (415) 555-4321',
  },
  {
    id: 'shelter-sf-8',
    name: 'Glide Memorial Daily Soup Kitchen',
    address: '330 Ellis St, Tenderloin, SF, CA 94102',
    coords: [37.7852, -122.4116],
    capacityMeals: 350,
    currentNeeds: ['Cooked Meal', 'Catered Buffet', 'Fresh Produce', 'Meal'],
    distanceKm: 2.3,
    etaMinutes: 11,
    contactPhone: '+1 (415) 555-7700',
  },
  {
    id: 'shelter-sf-9',
    name: "St. Anthony's Foundation Dining Room",
    address: '121 Golden Gate Ave, Mid-Market, SF, CA 94102',
    coords: [37.7821, -122.4132],
    capacityMeals: 400,
    currentNeeds: ['Cooked Meal', 'Fresh Produce', 'Meal'],
    distanceKm: 2.0,
    etaMinutes: 9,
    contactPhone: '+1 (415) 555-8800',
  },
  {
    id: 'shelter-sf-10',
    name: 'Marina Community Food Pantry',
    address: '1900 Lombard St, Marina District, SF, CA 94123',
    coords: [37.7998, -122.4340],
    capacityMeals: 70,
    currentNeeds: ['Fresh Produce', 'Bakery & Bread', 'Packaged Goods'],
    distanceKm: 4.5,
    etaMinutes: 17,
    contactPhone: '+1 (415) 555-9911',
  },
  {
    id: 'shelter-sf-11',
    name: 'Sunset Youth & Family Food Center',
    address: '1220 9th Ave, Inner Sunset, SF, CA 94122',
    coords: [37.7654, -122.4662],
    capacityMeals: 80,
    currentNeeds: ['Cooked Meal', 'Dairy & Refrigerated', 'Packaged Goods'],
    distanceKm: 5.9,
    etaMinutes: 20,
    contactPhone: '+1 (415) 555-2233',
  },

  // --- DELHI NCR SHELTERS ---
  {
    id: 'shelter-del-1',
    name: 'Gurudwara Bangla Sahib Mega Langar Kitchen',
    address: 'Ashoka Road, Connaught Place, New Delhi 110001',
    coords: [28.6264, 77.2090],
    capacityMeals: 500,
    currentNeeds: ['Cooked Meal', 'Fresh Produce', 'Bakery & Bread', 'Meal'],
    distanceKm: 3.2,
    etaMinutes: 12,
    contactPhone: '+91 11 2336 5486',
  },
  {
    id: 'shelter-del-2',
    name: 'Robin Hood Army South Hub & Kitchen',
    address: 'Block C, Hauz Khas Enclave, New Delhi 110016',
    coords: [28.5494, 77.2001],
    capacityMeals: 180,
    currentNeeds: ['Cooked Meal', 'Fresh Produce', 'Packaged Goods', 'Meal'],
    distanceKm: 4.1,
    etaMinutes: 15,
    contactPhone: '+91 98 1122 3344',
  },
  {
    id: 'shelter-del-3',
    name: 'Feeding India Central Food Bank',
    address: 'Lodhi Institutional Area, New Delhi 110003',
    coords: [28.5833, 77.2250],
    capacityMeals: 250,
    currentNeeds: ['Cooked Meal', 'Fresh Produce', 'Dairy & Refrigerated', 'Meal'],
    distanceKm: 4.5,
    etaMinutes: 16,
    contactPhone: '+91 11 4455 6677',
  },
  {
    id: 'shelter-del-4',
    name: 'Delhi Care Shelter Foundation',
    address: 'Ring Road, Lajpat Nagar IV, New Delhi 110024',
    coords: [28.5677, 77.2433],
    capacityMeals: 120,
    currentNeeds: ['Cooked Meal', 'Bakery & Bread', 'Meal'],
    distanceKm: 5.0,
    etaMinutes: 18,
    contactPhone: '+91 11 2981 2345',
  },
  {
    id: 'shelter-del-5',
    name: 'Uday Foundation Medical Care Shelter',
    address: 'Sri Aurobindo Marg, Adchini, New Delhi 110017',
    coords: [28.5355, 77.1980],
    capacityMeals: 95,
    currentNeeds: ['Cooked Meal', 'Dairy & Refrigerated', 'Fruits', 'Meal'],
    distanceKm: 6.2,
    etaMinutes: 22,
    contactPhone: '+91 11 2656 1444',
  },
  {
    id: 'shelter-del-6',
    name: 'Paharganj Community Night Shelter',
    address: 'Near New Delhi Railway Station, Paharganj 110055',
    coords: [28.6430, 77.2150],
    capacityMeals: 160,
    currentNeeds: ['Cooked Meal', 'Catered Buffet', 'Bakery & Bread', 'Meal'],
    distanceKm: 3.8,
    etaMinutes: 14,
    contactPhone: '+91 11 2358 9012',
  },
  {
    id: 'shelter-del-7',
    name: 'Akshaya Patra Mega Facility',
    address: 'Okhla Industrial Area Phase II, New Delhi 110020',
    coords: [28.5280, 77.2750],
    capacityMeals: 600,
    currentNeeds: ['Fresh Produce', 'Cooked Meal', 'Packaged Goods', 'Meal'],
    distanceKm: 8.5,
    etaMinutes: 28,
    contactPhone: '+91 11 4050 6070',
  },
];

/**
 * Haversine formula for exact distance between two coordinates in kilometers
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Realistic urban driving ETA estimation in minutes
 */
export function estimateDrivingMinutes(distanceKm: number): number {
  // Average urban speed ~22 km/h + 2 min buffer for parking/traffic lights
  return Math.max(4, Math.round(distanceKm * 2.7 + 2));
}

/**
 * AI Nearest-Route Matching Algorithm:
 * Evaluates all candidate shelters against the restaurant location, computes real distance/ETA,
 * scores feasibility, and sorts so the nearest, most compatible shelter is ranked #1.
 */
export function findRankedSheltersForDonation(
  restaurantCoords: [number, number],
  foodCategory: string = 'Meal',
  mealCount: number = 30,
  foodType: string = 'Veg',
  rescueWindowMinutes: number = 180
): Shelter[] {
  const [restLat, restLng] = restaurantCoords;

  // Filter or group shelters in proximity region (e.g. within 50 km)
  const sheltersWithDistances = VERIFIED_SHELTERS_DATA.map((shelter) => {
    const distanceKm = haversineDistanceKm(restLat, restLng, shelter.coords[0], shelter.coords[1]);
    const etaMinutes = estimateDrivingMinutes(distanceKm);

    // 1. Distance & ETA Score: Closer is substantially better
    // 0-3 km: 95-100%, 3-8 km: 80-95%, 8-15 km: 65-80%, >15 km: <65%
    const distanceScore = Math.max(15, Math.min(100, Math.round(100 - distanceKm * 3.8)));

    // 2. Capacity Fit Score: Does the shelter have enough capacity for the food?
    const capRatio = shelter.capacityMeals / Math.max(1, mealCount);
    let capacityScore = 80;
    if (capRatio >= 1.0 && capRatio <= 3.5) {
      capacityScore = 98; // Ideal capacity
    } else if (capRatio > 3.5) {
      capacityScore = 88; // Shelter is much larger
    } else {
      capacityScore = Math.round(capRatio * 80); // Shelter capacity is smaller than donation
    }

    // 3. Food Compatibility Score: Does the shelter need this category?
    let foodScore = 75;
    const needs = shelter.currentNeeds || [];
    const hasCategoryNeed = needs.some(
      (n) => n.toLowerCase().includes(foodCategory.toLowerCase()) || n.toLowerCase().includes('meal')
    );
    if (hasCategoryNeed) foodScore += 18;
    foodScore = Math.min(100, foodScore);

    // 4. Overall Weighted Score (Distance & route proximity has highest weight: 45%)
    const overallScore = Math.round(
      distanceScore * 0.45 + capacityScore * 0.30 + foodScore * 0.25
    );

    const feasibilityScore: FeasibilityBreakdown = {
      overallScore,
      timeFeasibility: Math.min(99, Math.round(100 - (etaMinutes / rescueWindowMinutes) * 100)),
      capacityFit: capacityScore,
      foodCompatibility: foodScore,
      distanceEta: distanceScore,
      needPriority: 94,
      driverReadiness: 90,
      explanation: `Optimal route: ${distanceKm} km away (~${etaMinutes} mins drive via transit corridor). Capacity: ${shelter.capacityMeals} meals. Urgent demand for ${foodCategory}.`,
    };

    return {
      ...shelter,
      distanceKm,
      etaMinutes,
      feasibilityScore,
    };
  });

  // Sort so that the closest / highest-scoring candidate is ranked first
  sheltersWithDistances.sort((a, b) => {
    // Primary sort: overall score
    const scoreDiff = (b.feasibilityScore?.overallScore || 0) - (a.feasibilityScore?.overallScore || 0);
    if (Math.abs(scoreDiff) > 2) return scoreDiff;
    // Tie breaker: direct distance
    return a.distanceKm - b.distanceKm;
  });

  return sheltersWithDistances;
}

/**
 * Intelligent geocoding / coordinate fallback for any user-entered restaurant or pickup address
 */
export function resolveRestaurantCoordinates(addressOrName: string): {
  coords: [number, number];
  name?: string;
  matchedKnownLocation: boolean;
} {
  const lower = (addressOrName || '').toLowerCase();

  // Check known restaurant locations first
  const known = RESTAURANT_LOCATIONS.find(
    (r) =>
      lower.includes(r.name.toLowerCase()) ||
      lower.includes(r.address.toLowerCase()) ||
      r.name.toLowerCase().includes(lower) ||
      (lower.includes('hyatt') && r.id === 'rest-sf-1') ||
      (lower.includes('tartine') && r.id === 'rest-sf-2') ||
      (lower.includes('salesforce') && r.id === 'rest-sf-3') ||
      (lower.includes('trattoria') && r.id === 'rest-sf-4') ||
      (lower.includes('whole foods') && r.id === 'rest-sf-5') ||
      (lower.includes('linkedin') && r.id === 'rest-sf-6') ||
      (lower.includes('taj') && r.id === 'rest-del-1') ||
      (lower.includes('maurya') && r.id === 'rest-del-2') ||
      (lower.includes('connaught') && r.id === 'rest-del-3') ||
      (lower.includes('aerocity') && r.id === 'rest-del-4') ||
      (lower.includes('hauz khas') && r.id === 'rest-del-5') ||
      (lower.includes('cyber') && r.id === 'rest-del-6') ||
      (lower.includes('haldiram') && r.id === 'rest-del-7')
  );

  if (known) {
    return {
      coords: known.coords,
      name: known.name,
      matchedKnownLocation: true,
    };
  }

  // Keyword area fallbacks
  if (lower.includes('mission')) {
    return { coords: [37.7605, -122.4190], matchedKnownLocation: true };
  }
  if (lower.includes('soma') || lower.includes('folsom')) {
    return { coords: [37.7810, -122.4050], matchedKnownLocation: true };
  }
  if (lower.includes('embarcadero') || lower.includes('financial')) {
    return { coords: [37.7940, -122.3960], matchedKnownLocation: true };
  }
  if (lower.includes('north beach') || lower.includes('columbus')) {
    return { coords: [37.8010, -122.4085], matchedKnownLocation: true };
  }
  if (lower.includes('haight') || lower.includes('ashbury')) {
    return { coords: [37.7680, -122.4530], matchedKnownLocation: true };
  }
  if (lower.includes('delhi') || lower.includes('cp') || lower.includes('connaught')) {
    return { coords: [28.6315, 77.2167], matchedKnownLocation: true };
  }
  if (lower.includes('gurgaon') || lower.includes('gurugram')) {
    return { coords: [28.4950, 77.0890], matchedKnownLocation: true };
  }
  if (lower.includes('lajpat')) {
    return { coords: [28.5670, 77.2430], matchedKnownLocation: true };
  }

  // Default coordinate: SF Downtown / Financial District
  return {
    coords: [37.7940, -122.3960],
    matchedKnownLocation: false,
  };
}
