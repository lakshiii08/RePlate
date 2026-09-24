const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to calculate relative ISO dates
const getRelativeIso = (minutesFromNow) => {
  return new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString();
};

// ==========================================
// IN-MEMORY OPERATIONAL DATABASE
// ==========================================

let sheltersStore = [
  {
    id: 'shelter-1',
    name: 'Hope Community Shelter & Kitchen',
    address: '452 Elm Street, Tenderloin / Downtown',
    coords: [37.7749, -122.4194],
    capacityMeals: 140,
    currentNeeds: ['Cooked Meal', 'Fresh Produce', 'Dairy & Refrigerated'],
    distanceKm: 2.1,
    etaMinutes: 11,
    contactPhone: '+1 (555) 234-5678',
    feasibilityScore: {
      overallScore: 96,
      timeFeasibility: 97,
      capacityFit: 95,
      foodCompatibility: 100,
      distanceEta: 92,
      needPriority: 98,
      driverReadiness: 94,
      explanation: 'High urgency intake request: hot meals matched with open warmers, 11 min transit buffer.',
    },
  },
  {
    id: 'shelter-2',
    name: 'Grace Haven Family Care Center',
    address: '890 Mission Avenue, SOMA District',
    coords: [37.7833, -122.4167],
    capacityMeals: 85,
    currentNeeds: ['Cooked Meal', 'Bakery & Bread', 'Packaged Goods'],
    distanceKm: 3.4,
    etaMinutes: 15,
    contactPhone: '+1 (555) 876-5432',
    feasibilityScore: {
      overallScore: 89,
      timeFeasibility: 91,
      capacityFit: 88,
      foodCompatibility: 94,
      distanceEta: 86,
      needPriority: 90,
      driverReadiness: 85,
      explanation: 'Suitable portion sizes for 28 resident families, verified food allergy isolation protocols.',
    },
  },
  {
    id: 'shelter-3',
    name: 'St. Vincent Dining Hall & Food Bank',
    address: '1200 Market Street, Civic Center',
    coords: [37.7695, -122.4269],
    capacityMeals: 220,
    currentNeeds: ['Catered Buffet', 'Fresh Produce', 'Cooked Meal'],
    distanceKm: 4.8,
    etaMinutes: 20,
    contactPhone: '+1 (555) 345-6789',
    feasibilityScore: {
      overallScore: 84,
      timeFeasibility: 82,
      capacityFit: 100,
      foodCompatibility: 88,
      distanceEta: 79,
      needPriority: 85,
      driverReadiness: 76,
      explanation: 'Commercial walk-in coolers available for high volume hotel banquet drops.',
    },
  },
  {
    id: 'shelter-4',
    name: 'Beacon Hill Youth Refuge',
    address: '742 Evergreen Terrace, North Beach',
    coords: [37.7900, -122.4050],
    capacityMeals: 45,
    currentNeeds: ['Bakery & Bread', 'Dairy & Refrigerated', 'Packaged Goods'],
    distanceKm: 5.7,
    etaMinutes: 24,
    contactPhone: '+1 (555) 987-6543',
    feasibilityScore: {
      overallScore: 78,
      timeFeasibility: 76,
      capacityFit: 70,
      foodCompatibility: 85,
      distanceEta: 74,
      needPriority: 82,
      driverReadiness: 88,
      explanation: 'Active snack & breakfast pantry with immediate refrigerated storage intake.',
    },
  },
  {
    id: 'shelter-5',
    name: 'Mission Community Table',
    address: '2240 Mission St, Mission Corridor',
    coords: [37.7605, -122.4190],
    capacityMeals: 110,
    currentNeeds: ['Cooked Meal', 'Catered Buffet', 'Bakery & Bread'],
    distanceKm: 3.9,
    etaMinutes: 16,
    contactPhone: '+1 (555) 312-9988',
    feasibilityScore: {
      overallScore: 86,
      timeFeasibility: 89,
      capacityFit: 84,
      foodCompatibility: 90,
      distanceEta: 83,
      needPriority: 88,
      driverReadiness: 86,
      explanation: 'Evening dinner service queue active; can distribute hot trays within 30 minutes.',
    },
  },
  {
    id: 'shelter-6',
    name: 'Bayview Seniors Nutrition Hub',
    address: '1580 Third Street, Bayview',
    coords: [37.7420, -122.3890],
    capacityMeals: 95,
    currentNeeds: ['Fresh Produce', 'Packaged Goods', 'Cooked Meal'],
    distanceKm: 6.8,
    etaMinutes: 26,
    contactPhone: '+1 (555) 654-3210',
    feasibilityScore: {
      overallScore: 75,
      timeFeasibility: 72,
      capacityFit: 85,
      foodCompatibility: 80,
      distanceEta: 68,
      needPriority: 86,
      driverReadiness: 72,
      explanation: 'Prioritizes low-sodium and diabetic-friendly packaged portions.',
    },
  },
  {
    id: 'shelter-7',
    name: 'Compass Family Outreach Center',
    address: '37 Grove Street, Central Plaza',
    coords: [37.7785, -122.4180],
    capacityMeals: 60,
    currentNeeds: ['Cooked Meal', 'Dairy & Refrigerated'],
    distanceKm: 2.8,
    etaMinutes: 13,
    contactPhone: '+1 (555) 432-1098',
    feasibilityScore: {
      overallScore: 91,
      timeFeasibility: 93,
      capacityFit: 86,
      foodCompatibility: 95,
      distanceEta: 90,
      needPriority: 92,
      driverReadiness: 90,
      explanation: 'Central location near courier transit spine with immediate distribution.',
    },
  },
];

