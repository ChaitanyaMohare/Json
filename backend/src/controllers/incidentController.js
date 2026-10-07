const mongoose = require('mongoose');
const Incident = require('../models/Incident');
const Report = require('../models/Report');
const corroborationService = require('../services/corroborationService');

const ALLOWED_TYPES = ['ACCIDENT', 'ROAD_BLOCK', 'ROAD_DAMAGE', 'FLOOD', 'OTHER'];
const ALLOWED_STATUSES = ['NEW', 'ACTIVE', 'VERIFIED', 'RESOLVED', 'REJECTED'];
const ALLOWED_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH'];

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

// @desc    Get all incidents with optional filters
// @route   GET /api/incidents
exports.getIncidents = async (req, res) => {
  try {
    const filter = {};
    const { type, severity, status } = req.query;

    if (type) {
      if (!ALLOWED_TYPES.includes(type.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid type filter. Allowed: ${ALLOWED_TYPES.join(', ')}`
        });
      }
      filter.type = type.toUpperCase();
    }

    if (severity) {
      if (!ALLOWED_SEVERITIES.includes(severity.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid severity filter. Allowed: ${ALLOWED_SEVERITIES.join(', ')}`
        });
      }
      filter.severity = severity.toUpperCase();
    }

    if (status) {
      if (!ALLOWED_STATUSES.includes(status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Allowed: ${ALLOWED_STATUSES.join(', ')}`
        });
      }
      filter.status = status.toUpperCase();
    }

    const incidents = await Incident.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve incidents',
      error: error.message
    });
  }
};

// @desc    Get nearby incidents using geospatial query
// @route   GET /api/incidents/nearby
exports.getNearbyIncidents = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Query parameters "latitude" and "longitude" are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const maxDistanceInMeters = radius !== undefined ? parseFloat(radius) : 5000;

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude (-90 to 90)'
      });
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid longitude (-180 to 180)'
      });
    }

    if (isNaN(maxDistanceInMeters) || maxDistanceInMeters <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Radius must be a positive number in meters'
      });
    }

    const incidents = await Incident.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistanceInMeters
        }
      }
    });

    return res.status(200).json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve nearby incidents',
      error: error.message
    });
  }
};

// @desc    Get single incident by ID
// @route   GET /api/incidents/:id
exports.getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incident ID format'
      });
    }

    const incident = await Incident.findById(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve incident',
      error: error.message
    });
  }
};

// @desc    Create new incident
// @route   POST /api/incidents
exports.createIncident = async (req, res) => {
  try {
    const { title, type, description, severity, confidence, status } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Field "title" is required'
      });
    }

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
        message: 'Valid location is required. Provide GeoJSON { location: { type: "Point", coordinates: [lng, lat] } } or { latitude, longitude }'
      });
    }

    let parsedSeverity = 'MEDIUM';
    if (severity) {
      if (!ALLOWED_SEVERITIES.includes(severity.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid severity. Allowed: ${ALLOWED_SEVERITIES.join(', ')}`
        });
      }
      parsedSeverity = severity.toUpperCase();
    }

    let parsedStatus = 'NEW';
    if (status) {
      if (!ALLOWED_STATUSES.includes(status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`
        });
      }
      parsedStatus = status.toUpperCase();
    }

    let parsedConfidence = 1;
    if (confidence !== undefined) {
      const confNum = parseFloat(confidence);
      if (isNaN(confNum) || confNum < 0 || confNum > 1) {
        return res.status(400).json({
          success: false,
          message: 'Confidence must be a number between 0 and 1'
        });
      }
      parsedConfidence = confNum;
    }

    const incident = await Incident.create({
      title: title.trim(),
      type: type.toUpperCase(),
      description: description ? description.trim() : '',
      location,
      severity: parsedSeverity,
      confidence: parsedConfidence,
      status: parsedStatus
    });

    return res.status(201).json({
      success: true,
      data: incident
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create incident',
      error: error.message
    });
  }
};

// @desc    Update incident status
// @route   PATCH /api/incidents/:id/status
exports.updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incident ID format'
      });
    }

    if (!status || !ALLOWED_STATUSES.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Field "status" is required and must be one of: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const updatedIncident = await Incident.findByIdAndUpdate(
      id,
      { status: status.toUpperCase() },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedIncident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedIncident
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update incident status',
      error: error.message
    });
  }
};

// @desc    Get supporting evidence reports for an incident
// @route   GET /api/incidents/:id/evidence
exports.getIncidentEvidence = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid incident ID format'
      });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    // Collect all supporting reports (either stored in evidence.reportIds or having incidentId)
    const reportIdsFromInc = incident.evidence?.reportIds || [];
    const directReports = await Report.find({
      $or: [
        { _id: { $in: reportIdsFromInc } },
        { incidentId: incident._id }
      ]
    }).sort({ createdAt: -1 }).lean();

    const formattedReports = directReports.map((r) => {
      const distance = corroborationService.calculateHaversineDistanceMeters(
        r.location?.coordinates,
        incident.location?.coordinates
      );
      const timeDiffMinutes = Math.round(
        Math.abs(new Date(r.createdAt).getTime() - new Date(incident.createdAt).getTime()) / (60 * 1000)
      );

      const pair = corroborationService.calculatePairCorroboration(
        {
          location: incident.location,
          type: incident.type,
          createdAt: incident.createdAt,
          description: incident.description
        },
        r
      );

      return {
        reportId: r._id.toString(),
        type: r.type,
        description: r.description,
        location: r.location,
        imageUrl: r.imageUrl,
        createdAt: r.createdAt,
        distanceMeters: distance,
        timeDifferenceMinutes: timeDiffMinutes,
        score: pair.score,
        aiAnalysis: r.aiAnalysis
      };
    });

    const reportCount = Math.max(incident.evidence?.reportCount || 0, formattedReports.length);
    const corroborationScore = incident.evidence?.corroborationScore || (reportCount >= 3 ? 85 : reportCount >= 2 ? 65 : 0);
    const evidenceLevel = incident.evidence?.evidenceLevel || corroborationService.determineEvidenceLevel(reportCount, corroborationScore);

    return res.status(200).json({
      success: true,
      data: {
        incidentId: incident._id,
        reportCount,
        corroborationScore,
        evidenceLevel,
        reports: formattedReports
      }
    });
  } catch (error) {
    console.error('Incident Evidence Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve incident evidence',
      error: error.message
    });
  }
};

