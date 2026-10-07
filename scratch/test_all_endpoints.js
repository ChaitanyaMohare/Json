const http = require('http');
const mongoose = require('mongoose');
const app = require('../backend/src/app');

async function testAll() {
  console.log('Connecting to database...');
  await mongoose.connect('mongodb://127.0.0.1:27017/routeguard');
  console.log('MongoDB connected.');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(5099, resolve));
  console.log('Test server listening on port 5099.\n');

  function req(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5099,
        path,
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {}
      };
      const r = http.request(options, res => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      });
      r.on('error', reject);
      if (body) r.write(JSON.stringify(body));
      r.end();
    });
  }

  const results = [];

  // 1. Health
  console.log('1. Testing GET /api/health...');
  const health = await req('GET', '/api/health');
  results.push({ test: 'Health Check', pass: health.status === 200 && health.data.status === 'ok', details: health.data });

  // 2. Submit Report
  console.log('2. Testing POST /api/reports...');
  const newReport = await req('POST', '/api/reports', {
    type: 'ACCIDENT',
    description: 'Collision near Indiranagar 100ft road between bike and cab',
    latitude: 12.9716,
    longitude: 77.6412
  });
  const reportId = newReport.data?.data?._id;
  results.push({ test: 'Create Report', pass: newReport.status === 201 && !!reportId, reportId });

  // 3. Get Reports
  console.log('3. Testing GET /api/reports...');
  const allReports = await req('GET', '/api/reports');
  results.push({ test: 'Get All Reports', pass: allReports.status === 200 && Array.isArray(allReports.data?.data) });

  // 4. Get Report by ID
  console.log('4. Testing GET /api/reports/:id...');
  const singleReport = await req('GET', `/api/reports/${reportId}`);
  results.push({ test: 'Get Report By ID', pass: singleReport.status === 200 && singleReport.data?.data?._id === reportId });

  // 5. AI Analyze Report
  console.log('5. Testing POST /api/ai/analyze-report...');
  const aiRes = await req('POST', '/api/ai/analyze-report', {
    reportId: reportId,
    description: 'Severe multi-vehicle crash blocking two lanes',
    type: 'ACCIDENT'
  });
  results.push({ test: 'AI Analysis', pass: aiRes.status === 200 && aiRes.data?.data?.category === 'ACCIDENT', ai: aiRes.data?.data });

  // 6. Corroboration for Report
  console.log('6. Testing GET /api/reports/:id/corroboration...');
  const corr = await req('GET', `/api/reports/${reportId}/corroboration`);
  results.push({ test: 'Corroboration Engine', pass: corr.status === 200 && corr.data?.data?.corroborationScore !== undefined });

  // 7. Promote Report to Incident
  console.log('7. Testing POST /api/reports/:id/promote...');
  const promote = await req('POST', `/api/reports/${reportId}/promote`);
  const incidentId = promote.data?.data?.incident?._id;
  results.push({ test: 'Promote Report to Incident', pass: (promote.status === 201 || promote.status === 200) && !!incidentId, incidentId });

  // 8. Get All Incidents
  console.log('8. Testing GET /api/incidents...');
  const incidents = await req('GET', '/api/incidents');
  results.push({ test: 'Get Incidents', pass: incidents.status === 200 && Array.isArray(incidents.data?.data) });

  // 9. Get Nearby Incidents (Geospatial)
  console.log('9. Testing GET /api/incidents/nearby...');
  const nearby = await req('GET', '/api/incidents/nearby?latitude=12.9716&longitude=77.6412&radius=5000');
  results.push({ test: 'Nearby Incidents (Geospatial)', pass: nearby.status === 200 && nearby.data?.count >= 1, count: nearby.data?.count });

  // 10. Get Incident by ID
  console.log('10. Testing GET /api/incidents/:id...');
  const singleInc = await req('GET', `/api/incidents/${incidentId}`);
  results.push({ test: 'Get Incident By ID', pass: singleInc.status === 200 && singleInc.data?.data?._id === incidentId });

  // 11. Update Incident Status
  console.log('11. Testing PATCH /api/incidents/:id/status...');
  const updateStatus = await req('PATCH', `/api/incidents/${incidentId}/status`, { status: 'VERIFIED' });
  results.push({ test: 'Update Incident Status', pass: updateStatus.status === 200 && updateStatus.data?.data?.status === 'VERIFIED' });

  // 12. Incident Evidence
  console.log('12. Testing GET /api/incidents/:id/evidence...');
  const evidence = await req('GET', `/api/incidents/${incidentId}/evidence`);
  results.push({ test: 'Get Incident Evidence', pass: evidence.status === 200 && evidence.data?.data?.incidentId === incidentId });

  // 13. Analytics Overview
  console.log('13. Testing GET /api/analytics/overview...');
  const analyticsOverview = await req('GET', '/api/analytics/overview?days=7');
  results.push({ test: 'Analytics Overview', pass: analyticsOverview.status === 200 && analyticsOverview.data?.data?.totalIncidents !== undefined });

  // 14. Analytics Hotspots
  console.log('14. Testing GET /api/analytics/hotspots...');
  const hotspots = await req('GET', '/api/analytics/hotspots?days=7');
  results.push({ test: 'Analytics Hotspots', pass: hotspots.status === 200 && Array.isArray(hotspots.data?.data) });

  console.log('\n================ TEST SUMMARY ================');
  let allPassed = true;
  for (const r of results) {
    console.log(`${r.pass ? '✅ PASS' : '❌ FAIL'} | ${r.test}`);
    if (!r.pass) allPassed = false;
  }
  console.log('==============================================');
  console.log(allPassed ? 'ALL BACKEND FUNCTIONS OPERATING PERFECTLY!' : 'SOME TESTS FAILED.');

  await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect();
  process.exit(allPassed ? 0 : 1);
}

testAll().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
