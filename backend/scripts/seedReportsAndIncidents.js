/**
 * Seed Script: Populate RouteGuard with realistic demo reports & incidents
 * Usage: node backend/scripts/seedReportsAndIncidents.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Report = require('../src/models/Report');
const Incident = require('../src/models/Incident');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/routeguard';

// Bengaluru coordinates for realistic locations
const LOCATIONS = {
  koramangala: { lat: 12.9352, lng: 77.6245 },
  indiranagar: { lat: 12.9716, lng: 77.6412 },
  whitefield: { lat: 12.9698, lng: 77.7499 },
  hebbal: { lat: 13.0358, lng: 77.5971 },
  mgRoad: { lat: 12.9750, lng: 77.6060 },
  jayanagar: { lat: 12.9250, lng: 77.5838 },
  electronic_city: { lat: 12.8456, lng: 77.6603 },
  marathahalli: { lat: 12.9591, lng: 77.6974 }
};

// Generate random offset for clustering reports
const addOffset = (lat, lng, maxMeters = 300) => {
  const metersToLatDeg = 1 / 111000;
  const metersToLngDeg = 1 / (111000 * Math.cos(lat * Math.PI / 180));
  const offsetLat = (Math.random() - 0.5) * 2 * maxMeters * metersToLatDeg;
  const offsetLng = (Math.random() - 0.5) * 2 * maxMeters * metersToLngDeg;
  return { lat: lat + offsetLat, lng: lng + offsetLng };
};

// Time offset helper (hours ago)
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);

const DEMO_REPORTS = [
  // Cluster 1: Koramangala Pothole Crisis (3 reports, STRONGLY_CORROBORATED)
  {
    type: 'ROAD_DAMAGE',
    description: 'Massive pothole on 80 Feet Road near Sony World signal. Almost fell off my bike!',
    location: addOffset(LOCATIONS.koramangala.lat, LOCATIONS.koramangala.lng, 50),
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400',
    createdAt: hoursAgo(2),
    aiAnalysis: {
      category: 'ROAD_DAMAGE',
      severity: 'HIGH',
      confidence: 0.94,
      suspicious: false,
      suspicionScore: 0.05,
      summary: 'Large pothole causing safety hazard',
      reasoning: 'Clear description of road damage with specific location details',
      analyzedAt: hoursAgo(2)
    }
  },
  {
    type: 'ROAD_DAMAGE',
    description: 'Huge crater near Sony World junction. Water filled. Very dangerous at night.',
    location: addOffset(LOCATIONS.koramangala.lat, LOCATIONS.koramangala.lng, 80),
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=400',
    createdAt: hoursAgo(3),
    aiAnalysis: {
      category: 'ROAD_DAMAGE',
      severity: 'HIGH',
      confidence: 0.91,
      suspicious: false,
      suspicionScore: 0.08,
      summary: 'Deep water-filled pothole hazard',
      reasoning: 'Multiple hazard indicators: depth, water accumulation, visibility concern',
      analyzedAt: hoursAgo(3)
    }
  },
  {
    type: 'ROAD_DAMAGE',
    description: 'Road completely damaged. Multiple potholes in a row.',
    location: addOffset(LOCATIONS.koramangala.lat, LOCATIONS.koramangala.lng, 120),
    imageUrl: null,
    createdAt: hoursAgo(4),
    aiAnalysis: {
      category: 'ROAD_DAMAGE',
      severity: 'MEDIUM',
      confidence: 0.85,
      suspicious: false,
      suspicionScore: 0.12,
      summary: 'Multiple potholes in sequence',
      reasoning: 'General description, moderate confidence due to lack of specifics',
      analyzedAt: hoursAgo(4)
    }
  },

  // Cluster 2: Indiranagar Accident (2 reports, CORROBORATED)
  {
    type: 'ACCIDENT',
    description: 'Two-wheeler accident at 100 Feet Road - CMH Road junction. Rider injured, ambulance called.',
    location: addOffset(LOCATIONS.indiranagar.lat, LOCATIONS.indiranagar.lng, 30),
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400',
    createdAt: hoursAgo(1),
    aiAnalysis: {
      category: 'ACCIDENT',
      severity: 'HIGH',
      confidence: 0.96,
      suspicious: false,
      suspicionScore: 0.03,
      summary: 'Motorcycle accident with injury at major junction',
      reasoning: 'Detailed incident report with injury confirmation and emergency response',
      analyzedAt: hoursAgo(1)
    }
  },
  {
    type: 'ACCIDENT',
    description: 'Saw bike accident near CMH Road. Traffic is building up.',
    location: addOffset(LOCATIONS.indiranagar.lat, LOCATIONS.indiranagar.lng, 60),
    imageUrl: null,
    createdAt: hoursAgo(1.5),
    aiAnalysis: {
      category: 'ACCIDENT',
      severity: 'MEDIUM',
      confidence: 0.82,
      suspicious: false,
      suspicionScore: 0.15,
      summary: 'Motorcycle accident causing traffic congestion',
      reasoning: 'Witness report with traffic impact mentioned',
      analyzedAt: hoursAgo(1.5)
    }
  },

  // Cluster 3: Whitefield Flooding (3 reports, STRONGLY_CORROBORATED)
  {
    type: 'FLOOD',
    description: 'ITPL Main Road completely waterlogged after rain. Water level knee-deep. Avoid this route!',
    location: addOffset(LOCATIONS.whitefield.lat, LOCATIONS.whitefield.lng, 40),
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400',
    createdAt: hoursAgo(0.5),
    aiAnalysis: {
      category: 'FLOOD',
      severity: 'HIGH',
      confidence: 0.97,
      suspicious: false,
      suspicionScore: 0.02,
      summary: 'Severe flooding with knee-deep water on main road',
      reasoning: 'Clear flood description with depth measurement and route advisory',
      analyzedAt: hoursAgo(0.5)
    }
  },
  {
    type: 'FLOOD',
    description: 'Heavy waterlogging near ITPL. Cars getting stuck. Please take alternate route.',
    location: addOffset(LOCATIONS.whitefield.lat, LOCATIONS.whitefield.lng, 70),
    imageUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
    createdAt: hoursAgo(1),
    aiAnalysis: {
      category: 'FLOOD',
      severity: 'HIGH',
      confidence: 0.93,
      suspicious: false,
      suspicionScore: 0.04,
      summary: 'Severe waterlogging causing vehicle entrapment',
      reasoning: 'High severity due to vehicle stalling reports',
      analyzedAt: hoursAgo(1)
    }
  },
  {
    type: 'FLOOD',
    description: 'Road flooded near Whitefield. Cannot pass.',
    location: addOffset(LOCATIONS.whitefield.lat, LOCATIONS.whitefield.lng, 100),
    imageUrl: null,
    createdAt: hoursAgo(1.2),
    aiAnalysis: {
      category: 'FLOOD',
      severity: 'MEDIUM',
      confidence: 0.88,
      suspicious: false,
      suspicionScore: 0.10,
      summary: 'Road flooding blocking passage',
      reasoning: 'Brief flood report with passage obstruction',
      analyzedAt: hoursAgo(1.2)
    }
  },

  // Isolated Report 4: Hebbal Road Block
  {
    type: 'ROAD_BLOCK',
    description: 'Fallen tree blocking left lane on Hebbal Flyover after storm. BBMP workers on site.',
    location: { lat: LOCATIONS.hebbal.lat, lng: LOCATIONS.hebbal.lng },
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=400',
    createdAt: hoursAgo(6),
    aiAnalysis: {
      category: 'ROAD_BLOCK',
      severity: 'MEDIUM',
      confidence: 0.89,
      suspicious: false,
      suspicionScore: 0.08,
      summary: 'Tree fall blocking traffic lane with cleanup in progress',
      reasoning: 'Obstruction report with authority response mentioned',
      analyzedAt: hoursAgo(6)
    }
  },

  // Isolated Report 5: MG Road Traffic Jam
  {
    type: 'OTHER',
    description: 'Heavy traffic jam on MG Road due to VIP movement. Expect 30+ min delay.',
    location: { lat: LOCATIONS.mgRoad.lat, lng: LOCATIONS.mgRoad.lng },
    imageUrl: null,
    createdAt: hoursAgo(0.3),
    aiAnalysis: {
      category: 'OTHER',
      severity: 'LOW',
      confidence: 0.75,
      suspicious: false,
      suspicionScore: 0.20,
      summary: 'Traffic congestion due to VIP convoy',
      reasoning: 'Temporary traffic condition, low severity',
      analyzedAt: hoursAgo(0.3)
    }
  },

  // Cluster 4: Jayanagar Road Damage (2 reports, CORROBORATED)
  {
    type: 'ROAD_DAMAGE',
    description: 'Open manhole on 4th Block Main Road. No warning sign. Extremely dangerous!',
    location: addOffset(LOCATIONS.jayanagar.lat, LOCATIONS.jayanagar.lng, 40),
    imageUrl: 'https://images.unsplash.com/photo-1572981547616-ee2d2cb4684b?w=400',
    createdAt: hoursAgo(12),
    aiAnalysis: {
      category: 'ROAD_DAMAGE',
      severity: 'HIGH',
      confidence: 0.95,
      suspicious: false,
      suspicionScore: 0.03,
      summary: 'Uncovered manhole posing severe safety risk',
      reasoning: 'Critical infrastructure hazard with no safety measures',
      analyzedAt: hoursAgo(12)
    }
  },
  {
    type: 'ROAD_DAMAGE',
    description: 'Broken road near Jayanagar 4th Block. Manhole cover missing.',
    location: addOffset(LOCATIONS.jayanagar.lat, LOCATIONS.jayanagar.lng, 60),
    imageUrl: null,
    createdAt: hoursAgo(15),
    aiAnalysis: {
      category: 'ROAD_DAMAGE',
      severity: 'HIGH',
      confidence: 0.90,
      suspicious: false,
      suspicionScore: 0.07,
      summary: 'Missing manhole cover on main road',
      reasoning: 'Infrastructure failure with high safety risk',
      analyzedAt: hoursAgo(15)
    }
  },

  // Isolated Report 6: Electronic City
  {
    type: 'ACCIDENT',
    description: 'Minor fender bender near Infosys Gate. No injuries. Traffic moving slowly.',
    location: { lat: LOCATIONS.electronic_city.lat, lng: LOCATIONS.electronic_city.lng },
    imageUrl: null,
    createdAt: hoursAgo(8),
    aiAnalysis: {
      category: 'ACCIDENT',
      severity: 'LOW',
      confidence: 0.80,
      suspicious: false,
      suspicionScore: 0.15,
      summary: 'Minor vehicle collision without casualties',
      reasoning: 'Low impact accident with no significant consequences',
      analyzedAt: hoursAgo(8)
    }
  },

  // Suspicious Report (should be flagged)
  {
    type: 'OTHER',
    description: 'Test test fake accident lol',
    location: { lat: LOCATIONS.marathahalli.lat, lng: LOCATIONS.marathahalli.lng },
    imageUrl: null,
    createdAt: hoursAgo(0.1),
    aiAnalysis: {
      category: 'OTHER',
      severity: 'LOW',
      confidence: 0.25,
      suspicious: true,
      suspicionScore: 0.92,
      summary: 'Potentially fraudulent report',
      reasoning: 'Contains spam indicators: "test", "fake", informal language',
      analyzedAt: hoursAgo(0.1)
    }
  }
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB!\n');

    // Clear existing data
    console.log('🗑️  Clearing existing reports and incidents...');
    await Report.deleteMany({});
    await Incident.deleteMany({});
    console.log('✅ Database cleared!\n');

    // Insert reports
    console.log('📝 Creating demo reports...');
    const createdReports = await Report.insertMany(
      DEMO_REPORTS.map(r => ({
        ...r,
        location: {
          type: 'Point',
          coordinates: [r.location.lng, r.location.lat]
        }
      }))
    );
    console.log(`✅ Created ${createdReports.length} demo reports!\n`);

    // Auto-promote corroborated reports to incidents
    console.log('🔄 Auto-promoting high-confidence reports to incidents...');
    
    // Promote the first report from each cluster
    const reportsToPromote = [
      createdReports[0],  // Koramangala pothole
      createdReports[3],  // Indiranagar accident
      createdReports[5],  // Whitefield flood
      createdReports[8],  // Hebbal road block
      createdReports[10], // Jayanagar manhole
    ];

    let incidentCount = 0;
    for (const report of reportsToPromote) {
      const ai = report.aiAnalysis || {};
      const incident = await Incident.create({
        type: report.type,
        title: ai.summary || `${report.type}: ${report.description.slice(0, 50)}`,
        description: report.description,
        location: report.location,
        severity: ai.severity || 'MEDIUM',
        confidence: ai.confidence || 0.75,
        status: 'ACTIVE',
        evidence: {
          reportIds: [report._id],
          reportCount: 1,
          corroborationScore: 50,
          evidenceLevel: 'ISOLATED'
        }
      });

      // Link report to incident
      report.incidentId = incident._id;
      await report.save();

      incidentCount++;
    }
    console.log(`✅ Created ${incidentCount} incidents from reports!\n`);

    // Summary
    const totalReports = await Report.countDocuments();
    const totalIncidents = await Incident.countDocuments();
    const activeIncidents = await Incident.countDocuments({ status: { $in: ['NEW', 'ACTIVE'] } });
    const suspiciousReports = await Report.countDocuments({ 'aiAnalysis.suspicious': true });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ SEED COMPLETED SUCCESSFULLY! ✨');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Total Reports:       ${totalReports}`);
    console.log(`🚨 Total Incidents:     ${totalIncidents}`);
    console.log(`⚠️  Active Incidents:    ${activeIncidents}`);
    console.log(`🔍 Suspicious Reports:  ${suspiciousReports}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Open your web dashboard at: http://localhost:3000');
    console.log('🔧 API running at: http://localhost:5000');
    console.log('\nYou can now test:');
    console.log('  • Dashboard KPIs and analytics');
    console.log('  • Interactive map with incident markers');
    console.log('  • Report corroboration engine');
    console.log('  • Incident management workflow');
    console.log('  • AI spam detection');

    await mongoose.disconnect();
    console.log('\n✅ MongoDB connection closed.');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed, DEMO_REPORTS };
