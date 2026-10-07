const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Helper to determine notification priority based on report severity and type
 */
function determinePriority(severity, type, suspicious) {
  if (suspicious) return 'LOW';
  if (severity === 'HIGH' || type === 'ACCIDENT') return 'URGENT';
  if (severity === 'MEDIUM') return 'HIGH';
  return 'MEDIUM';
}

/**
 * Helper to get location label from coordinates
 */
function getLocationLabel(coordinates, description) {
  if (!coordinates || coordinates.length !== 2) {
    return 'Unknown location';
  }
  
  const [lng, lat] = coordinates;
  
  // Simple area detection (can be enhanced with reverse geocoding)
  if (description && description.toLowerCase().includes('koramangala')) return 'Koramangala';
  if (description && description.toLowerCase().includes('indiranagar')) return 'Indiranagar';
  if (description && description.toLowerCase().includes('whitefield')) return 'Whitefield';
  if (description && description.toLowerCase().includes('hebbal')) return 'Hebbal';
  if (description && description.toLowerCase().includes('jayanagar')) return 'Jayanagar';
  
  return `Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
}

/**
 * Create a notification when a new report is submitted
 */
async function createReportNotification(report) {
  try {
    // Get user info if userId is provided
    let reporterInfo = {
      name: 'Anonymous User',
      email: null,
      phone: null,
      userId: null
    };

    if (report.userId) {
      const user = await User.findById(report.userId);
      if (user) {
        reporterInfo = {
          userId: user._id,
          name: user.name || 'Anonymous User',
          email: user.email || null,
          phone: user.phone || null
        };
      }
    }

    // Extract AI analysis if available
    const aiAnalysis = report.aiAnalysis || {};
    const severity = aiAnalysis.severity || 'MEDIUM';
    const suspicious = aiAnalysis.suspicious || false;
    const confidence = aiAnalysis.confidence || 0.5;
    
    const priority = determinePriority(severity, report.type, suspicious);
    
    // Get location details
    const coordinates = report.location?.coordinates || [];
    const locationLabel = getLocationLabel(coordinates, report.description);
    
    // Build notification title
    let title = '';
    if (suspicious) {
      title = `⚠️ Suspicious Report Flagged - ${report.type.replace('_', ' ')}`;
    } else if (severity === 'HIGH') {
      title = `🚨 HIGH SEVERITY Alert - ${report.type.replace('_', ' ')}`;
    } else {
      title = `📍 New Report: ${report.type.replace('_', ' ')}`;
    }

    // Build notification message
    const message = suspicious
      ? `A potentially suspicious ${report.type.toLowerCase().replace('_', ' ')} report was submitted at ${locationLabel}. Requires admin review.`
      : `${reporterInfo.name} reported a ${severity.toLowerCase()} severity ${report.type.toLowerCase().replace('_', ' ')} at ${locationLabel}.`;

    // Create notification
    const notification = await Notification.create({
      type: 'NEW_REPORT',
      title,
      message,
      reportId: report._id,
      reporterInfo,
      reportDetails: {
        type: report.type,
        description: report.description || '',
        location: locationLabel,
        severity,
        imageUrl: report.imageUrl || null,
        coordinates: coordinates.length === 2 ? {
          latitude: coordinates[1],
          longitude: coordinates[0]
        } : null
      },
      priority,
      isRead: false
    });

    console.log(`✅ Notification created: ${notification._id} - ${title}`);
    return notification;
  } catch (error) {
    console.error('Failed to create report notification:', error);
    throw error;
  }
}

/**
 * Create notification when report is promoted to incident
 */
async function createIncidentPromotionNotification(report, incident, action) {
  try {
    const locationLabel = getLocationLabel(
      incident.location?.coordinates,
      incident.description
    );

    const title = action === 'CREATED_NEW_INCIDENT'
      ? `🎯 Report Promoted to New Incident`
      : `🔗 Report Added to Existing Incident`;

    const message = action === 'CREATED_NEW_INCIDENT'
      ? `A ${report.type.toLowerCase().replace('_', ' ')} report at ${locationLabel} has been verified and promoted to an active incident.`
      : `A ${report.type.toLowerCase().replace('_', ' ')} report has been corroborated and attached to an existing incident at ${locationLabel}.`;

    const notification = await Notification.create({
      type: 'INCIDENT_PROMOTED',
      title,
      message,
      reportId: report._id,
      incidentId: incident._id,
      reportDetails: {
        type: report.type,
        description: incident.description || report.description,
        location: locationLabel,
        severity: incident.severity,
        coordinates: incident.location?.coordinates?.length === 2 ? {
          latitude: incident.location.coordinates[1],
          longitude: incident.location.coordinates[0]
        } : null
      },
      priority: incident.severity === 'HIGH' ? 'URGENT' : 'HIGH',
      isRead: false
    });

    console.log(`✅ Incident promotion notification created: ${notification._id}`);
    return notification;
  } catch (error) {
    console.error('Failed to create incident promotion notification:', error);
    throw error;
  }
}

/**
 * Create notification when incident status changes
 */
async function createStatusChangeNotification(incident, oldStatus, newStatus) {
  try {
    const locationLabel = getLocationLabel(
      incident.location?.coordinates,
      incident.description
    );

    const statusEmoji = {
      NEW: '🆕',
      ACTIVE: '🔴',
      VERIFIED: '✅',
      RESOLVED: '✔️',
      REJECTED: '❌'
    };

    const title = `${statusEmoji[newStatus]} Incident Status Changed: ${oldStatus} → ${newStatus}`;
    const message = `${incident.title} at ${locationLabel} has been updated to ${newStatus}.`;

    const notification = await Notification.create({
      type: 'STATUS_CHANGE',
      title,
      message,
      incidentId: incident._id,
      reportDetails: {
        type: incident.type,
        description: incident.description,
        location: locationLabel,
        severity: incident.severity,
        coordinates: incident.location?.coordinates?.length === 2 ? {
          latitude: incident.location.coordinates[1],
          longitude: incident.location.coordinates[0]
        } : null
      },
      priority: newStatus === 'RESOLVED' ? 'LOW' : 'MEDIUM',
      isRead: false
    });

    console.log(`✅ Status change notification created: ${notification._id}`);
    return notification;
  } catch (error) {
    console.error('Failed to create status change notification:', error);
    throw error;
  }
}

module.exports = {
  createReportNotification,
  createIncidentPromotionNotification,
  createStatusChangeNotification
};