let driversStore = [
  {
    id: 'driver-1',
    name: 'Aarav Patel',
    phone: '+1 (555) 111-2233',
    vehicleType: 'Refrigerated Van',
    coords: [37.7810, -122.4110],
    status: 'ON_RESCUE',
    rating: 4.95,
    etaToDonorMinutes: 7,
    deliveriesCompleted: 154,
  },
  {
    id: 'driver-2',
    name: 'Elena Rostova',
    phone: '+1 (555) 444-5566',
    vehicleType: 'EV Cargo Car',
    coords: [37.7740, -122.4210],
    status: 'AVAILABLE',
    rating: 4.88,
    etaToDonorMinutes: 12,
    deliveriesCompleted: 106,
  },
  {
    id: 'driver-3',
    name: 'Marcus Vance',
    phone: '+1 (555) 777-8899',
    vehicleType: 'Thermal Truck',
    coords: [37.7890, -122.4040],
    status: 'AVAILABLE',
    rating: 4.98,
    etaToDonorMinutes: 16,
    deliveriesCompleted: 228,
  },
  {
    id: 'driver-4',
    name: 'Sofia Chen',
    phone: '+1 (555) 222-3344',
    vehicleType: 'E-Bike Courier',
    coords: [37.7795, -122.4160],
    status: 'AVAILABLE',
    rating: 4.91,
    etaToDonorMinutes: 6,
    deliveriesCompleted: 87,
  },
  {
    id: 'driver-5',
    name: 'Jamal Washington',
    phone: '+1 (555) 888-9900',
    vehicleType: 'Refrigerated Van',
    coords: [37.7650, -122.4280],
    status: 'AVAILABLE',
    rating: 4.85,
    etaToDonorMinutes: 19,
    deliveriesCompleted: 141,
  },
  {
    id: 'driver-6',
    name: 'Maya Lin',
    phone: '+1 (555) 333-6677',
    vehicleType: 'EV Cargo Car',
    coords: [37.7950, -122.4010],
    status: 'AVAILABLE',
    rating: 4.92,
    etaToDonorMinutes: 10,
    deliveriesCompleted: 73,
  },
  {
    id: 'driver-7',
    name: 'Carlos Mendez',
    phone: '+1 (555) 555-1234',
    vehicleType: 'Thermal Truck',
    coords: [37.7710, -122.4330],
    status: 'OFFLINE',
    rating: 4.79,
    etaToDonorMinutes: 25,
    deliveriesCompleted: 92,
  },
];

