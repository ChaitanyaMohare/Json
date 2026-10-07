const Incident = require('../models/Incident');
const Report = require('../models/Report');

/**
 * Helper: Resolve approximate neighborhood or area name from coordinates
 * Defaults to readable geographic coordinates or recognized Bengaluru sectors
 */
function resolveAreaName(lng, lat) {
  // Approximate Bengaluru sectors for intuitive operator visibility
  if (lat >= 12.96 && lat <= 13.00 && lng >= 77.58 && lng <= 77.62) {
    return 'Bengaluru Central / MG Road Corridor';
  } else if (lat >= 12.91 && lat <= 12.95 && lng >= 77.60 && lng <= 77.65) {
    return 'Koramangala / HSR Transit Sector';
  } else if (lat >= 12.95 && lat <= 12.99 && lng >= 77.62 && lng <= 77.68) {
    return 'Indiranagar / Old Airport Road';
  } else if (lat >= 12.97 && lat <= 13.02 && lng >= 77.66 && lng <= 77.75) {
    return 'Whitefield / ITPL Expressway';
  } else if (lat >= 13.01 && lat <= 13.08 && lng >= 77.56 && lng <= 77.62) {
    return 'Hebbal / Bellary Road Junction';
  } else if (lat >= 12.90 && lat <= 12.96 && lng >= 77.53 && lng <= 77.59) {
    return 'Jayanagar / Banashankari Belt';
  }
  return `Sector (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`;
}

/**
 * @desc    Get aggregated road-safety analytics overview
 * @route   GET /api/analytics/overview
 */
