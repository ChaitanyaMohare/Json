/**
 * Development-only seed script for RouteGuard Hotspot Intelligence demo.
 * DO NOT run automatically in production.
 * 
 * Usage:
 *   node backend/scripts/seedHotspots.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Incident = require('../src/models/Incident');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/routeguard';

const DEMO_HOTSPOT_INCIDENTS = [
  // Cluster 1: Koramangala / Sony World Junction (Waterlogging & Road Damage) - High Risk
  {
    type: 'FLOOD',
    title: '[Demo] Severe waterlogging Sony World 80ft road',
    description: 'Stormwater backflow under pass, water level approx 2 feet',
    location: { type: 'Point', coordinates: [77.6255, 12.9348] },
    severity: 'HIGH',
    confidence: 0.94,
    status: 'ACTIVE'
  },
  {
    type: 'ROAD_DAMAGE',
    title: '[Demo] Open storm drain slab broken',
    description: 'Pedestrian and two-wheeler hazard on inner ring road',
    location: { type: 'Point', coordinates: [77.6261, 12.9355] },
    severity: 'HIGH',
    confidence: 0.89,
    status: 'VERIFIED'
  },
  {
    type: 'ROAD_BLOCK',
    title: '[Demo] Stranded city bus blocking 2 lanes',
    description: 'Engine stall due to flood water, traffic diverted',
    location: { type: 'Point', coordinates: [77.6248, 12.9342] },
    severity: 'MEDIUM',
    confidence: 0.82,
    status: 'ACTIVE'
  },

  // Cluster 2: Hebbal Flyover & Outer Ring Road (Accident & High Speed Collision) - Critical Risk
  {
    type: 'ACCIDENT',
    title: '[Demo] Multi-vehicle pileup Hebbal ramp',
    description: '3 car collision causing bumper to bumper gridlock up to Nagawara',
    location: { type: 'Point', coordinates: [77.5912, 13.0358] },
    severity: 'HIGH',
    confidence: 0.98,
    status: 'ACTIVE'
  },
  {
    type: 'ROAD_DAMAGE',
    title: '[Demo] Exposed steel expansion joint on flyover',
    description: 'Rider reported tyre burst hazard on down-ramp',
    location: { type: 'Point', coordinates: [77.5920, 13.0365] },
    severity: 'HIGH',
    confidence: 0.91,
    status: 'VERIFIED'
  },
  {
    type: 'ROAD_BLOCK',
    title: '[Demo] Highway emergency towing in progress',
    description: 'Heavy crane occupying right lane for vehicle retrieval',
    location: { type: 'Point', coordinates: [77.5908, 13.0350] },
    severity: 'MEDIUM',
    confidence: 0.85,
    status: 'ACTIVE'
  },

  // Cluster 3: Whitefield ITPL Main Road (Road Works & Damage) - Medium Risk
  {
    type: 'ROAD_DAMAGE',
    title: '[Demo] Pipelaying trench unfilled near ITPL Gate 2',
    description: 'Unpaved gravel strip across carriageway',
    location: { type: 'Point', coordinates: [77.7280, 12.9860] },
    severity: 'MEDIUM',
    confidence: 0.87,
    status: 'ACTIVE'
  },
  {
    type: 'ROAD_BLOCK',
    title: '[Demo] Barricaded metro cable maintenance',
    description: 'Temporary lane restriction for 50 meters',
    location: { type: 'Point', coordinates: [77.7292, 12.9871] },
    severity: 'LOW',
    confidence: 0.80,
    status: 'ACTIVE'
  }
];

async function seed() {
  console.log('Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected! Inserting demo hotspot incidents...');
  
  const created = await Incident.insertMany(DEMO_HOTSPOT_INCIDENTS);
  console.log(`Successfully seeded ${created.length} demo hotspot incidents!`);
  
  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = { seed, DEMO_HOTSPOT_INCIDENTS };
