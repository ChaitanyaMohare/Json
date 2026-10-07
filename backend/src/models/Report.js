const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    type: {
      type: String,
      required: [true, 'Report type is required'],
      enum: {
        values: ['ACCIDENT', 'ROAD_BLOCK', 'ROAD_DAMAGE', 'FLOOD', 'OTHER'],
        message: '{VALUE} is not a valid report type'
      }
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates [longitude, latitude] are required'],
        validate: {
          validator: function (val) {
            return (
              Array.isArray(val) &&
              val.length === 2 &&
              val[0] >= -180 &&
              val[0] <= 180 &&
              val[1] >= -90 &&
              val[1] <= 90
            );
          },
          message: 'Coordinates must be [longitude, latitude]'
        }
      }
    },
    imageUrl: {
      type: String,
      default: null,
      trim: true
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    aiAnalysis: {
      category: {
        type: String,
        enum: ['ACCIDENT', 'ROAD_BLOCK', 'ROAD_DAMAGE', 'FLOOD', 'OTHER']
      },
      severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH']
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      },
      suspicious: {
        type: Boolean,
        default: false
      },
      suspicionScore: {
        type: Number,
        min: 0,
        max: 1
      },
      summary: {
        type: String
      },
      reasoning: {
        type: String
      },
      analyzedAt: {
        type: Date
      }
    },
    corroboration: {
      matchedReportIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Report'
        }
      ],
      corroborationCount: {
        type: Number,
        default: 0
      },
      corroborationScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      evidenceLevel: {
        type: String,
        enum: ['ISOLATED', 'CORROBORATED', 'STRONGLY_CORROBORATED'],
        default: 'ISOLATED'
      },
      lastCheckedAt: {
        type: Date,
        default: Date.now
      }
    }
  }
);

ReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', ReportSchema);
