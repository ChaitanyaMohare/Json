const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Incident type is required'],
      enum: {
        values: ['ACCIDENT', 'ROAD_BLOCK', 'ROAD_DAMAGE', 'FLOOD', 'OTHER'],
        message: '{VALUE} is not a valid incident type'
      }
    },
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true
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
    severity: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH'],
        message: '{VALUE} is not a valid severity'
      },
      default: 'MEDIUM'
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence must be at least 0'],
      max: [1, 'Confidence cannot exceed 1'],
      default: 1
    },
    status: {
      type: String,
      enum: {
        values: ['NEW', 'ACTIVE', 'VERIFIED', 'RESOLVED', 'REJECTED'],
        message: '{VALUE} is not a valid status'
      },
      default: 'NEW'
    },
    evidence: {
      reportIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Report'
        }
      ],
      reportCount: {
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
      }
    }
  },
  {
    timestamps: true
  }
);

IncidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Incident', IncidentSchema);