exports.getAnalyticsOverview = async (req, res) => {
  try {
    const { days } = req.query;
    const parsedDays = days !== undefined ? parseInt(days, 10) : 7;
    const isFilteredByDays = !isNaN(parsedDays) && parsedDays > 0;

    const incidentMatch = {};
    const reportMatch = {};

    if (isFilteredByDays) {
      const cutoffDate = new Date(Date.now() - parsedDays * 24 * 60 * 60 * 1000);
      incidentMatch.createdAt = { $gte: cutoffDate };
      reportMatch.createdAt = { $gte: cutoffDate };
    }

    // Aggregations on Incidents collection
    const [incidentStats] = await Incident.aggregate([
      { $match: incidentMatch },
      {
        $facet: {
          totals: [{ $count: 'count' }],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          bySeverity: [
            { $group: { _id: '$severity', count: { $sum: 1 } } }
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          byEvidence: [
            { $group: { _id: '$evidence.evidenceLevel', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    // Aggregations on Reports collection
    const [reportStats] = await Report.aggregate([
      { $match: reportMatch },
      {
        $facet: {
          totals: [{ $count: 'count' }],
          pending: [
            {
              $match: {
                $or: [
                  { incidentId: null },
                  { incidentId: { $exists: false } }
                ]
              }
            },
            { $count: 'count' }
          ],
          suspicious: [
            {
              $match: {
                'aiAnalysis.suspicious': true
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]);

    // Format incident breakdowns
    const totalIncidents = incidentStats.totals[0]?.count || 0;
    const statusMap = { ACTIVE: 0, VERIFIED: 0, RESOLVED: 0, REJECTED: 0, NEW: 0 };
    (incidentStats.byStatus || []).forEach(item => {
      if (item._id) statusMap[item._id] = item.count;
    });

    const severityMap = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    (incidentStats.bySeverity || []).forEach(item => {
      if (item._id) severityMap[item._id] = item.count;
    });

    const typeMap = { ACCIDENT: 0, ROAD_BLOCK: 0, ROAD_DAMAGE: 0, FLOOD: 0, OTHER: 0 };
    (incidentStats.byType || []).forEach(item => {
      if (item._id) typeMap[item._id] = item.count;
    });

    const evidenceMap = { ISOLATED: 0, CORROBORATED: 0, STRONGLY_CORROBORATED: 0 };
    (incidentStats.byEvidence || []).forEach(item => {
      if (item._id && evidenceMap[item._id] !== undefined) {
        evidenceMap[item._id] = item.count;
      } else {
        evidenceMap.ISOLATED += item.count;
      }
    });

    // Format report breakdowns
    const totalReports = reportStats.totals[0]?.count || 0;
    const pendingReports = reportStats.pending[0]?.count || 0;
    const suspiciousReports = reportStats.suspicious[0]?.count || 0;

    return res.status(200).json({
      success: true,
      data: {
        timeWindowDays: isFilteredByDays ? parsedDays : null,
        totalIncidents,
        activeIncidents: statusMap.ACTIVE + statusMap.NEW,
        verifiedIncidents: statusMap.VERIFIED,
        resolvedIncidents: statusMap.RESOLVED,
        rejectedIncidents: statusMap.REJECTED,
        highSeverityIncidents: severityMap.HIGH,
        mediumSeverityIncidents: severityMap.MEDIUM,
        lowSeverityIncidents: severityMap.LOW,
        totalReports,
        pendingReports,
        suspiciousReports,
        corroboratedIncidents: evidenceMap.CORROBORATED + evidenceMap.STRONGLY_CORROBORATED,
        stronglyCorroboratedIncidents: evidenceMap.STRONGLY_CORROBORATED,
        isolatedIncidents: evidenceMap.ISOLATED,
        byType: typeMap,
        bySeverity: severityMap,
        byStatus: statusMap,
        byEvidence: evidenceMap
      }
    });
  } catch (error) {
    console.error('Analytics Overview Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics overview',
      error: error.message
    });
  }
};

/**
 * @desc    Get road safety hotspots based on geographic concentration & deterministic risk scoring
 * @route   GET /api/analytics/hotspots
 * 
 * SCORING LOGIC & WEIGHTS:
 * Practical operational risk indicator formula:
 * - Base incident concentration: +10 pts per incident in cluster
 * - High Severity Hazard: +25 pts (critical physical danger e.g. severe accident / crater)
 * - Medium Severity Hazard: +10 pts (moderate road obstruction)
 * - Low Severity Hazard: +3 pts (minor issue)
 * - Active / New Incident: +15 pts (unmitigated live threat requiring operator triage)
 * - Verified Incident: +20 pts (operator-confirmed hazard)
 * - Resolved Incident: -5 pts (incident cleared, attenuates hotspot risk)
 * 
 * RISK LEVEL THRESHOLDS:
 * - CRITICAL: riskScore >= 100
 * - HIGH:     60 <= riskScore < 100
 * - MEDIUM:   30 <= riskScore < 60
 * - LOW:      riskScore < 30
 */
exports.getHotspots = async (req, res) => {
  try {
    const { days, severity, status } = req.query;
    const parsedDays = days !== undefined ? parseInt(days, 10) : 7;
    const isFilteredByDays = !isNaN(parsedDays) && parsedDays > 0;

    const matchStage = {};

    if (isFilteredByDays) {
      const cutoffDate = new Date(Date.now() - parsedDays * 24 * 60 * 60 * 1000);
      matchStage.createdAt = { $gte: cutoffDate };
    }

    if (severity && severity.toUpperCase() !== 'ALL') {
      matchStage.severity = severity.toUpperCase();
    }

    if (status && status.toUpperCase() !== 'ALL') {
      matchStage.status = status.toUpperCase();
    }

    // Group incidents into geographic clusters by rounding coordinates to 2 decimal places (~1.1km grid)
    const rawClusters = await Incident.aggregate([
      { $match: matchStage },
      {
        $project: {
          type: 1,
          severity: 1,
          status: 1,
          title: 1,
          evidence: 1,
          lng: { $arrayElemAt: ['$location.coordinates', 0] },
          lat: { $arrayElemAt: ['$location.coordinates', 1] }
        }
      },
      {
        $project: {
          type: 1,
          severity: 1,
          status: 1,
          title: 1,
          evidence: 1,
          lng: 1,
          lat: 1,
          gridLng: { $round: ['$lng', 2] },
          gridLat: { $round: ['$lat', 2] }
        }
      },
      {
        $group: {
          _id: { gridLng: '$gridLng', gridLat: '$gridLat' },
          incidentCount: { $sum: 1 },
          avgLng: { $avg: '$lng' },
          avgLat: { $avg: '$lat' },
          highSeverityCount: {
            $sum: { $cond: [{ $eq: ['$severity', 'HIGH'] }, 1, 0] }
          },
          mediumSeverityCount: {
            $sum: { $cond: [{ $eq: ['$severity', 'MEDIUM'] }, 1, 0] }
          },
          lowSeverityCount: {
            $sum: { $cond: [{ $eq: ['$severity', 'LOW'] }, 1, 0] }
          },
          activeCount: {
            $sum: { $cond: [{ $in: ['$status', ['ACTIVE', 'NEW']] }, 1, 0] }
          },
          verifiedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'VERIFIED'] }, 1, 0] }
          },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] }
          },
          corroboratedCount: {
            $sum: { $cond: [{ $in: ['$evidence.evidenceLevel', ['CORROBORATED', 'STRONGLY_CORROBORATED']] }, 1, 0] }
          },
          totalSupportingReports: {
            $sum: { $ifNull: ['$evidence.reportCount', 1] }
          },
          types: { $push: '$type' },
          titles: { $push: '$title' }
        }
      }
    ]);

    // Calculate deterministic risk scores and determine risk levels
    const hotspots = rawClusters.map((cluster) => {
      const {
        _id,
        incidentCount,
        avgLng,
        avgLat,
        highSeverityCount,
        mediumSeverityCount,
        lowSeverityCount,
        activeCount,
        verifiedCount,
        resolvedCount,
        corroboratedCount,
        totalSupportingReports,
        types,
        titles
      } = cluster;

      // Deterministic risk scoring calculation
      const calculatedScore = Math.max(
        0,
        Math.round(
          incidentCount * 10 +
          highSeverityCount * 25 +
          mediumSeverityCount * 10 +
          lowSeverityCount * 3 +
          activeCount * 15 +
          verifiedCount * 20 -
          resolvedCount * 5
        )
      );

      let riskLevel = 'LOW';
      if (calculatedScore >= 100) {
        riskLevel = 'CRITICAL';
      } else if (calculatedScore >= 60) {
        riskLevel = 'HIGH';
      } else if (calculatedScore >= 30) {
        riskLevel = 'MEDIUM';
      }

      const lng = avgLng !== null && !isNaN(avgLng) ? Number(avgLng.toFixed(4)) : _id.gridLng;
      const lat = avgLat !== null && !isNaN(avgLat) ? Number(avgLat.toFixed(4)) : _id.gridLat;

      // Find top hazard types in cluster
      const typeCounts = {};
      types.forEach(t => {
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });
      const topHazards = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([t]) => t);

      return {
        id: `hotspot-${_id.gridLng}-${_id.gridLat}`,
        latitude: lat,
        longitude: lng,
        areaName: resolveAreaName(lng, lat),
        incidentCount,
        highSeverityCount,
        mediumSeverityCount,
        lowSeverityCount,
        activeCount,
        verifiedCount,
        resolvedCount,
        corroboratedCount: corroboratedCount || 0,
        totalSupportingReports: totalSupportingReports || incidentCount,
        riskScore: calculatedScore,
        riskLevel,
        topHazards,
        sampleTitles: titles.slice(0, 3)
      };
    });

    // Sort by riskScore descending (most dangerous areas first)
    hotspots.sort((a, b) => b.riskScore - a.riskScore);

    return res.status(200).json({
      success: true,
      count: hotspots.length,
      timeWindowDays: isFilteredByDays ? parsedDays : null,
      data: hotspots
    });
  } catch (error) {
    console.error('Hotspot Analytics Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve road safety hotspots',
      error: error.message
    });
  }
};
