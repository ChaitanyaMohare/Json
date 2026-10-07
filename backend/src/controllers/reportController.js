const mongoose = require('mongoose');
const Report = require('../models/Report');
const Incident = require('../models/Incident');
const corroborationService = require('../services/corroborationService');

const ALLOWED_TYPES = ['ACCIDENT', 'ROAD_BLOCK', 'ROAD_DAMAGE', 'FLOOD', 'OTHER'];

// Helper to normalize location input into GeoJSON Point
const normalizeLocation = (body) => {
  if (body.location && body.location.type === 'Point' && Array.isArray(body.location.coordinates)) {
    const [lng, lat] = body.location.coordinates.map(Number);
    if (!isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
      return { type: 'Point', coordinates: [lng, lat] };
    }
  }

  if (body.latitude !== undefined && body.longitude !== undefined) {
    const lat = parseFloat(body.latitude);
    const lng = parseFloat(body.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { type: 'Point', coordinates: [lng, lat] };
    }
  }

  if (Array.isArray(body.coordinates) && body.coordinates.length === 2) {
    const [lng, lat] = body.coordinates.map(Number);
    if (!isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
      return { type: 'Point', coordinates: [lng, lat] };
    }
  }

  return null;
};

// @desc    Get all reports
// @route   GET /api/reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports',
      error: error.message
    });
  }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve report',
      error: error.message
    });
  }
};

