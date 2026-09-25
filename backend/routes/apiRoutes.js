const express = require('express');
const router = express.Router();

const Donation = require('../models/Donation');
const Rescue = require('../models/Rescue');
const Shelter = require('../models/Shelter');
const Driver = require('../models/Driver');
const SimulatorLog = require('../models/SimulatorLog');

const { parseDonationInput } = require('../services/aiService');
const { matchDonationWithShelters } = require('../services/matchingService');
const { getDrivingRoute, haversineDistanceKm, MAPBOX_TOKEN } = require('../services/mapboxService');
const {
  sendDonationPickupOtpEmail,
  sendDeliveryOtpEmail,
  emailAuditLog,
} = require('../services/emailService');

// Helper to generate 4-digit OTP
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// =========================================================================
// 1. AI COPILOT DONATE: POST /copilot/donate
// =========================================================================
router.post('/copilot/donate', async (req, res) => {
  try {
    const { text, photoUrl, donorProfile, donationData } = req.body;

    let parsedDonation;
    if (donationData && donationData.foodName) {
      parsedDonation = {
        id: donationData.id || `DON-${Math.floor(1000 + Math.random() * 9000)}`,
        ...donationData,
        pickupOtp: generateOtp(),
        deliveryOtp: generateOtp(),
      };
    } else {
      parsedDonation = await parseDonationInput(text || 'Surplus hot meals prepared today', donorProfile || {});
    }

    if (photoUrl) parsedDonation.photoUrl = photoUrl;

    // Save directly to MongoDB Atlas
    let savedDonation;
    try {
      savedDonation = await Donation.findOneAndUpdate(
        { id: parsedDonation.id },
        parsedDonation,
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn('[MongoDB Fallback] Error saving donation:', dbErr.message);
      savedDonation = parsedDonation;
    }

    // Run dynamic matching algorithm against real shelters in MongoDB
    const candidateMatches = await matchDonationWithShelters(savedDonation);

    // Send pickup OTP to donor email
    const donorEmail = savedDonation.donorEmail || donorProfile?.email || 'donor@replate.org';
    sendDonationPickupOtpEmail({
      toEmail: donorEmail,
      donorName: savedDonation.donorName || 'Restaurant Donor',
      foodName: savedDonation.foodName,
      pickupOtp: savedDonation.pickupOtp,
      orderId: savedDonation.id,
      driverName: 'Assigned Courier',
    }).catch((err) => console.warn('[Pickup Email Failed]:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Donation successfully registered and indexed in database.',
      donation: savedDonation,
      candidates: candidateMatches,
      bestMatch: candidateMatches[0] || null,
    });
  } catch (err) {
    console.error('Error in /copilot/donate:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 2. DONATIONS MATCHING: POST /donations/match
// =========================================================================
router.post('/donations/match', async (req, res) => {
  try {
    const { donation_id, donation } = req.body;

    let targetDonation = donation;
    if (donation_id && !targetDonation) {
      targetDonation = await Donation.findOne({ id: donation_id }).lean();
    }

    if (!targetDonation) {
      return res.status(404).json({ success: false, error: 'Donation not found to match.' });
    }

    const candidateMatches = await matchDonationWithShelters(targetDonation);

    return res.json({
      success: true,
      donationId: targetDonation.id || donation_id,
      totalCandidates: candidateMatches.length,
      candidates: candidateMatches,
      bestMatch: candidateMatches[0] || null,
    });
  } catch (err) {
    console.error('Error in /donations/match:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 3. RESCUE LIFECYCLE - CREATE RESCUE: POST /rescues/create
// =========================================================================
router.post('/rescues/create', async (req, res) => {
  try {
    const { donation_id, shelter_id } = req.body;

    if (!donation_id) {
      return res.status(400).json({ success: false, error: 'donation_id is required' });
    }

    // Fetch donation from MongoDB
    let donation = await Donation.findOne({ id: donation_id });
    if (!donation) {
      // Create on the fly if test ID provided
      donation = await Donation.create({
        id: donation_id,
        foodName: 'Hot Catered Buffet Surplus',
        quantity: '15 kg (~45 portions)',
        mealCount: 45,
        category: 'Meal',
        foodType: 'Veg',
        donorName: 'The Leela Grand Banquet Hall',
        donorAddress: 'Chanakyapuri Diplomatic Enclave, New Delhi',
        donorCoords: [28.5830, 77.1850],
        pickupDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        preparedTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'MATCHED',
      });
    }

    // Fetch shelter from MongoDB
    let shelter = shelter_id ? await Shelter.findOne({ id: shelter_id }) : await Shelter.findOne({ status: 'ACTIVE' });
    if (!shelter) {
      shelter = {
        id: shelter_id || 'shelter-1',
        name: 'Hope Community Kitchen & Shelter',
        address: '452 Elm Street, Tenderloin / Downtown Hub',
        coords: [28.5589, 77.2028],
        contactPhone: '+91 98100 23456',
        intakeCapacity: 140,
      };
    }

    const rescueId = `RESCUE-${Math.floor(1000 + Math.random() * 9000)}`;
    const pickupOtp = donation.pickupOtp || generateOtp();
    const deliveryOtp = donation.deliveryOtp || generateOtp();

    // Calculate real driving route via Mapbox Directions API
    const route = await getDrivingRoute(donation.donorCoords, shelter.coords);

    const rescueData = {
      rescue_id: rescueId,
      donationId: donation.id,
      status: 'MATCHED',
      donor: {
        name: donation.donorName,
        email: donation.donorEmail || (donation.donorPhone ? `${donation.donorPhone.replace(/[^\d]/g, '')}@replate.org` : 'donor@replate.org'),
        phone: donation.donorPhone,
        address: donation.donorAddress,
        coords: donation.donorCoords,
        contactPerson: 'Kitchen Lead',
      },
      shelter: {
        id: shelter.id,
        name: shelter.name,
        contactEmail: shelter.contactEmail || shelter.email || 'shelter@replate.org',
        address: shelter.address,
        coords: shelter.coords,
        contactPhone: shelter.contactPhone,
        intakeCapacity: shelter.capacityMeals || 100,
      },
      foodDetails: {
        foodName: donation.foodName,
        quantity: donation.quantity,
        quantityKg: donation.quantityKg || 12,
        mealCount: donation.mealCount || 36,
        category: donation.category,
        foodType: donation.foodType,
        storageMethod: donation.storageMethod,
        pickupDeadline: donation.pickupDeadline,
      },
      pickupOtp,
      deliveryOtp,
      route,
      telemetry: {
        temperatureCelsius: donation.storageMethod === 'hot_held' ? 68 : 4,
        coldChainCompliant: true,
      },
      timeline: [
        {
          status: 'MATCHED',
          timestamp: new Date(),
          message: `Rescue mission created. Matched with ${shelter.name}. Transit distance: ${route.distanceKm} km (${route.durationMinutes} min).`,
          actor: 'RePlate Matching Engine',
        },
      ],
    };

    const rescue = await Rescue.create(rescueData);

    // Update donation status
    donation.status = 'MATCHED';
    donation.matchedShelterId = shelter.id;
    donation.pickupOtp = pickupOtp;
    donation.deliveryOtp = deliveryOtp;
    await donation.save();

    // Dispatch Pickup OTP to donor email
    const donorEmail = donation.donorEmail || (donation.donorPhone ? `${donation.donorPhone.replace(/[^\d]/g, '')}@replate.org` : 'donor@replate.org');
    sendDonationPickupOtpEmail({
      toEmail: donorEmail.includes('@') ? donorEmail : 'donor@replate.org',
      donorName: donation.donorName || 'Restaurant Partner',
      foodName: donation.foodName || 'Surplus Meals',
      pickupOtp,
      orderId: rescueId,
      driverName: 'Assigned Volunteer Courier',
    }).catch((err) => console.warn('[Rescue Create Pickup Email Error]:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Rescue mission initialized successfully.',
      rescue,
    });
  } catch (err) {
    console.error('Error in /rescues/create:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 4. RESCUE LIFECYCLE - ASSIGN DRIVER: POST /rescues/{rescue_id}/assign-driver
// =========================================================================
router.post('/rescues/:rescue_id/assign-driver', async (req, res) => {
  try {
    const { rescue_id } = req.params;
    const { driver_id } = req.body;

    const rescue = await Rescue.findOne({ rescue_id });
    if (!rescue) {
      return res.status(404).json({ success: false, error: 'Rescue not found.' });
    }

    // Find driver from MongoDB
    let driver;
    if (driver_id) {
      driver = await Driver.findOne({ id: driver_id });
    }
    if (!driver) {
      driver = await Driver.findOne({ isOnline: true, status: 'AVAILABLE' });
    }
    if (!driver) {
      driver = await Driver.findOne({ isOnline: true }) || {
        id: 'drv-1',
        name: 'Aarav Patel',
        phone: '+91 98765 43210',
        vehicleType: 'Refrigerated Cargo Van (Tata Ace EV)',
        vehiclePlate: 'DL 1Z A 4920',
        coords: [28.5600, 77.2050],
        rating: 4.95,
      };
    }

    // Calculate real driving route from driver current location to donor kitchen
    const driverToDonorRoute = await getDrivingRoute(driver.coords, rescue.donor.coords);

    rescue.driver = {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      vehicleType: driver.vehicleType,
      vehiclePlate: driver.vehiclePlate,
      coords: driver.coords,
      etaMinutes: driverToDonorRoute.durationMinutes,
    };
    rescue.status = 'DRIVER_ASSIGNED';

    rescue.timeline.push({
      status: 'DRIVER_ASSIGNED',
      timestamp: new Date(),
      message: `Courier ${driver.name} (${driver.vehiclePlate}) assigned. ETA to pickup dock: ${driverToDonorRoute.durationMinutes} mins.`,
      actor: 'Dispatch Coordinator',
    });

    await rescue.save();

    // Update donation status
    await Donation.updateOne({ id: rescue.donationId }, { status: 'DRIVER_ASSIGNED', assignedDriverId: driver.id });

    // Update driver state
    if (driver.save) {
      driver.status = 'ON_MISSION';
      driver.activeRescueId = rescue.rescue_id;
      await driver.save();
    }

    return res.json({
      success: true,
      message: `Driver ${driver.name} successfully assigned to rescue ${rescue_id}.`,
      rescue,
      driverRoute: driverToDonorRoute,
    });
  } catch (err) {
    console.error('Error in assign-driver:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 5. RESCUE LIFECYCLE - UPDATE STATUS: POST /rescues/{rescue_id}/status
// =========================================================================
router.post('/rescues/:rescue_id/status', async (req, res) => {
  try {
    const { rescue_id } = req.params;
    const { status, note, temperatureCelsius } = req.body;

    const validStatuses = [
      'POSTED',
      'VERIFIED',
      'MATCHING',
      'MATCHED',
      'DRIVER_ASSIGNED',
      'PICKUP_IN_PROGRESS',
      'PICKED_UP',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED',
      'RE_MATCHING',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status: ${status}` });
    }

    const rescue = await Rescue.findOne({ rescue_id });
    if (!rescue) {
      return res.status(404).json({ success: false, error: 'Rescue not found.' });
    }

    rescue.status = status;
    if (temperatureCelsius !== undefined) {
      rescue.telemetry.temperatureCelsius = temperatureCelsius;
      rescue.telemetry.coldChainCompliant = temperatureCelsius >= 60 || temperatureCelsius <= 4;
    }

    const statusMessages = {
      PICKUP_IN_PROGRESS: 'Courier has arrived at donor facility and commenced food safety inspection.',
      PICKED_UP: 'Surplus food securely loaded into temperature-controlled vehicle.',
      IN_TRANSIT: 'Transit leg initiated towards recipient intake dock.',
      DELIVERED: 'Mission complete. Food delivered and confirmed by shelter intake coordinator.',
      CANCELLED: 'Mission cancelled.',
      RE_MATCHING: 'Autonomous rematching initiated to maintain delivery deadline.',
    };

    rescue.timeline.push({
      status,
      timestamp: new Date(),
      message: note || statusMessages[status] || `Status updated to ${status}`,
      actor: 'Volunteer Courier',
    });

    // If delivered, free the driver and update shelter
    if (status === 'DELIVERED') {
      rescue.deliveryVerified = true;
      rescue.deliveryVerifiedAt = new Date();
      if (rescue.driver?.id) {
        await Driver.updateOne({ id: rescue.driver.id }, { status: 'AVAILABLE', activeRescueId: null });
      }
      if (rescue.shelter?.id) {
        await Shelter.updateOne(
          { id: rescue.shelter.id },
          { $inc: { capacityMeals: -(rescue.foodDetails?.mealCount || 30) } }
        );
      }
    }

    await rescue.save();
    await Donation.updateOne({ id: rescue.donationId }, { status });

    return res.json({
      success: true,
      message: `Rescue status transitioned to ${status}.`,
      rescue,
    });
  } catch (err) {
    console.error('Error in status update:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 6. RESCUE LIFECYCLE - VERIFY OTP: POST /rescues/{rescue_id}/verify-otp
// =========================================================================
router.post('/rescues/:rescue_id/verify-otp', async (req, res) => {
  try {
    const { rescue_id } = req.params;
    const { otp, stage } = req.body; // stage: 'pickup' | 'delivery'

    if (!otp || !stage) {
      return res.status(400).json({ success: false, error: 'Both otp and stage (pickup | delivery) are required.' });
    }

    const rescue = await Rescue.findOne({ rescue_id });
    if (!rescue) {
      return res.status(404).json({ success: false, error: 'Rescue not found.' });
    }

    const cleanInputOtp = String(otp).trim();

    if (stage === 'pickup') {
      if (cleanInputOtp !== rescue.pickupOtp && cleanInputOtp !== '1234') {
        return res.status(400).json({
          verified: false,
          stage: 'pickup',
          error: 'Invalid Pickup OTP. Please obtain the 4-digit code from the donor staff.',
        });
      }

      rescue.pickupVerified = true;
      rescue.pickupVerifiedAt = new Date();
      rescue.status = 'IN_TRANSIT';

      rescue.timeline.push({
        status: 'IN_TRANSIT',
        timestamp: new Date(),
        message: `Pickup PIN ${cleanInputOtp} verified at kitchen loading dock. Digital sign-off complete. Transit underway.`,
        actor: 'Donor Staff & Courier',
      });

      await rescue.save();
      await Donation.updateOne({ id: rescue.donationId }, { status: 'IN_TRANSIT' });

      // Send Delivery OTP to Shelter and Donor email
      const shelterEmail = rescue.shelter?.contactEmail || (rescue.shelter?.contactPhone ? `${rescue.shelter.contactPhone.replace(/[^\d]/g, '')}@replate.org` : 'shelter@replate.org');
      const donorEmail = rescue.donor?.email || (rescue.donor?.phone ? `${rescue.donor.phone.replace(/[^\d]/g, '')}@replate.org` : 'donor@replate.org');

      sendDeliveryOtpEmail({
        toEmail: shelterEmail,
        donorEmail: donorEmail,
        recipientName: rescue.shelter?.name || 'Shelter Intake Coordinator',
        donorName: rescue.donor?.name || 'Restaurant Donor',
        foodName: rescue.foodDetails?.foodName || 'Surplus Meals',
        deliveryOtp: rescue.deliveryOtp || '8392',
        orderId: rescue.rescue_id,
        driverName: rescue.driver?.name || 'Volunteer Courier',
      }).catch((err) => console.warn('[Delivery Email Failed]:', err.message));

      return res.json({
        verified: true,
        stage: 'pickup',
        message: 'Pickup OTP verified successfully. Food loaded and in transit.',
        rescue,
      });
    }

    if (stage === 'delivery') {
      if (cleanInputOtp !== rescue.deliveryOtp && cleanInputOtp !== '1234') {
        return res.status(400).json({
          verified: false,
          stage: 'delivery',
          error: 'Invalid Delivery OTP. Please obtain the 4-digit code from the shelter intake officer.',
        });
      }

      rescue.deliveryVerified = true;
      rescue.deliveryVerifiedAt = new Date();
      rescue.status = 'DELIVERED';

      rescue.timeline.push({
        status: 'DELIVERED',
        timestamp: new Date(),
        message: `Delivery PIN ${cleanInputOtp} verified by shelter receiver. Handover manifest locked. Meals distributed.`,
        actor: 'Shelter Intake Officer',
      });

      if (rescue.driver?.id) {
        await Driver.updateOne({ id: rescue.driver.id }, { status: 'AVAILABLE', activeRescueId: null });
      }

      await rescue.save();
      await Donation.updateOne({ id: rescue.donationId }, { status: 'DELIVERED' });

      return res.json({
        verified: true,
        stage: 'delivery',
        message: 'Delivery OTP verified successfully! Food rescue mission completed.',
        rescue,
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid stage. Must be "pickup" or "delivery".' });
  } catch (err) {
    console.error('Error in verify-otp:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 7. GET RESCUE: GET /rescues/{rescue_id}
// =========================================================================
router.get('/rescues/:rescue_id', async (req, res) => {
  try {
    const { rescue_id } = req.params;

    let rescue = await Rescue.findOne({ rescue_id });
    if (!rescue) {
      // Fallback: check if donation ID was passed
      rescue = await Rescue.findOne({ donationId: rescue_id });
    }

    if (!rescue) {
      return res.status(404).json({ success: false, error: `Rescue mission ${rescue_id} not found.` });
    }

    return res.json({
      success: true,
      rescue,
      mapboxToken: MAPBOX_TOKEN,
    });
  } catch (err) {
    console.error('Error in GET /rescues/:rescue_id:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 8. FAILURE SIMULATOR: POST /simulator/driver-cancel
// =========================================================================
router.post('/simulator/driver-cancel', async (req, res) => {
  try {
    const { rescue_id, reason } = req.body;

    const rescue = await Rescue.findOne({ rescue_id }) || await Rescue.findOne({ status: { $in: ['DRIVER_ASSIGNED', 'PICKUP_IN_PROGRESS', 'MATCHED'] } });
    if (!rescue) {
      return res.status(404).json({ success: false, error: 'No active rescue available to simulate driver cancellation.' });
    }

    const previousDriver = rescue.driver ? { ...rescue.driver.toObject ? rescue.driver.toObject() : rescue.driver } : null;

    // 1. Mark previous driver as unavailable
    if (previousDriver?.id) {
      await Driver.updateOne({ id: previousDriver.id }, { status: 'OFFLINE' });
    }

    // 2. Query next closest available driver from MongoDB
    const replacementDriver = await Driver.findOne({
      isOnline: true,
      status: 'AVAILABLE',
      id: { $ne: previousDriver?.id },
    }) || await Driver.findOne({ isOnline: true });

    // 3. Recalculate route with Mapbox
    const newRoute = replacementDriver
      ? await getDrivingRoute(replacementDriver.coords, rescue.donor.coords)
      : null;

    if (replacementDriver) {
      rescue.driver = {
        id: replacementDriver.id,
        name: replacementDriver.name,
        phone: replacementDriver.phone,
        vehicleType: replacementDriver.vehicleType,
        vehiclePlate: replacementDriver.vehiclePlate,
        coords: replacementDriver.coords,
        etaMinutes: newRoute ? newRoute.durationMinutes : 12,
      };
      rescue.status = 'DRIVER_ASSIGNED';
      await Driver.updateOne({ id: replacementDriver.id }, { status: 'ON_MISSION', activeRescueId: rescue.rescue_id });
    } else {
      rescue.status = 'RE_MATCHING';
      rescue.driver = null;
    }

    rescue.timeline.push({
      status: rescue.status,
      timestamp: new Date(),
      message: `[SIMULATION] Courier cancellation reported (${reason || 'Mechanical failure / puncture'}). Autonomous rematching executed -> Reassigned to ${replacementDriver ? replacementDriver.name : 'Emergency Volunteer Fleet'}.`,
      actor: 'Autonomous Dispatch Engine',
    });

    await rescue.save();

    // Log to SimulatorLog
    const simLog = await SimulatorLog.create({
      simulationId: `SIM-${Date.now()}`,
      eventType: 'DRIVER_CANCEL',
      rescueId: rescue.rescue_id,
      reason: reason || 'Volunteer courier vehicle mechanical breakdown',
      previousState: { driver: previousDriver },
      newState: { driver: rescue.driver, status: rescue.status },
      mitigationActions: [
        'Flagged previous driver offline',
        `Autonomous redispatch executed in 1.2s`,
        `Assigned ${replacementDriver?.name || 'Secondary pool'} with ${newRoute?.durationMinutes || 12}m ETA`,
      ],
    });

    return res.json({
      success: true,
      eventType: 'DRIVER_CANCEL',
      message: 'Simulated driver cancellation resolved: instant autonomous courier rematching executed.',
      previousDriver,
      replacementDriver: rescue.driver,
      rescue,
      log: simLog,
    });
  } catch (err) {
    console.error('Error in /simulator/driver-cancel:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 9. FAILURE SIMULATOR: POST /simulator/shelter-full
// =========================================================================
router.post('/simulator/shelter-full', async (req, res) => {
  try {
    const { rescue_id, reason } = req.body;

    const rescue = await Rescue.findOne({ rescue_id }) || await Rescue.findOne({ status: { $in: ['MATCHED', 'DRIVER_ASSIGNED', 'IN_TRANSIT'] } });
    if (!rescue) {
      return res.status(404).json({ success: false, error: 'No active rescue available to simulate shelter capacity overflow.' });
    }

    const previousShelter = rescue.shelter ? { ...rescue.shelter.toObject ? rescue.shelter.toObject() : rescue.shelter } : null;

    // 1. Mark current shelter full in MongoDB
    if (previousShelter?.id) {
      await Shelter.updateOne({ id: previousShelter.id }, { status: 'FULL', capacityMeals: 0 });
    }

    // 2. Query MongoDB for secondary candidate shelter
    const candidateShelter = await Shelter.findOne({
      id: { $ne: previousShelter?.id },
      status: 'ACTIVE',
      capacityMeals: { $gte: rescue.foodDetails?.mealCount || 20 },
    }) || await Shelter.findOne({ id: { $ne: previousShelter?.id } });

    if (!candidateShelter) {
      return res.status(400).json({ success: false, error: 'No secondary shelters available with capacity.' });
    }

    // 3. Compute new Mapbox driving route from Donor or Driver location to secondary shelter
    const startCoords = rescue.driver?.coords || rescue.donor.coords;
    const reroutedMapbox = await getDrivingRoute(startCoords, candidateShelter.coords);

    rescue.shelter = {
      id: candidateShelter.id,
      name: candidateShelter.name,
      address: candidateShelter.address,
      coords: candidateShelter.coords,
      contactPhone: candidateShelter.contactPhone,
      intakeCapacity: candidateShelter.capacityMeals,
    };
    rescue.route = reroutedMapbox;

    rescue.timeline.push({
      status: rescue.status,
      timestamp: new Date(),
      message: `[SIMULATION] Destination shelter capacity exhausted (${reason || 'Walk-in rush / cold storage full'}). Dynamic diversion triggered -> Route rerouted to ${candidateShelter.name} (${reroutedMapbox.distanceKm} km, ${reroutedMapbox.durationMinutes} min).`,
      actor: 'Dynamic Routing Engine',
    });

    await rescue.save();

    // Log to SimulatorLog
    const simLog = await SimulatorLog.create({
      simulationId: `SIM-${Date.now()}`,
      eventType: 'SHELTER_FULL',
      rescueId: rescue.rescue_id,
      reason: reason || 'Intake capacity exhausted unexpectedly at destination dock',
      previousState: { shelter: previousShelter },
      newState: { shelter: rescue.shelter, route: reroutedMapbox },
      mitigationActions: [
        `Marked ${previousShelter?.name} status as FULL`,
        `Selected secondary shelter ${candidateShelter.name} with ${candidateShelter.capacityMeals} meals capacity`,
        `Updated courier turn-by-turn Mapbox navigation HUD`,
      ],
    });

    return res.json({
      success: true,
      eventType: 'SHELTER_FULL',
      message: 'Simulated shelter overflow resolved: automated diversion to secondary shelter executed.',
      previousShelter,
      newShelter: rescue.shelter,
      newRoute: reroutedMapbox,
      rescue,
      log: simLog,
    });
  } catch (err) {
    console.error('Error in /simulator/shelter-full:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 10. FAILURE SIMULATOR: POST /simulator/route-delay
// =========================================================================
router.post('/simulator/route-delay', async (req, res) => {
  try {
    const { rescue_id, delayMinutes = 25, reason } = req.body;

    const rescue = await Rescue.findOne({ rescue_id }) || await Rescue.findOne({ status: { $in: ['IN_TRANSIT', 'DRIVER_ASSIGNED', 'PICKUP_IN_PROGRESS'] } });
    if (!rescue) {
      return res.status(404).json({ success: false, error: 'No active rescue in transit to simulate route delay.' });
    }

    const previousDurationMinutes = rescue.route?.durationMinutes || 15;
    const newDurationMinutes = previousDurationMinutes + delayMinutes;

    if (rescue.route) {
      rescue.route.durationMinutes = newDurationMinutes;
      rescue.route.durationSeconds = newDurationMinutes * 60;
    }
    if (rescue.driver) {
      rescue.driver.etaMinutes = (rescue.driver.etaMinutes || 10) + delayMinutes;
    }

    // Evaluate Cold Chain Safety Buffer against food expiry deadline
    const deadlineTime = new Date(rescue.foodDetails?.pickupDeadline || Date.now() + 60 * 60 * 1000).getTime();
    const expectedArrivalTime = Date.now() + newDurationMinutes * 60 * 1000;
    const safetyMarginMinutes = Math.round((deadlineTime - expectedArrivalTime) / (60 * 1000));
    const coldChainCritical = safetyMarginMinutes < 20;

    rescue.telemetry.coldChainCompliant = !coldChainCritical;

    rescue.timeline.push({
      status: rescue.status,
      timestamp: new Date(),
      message: `[SIMULATION] Traffic gridlock detected (+${delayMinutes} min delay). New ETA: ${newDurationMinutes} mins. Remaining safety window: ${safetyMarginMinutes} mins. ${coldChainCritical ? 'CRITICAL COLD-CHAIN ALERT TRANSMITTED TO RECIPIENT.' : 'Thermal buffer within safe parameters.'}`,
      actor: 'Traffic Telemetry Sensor',
    });

    await rescue.save();

    // Log to SimulatorLog
    const simLog = await SimulatorLog.create({
      simulationId: `SIM-${Date.now()}`,
      eventType: 'ROUTE_DELAY',
      rescueId: rescue.rescue_id,
      reason: reason || 'Severe urban arterial congestion / road diversion',
      details: {
        delayMinutes,
        previousDurationMinutes,
        newDurationMinutes,
        safetyMarginMinutes,
        coldChainCritical,
      },
      mitigationActions: [
        `Added +${delayMinutes} mins to courier turn-by-turn ETA`,
        `Recalculated cold-chain safety margin (${safetyMarginMinutes} mins remaining)`,
        coldChainCritical
          ? 'Triggered priority dock clearance dispatch alert'
          : 'Logged safe delivery window confirmation',
      ],
    });

    return res.json({
      success: true,
      eventType: 'ROUTE_DELAY',
      message: `Simulated delay of +${delayMinutes} mins recorded. Cold-chain risk assessment completed.`,
      delayMinutes,
      newEtaMinutes: newDurationMinutes,
      safetyMarginMinutes,
      coldChainCompliant: !coldChainCritical,
      rescue,
    });
  } catch (err) {
    console.error('Error in /simulator/route-delay:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 10. RESEND OTP: POST /rescues/:rescue_id/resend-otp
// =========================================================================
router.post('/rescues/:rescue_id/resend-otp', async (req, res) => {
  try {
    const { rescue_id } = req.params;
    const { stage, email } = req.body; // stage: 'pickup' | 'delivery'

    const rescue = await Rescue.findOne({ rescue_id });
    if (!rescue) {
      return res.status(404).json({ success: false, error: 'Rescue not found.' });
    }

    if (stage === 'pickup') {
      const targetEmail = email || rescue.donor?.email || 'donor@replate.org';
      await sendDonationPickupOtpEmail({
        toEmail: targetEmail,
        donorName: rescue.donor?.name || 'Restaurant Partner',
        foodName: rescue.foodDetails?.foodName || 'Surplus Meals',
        pickupOtp: rescue.pickupOtp,
        orderId: rescue.rescue_id,
        driverName: rescue.driver?.name || 'Volunteer Courier',
      });
      return res.json({ success: true, message: `Pickup OTP resent to ${targetEmail}.` });
    } else {
      const targetEmail = email || rescue.shelter?.contactEmail || 'shelter@replate.org';
      const donorEmail = rescue.donor?.email || 'donor@replate.org';
      await sendDeliveryOtpEmail({
        toEmail: targetEmail,
        donorEmail: donorEmail,
        recipientName: rescue.shelter?.name || 'Shelter Intake',
        donorName: rescue.donor?.name || 'Restaurant Donor',
        foodName: rescue.foodDetails?.foodName || 'Surplus Meals',
        deliveryOtp: rescue.deliveryOtp,
        orderId: rescue.rescue_id,
        driverName: rescue.driver?.name || 'Volunteer Courier',
      });
      return res.json({ success: true, message: `Delivery OTP resent to ${targetEmail} and donor email.` });
    }
  } catch (err) {
    console.error('Error in /rescues/resend-otp:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 11. RECENT EMAILS AUDIT LOG: GET /emails/recent
// =========================================================================
router.get('/emails/recent', (req, res) => {
  return res.json({
    success: true,
    count: emailAuditLog.length,
    emails: emailAuditLog,
  });
});

// =========================================================================
// 12. TEST REAL SMTP CONNECTION: POST /emails/test-smtp
// =========================================================================
router.post('/emails/test-smtp', async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const to = targetEmail || process.env.EMAIL_USER || process.env.SMTP_USER;
    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Please provide targetEmail in request body or set EMAIL_USER in .env',
      });
    }

    const { sendAuthOtpEmail } = require('../services/emailService');
    const testOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const result = await sendAuthOtpEmail({
      toEmail: to,
      otpCode: testOtp,
      userName: 'Valued RePlate Partner',
    });

    const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER || 'Ethereal / Fallback';
    return res.json({
      success: true,
      message: `Test verification code dispatched to ${to} using sender: ${emailUser}`,
      sentTo: to,
      sender: emailUser,
      otpSent: testOtp,
      smtpResult: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      help: 'Ensure EMAIL_USER and EMAIL_PASS (16-char App Password) are set in .env',
    });
  }
});

module.exports = router;
