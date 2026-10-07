const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['NEW_REPORT', 'INCIDENT_PROMOTED', 'STATUS_CHANGE', 'HIGH_SEVERITY_ALERT'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      default: null
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null
    },
    reporterInfo: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      name: {
        type: String,
        default: 'Anonymous User'
      },
      email: {
        type: String,
        default: null
      },
      phone: {
        type: String,
        default: null
      }
    },
    reportDetails: {
      type: {
        type: String,
        enum: ['ACCIDENT', 'ROAD_BLOCK', 'ROAD_DAMAGE', 'FLOOD', 'OTHER']
      },
      description: String,
      location: String,
      severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH']
      },
      imageUrl: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for fast unread queries
NotificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