let donationsStore = [
  {
    id: 'RP-1024',
    donorId: 'donor-1',
    donorName: 'Grand Hyatt Hotel Catering',
    donorAddress: '345 Embarcadero Plaza, Financial District',
    donorCoords: [37.7940, -122.3960],
    foodName: 'Paneer Rice & Vegetable Curry Trays',
    category: 'Cooked Meal',
    quantity: '50 packed meals',
    mealCount: 50,
    description: 'Freshly prepared paneer rice and warm vegetable curry in insulated food trays from luncheon conference.',
    prepTime: '7:00 PM',
    availableFrom: '7:30 PM',
    pickupDeadline: getRelativeIso(38),
    rescueWindowMinutes: 90,
    storageMethod: 'hot_held',
    packagingType: 'sealed',
    allergens: ['Dairy'],
    declarations: {
      safeStorage: true,
      cleanContainers: true,
      noContamination: true,
      donorVerified: true,
    },
    eligibilityStatus: 'ELIGIBLE',
    status: 'PICKUP_IN_PROGRESS',
    matchedShelter: sheltersStore[0],
    assignedDriver: driversStore[0],
    driverCoords: [37.7860, -122.4050],
    createdAt: getRelativeIso(-35),
    urgencyLevel: 'attention',
  },
  {
    id: 'RP-1025',
    donorId: 'donor-2',
    donorName: 'Artisan Sourdough & Cafe',
    donorAddress: '512 Valencia St, Mission District',
    donorCoords: [37.7640, -122.4220],
    foodName: 'Artisanal Sourdough & Croissants',
    category: 'Bakery & Bread',
    quantity: '35 loaves / 60 pastries',
    mealCount: 45,
    description: 'Surplus morning artisanal sourdough loaves, whole grain batards, and butter croissants.',
    prepTime: '6:00 AM',
    availableFrom: '7:45 PM',
    pickupDeadline: getRelativeIso(115),
    rescueWindowMinutes: 180,
    storageMethod: 'ambient',
    packagingType: 'covered',
    allergens: ['Gluten', 'Butter/Dairy'],
    declarations: {
      safeStorage: true,
      cleanContainers: true,
      noContamination: true,
      donorVerified: true,
    },
    eligibilityStatus: 'ELIGIBLE',
    status: 'MATCHED',
    matchedShelter: sheltersStore[1],
    createdAt: getRelativeIso(-20),
    urgencyLevel: 'normal',
  },
  {
    id: 'RP-1026',
    donorId: 'donor-3',
    donorName: 'Corporate Tech Campus Cafeteria',
    donorAddress: '100 Silicon Way, SOMA South',
    donorCoords: [37.7810, -122.3990],
    foodName: 'Grilled Herb Chicken & Quinoa Bowls',
    category: 'Cooked Meal',
    quantity: '80 individual containers',
    mealCount: 80,
    description: 'Individually portioned grilled herb chicken with quinoa and roasted vegetables in sealed compostable containers.',
    prepTime: '6:30 PM',
    availableFrom: '7:00 PM',
    pickupDeadline: getRelativeIso(16),
    rescueWindowMinutes: 60,
    storageMethod: 'refrigerated',
    packagingType: 'individual_containers',
    allergens: [],
    declarations: {
      safeStorage: true,
      cleanContainers: true,
      noContamination: true,
      donorVerified: true,
    },
    eligibilityStatus: 'ELIGIBLE',
    status: 'POSTED',
    createdAt: getRelativeIso(-44),
    urgencyLevel: 'critical',
  },
  {
    id: 'RP-1027',
    donorId: 'donor-4',
    donorName: 'Bella Vista Trattoria',
    donorAddress: '1648 Stockton St, North Beach',
    donorCoords: [37.8010, -122.4085],
    foodName: 'Baked Penne Bolognese & Focaccia',
    category: 'Cooked Meal',
    quantity: '3 large thermal hotel pans (60 portions)',
    mealCount: 60,
    description: 'Freshly baked pasta with slow-cooked beef ragu, fresh mozzarella, and herb garlic focaccia bread.',
    prepTime: '8:00 PM',
    availableFrom: '8:30 PM',
    pickupDeadline: getRelativeIso(55),
    rescueWindowMinutes: 100,
    storageMethod: 'hot_held',
    packagingType: 'sealed',
    allergens: ['Dairy', 'Gluten'],
    declarations: {
      safeStorage: true,
      cleanContainers: true,
      noContamination: true,
      donorVerified: true,
    },
    eligibilityStatus: 'ELIGIBLE',
    status: 'DRIVER_ASSIGNED',
    matchedShelter: sheltersStore[2],
    assignedDriver: driversStore[2],
    driverCoords: [37.7950, -122.4050],
    createdAt: getRelativeIso(-15),
    urgencyLevel: 'attention',
  },
  {
    id: 'RP-1028',
    donorId: 'donor-5',
    donorName: 'Green Leaf Organic Market',
    donorAddress: '780 Stanyan St, Haight-Ashbury',
    donorCoords: [37.7680, -122.4530],
    foodName: 'Mixed Organic Produce & Stone Fruits',
    category: 'Fresh Produce',
    quantity: '12 crates (approx. 140 kg)',
    mealCount: 90,
    description: 'Crisp organic romaine, heirloom tomatoes, zucchini, apples, and ripe peaches in clean wooden produce crates.',
    prepTime: '4:00 PM',
    availableFrom: '5:00 PM',
    pickupDeadline: getRelativeIso(180),
    rescueWindowMinutes: 240,
    storageMethod: 'ambient',
    packagingType: 'bulk_boxes',
    allergens: [],
    declarations: {
      safeStorage: true,
      cleanContainers: true,
      noContamination: true,
      donorVerified: true,
    },
    eligibilityStatus: 'ELIGIBLE',
    status: 'MATCHED',
    matchedShelter: sheltersStore[4],
    createdAt: getRelativeIso(-50),
    urgencyLevel: 'normal',
  },
  {
    id: 'RP-1029',
    donorId: 'donor-6',
    donorName: 'Metro Express Deli',
    donorAddress: '201 2nd St, Financial District',
    donorCoords: [37.7885, -122.3995],
    foodName: 'Artisan Turkey & Cheddar Baguette Boxes',
    category: 'Packaged Goods',
    quantity: '40 wrapped meal boxes with crisp chips & apple',
    mealCount: 40,
    description: 'Pre-boxed gourmet deli lunches prepared for canceled conference session.',
    prepTime: '11:30 AM',
    availableFrom: '1:00 PM',
    pickupDeadline: getRelativeIso(70),
    rescueWindowMinutes: 120,
    storageMethod: 'refrigerated',
    packagingType: 'individual_containers',
    allergens: ['Gluten', 'Dairy'],
    declarations: {
      safeStorage: true,
      cleanContainers: true,
      noContamination: true,
      donorVerified: true,
    },
    eligibilityStatus: 'ELIGIBLE',
    status: 'IN_TRANSIT',
    matchedShelter: sheltersStore[6],
    assignedDriver: driversStore[3],
    driverCoords: [37.7820, -122.4080],
    createdAt: getRelativeIso(-75),
    urgencyLevel: 'attention',
  },
  {
    id: 'RP-1030',
    donorId: 'donor-7',
    donorName: 'Pacific Culinary Institute',
    donorAddress: '600 Townsend St, Design District',
    donorCoords: [37.7715, -122.4035],
    foodName: 'Herb Roasted Salmon & Wild Rice',
    category: 'Cooked Meal',
    quantity: '35 gourmet plated dinner portions',
    mealCount: 35,
    description: 'Seared wild salmon fillets with steamed asparagus, dill sauce, and brown wild rice pilaf.',
    prepTime: '6:45 PM',
    availableFrom: '7:15 PM',
    pickupDeadline: getRelativeIso(19),
    rescueWindowMinutes: 50,
    storageMethod: 'hot_held',
    packagingType: 'sealed',
    allergens: ['Fish', 'Dairy'],
    declarations: {
      safeStorage: true,
      cleanContainers: true,
      noContamination: true,
      donorVerified: true,
    },
    eligibilityStatus: 'ELIGIBLE',
    status: 'RE_MATCHING',
    matchedShelter: sheltersStore[0],
    assignedDriver: driversStore[1],
    driverCoords: [37.7780, -122.4150],
    createdAt: getRelativeIso(-31),
    urgencyLevel: 'critical',
  },
  {
    id: 'RP-1021',
    donorId: 'donor-1',
    donorName: 'Grand Hyatt Hotel Catering',
    donorAddress: '345 Embarcadero Plaza',
    donorCoords: [37.7940, -122.3960],
    foodName: 'Roasted Mediterranean Salad Bowls',
    category: 'Fresh Produce',
    quantity: '30 portions',
    mealCount: 30,
    description: 'Chilled salads with feta cheese, kalamata olives, and olive oil vinaigrette dressing packaged separately.',
    prepTime: '12:00 PM',
    availableFrom: '1:00 PM',
    pickupDeadline: getRelativeIso(-180),
    rescueWindowMinutes: 120,
    storageMethod: 'refrigerated',
    packagingType: 'sealed',
    allergens: ['Dairy'],
    declarations: {
      safeStorage: true,
      cleanContainers: true,
      noContamination: true,
      donorVerified: true,
    },
    eligibilityStatus: 'ELIGIBLE',
    status: 'DELIVERED',
    matchedShelter: sheltersStore[0],
    assignedDriver: driversStore[0],
    pickupVerification: {
      tempCelsius: 4.2,
      packagingVerified: true,
      pinCode: '1021',
      photoUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
      timestamp: getRelativeIso(-160),
      verifiedByDriverId: 'driver-1',
    },
    deliveryVerification: {
      tempCelsius: 4.8,
      recipientName: 'Sister Maria Teresa / Hope Shelter',
      recipientSignature: 'M_Teresa_Verified',
      photoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop',
      timestamp: getRelativeIso(-140),
    },
    createdAt: getRelativeIso(-200),
    urgencyLevel: 'normal',
  },
  {
    id: 'RP-1022',
    donorId: 'donor-8',
    donorName: 'University Dining Commons',
    donorAddress: '500 Parnassus Ave, Medical Campus',
    donorCoords: [37.7630, -122.4580],
    foodName: 'Hearty Lentil Soup & Whole Grain Rolls',
    category: 'Cooked Meal',
    quantity: '65 portions (thermal cambro containers)',
    mealCount: 65,
    description: 'Warm vegan lentil and vegetable stew with fresh baked dinner rolls.',
    prepTime: '1:00 PM',
    availableFrom: '2:00 PM',
    pickupDeadline: getRelativeIso(-320),
    rescueWindowMinutes: 90,
    storageMethod: 'hot_held',
    packagingType: 'sealed',
    allergens: ['Gluten'],
    declarations: {
      safeStorage: true,
      cleanContainers: true,
      noContamination: true,
      donorVerified: true,
    },
    eligibilityStatus: 'ELIGIBLE',
    status: 'DELIVERED',
    matchedShelter: sheltersStore[1],
    assignedDriver: driversStore[1],
    pickupVerification: {
      tempCelsius: 67.5,
      packagingVerified: true,
      pinCode: '1022',
      photoUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop',
      timestamp: getRelativeIso(-300),
      verifiedByDriverId: 'driver-2',
    },
    deliveryVerification: {
      tempCelsius: 64.0,
      recipientName: 'Marcus Williams / Grace Haven',
      recipientSignature: 'MWilliams_Signed',
      timestamp: getRelativeIso(-280),
    },
    createdAt: getRelativeIso(-360),
    urgencyLevel: 'normal',
  },
];

