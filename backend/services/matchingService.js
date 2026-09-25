const Shelter = require('../models/Shelter');
const { haversineDistanceKm } = require('./mapboxService');

/**
 * Multi-criteria heuristic scoring engine for matching donations to recipient shelters
 */
async function matchDonationWithShelters(donation) {
  // Query all active shelters from MongoDB
  const shelters = await Shelter.find({ status: 'ACTIVE' }).lean();

  if (!shelters || shelters.length === 0) {
    return [];
  }

  const donorCoords = donation.donorCoords || [28.5589, 77.2028];
  const requiredMeals = donation.mealCount || 30;
  const foodCategory = donation.category || 'Meal';
  const foodType = donation.foodType || 'Veg';

  const scoredCandidates = shelters.map((shelter) => {
    const shelterCoords = shelter.coords || [28.5672, 77.2100];
    const distanceKm = haversineDistanceKm(
      donorCoords[0],
      donorCoords[1],
      shelterCoords[0],
      shelterCoords[1]
    );

    // 1. Distance & ETA (Closer is better, max 25 km)
    const distanceScore = Math.max(20, Math.min(100, Math.round(100 - distanceKm * 3.5)));
    const etaMinutes = Math.max(5, Math.round(distanceKm * 2.8));

    // 2. Capacity Fit
    const capRatio = shelter.capacityMeals / Math.max(1, requiredMeals);
    let capacityScore = 80;
    if (capRatio >= 1.0 && capRatio <= 3.0) {
      capacityScore = 98; // Perfect match
    } else if (capRatio > 3.0) {
      capacityScore = 85; // Shelter is much bigger
    } else {
      capacityScore = Math.round(capRatio * 80); // Shelter capacity is smaller than donation
    }

    // 3. Food Compatibility & Dietary Preferences
    let foodScore = 75;
    const needs = shelter.currentNeeds || [];
    const hasCategoryNeed = needs.some(
      (n) => n.toLowerCase().includes(foodCategory.toLowerCase()) || n.toLowerCase().includes('meal')
    );
    if (hasCategoryNeed) foodScore += 15;

    const dietaryMatch = !shelter.dietaryPreferences || shelter.dietaryPreferences.includes(foodType);
    if (dietaryMatch) foodScore += 10;
    foodScore = Math.min(100, foodScore);

    // 4. Overall Weighted Score
    const overallScore = Math.round(
      distanceScore * 0.35 + capacityScore * 0.35 + foodScore * 0.30
    );

    return {
      shelterId: shelter.id,
      name: shelter.name,
      address: shelter.address,
      coords: shelterCoords,
      contactPhone: shelter.contactPhone,
      intakeCapacity: shelter.capacityMeals,
      distanceKm,
      etaMinutes,
      feasibilityScore: {
        overallScore,
        distanceEta: distanceScore,
        capacityFit: capacityScore,
        foodCompatibility: foodScore,
        explanation: `${distanceKm} km transit (${etaMinutes} min) &bull; Capacity: ${shelter.capacityMeals} meals &bull; Dietary fit: ${foodType} compatible`,
      },
    };
  });

  // Sort descending by overallScore
  scoredCandidates.sort((a, b) => b.feasibilityScore.overallScore - a.feasibilityScore.overallScore);

  return scoredCandidates;
}

module.exports = {
  matchDonationWithShelters,
};
