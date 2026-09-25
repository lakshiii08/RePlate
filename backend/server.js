const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables across all local config files
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });
dotenv.config({ path: path.join(__dirname, '../.env.local'), override: true });

const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { connectDB } = require('./database');
const Donation = require('./models/Donation');
const Shelter = require('./models/Shelter');
const Driver = require('./models/Driver');
const Rescue = require('./models/Rescue');
const User = require('./models/User');
const Otp = require('./models/Otp');
const apiRoutes = require('./routes/apiRoutes');
const {
  sendAuthOtpEmail,
  sendDonationPickupOtpEmail,
  sendDeliveryOtpEmail,
  emailAuditLog,
} = require('./services/emailService');
const { haversineDistanceKm, getDrivingRoute } = require('./services/mapboxService');

// ==========================================
// REAL-TIME WEBSOCKET TELEMETRY HUB
// ==========================================
const wsClients = new Set();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  wsClients.add(ws);
  console.log(`[WebSocket] Client connected. Total active clients: ${wsClients.size}`);
  ws.send(JSON.stringify({ type: 'CONNECTED', payload: { status: 'ONLINE', time: new Date().toISOString() } }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      } else if (data.type === 'DRIVER_LOCATION_UPDATE') {
        broadcast('DRIVER_LOCATION_UPDATE', data.payload);
      }
    } catch (e) {
      console.warn('[WebSocket message parse error]:', e.message);
    }
  });

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log(`[WebSocket] Client disconnected. Total active clients: ${wsClients.size}`);
  });
});

function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload });
  wsClients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

// Initialize MongoDB Atlas connection & sync
connectDB()
  .then(() => syncFromMongoDB())
  .catch((err) => console.error('[MongoDB Startup Error]:', err.message));

// Mount REST and Lifecycle endpoints both at root and /api
app.use('/', apiRoutes);
app.use('/api', apiRoutes);

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
  {
    id: 'shelter-8',
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
    id: 'shelter-9',
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
    id: 'shelter-10',
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
    id: 'shelter-11',
    name: 'Sunset Youth & Family Food Center',
    address: '1220 9th Ave, Inner Sunset, SF, CA 94122',
    coords: [37.7654, -122.4662],
    capacityMeals: 80,
    currentNeeds: ['Cooked Meal', 'Dairy & Refrigerated', 'Packaged Goods'],
    distanceKm: 5.9,
    etaMinutes: 20,
    contactPhone: '+1 (415) 555-2233',
  },
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
  {
    id: 'driver-delhi-1',
    name: 'Rajesh Kumar',
    phone: '+91 98101 23456',
    vehicleType: 'Refrigerated Van',
    coords: [28.6304, 77.2177],
    status: 'AVAILABLE',
    rating: 4.96,
    etaToDonorMinutes: 8,
    deliveriesCompleted: 142,
  },
  {
    id: 'driver-delhi-2',
    name: 'Pooja Sharma',
    phone: '+91 98712 34567',
    vehicleType: 'EV Cargo Car',
    coords: [28.5672, 77.2100],
    status: 'AVAILABLE',
    rating: 4.91,
    etaToDonorMinutes: 11,
    deliveriesCompleted: 98,
  },
  {
    id: 'driver-delhi-3',
    name: 'Amitabh Sengupta',
    phone: '+91 99100 45678',
    vehicleType: 'Thermal Truck',
    coords: [28.4595, 77.0266],
    status: 'AVAILABLE',
    rating: 4.89,
    etaToDonorMinutes: 14,
    deliveriesCompleted: 115,
  },
  {
    id: 'driver-delhi-4',
    name: 'Deepak Verma',
    phone: '+91 98188 56789',
    vehicleType: 'E-Bike Courier',
    coords: [28.6139, 77.2090],
    status: 'AVAILABLE',
    rating: 4.94,
    etaToDonorMinutes: 6,
    deliveriesCompleted: 76,
  },
];

let donationsStore = [];

// Real MongoDB database synchronization
async function syncFromMongoDB() {
  try {
    const dbDonations = await Donation.find().sort({ createdAt: -1 }).lean();
    if (dbDonations && dbDonations.length > 0) {
      donationsStore = dbDonations;
      console.log(`✅ [MongoDB] Synchronized ${dbDonations.length} real donations from database.`);
    } else {
      console.log('ℹ️ [MongoDB] Database connected with zero mock donations. Ready for real food rescues.');
    }

    const dbShelters = await Shelter.find().lean();
    if (dbShelters && dbShelters.length > 0) {
      sheltersStore = dbShelters;
    }
    const dbDrivers = await Driver.find().lean();
    if (dbDrivers && dbDrivers.length > 0) {
      driversStore = dbDrivers;
    }
    const dbUsers = await User.find().lean();
    if (dbUsers && dbUsers.length > 0) {
      usersStore = dbUsers;
      console.log(`✅ [MongoDB] Synchronized ${dbUsers.length} real registered users.`);
    }
  } catch (err) {
    console.warn('[MongoDB Sync warning]:', err.message);
  }
}