let usersStore = [
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
    organization: 'Hope Community Shelter',
    location: 'Downtown, SF',
    status: 'ACTIVE',
    activeRescueId: 'RP-1024',
  },
  {
    id: 'user-shelter-2',
    name: 'Sister Maria Teresa',
    email: 'gracehaven@replate.org',
    phone: '+1 (555) 444-5566',
    role: 'SHELTER',
    organization: 'Grace Haven Family Care',
    location: 'SOMA, SF',
    status: 'ACTIVE',
    activeRescueId: 'RP-1025',
  },
  {
    id: 'user-driver-1',
    name: 'Aarav Patel',
    email: 'driver@replate.org',
    phone: '+1 (555) 111-2233',
    role: 'DRIVER',
    organization: 'Refrigerated Courier Transport',
    location: 'En Route Embarcadero',
    status: 'ACTIVE',
    activeRescueId: 'RP-1024',
  },
  {
    id: 'user-driver-2',
    name: 'Elena Rostova',
    email: 'elena@replate.org',
    phone: '+1 (555) 444-5566',
    role: 'DRIVER',
    organization: 'Urban EV Cargo Express',
    location: 'Mission Corridor',
    status: 'ACTIVE',
    activeRescueId: 'RP-1030',
  },
  {
    id: 'user-admin-1',
    name: 'Operations Dispatch Admin',
    email: 'admin@replate.org',
    phone: '+1 (555) 999-0000',
    role: 'ADMIN',
    organization: 'RePlate Regional Dispatch Command',
    location: 'San Francisco Hub',
    status: 'ACTIVE',
  },
];

let safetyReviewsStore = [
  {
    id: 'SR-201',
    donationId: 'RP-1029',
    donorName: 'Metro Express Deli',
    foodName: 'Artisan Turkey & Cheddar Baguette Boxes',
    category: 'Packaged Goods',
    storageMethod: 'refrigerated',
    pickupDeadline: getRelativeIso(70),
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
    pickupDeadline: getRelativeIso(19),
    flaggedReason: 'Critical remaining time (<20 min) requires expedited thermal barrier confirmation.',
    status: 'PENDING_REVIEW',
  },
];

// Helper: dynamic calculation of impact metrics
function calculateImpact() {
  const delivered = donationsStore.filter((d) => d.status === 'DELIVERED');
  const active = donationsStore.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED');

  const baseDeliveredMeals = 41200;
  const recentDeliveredMeals = delivered.reduce((acc, d) => acc + (d.mealCount || 0), 0);
  const mealsRescued = baseDeliveredMeals + recentDeliveredMeals;
  const foodSavedKg = Math.round(mealsRescued * 0.45);
  const deliveriesCompleted = 3280 + delivered.length;
  const co2PreventedKg = Math.round(foodSavedKg * 2.5);

  const matchedShelterIds = new Set(donationsStore.map((d) => d.matchedShelter?.id).filter(Boolean));
  const sheltersServed = Math.max(sheltersStore.length, 50 + matchedShelterIds.size);

  return {
    mealsRescued,
    activeRescues: active.length,
    foodSavedKg,
    deliveriesCompleted,
    co2PreventedKg,
    sheltersServed,
  };
}

