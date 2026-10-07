const Report = require('../models/Report');
const Incident = require('../models/Incident');

// Configurable Corroboration Engine Constants
const CONFIG = {
  MAX_DISTANCE_METERS: 500,
  MAX_TIME_WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
  MIN_MATCH_SCORE: 40,

  // Distance Score Weights
  DISTANCE_THRESHOLDS: [
    { maxMeters: 100, points: 50 },
    { maxMeters: 250, points: 35 },
    { maxMeters: 500, points: 20 }
  ],

  // Category Score Weights
  CATEGORY_EXACT_POINTS: 25,
  CATEGORY_COMPATIBLE_POINTS: 10,

  // Time Score Weights
  TIME_THRESHOLDS: [
    { maxMinutes: 60, points: 15 },
    { maxMinutes: 360, points: 10 },
    { maxMinutes: 1440, points: 5 }
  ],

  // Evidence Level Thresholds
  THRESHOLDS: {
    STRONGLY_CORROBORATED_COUNT: 3,
    STRONGLY_CORROBORATED_SCORE: 75,
    CORROBORATED_COUNT: 2,
    CORROBORATED_SCORE: 50
  }
};

/**
 * Calculate great-circle distance in meters between two [longitude, latitude] coordinates.
 */
function calculateHaversineDistanceMeters(coordA, coordB) {
  if (!Array.isArray(coordA) || !Array.isArray(coordB)) return 999999;
  const [lng1, lat1] = coordA;
  const [lng2, lat2] = coordB;

  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Check category and semantic compatibility between two hazard types.
 */
function checkCategoryCompatibility(typeA, typeB, descA = '', descB = '') {
  const normA = (typeA || 'OTHER').toUpperCase();
  const normB = (typeB || 'OTHER').toUpperCase();

  if (normA === normB) {
    return { isCompatible: true, isExact: true, points: CONFIG.CATEGORY_EXACT_POINTS };
  }

  // Cross-category compatibility matrix for secondary effects
  const compatiblePairs = new Set([
    'ROAD_DAMAGE:ROAD_BLOCK',
    'ROAD_BLOCK:ROAD_DAMAGE',
    'ACCIDENT:ROAD_BLOCK',
    'ROAD_BLOCK:ACCIDENT',
    'FLOOD:ROAD_BLOCK',
    'ROAD_BLOCK:FLOOD'
  ]);

  if (compatiblePairs.has(`${normA}:${normB}`)) {
    return { isCompatible: true, isExact: false, points: CONFIG.CATEGORY_COMPATIBLE_POINTS };
  }

  // Cautious keyword matching if one is OTHER
  if (normA === 'OTHER' || normB === 'OTHER') {
    const textA = (descA || '').toLowerCase();
    const textB = (descB || '').toLowerCase();
    const keywords = ['pothole', 'accident', 'crash', 'water', 'flood', 'blocked', 'jam', 'crater'];
    const matchedKeyword = keywords.find(k => textA.includes(k) && textB.includes(k));
    if (matchedKeyword) {
      return { isCompatible: true, isExact: false, points: CONFIG.CATEGORY_COMPATIBLE_POINTS };
    }
  }

  return { isCompatible: false, isExact: false, points: 0 };
}

/**
 * Calculate deterministic pairwise corroboration score between two reports.
 */
function calculatePairCorroboration(reportA, reportB) {
  const coordsA = reportA.location?.coordinates;
  const coordsB = reportB.location?.coordinates;
  const distanceMeters = calculateHaversineDistanceMeters(coordsA, coordsB);

  // 1. Distance score
  let distancePoints = 0;
  for (const tier of CONFIG.DISTANCE_THRESHOLDS) {
    if (distanceMeters <= tier.maxMeters) {
      distancePoints = tier.points;
      break;
    }
  }

  // 2. Category score
  const categoryResult = checkCategoryCompatibility(
    reportA.type,
    reportB.type,
    reportA.description,
    reportB.description
  );
  const categoryPoints = categoryResult.points;

  // 3. Time score
  const timeA = new Date(reportA.createdAt || Date.now()).getTime();
  const timeB = new Date(reportB.createdAt || Date.now()).getTime();
  const timeDiffMs = Math.abs(timeA - timeB);
  const timeDiffMinutes = Math.round(timeDiffMs / (60 * 1000));

  let timePoints = 0;
  for (const tier of CONFIG.TIME_THRESHOLDS) {
    if (timeDiffMinutes <= tier.maxMinutes) {
      timePoints = tier.points;
      break;
    }
  }

  // Total deterministic score (capped at 100)
  const totalScore = Math.min(100, distancePoints + categoryPoints + timePoints);

  // Criteria for qualifying as corroborating match:
  // Must be within 500m, category compatible, within 24h, and reach minimum threshold
  const isMatch =
    distanceMeters <= CONFIG.MAX_DISTANCE_METERS &&
    timeDiffMs <= CONFIG.MAX_TIME_WINDOW_MS &&
    categoryResult.isCompatible &&
    totalScore >= CONFIG.MIN_MATCH_SCORE;

  return {
    distanceMeters,
    timeDifferenceMinutes: timeDiffMinutes,
    distancePoints,
    categoryPoints,
    timePoints,
    score: totalScore,
    isMatch
  };
}

/**
 * Compute the qualitative Evidence Level from report count and corroboration score.
 */
function determineEvidenceLevel(totalReports, score) {
  if (
    totalReports >= CONFIG.THRESHOLDS.STRONGLY_CORROBORATED_COUNT ||
    score >= CONFIG.THRESHOLDS.STRONGLY_CORROBORATED_SCORE
  ) {
    return 'STRONGLY_CORROBORATED';
  } else if (
    totalReports >= CONFIG.THRESHOLDS.CORROBORATED_COUNT ||
    score >= CONFIG.THRESHOLDS.CORROBORATED_SCORE
  ) {
    return 'CORROBORATED';
  }
  return 'ISOLATED';
}

/**
 * Find all corroborating community reports for a given target report.
 */
async function findCorroboratingReports(targetReport) {
  if (!targetReport || !targetReport.location?.coordinates) {
    return {
      matchedReports: [],
      corroborationCount: 1,
      corroborationScore: 0,
      evidenceLevel: 'ISOLATED'
    };
  }

  const [lng, lat] = targetReport.location.coordinates;
  const targetTime = new Date(targetReport.createdAt || Date.now()).getTime();
  const minTime = new Date(targetTime - CONFIG.MAX_TIME_WINDOW_MS);
  const maxTime = new Date(targetTime + CONFIG.MAX_TIME_WINDOW_MS);

  // MongoDB 2dsphere geospatial search within 500m
  const candidates = await Report.find({
    _id: { $ne: targetReport._id },
    createdAt: { $gte: minTime, $lte: maxTime },
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: CONFIG.MAX_DISTANCE_METERS
      }
    }
  }).lean();

  const matched = [];
  let scoreSum = 0;

  for (const cand of candidates) {
    const pair = calculatePairCorroboration(targetReport, cand);
    if (pair.isMatch) {
      matched.push({
        reportId: cand._id.toString(),
        type: cand.type,
        description: cand.description,
        location: cand.location,
        imageUrl: cand.imageUrl,
        incidentId: cand.incidentId ? cand.incidentId.toString() : null,
        createdAt: cand.createdAt,
        distanceMeters: pair.distanceMeters,
        timeDifferenceMinutes: pair.timeDifferenceMinutes,
        score: pair.score
      });
      scoreSum += pair.score;
    }
  }

  // Sort best evidence matches first
  matched.sort((a, b) => b.score - a.score);

  const matchedCount = matched.length;
  const totalReportsCount = matchedCount + 1; // including the target report itself
  const avgScore = matchedCount > 0 ? Math.round(scoreSum / matchedCount) : 0;
  const evidenceLevel = determineEvidenceLevel(totalReportsCount, avgScore);

  return {
    matchedReports: matched,
    corroborationCount: totalReportsCount,
    corroborationScore: avgScore,
    evidenceLevel
  };
}

/**
 * Check if a nearby compatible ACTIVE or VERIFIED Incident already exists that can absorb this report.
 */
async function findMatchingActiveIncident(report) {
  if (!report || !report.location?.coordinates) return null;
  const [lng, lat] = report.location.coordinates;

  // Search active/verified incidents within 500 meters
  const nearbyIncidents = await Incident.find({
    status: { $in: ['ACTIVE', 'VERIFIED', 'NEW'] },
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: CONFIG.MAX_DISTANCE_METERS
      }
    }
  });

  for (const inc of nearbyIncidents) {
    const catCheck = checkCategoryCompatibility(report.type, inc.type, report.description, inc.description);
    if (catCheck.isCompatible) {
      const distance = calculateHaversineDistanceMeters(report.location.coordinates, inc.location.coordinates);
      if (distance <= CONFIG.MAX_DISTANCE_METERS) {
        return {
          incident: inc,
          distanceMeters: distance,
          isExactCategory: catCheck.isExact
        };
      }
    }
  }

  return null;
}

module.exports = {
  CONFIG,
  calculateHaversineDistanceMeters,
  checkCategoryCompatibility,
  calculatePairCorroboration,
  determineEvidenceLevel,
  findCorroboratingReports,
  findMatchingActiveIncident
};