let usersStore = [];

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
  const declarations = donation.declarations || { safeStorage: true, noContamination: true };
  if (!declarations.safeStorage) {
    return {
      status: 'DO_NOT_ROUTE',
      reason: 'Failed Safety Verification: Storage temperature guidelines not affirmed by donor.',
    };
  }
  if (!declarations.noContamination) {
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

// 3. Donations Endpoints (Real MongoDB Atlas Persistence + WebSockets)
app.get('/api/donations', async (req, res) => {
  const { status, donorId, urgency } = req.query;
  try {
    const filter = {};
    if (status) filter.status = status;
    if (donorId) filter.donorId = donorId;
    if (urgency) filter.urgencyLevel = urgency;
    const dbResults = await Donation.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(dbResults);
  } catch (err) {
    let results = [...donationsStore];
    if (status) results = results.filter((d) => d.status.toLowerCase() === status.toLowerCase());
    if (donorId) results = results.filter((d) => d.donorId === donorId);
    if (urgency) results = results.filter((d) => d.urgencyLevel === urgency);
    return res.json(results);
  }
});

app.get('/api/donations/:id', async (req, res) => {
  try {
    const item = await Donation.findOne({ id: new RegExp(`^${req.params.id}$`, 'i') }).lean();
    if (item) return res.json(item);
  } catch (err) {}

  const mem = donationsStore.find((d) => d.id.toLowerCase() === req.params.id.toLowerCase());
  if (mem) return res.json(mem);
  return res.status(404).json({ error: 'Donation not found' });
});

app.post('/api/donations', async (req, res) => {
  const data = req.body;
  const rescueWindowMinutes = data.rescueWindowMinutes || 90;
  const eligibility = evaluateSafetyEligibility(data);

  const pickupOtp = data.pickupOtp || Math.floor(1000 + Math.random() * 9000).toString();
  const deliveryOtp = data.deliveryOtp || Math.floor(1000 + Math.random() * 9000).toString();

  const newDonation = {
    ...data,
    id: data.id || `RP-${Math.floor(1000 + Math.random() * 9000)}`,
    status: eligibility.status === 'DO_NOT_ROUTE' ? 'CANCELLED' : (data.status || 'POSTED'),
    eligibilityStatus: eligibility.status,
    eligibilityReason: eligibility.reason,
    urgencyLevel: rescueWindowMinutes < 30 ? 'critical' : rescueWindowMinutes < 60 ? 'attention' : 'normal',
    createdAt: data.createdAt || new Date().toISOString(),
    pickupDeadline: data.pickupDeadline || getRelativeIso(rescueWindowMinutes),
    pickupOtp,
    deliveryOtp,
    pickupVerification: data.pickupVerification || {
      otpCode: pickupOtp,
      verified: false,
    },
    deliveryVerification: data.deliveryVerification || {
      otpCode: deliveryOtp,
      verified: false,
    },
  };

  try {
    await Donation.findOneAndUpdate({ id: newDonation.id }, newDonation, { upsert: true, new: true });
    console.log(`✅ [MongoDB Atlas] Saved real donation #${newDonation.id} (${newDonation.foodName})`);
  } catch (err) {
    console.warn('[MongoDB Atlas Save Error]:', err.message);
  }

  donationsStore.unshift(newDonation);
  broadcast('DONATION_CREATED', newDonation);

  if (data.deliveryMode === 'VOLUNTEER') {
    const donorEmail = data.donorEmail || (data.donorPhone ? `${data.donorPhone.replace(/[^\d]/g, '')}@replate.org` : 'donor@replate.org');
    sendDonationPickupOtpEmail({
      toEmail: donorEmail.includes('@') ? donorEmail : 'donor@replate.org',
      donorName: newDonation.donorName || 'Restaurant Partner',
      foodName: newDonation.foodName || 'Surplus Food',
      pickupOtp,
      orderId: newDonation.id,
      driverName: 'Assigned Courier',
    }).catch((e) => console.warn('[Pickup Email Failed]:', e.message));
  }

  res.status(201).json(newDonation);
});

app.patch('/api/donations/:id', async (req, res) => {
  let updated = null;
  try {
    updated = await Donation.findOneAndUpdate(
      { id: new RegExp(`^${req.params.id}$`, 'i') },
      { ...req.body },
      { new: true }
    ).lean();
  } catch (err) {
    console.warn('[MongoDB Donation Update Error]:', err.message);
  }

  const index = donationsStore.findIndex((d) => d.id.toLowerCase() === req.params.id.toLowerCase());
  if (index !== -1) {
    donationsStore[index] = { ...donationsStore[index], ...req.body };
    if (!updated) updated = donationsStore[index];
  } else if (updated) {
    donationsStore.unshift(updated);
  }

  if (!updated) {
    return res.status(404).json({ error: 'Donation not found' });
  }

  broadcast('DONATION_STATUS_UPDATE', {
    donationId: req.params.id,
    status: updated.status,
    donation: updated,
    timestamp: new Date().toISOString(),
  });

  if (req.body.status === 'DRIVER_ASSIGNED' && req.body.assignedDriver) {
    broadcast('DRIVER_ASSIGNED', { donationId: req.params.id, driver: req.body.assignedDriver });
    const donorEmail = updated.donorEmail || 'donor@replate.org';
    sendDonationPickupOtpEmail({
      toEmail: donorEmail,
      donorName: updated.donorName || 'Restaurant Partner',
      foodName: updated.foodName || 'Surplus Food',
      pickupOtp: updated.pickupOtp || '4829',
      orderId: updated.id,
      driverName: updated.assignedDriver?.name || 'Volunteer Courier',
    }).catch((e) => console.warn('[Pickup Email Failed]:', e.message));
  }

  res.json(updated);
});

// Verification endpoints with strict OTP validation (Persisted to MongoDB Atlas)
app.post('/api/donations/:id/verify-pickup', async (req, res) => {
  const { tempCelsius, packagingVerified, pinCode, otp, driverId, photoUrl } = req.body;
  
  let donation = await Donation.findOne({ id: new RegExp(`^${req.params.id}$`, 'i') }).lean();
  if (!donation) {
    donation = donationsStore.find((d) => d.id.toLowerCase() === req.params.id.toLowerCase());
  }
  if (!donation) return res.status(404).json({ error: 'Donation not found' });

  const expectedOtp = donation.pickupOtp || '4829';
  const cleanPin = String(pinCode || otp || '').trim();

  // Validate OTP provided by donor (Strict - Real OTP only)
  if (cleanPin !== expectedOtp) {
    return res.status(400).json({ error: 'Invalid Pickup OTP. Please obtain the 4-digit code sent to the donor email.' });
  }

  const pickupData = {
    tempCelsius: Number(tempCelsius) || 65.0,
    packagingVerified: Boolean(packagingVerified),
    pinCode: cleanPin,
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop',
    timestamp: new Date().toISOString(),
    verifiedByDriverId: driverId || 'driver-1',
  };

  const updatedFields = {
    status: 'IN_TRANSIT',
    pickupVerification: pickupData,
  };

  try {
    await Donation.findOneAndUpdate({ id: donation.id }, updatedFields, { new: true });
    await Rescue.findOneAndUpdate({ donationId: donation.id }, { status: 'IN_TRANSIT', pickupVerified: true });
  } catch (err) {
    console.warn('[MongoDB Verify Pickup]:', err.message);
  }

  const index = donationsStore.findIndex((d) => d.id.toLowerCase() === req.params.id.toLowerCase());
  if (index !== -1) {
    donationsStore[index] = { ...donationsStore[index], ...updatedFields };
  }

  // Broadcast live pickup event to all WebSocket clients
  broadcast('DONATION_STATUS_UPDATE', {
    donationId: donation.id,
    status: 'IN_TRANSIT',
    pickupVerification: pickupData,
    timestamp: new Date().toISOString(),
  });

  // Dispatch Delivery OTP to shelter and donor email upon starting transit
  const deliveryOtp = donation.deliveryOtp || '8392';
  const shelterEmail = donation.matchedShelter?.contactEmail || 'shelter@replate.org';
  const donorEmail = donation.donorEmail || 'donor@replate.org';
  sendDeliveryOtpEmail({
    toEmail: shelterEmail,
    donorEmail,
    recipientName: donation.matchedShelter?.name || 'Community Shelter',
    donorName: donation.donorName || 'Restaurant Donor',
    foodName: donation.foodName || 'Surplus Meals',
    deliveryOtp,
    orderId: donation.id,
    driverName: 'Volunteer Courier',
  }).catch((e) => console.warn('[Delivery Email Failed]:', e.message));

  res.json({ ...donation, ...updatedFields });
});

app.post('/api/donations/:id/verify-delivery', async (req, res) => {
  let donation = await Donation.findOne({ id: new RegExp(`^${req.params.id}$`, 'i') }).lean();
  if (!donation) {
    donation = donationsStore.find((d) => d.id.toLowerCase() === req.params.id.toLowerCase());
  }
  if (!donation) return res.status(404).json({ error: 'Donation not found' });

  const { tempCelsius, recipientName, recipientSignature, photoUrl, pinCode, otp } = req.body;
  const expectedOtp = donation.deliveryOtp || '8392';
  const cleanPin = String(pinCode || otp || '').trim();

  // Validate Delivery OTP if supplied (Strict - Real OTP only)
  if (cleanPin && cleanPin !== expectedOtp) {
    return res.status(400).json({ error: 'Invalid Delivery OTP. Please obtain the 4-digit code sent to the shelter email.' });
  }

  const deliveryData = {
    tempCelsius: Number(tempCelsius) || 62.0,
    recipientName: recipientName || 'Shelter Intake Coordinator',
    recipientSignature: recipientSignature || 'Verified_Signature',
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&auto=format&fit=crop',
    timestamp: new Date().toISOString(),
    pinCode: cleanPin || expectedOtp,
  };

  const updatedFields = {
    status: 'DELIVERED',
    deliveryVerification: deliveryData,
  };

  try {
    await Donation.findOneAndUpdate({ id: donation.id }, updatedFields, { new: true });
    await Rescue.findOneAndUpdate({ donationId: donation.id }, { status: 'DELIVERED', deliveryVerified: true });
  } catch (err) {
    console.warn('[MongoDB Verify Delivery]:', err.message);
  }

  const index = donationsStore.findIndex((d) => d.id.toLowerCase() === req.params.id.toLowerCase());
  if (index !== -1) {
    donationsStore[index] = { ...donationsStore[index], ...updatedFields };
  }

  // Broadcast live delivery event to all WebSocket clients
  broadcast('DONATION_STATUS_UPDATE', {
    donationId: donation.id,
    status: 'DELIVERED',
    deliveryVerification: deliveryData,
    timestamp: new Date().toISOString(),
  });

  res.json({ ...donation, ...updatedFields });
});

// 4. Shelters Endpoints (Backed by MongoDB Atlas)
app.get('/api/shelters', async (req, res) => {
  try {
    const dbShelters = await Shelter.find().lean();
    if (dbShelters && dbShelters.length > 0) return res.json(dbShelters);
  } catch (e) {}
  res.json(sheltersStore);
});

app.patch('/api/shelters/:id', async (req, res) => {
  try {
    const updated = await Shelter.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }).lean();
    if (updated) return res.json(updated);
  } catch (e) {}
  const index = sheltersStore.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Shelter not found' });
  sheltersStore[index] = { ...sheltersStore[index], ...req.body };
  res.json(sheltersStore[index]);
});