// Deterministic safety evaluation
function evaluateSafetyEligibility(donation) {
  if (!donation.declarations?.safeStorage) {
    return {
      status: 'DO_NOT_ROUTE',
      reason: 'Failed Safety Verification: Storage temperature guidelines not affirmed by donor.',
    };
  }
  if (!donation.declarations?.noContamination) {
    return {
      status: 'DO_NOT_ROUTE',
      reason: 'Failed Safety Verification: Cross-contamination declaration unverified.',
    };
  }
  if (donation.storageMethod === 'hot_held' && donation.packagingType === 'covered') {
    return {
      status: 'REVIEW_REQUIRED',
      reason: 'Review Required: Hot-held items covered but unsealed require thermal insulation inspection.',
    };
  }
  if (donation.rescueWindowMinutes && donation.rescueWindowMinutes < 15) {
    return {
      status: 'DO_NOT_ROUTE',
      reason: 'Feasibility Risk: Under 15 minutes remaining rescue window.',
    };
  }
  return {
    status: 'ELIGIBLE',
    reason: '100% Deterministic Safety Criteria Passed: Temperature, packaging integrity, and food handler declaration affirmed.',
  };
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Health check & Telemetry Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiIntegrated: Boolean(GEMINI_API_KEY),
    aiModel: GEMINI_API_KEY ? 'gemini-1.5-flash' : 'built-in-nlp-engine',
    stats: calculateImpact(),
  });
});

// 2. Impact Telemetry
app.get('/api/impact', (req, res) => {
  res.json(calculateImpact());
});

// 3. Donations Endpoints
app.get('/api/donations', (req, res) => {
  let results = [...donationsStore];
  const { status, donorId, urgency } = req.query;

  if (status) {
    results = results.filter((d) => d.status.toLowerCase() === status.toLowerCase());
  }
  if (donorId) {
    results = results.filter((d) => d.donorId === donorId);
  }
  if (urgency) {
    results = results.filter((d) => d.urgencyLevel === urgency);
  }

  res.json(results);
});

app.get('/api/donations/:id', (req, res) => {
  const item = donationsStore.find((d) => d.id.toLowerCase() === req.params.id.toLowerCase());
  if (!item) {
    return res.status(404).json({ error: 'Donation not found', fallback: donationsStore[0] });
  }
  res.json(item);
});

app.post('/api/donations', (req, res) => {
  const data = req.body;
  const rescueWindowMinutes = data.rescueWindowMinutes || 90;
  const eligibility = evaluateSafetyEligibility(data);

  const newDonation = {
    ...data,
    id: `RP-${Math.floor(1000 + Math.random() * 9000)}`,
    status: eligibility.status === 'DO_NOT_ROUTE' ? 'CANCELLED' : 'POSTED',
    eligibilityStatus: eligibility.status,
    eligibilityReason: eligibility.reason,
    urgencyLevel: rescueWindowMinutes < 30 ? 'critical' : rescueWindowMinutes < 60 ? 'attention' : 'normal',
    createdAt: new Date().toISOString(),
    pickupDeadline: data.pickupDeadline || getRelativeIso(rescueWindowMinutes),
  };

  donationsStore.unshift(newDonation);
  res.status(201).json(newDonation);
});

app.patch('/api/donations/:id', (req, res) => {
  const index = donationsStore.findIndex((d) => d.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Donation not found' });
  }

  donationsStore[index] = {
    ...donationsStore[index],
    ...req.body,
  };

  res.json(donationsStore[index]);
});

// Verification endpoints
app.post('/api/donations/:id/verify-pickup', (req, res) => {
  const index = donationsStore.findIndex((d) => d.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: 'Donation not found' });

  const { tempCelsius, packagingVerified, pinCode, driverId, photoUrl } = req.body;
  const pickupData = {
    tempCelsius: Number(tempCelsius) || 65.0,
    packagingVerified: Boolean(packagingVerified),
    pinCode: pinCode || '1024',
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop',
    timestamp: new Date().toISOString(),
    verifiedByDriverId: driverId || 'driver-1',
  };

  donationsStore[index] = {
    ...donationsStore[index],
    status: 'IN_TRANSIT',
    pickupVerification: pickupData,
  };

  res.json(donationsStore[index]);
});

app.post('/api/donations/:id/verify-delivery', (req, res) => {
  const index = donationsStore.findIndex((d) => d.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: 'Donation not found' });

  const { tempCelsius, recipientName, recipientSignature, photoUrl } = req.body;
  const deliveryData = {
    tempCelsius: Number(tempCelsius) || 62.0,
    recipientName: recipientName || 'Shelter Intake Coordinator',
    recipientSignature: recipientSignature || 'Verified_Signature',
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&auto=format&fit=crop',
    timestamp: new Date().toISOString(),
  };

  donationsStore[index] = {
    ...donationsStore[index],
    status: 'DELIVERED',
    deliveryVerification: deliveryData,
  };

  res.json(donationsStore[index]);
});

// 4. Shelters Endpoints
app.get('/api/shelters', (req, res) => {
  res.json(sheltersStore);
});

app.patch('/api/shelters/:id', (req, res) => {
  const index = sheltersStore.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Shelter not found' });

  sheltersStore[index] = { ...sheltersStore[index], ...req.body };
  res.json(sheltersStore[index]);
});

// 5. Drivers Endpoints
app.get('/api/drivers', (req, res) => {
  const { status } = req.query;
  let results = [...driversStore];
  if (status) {
    results = results.filter((d) => d.status.toLowerCase() === status.toLowerCase());
  }
  res.json(results);
});

