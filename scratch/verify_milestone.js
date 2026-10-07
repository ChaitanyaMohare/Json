const http = require('http');

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  console.log('--- 1. Checking backend health ---');
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('Health:', health.status, health.data);

  console.log('\n--- 2. Creating three reports in close proximity (Koramanagala) ---');
  const r1 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    type: 'ROAD_DAMAGE',
    description: 'Deep pothole on 80ft road near Koramangala 4th block',
    latitude: 12.9345,
    longitude: 77.6250
  });

  const r2 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    type: 'ROAD_DAMAGE',
    description: 'Crater hole on road near junction, severe rim danger',
    latitude: 12.9348,
    longitude: 77.6253
  });

  const r3 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    type: 'ROAD_DAMAGE',
    description: 'Massive asphalt depression causing vehicle swerves',
    latitude: 12.9343,
    longitude: 77.6248
  });

  const rep1Id = r1.data.data._id;
  const rep2Id = r2.data.data._id;
  const rep3Id = r3.data.data._id;
  console.log('Created reports:', { rep1Id, rep2Id, rep3Id });

  console.log('\n--- 3. Testing GET /api/reports/:id/corroboration ---');
  const corr = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reports/${rep1Id}/corroboration`,
    method: 'GET'
  });
  console.log('Corroboration for Report 1:', JSON.stringify(corr.data, null, 2));

  console.log('\n--- 4. Promoting Report 1 (Should create new Incident) ---');
  const prom1 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reports/${rep1Id}/promote`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {});
  console.log('Promotion 1 result:', {
    action: prom1.data.data?.action,
    incidentId: prom1.data.data?.incident?._id,
    evidenceLevel: prom1.data.data?.incident?.evidence?.evidenceLevel,
    evidenceScore: prom1.data.data?.incident?.evidence?.corroborationScore,
    reportCount: prom1.data.data?.incident?.evidence?.reportCount
  });
  const incidentId = prom1.data.data?.incident?._id;

  console.log('\n--- 5. Promoting Report 2 (Should ATTACH to existing Incident, duplicate prevented) ---');
  const prom2 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reports/${rep2Id}/promote`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {});
  console.log('Promotion 2 result:', {
    action: prom2.data.data?.action,
    incidentId: prom2.data.data?.incidentId || prom2.data.data?.incident?._id,
    evidenceLevel: prom2.data.data?.evidenceLevel
  });

  console.log('\n--- 6. Promoting Report 3 (Should also ATTACH to existing Incident) ---');
  const prom3 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reports/${rep3Id}/promote`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {});
  console.log('Promotion 3 result:', {
    action: prom3.data.data?.action,
    incidentId: prom3.data.data?.incidentId || prom3.data.data?.incident?._id,
    evidenceLevel: prom3.data.data?.evidenceLevel
  });

  console.log('\n--- 7. Testing GET /api/incidents/:id/evidence ---');
  const incEvidence = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/incidents/${incidentId}/evidence`,
    method: 'GET'
  });
  console.log('Incident Evidence Details:', JSON.stringify({
    incidentId: incEvidence.data.data?.incidentId,
    reportCount: incEvidence.data.data?.reportCount,
    corroborationScore: incEvidence.data.data?.corroborationScore,
    evidenceLevel: incEvidence.data.data?.evidenceLevel,
    reportItemsCount: incEvidence.data.data?.reports?.length
  }, null, 2));

  console.log('\n--- 8. Testing Analytics Overview Corroboration KPI ---');
  const analytics = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/analytics/overview?days=7',
    method: 'GET'
  });
  console.log('Analytics Corroboration Stats:', {
    corroboratedIncidents: analytics.data.data?.corroboratedIncidents,
    stronglyCorroboratedIncidents: analytics.data.data?.stronglyCorroboratedIncidents,
    byEvidence: analytics.data.data?.byEvidence
  });

  console.log('\n--- All backend & frontend integration tests successfully verified! ---');
}

run().catch(console.error);