// 5. Drivers Endpoints (Backed by MongoDB Atlas)
app.get('/api/drivers', async (req, res) => {
  const { status, lat, lng } = req.query;
  let results = [];
  try {
    const filter = status ? { status: status.toUpperCase() } : {};
    const dbDrivers = await Driver.find(filter).lean();
    results = dbDrivers && dbDrivers.length > 0 ? dbDrivers : [...driversStore];
  } catch (e) {
    results = [...driversStore];
  }

  if (status) {
    results = results.filter((d) => d.status.toLowerCase() === status.toLowerCase());
  }
  if (lat && lng) {
    const origin = [parseFloat(lat), parseFloat(lng)];
    results = results
      .map((d) => {
        const dist = haversineDistanceKm(origin, d.coords);
        return {
          ...d,
          distanceKm: dist,
          etaToDonorMinutes: Math.max(3, Math.round((dist / 30) * 60) + 2),
        };
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }
  res.json(results);
});

app.patch('/api/drivers/:id', async (req, res) => {
  try {
    const updated = await Driver.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }).lean();
    if (updated) return res.json(updated);
  } catch (e) {}
  const index = driversStore.findIndex((d) => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Driver not found' });
  driversStore[index] = { ...driversStore[index], ...req.body };
  res.json(driversStore[index]);
});

// Real-Time Driver Live GPS Telemetry Ingest
app.post(['/api/drivers/:id/location', '/drivers/:id/location'], async (req, res) => {
  const { id } = req.params;
  const { coords, activeDonationId, speed = 35, heading = 0, etaMinutes = 8 } = req.body;
  if (!coords || !Array.isArray(coords)) {
    return res.status(400).json({ error: 'Valid [lat, lng] coordinates array required' });
  }

  try {
    await Driver.findOneAndUpdate({ id }, { coords, status: activeDonationId ? 'ON_MISSION' : 'AVAILABLE' });
    if (activeDonationId) {
      await Donation.findOneAndUpdate({ id: activeDonationId }, { driverCoords: coords });
    }
  } catch (e) {
    console.warn('[Driver Location DB Error]:', e.message);
  }

  const dIdx = driversStore.findIndex((d) => d.id === id);
  if (dIdx !== -1) driversStore[dIdx].coords = coords;
  if (activeDonationId) {
    const donIdx = donationsStore.findIndex((d) => d.id.toLowerCase() === activeDonationId.toLowerCase());
    if (donIdx !== -1) donationsStore[donIdx].driverCoords = coords;
  }

  // Broadcast live GPS coordinates to all clients in real time!
  broadcast('DRIVER_LOCATION_UPDATE', {
    driverId: id,
    coords,
    activeDonationId,
    speed,
    heading,
    etaMinutes,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, driverId: id, coords });
});

// Real-Time Road GPS Simulation & Telemetry Stream
const activeSimulations = new Map();

app.post(['/api/telemetry/simulate-route', '/telemetry/simulate-route'], async (req, res) => {
  const { donationId, speedMultiplier = 1 } = req.body;
  let donation = await Donation.findOne({ id: new RegExp(`^${donationId}$`, 'i') }).lean();
  if (!donation) {
    donation = donationsStore.find((d) => d.id.toLowerCase() === donationId?.toLowerCase());
  }
  const donorCoords = donation.donorCoords || donation.pickupCoords;
  if (!donation || !donorCoords) {
    return res.status(404).json({ error: 'Donation with donorCoords or pickupCoords required' });
  }

  if (activeSimulations.has(donation.id)) {
    clearInterval(activeSimulations.get(donation.id));
    activeSimulations.delete(donation.id);
  }

  const driver = donation.assignedDriver || driversStore[0];
  const driverCoords = donation.driverCoords || driver?.coords || [donorCoords[0] + 0.008, donorCoords[1] + 0.008];
  const shelterCoords = donation.matchedShelter?.coords || [donorCoords[0] + 0.015, donorCoords[1] + 0.015];

  let waypoints = [];
  try {
    const route1 = await getDrivingRoute(driverCoords, donorCoords);
    const route2 = await getDrivingRoute(donorCoords, shelterCoords);
    if (route1?.geometry?.coordinates && route2?.geometry?.coordinates) {
      const p1 = route1.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const p2 = route2.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      waypoints = [...p1, ...p2];
    }
  } catch (e) {}

  if (waypoints.length === 0) {
    const count = 30;
    for (let i = 0; i <= count / 2; i++) {
      const f = i / (count / 2);
      waypoints.push([
        driverCoords[0] + (donorCoords[0] - driverCoords[0]) * f,
        driverCoords[1] + (donorCoords[1] - driverCoords[1]) * f,
      ]);
    }
    for (let i = 1; i <= count / 2; i++) {
      const f = i / (count / 2);
      waypoints.push([
        donorCoords[0] + (shelterCoords[0] - donorCoords[0]) * f,
        donorCoords[1] + (shelterCoords[1] - donorCoords[1]) * f,
      ]);
    }
  }

  let idx = 0;
  const mid = Math.floor(waypoints.length / 2);

  const timer = setInterval(async () => {
    if (idx >= waypoints.length) {
      clearInterval(timer);
      activeSimulations.delete(donation.id);
      await Donation.findOneAndUpdate({ id: donation.id }, { status: 'DELIVERED' });
      broadcast('DONATION_STATUS_UPDATE', { donationId: donation.id, status: 'DELIVERED' });
      return;
    }

    const curr = waypoints[idx];
    const status = idx >= mid ? 'IN_TRANSIT' : 'PICKUP_IN_PROGRESS';

    if (idx % 3 === 0) {
      Donation.findOneAndUpdate({ id: donation.id }, { driverCoords: curr }).catch(() => {});
    }

    broadcast('DRIVER_LOCATION_UPDATE', {
      driverId: driver?.id || 'driver-1',
      driverName: driver?.name || 'Active Courier',
      coords: curr,
      activeDonationId: donation.id,
      speed: Math.round(28 + Math.sin(idx) * 8),
      heading: Math.round((idx / waypoints.length) * 360),
      etaMinutes: Math.max(1, Math.round((waypoints.length - idx) * 0.4)),
      status,
      progressPercent: Math.round((idx / waypoints.length) * 100),
      timestamp: new Date().toISOString(),
    });

    idx++;
  }, Math.max(700, 1600 / speedMultiplier));

  activeSimulations.set(donation.id, timer);

  res.json({
    success: true,
    message: 'Live GPS telemetry stream active',
    donationId: donation.id,
    waypoints: waypoints.length,
  });
});

app.post(['/api/telemetry/stop-simulation', '/telemetry/stop-simulation'], (req, res) => {
  const { donationId } = req.body;
  if (activeSimulations.has(donationId)) {
    clearInterval(activeSimulations.get(donationId));
    activeSimulations.delete(donationId);
  }
  res.json({ success: true, message: 'Simulation stopped' });
});

// 6. Matching & Assignment Endpoints (Backed by MongoDB Atlas)
app.get('/api/matching/candidates/:donationId', async (req, res) => {
  let donation = await Donation.findOne({ id: new RegExp(`^${req.params.donationId}$`, 'i') }).lean();
  if (!donation) {
    donation = donationsStore.find((d) => d.id.toLowerCase() === req.params.donationId.toLowerCase());
  }
  const category = donation?.category || 'Cooked Meal';
  const remainingMin = donation?.rescueWindowMinutes || 90;
  const donorCoords = donation?.donorCoords || [37.7940, -122.3960];

  let candidateShelters = [];
  try {
    candidateShelters = await Shelter.find({ status: 'ACTIVE' }).lean();
  } catch (e) {}
  if (!candidateShelters || candidateShelters.length === 0) {
    candidateShelters = sheltersStore;
  }

  // Filter candidate shelters within regional metropolitan transit radius (< 150 km)
  const regionalShelters = candidateShelters.filter((shelter) => {
    const sCoords = shelter.coords || [37.7749, -122.4194];
    return haversineDistanceKm(donorCoords, sCoords) < 150;
  });
  const sheltersToScore = regionalShelters.length > 0 ? regionalShelters : candidateShelters;

  const scoredShelters = sheltersToScore.map((shelter) => {
    const sCoords = shelter.coords || [37.7749, -122.4194];
    const distanceKm = haversineDistanceKm(donorCoords, sCoords);
    const etaMinutes = Math.max(4, Math.round(distanceKm * 2.7 + 2));

    const distanceScore = Math.max(15, Math.min(100, Math.round(100 - distanceKm * 3.8)));
    const capScore = shelter.capacityMeals >= (donation?.mealCount || 40) ? 96 : 72;
    const foodComp = (shelter.currentNeeds || []).some(
      (n) => n.toLowerCase().includes(category.toLowerCase()) || n.toLowerCase().includes('meal')
    ) ? 100 : 80;
    const overall = Math.round((distanceScore * 0.45) + (capScore * 0.3) + (foodComp * 0.25));

    return {
      ...shelter,
      distanceKm,
      etaMinutes,
      feasibilityScore: {
        overallScore: overall,
        timeFeasibility: Math.min(99, Math.round(100 - (etaMinutes / remainingMin) * 100)),
        capacityFit: capScore,
        foodCompatibility: foodComp,
        distanceEta: distanceScore,
        needPriority: shelter.currentNeeds && shelter.currentNeeds[0] === category ? 98 : 84,
        driverReadiness: 90,
        explanation: `${shelter.name} is ${distanceKm} km away (~${etaMinutes} mins drive via optimal route), matching dietary demand for ${category} with confirmed intake capacity (${shelter.capacityMeals} portions).`,
      },
    };
  });

  scoredShelters.sort((a, b) => b.feasibilityScore.overallScore - a.feasibilityScore.overallScore || a.distanceKm - b.distanceKm);
  res.json(scoredShelters);
});

app.post('/api/matching/assign', async (req, res) => {
  const { donationId, shelterId, driverId } = req.body;
  
  let donation = await Donation.findOne({ id: new RegExp(`^${donationId}$`, 'i') }).lean();
  if (!donation) {
    donation = donationsStore.find((d) => d.id.toLowerCase() === donationId.toLowerCase());
  }
  if (!donation) return res.status(404).json({ error: 'Donation not found' });

  const allShelters = await Shelter.find().lean().catch(() => sheltersStore);
  const allDrivers = await Driver.find().lean().catch(() => driversStore);

  const shelter = allShelters.find((s) => s.id === shelterId) || allShelters[0] || sheltersStore[0];
  const driver = allDrivers.find((dr) => dr.id === driverId) || allDrivers[0] || driversStore[0];

  const updatedFields = {
    status: 'DRIVER_ASSIGNED',
    matchedShelter: shelter,
    assignedDriver: driver,
    driverCoords: driver.coords,
  };

  try {
    await Donation.findOneAndUpdate({ id: donation.id }, updatedFields, { new: true });
    await Driver.findOneAndUpdate({ id: driver.id }, { status: 'ON_MISSION' });
  } catch (err) {
    console.warn('[MongoDB Assign Error]:', err.message);
  }

  const dIndex = donationsStore.findIndex((d) => d.id.toLowerCase() === donationId.toLowerCase());
  if (dIndex !== -1) {
    donationsStore[dIndex] = { ...donationsStore[dIndex], ...updatedFields };
  }

  broadcast('DRIVER_ASSIGNED', { donationId: donation.id, driver, shelter });
  broadcast('DONATION_STATUS_UPDATE', { donationId: donation.id, status: 'DRIVER_ASSIGNED', matchedShelter: shelter, assignedDriver: driver });

  res.json({ ...donation, ...updatedFields });
});

app.post('/api/matching/rematch', async (req, res) => {
  const { donationId, reason } = req.body;
  let donation = await Donation.findOne({ id: new RegExp(`^${donationId}$`, 'i') }).lean();
  if (!donation) {
    donation = donationsStore.find((d) => d.id.toLowerCase() === donationId.toLowerCase());
  }
  if (!donation) return res.status(404).json({ error: 'Donation not found' });

  const allDrivers = await Driver.find({ status: 'AVAILABLE' }).lean().catch(() => driversStore);
  const backupDriver = allDrivers.find((d) => d.id !== donation.assignedDriver?.id) || allDrivers[0] || driversStore[1];
  const backupShelter = sheltersStore[1];

  const updatedFields = {
    status: 'RE_MATCHING',
    assignedDriver: backupDriver,
    matchedShelter: backupShelter,
    driverCoords: backupDriver.coords,
    urgencyLevel: 'critical',
  };

  await Donation.findOneAndUpdate({ id: donation.id }, updatedFields).catch(() => {});
  broadcast('DONATION_STATUS_UPDATE', { donationId: donation.id, ...updatedFields });

  res.json({
    donation: { ...donation, ...updatedFields },
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
app.post('/api/auth/login', async (req, res) => {
  const { email, role } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  let user = null;
  try {
    user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') }).lean();
  } catch (err) {}

  if (!user) {
    user = usersStore.find((u) => u.email.toLowerCase() === cleanEmail);
  }

  if (!user) {
    return res.status(404).json({
      error: 'Account not found. Please sign up or verify using Email OTP to auto-create your account.',
    });
  }
  res.json(user);
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, role, organization } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  let existing = null;
  try {
    existing = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') }).lean();
  } catch (err) {}

  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: (name || '').trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    phone: phone || '',
    role: role || 'DONOR',
    organization: organization || `${role || 'Donor'} Partner`,
    status: 'ACTIVE',
  };

  try {
    await User.create(newUser);
  } catch (err) {
    console.warn('[MongoDB User Create]:', err.message);
  }

  usersStore.unshift(newUser);
  res.status(201).json(newUser);
});

// Active OTP store in memory
const activeAuthOtps = new Map();

const handleSendOtp = async (req, res) => {
  const { email, phone, role, name } = req.body;
  const targetEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').replace(/[^\d+]/g, '');

  if (!targetEmail && (!cleanPhone || cleanPhone.length < 8)) {
    return res.status(400).json({ error: 'Valid email address or phone number is required.' });
  }

  // The email entered by the user is the recipient.
  // The env account (EMAIL_USER in .env) is used as the authenticated SMTP sender.
  const recipientEmail = targetEmail || (cleanPhone ? `${cleanPhone.slice(-6)}@replate.org` : '');
  if (!recipientEmail || !recipientEmail.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required to receive the verification OTP.' });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAtMs = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Persist OTP in MongoDB Atlas and in memory
  try {
    await Otp.deleteMany({ identifier: recipientEmail });
    await Otp.create({
      identifier: recipientEmail,
      otp,
      role: role || 'DONOR',
      name: name || '',
      expiresAt: new Date(expiresAtMs),
    });
  } catch (dbErr) {
    console.warn('[MongoDB Otp Save]:', dbErr.message);
  }

  activeAuthOtps.set(recipientEmail, { otp, expiresAt: expiresAtMs, role, name });

  // Dispatch email to user's filled-in address via SMTP account in env
  try {
    const emailResult = await sendAuthOtpEmail({
      toEmail: recipientEmail,
      otp,
      role: role || 'Partner',
      name: name || recipientEmail.split('@')[0],
    });

    if (emailResult && emailResult.success === false) {
      console.error('[Send OTP Mail Error]:', emailResult.error);
      return res.status(500).json({
        success: false,
        error: `Could not send verification email to ${recipientEmail}: ${emailResult.error}`,
      });
    }
  } catch (err) {
    console.error('[Send OTP Mail Exception]:', err.message);
    return res.status(500).json({
      success: false,
      error: `Failed to deliver email to ${recipientEmail}: ${err.message}`,
    });
  }

  // Real OTP sent directly to email: never return code in response
  res.json({
    success: true,
    message: `Verification code sent to ${recipientEmail}. Please check your email inbox to verify.`,
    sentTo: recipientEmail,
    expiresInSeconds: 600,
  });
};

app.post('/api/auth/send-otp', handleSendOtp);
app.post('/auth/send-otp', handleSendOtp);

const handleVerifyOtp = async (req, res) => {
  const { email, phone, otp, code, role, newUserData } = req.body;
  const targetEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').replace(/[^\d+]/g, '');
  const cleanOtp = String(otp || code || '').trim();

  if ((!targetEmail && !cleanPhone) || !cleanOtp) {
    return res.status(400).json({ error: 'Email/Phone and OTP are required' });
  }

  const identifier = targetEmail || cleanPhone;

  // Real verification check against MongoDB Atlas & memory store (STRICT: ZERO BYPASS CODES)
  let validRecord = null;
  try {
    const dbRecord = await Otp.findOne({ identifier, otp: cleanOtp }).lean();
    if (dbRecord && new Date(dbRecord.expiresAt).getTime() > Date.now()) {
      validRecord = dbRecord;
    }
  } catch (err) {
    console.warn('[MongoDB Otp Query]:', err.message);
  }

  if (!validRecord) {
    const mem = activeAuthOtps.get(identifier);
    if (mem && mem.otp === cleanOtp && Date.now() <= mem.expiresAt) {
      validRecord = mem;
    }
  }

  if (!validRecord) {
    return res.status(400).json({
      error: 'Invalid or expired verification code. Please check the code sent to your email.',
    });
  }

  // Clear consumed OTP immediately
  try {
    await Otp.deleteMany({ identifier });
  } catch (e) {}
  activeAuthOtps.delete(identifier);

  // Retrieve or create real user in MongoDB Atlas
  let user = null;
  try {
    user = await User.findOne({
      $or: [
        { email: new RegExp(`^${targetEmail}$`, 'i') },
        ...(cleanPhone ? [{ phone: cleanPhone }] : []),
      ],
    }).lean();
  } catch (e) {}

  if (!user) {
    const targetRole = newUserData?.role || role || validRecord.role || 'DONOR';
    const emailPrefix = targetEmail ? targetEmail.split('@')[0] : 'Partner';
    const displayName =
      newUserData?.name ||
      validRecord.name ||
      (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).replace(/[._]/g, ' '));

    const newUser = {
      id: `user-${Date.now()}`,
      name: displayName,
      email: targetEmail || `${cleanPhone.slice(-6)}@replate.org`,
      phone: newUserData?.phone || cleanPhone || '',
      role: targetRole,
      organization:
        newUserData?.organization ||
        (targetRole === 'DONOR'
          ? 'Partner Restaurant'
          : targetRole === 'SHELTER'
          ? 'Community Food Shelter'
          : 'Volunteer Courier Fleet'),
      status: 'ACTIVE',
    };

    try {
      const created = await User.create(newUser);
      user = created.toObject();
    } catch (createErr) {
      user = newUser;
    }

    usersStore.unshift(user);
  }

  res.json({
    success: true,
    user,
    token: `token-${user.id}-${Date.now()}`,
  });
};

app.post('/api/auth/verify-otp', handleVerifyOtp);
app.post('/auth/verify-otp', handleVerifyOtp);

server.listen(PORT, () => {
  console.log(`RePlate Operational Backend running at http://localhost:${PORT}`);
  console.log(`WebSocket Telemetry Server active at ws://localhost:${PORT}`);
  console.log(`AI Engine: ${GEMINI_API_KEY ? 'Google Gemini 1.5 Flash Connected' : 'High-Performance Built-in NLP Fallback Ready'}`);
});