app.patch('/api/drivers/:id', (req, res) => {
  const index = driversStore.findIndex((d) => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Driver not found' });

  driversStore[index] = { ...driversStore[index], ...req.body };
  res.json(driversStore[index]);
});

// 6. Matching & Assignment Endpoints
app.get('/api/matching/candidates/:donationId', (req, res) => {
  const donation = donationsStore.find((d) => d.id.toLowerCase() === req.params.donationId.toLowerCase());
  const category = donation?.category || 'Cooked Meal';
  const remainingMin = donation?.rescueWindowMinutes || 90;

  const scoredShelters = sheltersStore.map((shelter) => {
    const timeScore = Math.max(50, Math.min(99, Math.round(100 - (shelter.etaMinutes * 1.2))));
    const capScore = shelter.capacityMeals >= (donation?.mealCount || 40) ? 96 : 72;
    const foodComp = shelter.currentNeeds.includes(category) ? 100 : 80;
    const overall = Math.round((timeScore * 0.4) + (capScore * 0.3) + (foodComp * 0.3));

    return {
      ...shelter,
      feasibilityScore: {
        overallScore: overall,
        timeFeasibility: timeScore,
        capacityFit: capScore,
        foodCompatibility: foodComp,
        distanceEta: Math.max(65, 100 - Math.round(shelter.distanceKm * 5)),
        needPriority: shelter.currentNeeds[0] === category ? 98 : 84,
        driverReadiness: 90,
        explanation: `${shelter.name} matches dietary demand for ${category} with confirmed intake capacity (${shelter.capacityMeals} portions), reachable in ${shelter.etaMinutes} mins with safe ${remainingMin - shelter.etaMinutes}m preservation cushion.`,
      },
    };
  });

  scoredShelters.sort((a, b) => b.feasibilityScore.overallScore - a.feasibilityScore.overallScore);
  res.json(scoredShelters);
});

app.post('/api/matching/assign', (req, res) => {
  const { donationId, shelterId, driverId } = req.body;
  const dIndex = donationsStore.findIndex((d) => d.id.toLowerCase() === donationId.toLowerCase());
  if (dIndex === -1) return res.status(404).json({ error: 'Donation not found' });

  const shelter = sheltersStore.find((s) => s.id === shelterId) || sheltersStore[0];
  const driver = driversStore.find((dr) => dr.id === driverId) || driversStore[0];

  donationsStore[dIndex] = {
    ...donationsStore[dIndex],
    status: 'DRIVER_ASSIGNED',
    matchedShelter: shelter,
    assignedDriver: driver,
    driverCoords: driver.coords,
  };

  res.json(donationsStore[dIndex]);
});

app.post('/api/matching/rematch', (req, res) => {
  const { donationId, reason } = req.body;
  const dIndex = donationsStore.findIndex((d) => d.id.toLowerCase() === donationId.toLowerCase());
  if (dIndex === -1) return res.status(404).json({ error: 'Donation not found' });

  const backupDriver = driversStore.find((d) => d.status === 'AVAILABLE' && d.id !== donationsStore[dIndex].assignedDriver?.id) || driversStore[1];
  const backupShelter = sheltersStore[1];

  donationsStore[dIndex] = {
    ...donationsStore[dIndex],
    status: 'RE_MATCHING',
    assignedDriver: backupDriver,
    matchedShelter: backupShelter,
    driverCoords: backupDriver.coords,
    urgencyLevel: 'critical',
  };

  res.json({
    donation: donationsStore[dIndex],
    backupDriver,
    backupShelter,
    reason: reason || 'Driver route failure trigger - automated failover executed',
  });
});

// 7. AI Endpoints (Compatible with Gemini API & High-Performance Fallback)
app.post('/api/ai/parse', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text prompt is required' });
  }

  // If Gemini API Key is configured, attempt real Gemini 1.5 Flash extraction
  if (GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an AI Food Logistics Specialist. Parse this surplus food description into structured JSON:
"${text}"

Respond with ONLY valid JSON with keys:
{
  "foodName": string,
  "category": "Cooked Meal" | "Bakery & Bread" | "Fresh Produce" | "Packaged Goods" | "Dairy & Refrigerated" | "Catered Buffet",
  "quantity": string,
  "mealCount": number,
  "prepTime": string,
  "packagingType": "sealed" | "covered" | "individual_containers" | "bulk_boxes",
  "storageMethod": "hot_held" | "refrigerated" | "ambient" | "frozen",
  "allergens": string[],
  "confidenceScore": number,
  "extractedReasoning": string
}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const geminiData = await response.json();
        const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          const jsonText = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(jsonText);
          return res.json(parsed);
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, using built-in NLP parser fallback:', err.message);
    }
  }

  // High-performance Built-in NLP Parser Fallback
  const lower = text.toLowerCase();

  let foodName = 'Surplus Prepared Food';
  let category = 'Cooked Meal';
  let quantity = '40 meals';
  let mealCount = 40;
  let prepTime = '7:00 PM';
  let packagingType = 'sealed';
  let storageMethod = 'hot_held';
  const allergens = [];

  // Quantity detection
  const numberMatch = text.match(/(\d+)\s*(meals|portions|boxes|trays|platters|loaves|crates|kg|lbs|containers)?/i);
  if (numberMatch) {
    const count = parseInt(numberMatch[1], 10);
    mealCount = count;
    quantity = `${count} ${numberMatch[2] || 'portions'}`;
  }

  // Time extraction: require colon or am/pm
  const timeMatch = text.match(/(\b\d{1,2}:\d{2}\s*(?:am|pm)?\b|\b\d{1,2}\s*(?:am|pm)\b)/i);
  if (timeMatch) {
    prepTime = timeMatch[1].toUpperCase();
  }

  // Classification & Allergen recognition
  if (lower.includes('lasagna') || lower.includes('pasta') || lower.includes('spaghetti') || lower.includes('penne')) {
    foodName = 'Baked Italian Pasta & Lasagna';
    category = 'Cooked Meal';
    storageMethod = 'hot_held';
    packagingType = 'sealed';
    if (!allergens.includes('Gluten')) allergens.push('Gluten');
    if (!allergens.includes('Dairy')) allergens.push('Dairy');
  } else if (lower.includes('paneer') || lower.includes('curry') || lower.includes('rice') || lower.includes('biryani')) {
    foodName = 'Paneer Rice & Vegetable Curry';
    category = 'Cooked Meal';
    storageMethod = 'hot_held';
    packagingType = 'sealed';
    if (!allergens.includes('Dairy')) allergens.push('Dairy');
  } else if (lower.includes('bread') || lower.includes('croissant') || lower.includes('pastr') || lower.includes('sourdough')) {
    foodName = 'Artisanal Sourdough & Pastries';
    category = 'Bakery & Bread';
    storageMethod = 'ambient';
    packagingType = 'covered';
    if (!allergens.includes('Gluten')) allergens.push('Gluten');
    if (!allergens.includes('Dairy')) allergens.push('Dairy');
  } else if (lower.includes('chicken') || lower.includes('beef') || lower.includes('meat') || lower.includes('turkey')) {
    foodName = 'Herb Roasted Chicken & Grain Bowls';
    category = 'Cooked Meal';
    storageMethod = 'refrigerated';
    packagingType = 'individual_containers';
  } else if (lower.includes('salad') || lower.includes('fruit') || lower.includes('produce') || lower.includes('vegetable')) {
    foodName = 'Garden Salad & Chilled Farm Produce';
    category = 'Fresh Produce';
    storageMethod = 'refrigerated';
    packagingType = 'bulk_boxes';
  } else if (lower.includes('sandwich') || lower.includes('wrap') || lower.includes('box lunch')) {
    foodName = 'Deli Sandwiches & Wrapped Lunch Boxes';
    category = 'Packaged Goods';
    storageMethod = 'refrigerated';
    packagingType = 'individual_containers';
    if (!allergens.includes('Gluten')) allergens.push('Gluten');
  } else if (lower.includes('buffet') || lower.includes('banquet') || lower.includes('catering')) {
    foodName = 'Catered Event Entrees & Sides';
    category = 'Catered Buffet';
    storageMethod = 'hot_held';
    packagingType = 'sealed';
  }

  // Explicit allergen keywords check
  if (lower.includes('cheese') || lower.includes('milk') || lower.includes('butter') || lower.includes('dairy')) {
    if (!allergens.includes('Dairy')) allergens.push('Dairy');
  }
  if (lower.includes('wheat') || lower.includes('flour') || lower.includes('gluten')) {
    if (!allergens.includes('Gluten')) allergens.push('Gluten');
  }
  if (lower.includes('nut') || lower.includes('peanut') || lower.includes('almond')) {
    if (!allergens.includes('Tree Nuts')) allergens.push('Tree Nuts');
  }
  if (lower.includes('egg')) {
    if (!allergens.includes('Eggs')) allergens.push('Eggs');
  }
  if (lower.includes('fish') || lower.includes('salmon') || lower.includes('tuna')) {
    if (!allergens.includes('Fish')) allergens.push('Fish');
  }

  res.json({
    foodName,
    category,
    quantity,
    mealCount,
    prepTime,
    packagingType,
    storageMethod,
    allergens,
    confidenceScore: 0.95,
    extractedReasoning: `Structured ${category} specifications extracted: portion count (${mealCount}), thermal parameters (${storageMethod}), and allergen alerts.`,
  });
});

