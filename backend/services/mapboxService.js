const axios = require('axios');

const MAPBOX_TOKEN =
  process.env.MAPBOX_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  'pk.eyJ1IjoiamF0aW4xMTEyIiwiYSI6ImNtdWEycWF2djB5cjcyeXM5ZHg3MnQ1bjkifQ.mWhTcaDNa-ySEszTwb42zg';

// Calculate Haversine distance as backup
function haversineDistanceKm(a, b, c, d) {
  let lat1, lon1, lat2, lon2;
  if (Array.isArray(a) && Array.isArray(b)) {
    [lat1, lon1] = a;
    [lat2, lon2] = b;
  } else {
    lat1 = Number(a);
    lon1 = Number(b);
    lat2 = Number(c);
    lon2 = Number(d);
  }
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const aVal =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const cVal = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return Math.round(R * cVal * 10) / 10;
}

/**
 * Fetch real driving route from Mapbox Directions API
 * @param {[number, number]} origin - [latitude, longitude]
 * @param {[number, number]} destination - [latitude, longitude]
 */
async function getDrivingRoute(origin, destination) {
  const [origLat, origLng] = origin;
  const [destLat, destLng] = destination;

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origLng},${origLat};${destLng},${destLat}?geometries=geojson&steps=true&overview=full&access_token=${MAPBOX_TOKEN}`;
    const response = await axios.get(url, { timeout: 7000 });

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const primaryRoute = response.data.routes[0];
      const distanceMeters = primaryRoute.distance;
      const durationSeconds = primaryRoute.duration;
      const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
      const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

      const steps = (primaryRoute.legs[0]?.steps || []).map((step) => ({
        instruction: step.maneuver?.instruction || 'Continue on route',
        distance: Math.round(step.distance),
        duration: Math.round(step.duration),
      }));

      return {
        source: 'mapbox',
        distanceMeters: Math.round(distanceMeters),
        distanceKm,
        durationSeconds: Math.round(durationSeconds),
        durationMinutes,
        geometry: primaryRoute.geometry, // GeoJSON { type: 'LineString', coordinates: [[lng, lat], ...] }
        steps,
      };
    }
  } catch (error) {
    console.warn('[MapboxService] Fallback to synthetic routing due to API warning:', error.message);
  }

  // Graceful fallback route
  const distKm = haversineDistanceKm(origLat, origLng, destLat, destLng) || 3.5;
  const durMins = Math.max(5, Math.round(distKm * 3.2)); // avg ~20 km/h urban speed

  return {
    source: 'haversine-calculated',
    distanceMeters: Math.round(distKm * 1000),
    distanceKm: distKm,
    durationSeconds: durMins * 60,
    durationMinutes: durMins,
    geometry: {
      type: 'LineString',
      coordinates: [
        [origLng, origLat],
        [(origLng + destLng) / 2 + 0.002, (origLat + destLat) / 2 - 0.001],
        [destLng, destLat],
      ],
    },
    steps: [
      { instruction: `Depart origin and merge onto arterial corridor`, distance: 800, duration: 180 },
      { instruction: `Continue straight towards destination hub for ${distKm} km`, distance: distKm * 1000, duration: durMins * 60 },
      { instruction: `Arrive at intake receiver dock`, distance: 200, duration: 60 },
    ],
  };
}

module.exports = {
  getDrivingRoute,
  haversineDistanceKm,
  MAPBOX_TOKEN,
};