// @desc    Create new report
// @route   POST /api/reports
exports.createReport = async (req, res) => {
  try {
    const { type, description, userId, imageUrl, incidentId } = req.body;

    if (!type || !ALLOWED_TYPES.includes(type.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Field "type" is required and must be one of: ${ALLOWED_TYPES.join(', ')}`
      });
    }

    const location = normalizeLocation(req.body);
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Valid location coordinates are required. Provide { latitude, longitude } or GeoJSON Point'
      });
    }

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId format'
      });
    }

    if (incidentId && !mongoose.Types.ObjectId.isValid(incidentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incidentId format'
      });
    }

    const report = await Report.create({
      type: type.toUpperCase(),
      description: description ? description.trim() : '',
      location,
      userId: userId || null,
      imageUrl: imageUrl || null,
      incidentId: incidentId || null
    });

    return res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: error.message
    });
  }
};

// @desc    Get corroborating evidence reports for a report
// @route   GET /api/reports/:id/corroboration
exports.getReportCorroboration = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const corroboration = await corroborationService.findCorroboratingReports(report);

    // Cache corroboration state in report
    report.corroboration = {
      matchedReportIds: corroboration.matchedReports.map((r) => r.reportId),
      corroborationCount: corroboration.corroborationCount,
      corroborationScore: corroboration.corroborationScore,
      evidenceLevel: corroboration.evidenceLevel,
      lastCheckedAt: new Date()
    };
    await report.save();

    return res.status(200).json({
      success: true,
      data: {
        reportId: report._id,
        matchedReports: corroboration.matchedReports,
        corroborationCount: corroboration.corroborationCount,
        corroborationScore: corroboration.corroborationScore,
        evidenceLevel: corroboration.evidenceLevel
      }
    });
  } catch (error) {
    console.error('Report Corroboration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve report corroboration',
      error: error.message
    });
  }
};

// @desc    Promote community report to official incident (with Evidence Fusion & Duplicate Prevention)
// @route   POST /api/reports/:id/promote
exports.promoteReportToIncident = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Duplicate promotion prevention on report itself
    if (report.incidentId) {
      return res.status(400).json({
        success: false,
        message: 'Report is already promoted to an incident',
        incidentId: report.incidentId
      });
    }

    // DUPLICATE INCIDENT PREVENTION:
    // Check whether a nearby compatible ACTIVE or VERIFIED incident already exists
    const existingMatch = await corroborationService.findMatchingActiveIncident(report);
    if (existingMatch) {
      const existingIncident = existingMatch.incident;

      // Attach new report to existing incident evidence
      const currentReportIds = (existingIncident.evidence?.reportIds || []).map((rid) => rid.toString());
      if (!currentReportIds.includes(report._id.toString())) {
        currentReportIds.push(report._id.toString());
      }

      // Recalculate evidence metrics
      const allSupportingReports = await Report.find({ _id: { $in: currentReportIds } });
      let totalScore = 0;
      let pairCount = 0;
      for (let i = 0; i < allSupportingReports.length; i++) {
        for (let j = i + 1; j < allSupportingReports.length; j++) {
          const p = corroborationService.calculatePairCorroboration(allSupportingReports[i], allSupportingReports[j]);
          totalScore += p.score;
          pairCount++;
        }
      }
      const baseScore = pairCount > 0 ? Math.round(totalScore / pairCount) : 50;
      const corroborationScore = Math.min(100, baseScore + (allSupportingReports.length > 2 ? 15 : 5));
      const evidenceLevel = corroborationService.determineEvidenceLevel(allSupportingReports.length, corroborationScore);

      existingIncident.evidence = {
        reportIds: currentReportIds,
        reportCount: allSupportingReports.length,
        corroborationScore,
        evidenceLevel
      };
      await existingIncident.save();

      // Link report to existing incident
      report.incidentId = existingIncident._id;
      report.corroboration = {
        matchedReportIds: currentReportIds.filter((rid) => rid !== report._id.toString()),
        corroborationCount: allSupportingReports.length,
        corroborationScore,
        evidenceLevel,
        lastCheckedAt: new Date()
      };
      await report.save();

      return res.status(200).json({
        success: true,
        action: 'ATTACHED_TO_EXISTING_INCIDENT',
        message: `Corroborated and attached to existing active incident (${existingIncident.title}) to prevent duplicate incident creation.`,
        data: {
          incident: existingIncident,
          report,
          action: 'ATTACHED_TO_EXISTING_INCIDENT',
          evidenceLevel
        }
      });
    }

    // NO EXISTING INCIDENT: CREATE NEW INCIDENT WITH EVIDENCE FUSION
    const ai = report.aiAnalysis || {};
    const incidentType = ai.category || report.type || 'OTHER';
    const incidentSeverity = ai.severity || 'MEDIUM';
    const incidentConfidence = typeof ai.confidence === 'number' ? ai.confidence : 0.5;

    const title = ai.summary && ai.summary.trim() !== ''
      ? ai.summary
      : `${incidentType.replace('_', ' ')}: ${report.description ? report.description.slice(0, 50) : 'Hazard on road'}`;

    const description = report.description || ai.reasoning || '';

    // Find all corroborating community reports in the area
    const corroboration = await corroborationService.findCorroboratingReports(report);
    const initialReportIds = [report._id];
    corroboration.matchedReports.forEach((m) => {
      initialReportIds.push(m.reportId);
    });

    // Create Incident with status 'ACTIVE' (NOT VERIFIED yet)
    const incident = await Incident.create({
      type: incidentType,
      title,
      description,
      location: report.location,
      severity: incidentSeverity,
      confidence: incidentConfidence,
      status: 'ACTIVE',
      evidence: {
        reportIds: initialReportIds,
        reportCount: initialReportIds.length,
        corroborationScore: corroboration.corroborationScore,
        evidenceLevel: corroboration.evidenceLevel
      }
    });

    // Link original report
    report.incidentId = incident._id;
    report.corroboration = {
      matchedReportIds: corroboration.matchedReports.map((m) => m.reportId),
      corroborationCount: corroboration.corroborationCount,
      corroborationScore: corroboration.corroborationScore,
      evidenceLevel: corroboration.evidenceLevel,
      lastCheckedAt: new Date()
    };
    await report.save();

    return res.status(201).json({
      success: true,
      action: 'CREATED_NEW_INCIDENT',
      data: {
        incident,
        report,
        action: 'CREATED_NEW_INCIDENT',
        evidenceLevel: incident.evidence.evidenceLevel
      }
    });
  } catch (error) {
    console.error('Promote Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to promote report to incident',
      error: error.message
    });
  }
};