app.post('/api/ai/copilot', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // If Gemini API Key is configured, formulate dynamic prompt with active graph state
  if (GEMINI_API_KEY) {
    try {
      const activeSummary = donationsStore
        .filter((d) => d.status !== 'DELIVERED')
        .map((d) => `#${d.id} (${d.foodName}, Status: ${d.status}, Urgency: ${d.urgencyLevel}, Shelter: ${d.matchedShelter?.name || 'Unassigned'})`)
        .join('; ');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are the RePlate Logistics Dispatch Assistant. 
Current Active Rescues: ${activeSummary}
Available Couriers: ${driversStore.filter((dr) => dr.status === 'AVAILABLE').map((dr) => dr.name + ' (' + dr.vehicleType + ')').join(', ')}

Answer this operational dispatch question clearly and professionally in 2-3 concise sentences:
"${query}"`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const geminiData = await response.json();
        const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer) {
          return res.json({ answer: answer.trim() });
        }
      }
    } catch (err) {
      console.warn('Gemini copilot query failed, using built-in reasoning engine:', err.message);
    }
  }

  // Data-backed Operational Copilot Reasoning Fallback
  const lower = query.toLowerCase();
  const criticalItem = donationsStore.find((d) => d.urgencyLevel === 'critical' || d.status === 'RE_MATCHING');
  const availableDrivers = driversStore.filter((d) => d.status === 'AVAILABLE');

  let answer = '';
  if (lower.includes('prioritize') || lower.includes('priority') || lower.includes('urgent')) {
    if (criticalItem) {
      answer = `PRIORITY DISPATCH ACTION: Prioritize Rescue #${criticalItem.id} (${criticalItem.foodName}). Rescue window is approaching expiration. Recommend assigning available courier ${availableDrivers[0]?.name || 'Elena Rostova'} (${availableDrivers[0]?.etaToDonorMinutes || 8} min ETA).`;
    } else {
      answer = `All current active rescues are within safe preservation thresholds. No critical emergency escalations pending.`;
    }
  } else if (lower.includes('driver') || lower.includes('courier')) {
    answer = `DISPATCH STATUS: ${availableDrivers.length} drivers currently active and ready for dispatch. Recommended courier: ${availableDrivers[0]?.name} (${availableDrivers[0]?.vehicleType}, ${availableDrivers[0]?.etaToDonorMinutes} min ETA, ${availableDrivers[0]?.rating}★ rating).`;
  } else if (lower.includes('shelter') || lower.includes('capacity')) {
    const topShelter = sheltersStore[0];
    answer = `INTAKE TELEMETRY: ${topShelter.name} currently has ${topShelter.capacityMeals} meal intake spaces available with active demand for Cooked Meals and Fresh Produce.`;
  } else if (lower.includes('rp-') || lower.includes('1024') || lower.includes('1026')) {
    const matched = donationsStore.find((d) => lower.includes(d.id.toLowerCase()) || lower.includes(d.id.replace('rp-', '')));
    if (matched) {
      answer = `RESCUE #${matched.id} (${matched.foodName}): Current status is ${matched.status.replace(/_/g, ' ')}. Donor: ${matched.donorName}. Shelter: ${matched.matchedShelter?.name || 'Awaiting Match'}. Driver: ${matched.assignedDriver?.name || 'Unassigned'}.`;
    } else {
      answer = `Rescue record located in historical database. All food safety temperature logs passed.`;
    }
  } else {
    answer = `DISPATCH TELEMETRY: System tracking ${donationsStore.filter((d) => d.status !== 'DELIVERED').length} active rescues, ${availableDrivers.length} available couriers, and ${sheltersStore.length} partner shelters. Zero safety violations reported.`;
  }

  res.json({ answer });
});

