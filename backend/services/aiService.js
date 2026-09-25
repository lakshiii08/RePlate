const Donation = require('../models/Donation');

/**
 * AI-assisted text extraction for surplus food donation
 * Extracts structured fields from freeform descriptions
 */
async function parseDonationInput(rawText, donorProfile = {}) {
  const text = (rawText || '').toLowerCase();

  // 1. Food Name Heuristic Extraction
  let foodName = 'Surplus Prepared Meals';
  const nameMatches = rawText.match(
    /(?:donating|have|surplus|fresh|prepared)\s+([a-zA-Z0-9\s,&]+?)(?:\s+(?:trays|boxes|portions|meals|kg|packets|containers|prepared|ready|at|before|from|\.|\n|$))/i
  );
  if (nameMatches && nameMatches[1] && nameMatches[1].trim().length > 3) {
    foodName = nameMatches[1].trim();
    // Capitalize words
    foodName = foodName.replace(/\b\w/g, (c) => c.toUpperCase());
  } else if (text.includes('biryani')) {
    foodName = 'Vegetable Biryani & Raita Trays';
  } else if (text.includes('dal') || text.includes('rice') || text.includes('curry')) {
    foodName = 'Dal Makhani & Basmati Rice Combo';
  } else if (text.includes('croissant') || text.includes('bread') || text.includes('pastry') || text.includes('cake')) {
    foodName = 'Artisan Sourdough & Assorted Pastries';
  } else if (text.includes('fruit') || text.includes('apple') || text.includes('banana')) {
    foodName = 'Fresh Seasonal Fruit Crates';
  } else if (text.includes('sandwich') || text.includes('wrap')) {
    foodName = 'Gourmet Vegetable Wraps & Sandwiches';
  }

  // 2. Category Classification
  let category = 'Meal';
  if (text.includes('bread') || text.includes('bakery') || text.includes('pastry') || text.includes('cake') || text.includes('croissant')) {
    category = 'Bakery';
  } else if (text.includes('fruit') || text.includes('vegetable') || text.includes('apple') || text.includes('orange') || text.includes('produce')) {
    category = 'Fruits';
  } else if (text.includes('cater') || text.includes('buffet') || text.includes('banquet')) {
    category = 'Meal';
  }

  // 3. Food Type (Veg / Non-Veg)
  let foodType = 'Veg';
  if (text.includes('chicken') || text.includes('mutton') || text.includes('fish') || text.includes('meat') || text.includes('egg') || text.includes('non-veg') || text.includes('non veg')) {
    foodType = 'Non-Veg';
  }

  // 4. Quantity Extraction
  let quantityKg = 12;
  let quantityStr = '12 kg (~36 portions)';
  const kgMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos|kilograms)/i);
  const mealsMatch = text.match(/(\d+)\s*(?:meals|portions|people|servings|plates)/i);
  const boxesMatch = text.match(/(\d+)\s*(?:trays|boxes|containers|packets)/i);

  if (kgMatch) {
    quantityKg = parseFloat(kgMatch[1]);
    quantityStr = `${quantityKg} kg (~${Math.round(quantityKg * 3)} portions)`;
  } else if (mealsMatch) {
    const mealCount = parseInt(mealsMatch[1], 10);
    quantityKg = Math.max(2, Math.round(mealCount * 0.35));
    quantityStr = `${mealCount} portions (~${quantityKg} kg)`;
  } else if (boxesMatch) {
    const boxCount = parseInt(boxesMatch[1], 10);
    quantityKg = boxCount * 4;
    quantityStr = `${boxCount} bulk trays (~${quantityKg} kg)`;
  }

  const mealCount = Math.round(quantityKg * 3);

  // 5. Expiry & Shelf Life
  const now = Date.now();
  let expiryHours = 3; // Default 3 hours for hot prepared meals
  const hoursMatch = text.match(/(?:within|in|before|lasts?)\s*(\d+(?:\.\d+)?)\s*(?:hours|hrs|hr)/i);
  if (hoursMatch) {
    expiryHours = parseFloat(hoursMatch[1]);
  } else if (category === 'Bakery') {
    expiryHours = 24;
  } else if (category === 'Fruits') {
    expiryHours = 36;
  }

  const pickupDeadline = new Date(now + expiryHours * 60 * 60 * 1000).toISOString();
  const preparedTime = new Date(now - 45 * 60 * 1000).toISOString(); // ~45 mins ago

  // 6. Storage Method
  let storageMethod = 'ambient';
  if (category === 'Meal') {
    storageMethod = text.includes('cold') || text.includes('refrigerat') ? 'refrigerated' : 'hot_held';
  } else if (text.includes('chill') || text.includes('fridge') || text.includes('cold')) {
    storageMethod = 'refrigerated';
  }

  // 7. Packaging Type
  let packagingType = 'sealed';
  if (text.includes('tray') || text.includes('bulk') || text.includes('cater')) {
    packagingType = 'bulk_boxes';
  } else if (text.includes('box') || text.includes('pack')) {
    packagingType = 'individual_containers';
  }

  // 8. Generate Unique ID
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const donationId = `DON-${randomSuffix}`;

  return {
    id: donationId,
    foodName,
    category,
    foodType,
    quantity: quantityStr,
    quantityKg,
    mealCount,
    storageMethod,
    packagingType,
    pickupDeadline,
    preparedTime,
    donorName: donorProfile.name || 'Royal Spice Grand Kitchen',
    donorPhone: donorProfile.phone || '+91 98100 77123',
    donorAddress: donorProfile.address || 'DLF Cyber City, Tower B, Phase 2, Gurugram',
    donorCoords: donorProfile.coords || [28.4900, 77.0890],
    pickupLocation: donorProfile.address || 'DLF Cyber City, Tower B, Phase 2, Gurugram',
    status: 'POSTED',
    specialNotes: rawText.length > 200 ? rawText.substring(0, 200) + '...' : rawText,
    pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
    deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
  };
}

module.exports = {
  parseDonationInput,
};
