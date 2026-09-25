const mongoose = require('mongoose');
const Shelter = require('./models/Shelter');
const Driver = require('./models/Driver');
const Donation = require('./models/Donation');
const Rescue = require('./models/Rescue');

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://mayankraj170804_db_user:gFmN37Om10iybgEP@ac-dql9vpr-shard-00-00.yfy2axz.mongodb.net:27017,ac-dql9vpr-shard-00-01.yfy2axz.mongodb.net:27017,ac-dql9vpr-shard-00-02.yfy2axz.mongodb.net:27017/replate?ssl=true&replicaSet=atlas-139c07-shard-0&authSource=admin&appName=Cluster0';

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log('✅ [MongoDB] Connected successfully to MongoDB Atlas database!');
    await seedInitialData();
  } catch (err) {
    console.error('❌ [MongoDB] Connection error:', err.message);
    console.warn('[MongoDB] Proceeding with live in-memory / dynamic failover mode.');
  }
}

async function seedInitialData() {
  try {
    const verifiedShelters = [
      {
        id: 'shelter-1',
        name: 'Hope Community Shelter & Kitchen',
        address: '452 Elm Street, Tenderloin / Downtown',
        coords: [37.7833, -122.4167],
        capacityMeals: 120,
        currentNeeds: ['Cooked Meal', 'Fresh Produce', 'Dairy & Refrigerated', 'Meal'],
        contactPhone: '+1 (415) 890-4432',
        dietaryPreferences: ['Veg', 'Non-Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-2',
        name: 'Grace Haven Family Care Center',
        address: '890 Mission Avenue, SOMA District',
        coords: [37.7820, -122.4050],
        capacityMeals: 80,
        currentNeeds: ['Cooked Meal', 'Bakery & Bread', 'Packaged Goods', 'Dairy'],
        contactPhone: '+1 (415) 765-2198',
        dietaryPreferences: ['Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-3',
        name: 'St. Vincent Dining Hall & Food Bank',
        address: '1200 Market Street, Civic Center',
        coords: [37.7780, -122.4170],
        capacityMeals: 150,
        currentNeeds: ['Cooked Meal', 'Bakery & Bread', 'Meal'],
        contactPhone: '+1 (415) 342-9901',
        dietaryPreferences: ['Veg', 'Non-Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-4',
        name: 'Beacon Hill Youth Refuge',
        address: '742 Evergreen Terrace, North Beach',
        coords: [37.7990, -122.4090],
        capacityMeals: 60,
        currentNeeds: ['Bakery & Bread', 'Dairy & Refrigerated', 'Packaged Goods'],
        contactPhone: '+1 (415) 555-0143',
        dietaryPreferences: ['Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-5',
        name: 'Mission Community Table',
        address: '2240 Mission St, Mission Corridor',
        coords: [37.7610, -122.4195],
        capacityMeals: 110,
        currentNeeds: ['Cooked Meal', 'Fresh Produce', 'Bakery & Bread', 'Meal'],
        contactPhone: '+1 (415) 648-5520',
        dietaryPreferences: ['Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-6',
        name: 'Bayview Seniors Nutrition Hub',
        address: '1501 Quesada Ave, Bayview',
        coords: [37.7330, -122.3890],
        capacityMeals: 130,
        currentNeeds: ['Cooked Meal', 'Dairy & Refrigerated', 'Fresh Produce', 'Meal'],
        contactPhone: '+1 (415) 822-1140',
        dietaryPreferences: ['Veg', 'Non-Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-7',
        name: 'Compass Family Outreach Center',
        address: '37 Grove Street, Central Plaza',
        coords: [37.7795, -122.4140],
        capacityMeals: 90,
        currentNeeds: ['Dairy & Refrigerated', 'Fresh Produce', 'Packaged Goods'],
        contactPhone: '+1 (415) 644-0504',
        dietaryPreferences: ['Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-del-1',
        name: 'Gurudwara Bangla Sahib Mega Langar Kitchen',
        address: 'Ashoka Road, Connaught Place, New Delhi 110001',
        coords: [28.6264, 77.2091],
        capacityMeals: 450,
        currentNeeds: ['Cooked Meal', 'Dairy & Refrigerated', 'Bakery & Bread', 'Meal'],
        contactPhone: '+91 11 2336 5486',
        dietaryPreferences: ['Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-del-2',
        name: 'Feeding India Central Food Bank',
        address: 'Lodhi Institutional Area, New Delhi 110003',
        coords: [28.5892, 77.2230],
        capacityMeals: 300,
        currentNeeds: ['Cooked Meal', 'Fresh Produce', 'Fruits', 'Meal'],
        contactPhone: '+91 11 4155 7800',
        dietaryPreferences: ['Veg', 'Non-Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-del-3',
        name: 'Robin Hood Army South Hub & Kitchen',
        address: 'Block C, Hauz Khas Enclave, New Delhi 110016',
        coords: [28.5494, 77.2001],
        capacityMeals: 220,
        currentNeeds: ['Cooked Meal', 'Bakery & Bread', 'Meal'],
        contactPhone: '+91 98110 54321',
        dietaryPreferences: ['Veg', 'Non-Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-del-4',
        name: 'Delhi Care Shelter Foundation',
        address: 'Ring Road, Lajpat Nagar IV, New Delhi 110024',
        coords: [28.5685, 77.2435],
        capacityMeals: 160,
        currentNeeds: ['Cooked Meal', 'Bakery & Bread', 'Dairy & Refrigerated', 'Meal'],
        contactPhone: '+91 11 2983 4567',
        dietaryPreferences: ['Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-del-5',
        name: 'Uday Foundation Medical Care Shelter',
        address: 'Sri Aurobindo Marg, Adchini, New Delhi 110017',
        coords: [28.5355, 77.1980],
        capacityMeals: 140,
        currentNeeds: ['Cooked Meal', 'Dairy & Refrigerated', 'Fruits', 'Meal'],
        contactPhone: '+91 11 2656 1444',
        dietaryPreferences: ['Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-del-6',
        name: 'Goonj Urban Resource & Relief Center',
        address: 'J-93 Sarita Vihar, New Delhi 110076',
        coords: [28.5280, 77.2950],
        capacityMeals: 260,
        currentNeeds: ['Fresh Produce', 'Packaged Goods', 'Bakery & Bread'],
        contactPhone: '+91 11 2697 2222',
        dietaryPreferences: ['Veg'],
        status: 'ACTIVE',
      },
      {
        id: 'shelter-del-7',
        name: 'Rasoi On Wheels Mobile Kitchen Hub',
        address: 'Phase 1, Udyog Vihar, Gurugram 122016',
        coords: [28.5020, 77.0850],
        capacityMeals: 180,
        currentNeeds: ['Cooked Meal', 'Meal', 'Bakery & Bread'],
        contactPhone: '+91 98100 87878',
        dietaryPreferences: ['Veg'],
        status: 'ACTIVE',
      },
    ];

    for (const s of verifiedShelters) {
      await Shelter.findOneAndUpdate({ id: s.id }, s, { upsert: true, new: true });
    }
    console.log(`✅ [MongoDB] Synchronized ${verifiedShelters.length} verified shelters.`);

    const verifiedDrivers = [
      {
        id: 'driver-1',
        name: 'Aarav Patel',
        phone: '+1 (555) 111-2233',
        vehicleType: 'Refrigerated Van',
        vehiclePlate: 'SF 49 RESQ',
        coords: [37.7810, -122.4110],
        status: 'AVAILABLE',
        isOnline: true,
        rating: 4.95,
      },
      {
        id: 'driver-2',
        name: 'Elena Rostova',
        phone: '+1 (555) 444-5566',
        vehicleType: 'EV Cargo Car',
        vehiclePlate: 'CA 7E FOOD',
        coords: [37.7740, -122.4210],
        status: 'AVAILABLE',
        isOnline: true,
        rating: 4.88,
      },
      {
        id: 'driver-3',
        name: 'Marcus Vance',
        phone: '+1 (555) 777-8899',
        vehicleType: 'Thermal Truck',
        vehiclePlate: 'CA 8T HERO',
        coords: [37.7890, -122.4040],
        status: 'AVAILABLE',
        isOnline: true,
        rating: 4.98,
      },
      {
        id: 'driver-4',
        name: 'Sofia Chen',
        phone: '+1 (555) 222-3344',
        vehicleType: 'E-Bike Courier',
        vehiclePlate: 'EB 102 MKT',
        coords: [37.7795, -122.4160],
        status: 'AVAILABLE',
        isOnline: true,
        rating: 4.91,
      },
      {
        id: 'driver-5',
        name: 'Jamal Washington',
        phone: '+1 (555) 888-9900',
        vehicleType: 'Refrigerated Van',
        vehiclePlate: 'SF 99 COLD',
        coords: [37.7650, -122.4280],
        status: 'AVAILABLE',
        isOnline: true,
        rating: 4.85,
      },
      {
        id: 'driver-delhi-1',
        name: 'Rajesh Kumar',
        phone: '+91 98101 23456',
        vehicleType: 'Refrigerated Van (Tata Ace EV)',
        vehiclePlate: 'DL 1Z A 4920',
        coords: [28.6304, 77.2177],
        status: 'AVAILABLE',
        isOnline: true,
        rating: 4.96,
      },
      {
        id: 'driver-delhi-2',
        name: 'Pooja Sharma',
        phone: '+91 98712 34567',
        vehicleType: 'EV Cargo Car (Maruti Eeco)',
        vehiclePlate: 'DL 4C B 8821',
        coords: [28.5672, 77.2100],
        status: 'AVAILABLE',
        isOnline: true,
        rating: 4.91,
      },
      {
        id: 'driver-delhi-3',
        name: 'Amitabh Sengupta',
        phone: '+91 99100 45678',
        vehicleType: 'Thermal Truck (Eicher Pro)',
        vehiclePlate: 'DL 1L C 1109',
        coords: [28.4595, 77.0266],
        status: 'AVAILABLE',
        isOnline: true,
        rating: 4.89,
      },
      {
        id: 'driver-delhi-4',
        name: 'Deepak Verma',
        phone: '+91 98188 56789',
        vehicleType: 'E-Bike Courier (Hero Lectro)',
        vehiclePlate: 'DL 2E V 3412',
        coords: [28.6139, 77.2090],
        status: 'AVAILABLE',
        isOnline: true,
        rating: 4.94,
      },
    ];

    for (const d of verifiedDrivers) {
      await Driver.findOneAndUpdate({ id: d.id }, d, { upsert: true, new: true });
    }
    console.log(`✅ [MongoDB] Synchronized ${verifiedDrivers.length} verified active couriers.`);
  } catch (seedErr) {
    console.warn('[MongoDB] Seed check notification:', seedErr.message);
  }
}

module.exports = {
  connectDB,
  isConnected: () => isConnected,
};