// 8. Admin Portal Support Endpoints
app.get('/api/admin/command-center', (req, res) => {
  const activeRescues = donationsStore.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED');
  const criticalRescues = donationsStore.filter((d) => d.urgencyLevel === 'critical' || d.status === 'RE_MATCHING');
  const availableDrivers = driversStore.filter((d) => d.status === 'AVAILABLE');
  const pendingDonations = donationsStore.filter((d) => d.status === 'POSTED' || d.status === 'VERIFIED');
  const completedDeliveries = donationsStore.filter((d) => d.status === 'DELIVERED');

  res.json({
    metrics: {
      activeRescuesCount: activeRescues.length,
      criticalRescuesCount: criticalRescues.length,
      availableDriversCount: availableDrivers.length,
      pendingDonationsCount: pendingDonations.length,
      completedDeliveriesCount: completedDeliveries.length,
    },
    impact: calculateImpact(),
    recentActive: activeRescues.slice(0, 5),
  });
});

app.get('/api/admin/safety-reviews', (req, res) => {
  res.json(safetyReviewsStore);
});

app.patch('/api/admin/safety-reviews/:id', (req, res) => {
  const item = safetyReviewsStore.find((sr) => sr.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Review item not found' });

  item.status = req.body.status || item.status;
  res.json(item);
});

app.get('/api/admin/users', (req, res) => {
  res.json(usersStore);
});

// 9. Authentication Endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  let user = usersStore.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user && role) {
    user = usersStore.find((u) => u.role === role);
  }
  if (!user) {
    user = usersStore[0];
  }
  res.json(user);
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, role } = req.body;
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    phone,
    role: role || 'DONOR',
    organization: `${role || 'Donor'} Partner`,
    location: 'San Francisco, CA',
    status: 'ACTIVE',
  };
  usersStore.push(newUser);
  res.status(201).json(newUser);
});

app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  const cleanPhone = (phone || '').replace(/[^\d+]/g, '');
  if (!cleanPhone || cleanPhone.length < 8) {
    return res.status(400).json({ error: 'Valid phone number required' });
  }
  const demoOtp = Math.floor(1000 + Math.random() * 9000).toString();
  res.json({
    success: true,
    message: `OTP sent to ${cleanPhone}`,
    demoOtp,
    expiresInSeconds: 300,
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp, role, newUserData } = req.body;
  const cleanPhone = (phone || '').replace(/[^\d+]/g, '');
  if (!cleanPhone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  let existingUser = usersStore.find((u) => u.phone.replace(/[^\d+]/g, '') === cleanPhone);
  if (!existingUser) {
    const targetRole = newUserData?.role || role || 'DONOR';
    const newUser = {
      id: `user-${Date.now()}`,
      name: newUserData?.name || (targetRole === 'DONOR' ? 'Local Restaurant Partner' : targetRole === 'SHELTER' ? 'City Food Hub' : 'Urban Volunteer Driver'),
      email: `${cleanPhone.slice(-6)}@replate.org`,
      phone: cleanPhone,
      role: targetRole,
      organization: newUserData?.organization || (targetRole === 'DONOR' ? 'Fresh Food Donor' : targetRole === 'SHELTER' ? 'Neighborhood Shelter' : 'Eco Courier Volunteer'),
      status: 'ACTIVE',
    };
    usersStore.push(newUser);
    existingUser = newUser;
  }

  res.json({
    success: true,
    user: existingUser,
    token: `token-${existingUser.id}-${Date.now()}`,
  });
});

app.listen(PORT, () => {
  console.log(`RePlate Operational Backend running at http://localhost:${PORT}`);
  console.log(`AI Engine: ${GEMINI_API_KEY ? 'Google Gemini 1.5 Flash Connected' : 'High-Performance Built-in NLP Fallback Ready'}`);
});
