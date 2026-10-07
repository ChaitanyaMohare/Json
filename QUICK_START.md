# 🚀 Waysure Project - Quick Start Guide

## ✅ Current Status

Both backend and frontend are **RUNNING** and **WORKING PERFECTLY**!

### Services Running
- 🌐 **Web Dashboard**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:5000
- 💾 **MongoDB**: Running on port 27017

### Database Status
- 📊 **Reports**: 14 (including 1 suspicious)
- 🚨 **Incidents**: 5 active incidents
- 🗺️ **Locations**: Realistic Bengaluru coordinates
- 🕐 **Time Range**: Reports from last 15 hours

---

## 🎯 Demo Data Overview

### Report Clusters (for testing corroboration):

1. **Koramangala Pothole** (3 reports - STRONGLY_CORROBORATED)
   - High severity road damage
   - Multiple users reporting same issue
   - Within 300m radius

2. **Indiranagar Accident** (2 reports - CORROBORATED)
   - Two-wheeler accident with injuries
   - Traffic congestion reported
   - Within 100m radius

3. **Whitefield Flooding** (3 reports - STRONGLY_CORROBORATED)
   - Knee-deep water on ITPL Main Road
   - Multiple vehicle stalling reports
   - High severity flood

4. **Jayanagar Manhole** (2 reports - CORROBORATED)
   - Uncovered manhole hazard
   - No warning signs
   - Critical safety issue

5. **Isolated Reports**:
   - Hebbal tree fall (road block)
   - MG Road traffic jam (VIP movement)
   - Electronic City fender bender
   - **Marathahalli SPAM** (flagged as suspicious)

---

## 🧪 Testing Scenarios

### 1. View Dashboard
Open: http://localhost:3000

**What you'll see:**
- 7 KPI metric cards with live data
- Interactive map with incident markers
- Recent incidents carousel
- Risk assessment cards
- Incident distribution donut chart

### 2. View Incidents
Navigate to: **Admin → Incidents**

**Features to test:**
- Filter by type (Accident, Road Block, Road Damage, Flood)
- Filter by severity (High, Medium, Low)
- Filter by status (Active, Verified, Resolved)
- Click any incident to see details

### 3. View Reports
Navigate to: **Admin → Reports**

**What to look for:**
- 14 community reports
- AI analysis fields (confidence, severity)
- Suspicious report flagged
- Photo attachments on some reports

### 4. Analytics Dashboard
Navigate to: **Admin → Analytics**

**Key metrics:**
- Total hazards: 5
- Crowd reports: 14
- Suspicious reports: 1
- Time-range toggle (7/14/30 days)

### 5. Map View
Navigate to: **Admin → Map View**

**Interactive features:**
- Incident markers clustered by location
- Click markers to see details
- Real-time incident counter
- Refresh button

---

## 🔧 API Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get All Incidents
```bash
curl http://localhost:5000/api/incidents
```

### Get Reports
```bash
curl http://localhost:5000/api/reports
```

### Analytics Overview
```bash
curl http://localhost:5000/api/analytics/overview
```

### Nearby Incidents (Geospatial Query)
```bash
curl "http://localhost:5000/api/incidents/nearby?latitude=12.9352&longitude=77.6245&radius=5000"
```

### Get Hotspots
```bash
curl http://localhost:5000/api/analytics/hotspots?days=7
```

---

## 🎨 Key Features Demonstrated

### 1. AI Analysis
- Every report has AI analysis with:
  - Category classification
  - Severity assessment
  - Confidence score (0-1)
  - Spam detection
  - Summary generation

### 2. Corroboration Engine
- Reports within 500m are automatically matched
- Time window: 24 hours
- Scoring based on distance, time, and category
- Evidence levels: ISOLATED → CORROBORATED → STRONGLY_CORROBORATED

### 3. Geospatial Queries
- MongoDB 2dsphere indexes enabled
- Fast nearby incident searches
- Radius-based filtering
- Coordinate-based clustering

### 4. Admin Dashboard
- Real-time KPI tracking
- Interactive data visualization
- Advanced filtering capabilities
- Professional UI/UX with Tailwind CSS

---

## 🔄 Re-seed Database

If you want to reset the demo data:

```bash
cd backend
node scripts/seedReportsAndIncidents.js
```

This will:
1. Clear all existing reports and incidents
2. Create 14 new demo reports
3. Auto-promote 5 reports to incidents
4. Display summary statistics

---

## 📱 Mobile App Integration

The mobile app (in `/mobile` folder) can:
- Submit new reports to the API
- View nearby incidents
- Upload photos with reports
- Track user location

**Note**: Mobile app needs separate setup with Expo.

---

## 🛠️ Troubleshooting

### Backend not responding?
```bash
# Check if process is running
Get-Process node

# Restart backend
cd backend
npm run dev
```

### Frontend not loading?
```bash
# Restart Next.js
cd web
npm run dev
```

### MongoDB connection issues?
```bash
# Check MongoDB service
Get-Service MongoDB

# Start MongoDB if stopped
Start-Service MongoDB
```

### Port conflicts?
- Backend uses: **5000**
- Frontend uses: **3000**
- MongoDB uses: **27017**

---

## 📊 Database Schema

### Report Document
```javascript
{
  type: 'ACCIDENT' | 'ROAD_BLOCK' | 'ROAD_DAMAGE' | 'FLOOD' | 'OTHER',
  description: String,
  location: { type: 'Point', coordinates: [lng, lat] },
  imageUrl: String (optional),
  incidentId: ObjectId (if promoted),
  aiAnalysis: {
    category, severity, confidence,
    suspicious, suspicionScore,
    summary, reasoning
  },
  createdAt: Date
}
```

### Incident Document
```javascript
{
  type: String,
  title: String,
  description: String,
  location: { type: 'Point', coordinates: [lng, lat] },
  severity: 'LOW' | 'MEDIUM' | 'HIGH',
  status: 'NEW' | 'ACTIVE' | 'VERIFIED' | 'RESOLVED',
  evidence: {
    reportIds: [ObjectId],
    reportCount: Number,
    corroborationScore: 0-100,
    evidenceLevel: String
  },
  createdAt: Date
}
```

---

## 🎉 Success Indicators

✅ Web dashboard loads with data  
✅ Map shows incident markers  
✅ Filters work correctly  
✅ API returns JSON responses  
✅ Analytics show correct metrics  
✅ Corroboration clustering visible  
✅ Spam detection working (1 suspicious report)  
✅ MongoDB queries are fast (<100ms)  

---

## 📞 Next Steps

1. **Test Corroboration**: Submit a new report near an existing cluster
2. **Promote Reports**: Try promoting a report to an incident via API
3. **Update Status**: Change incident status from ACTIVE → VERIFIED
4. **Time Filters**: Test analytics with different time ranges
5. **Geospatial**: Test nearby queries with different coordinates

---

## 🎓 Learning Points

This project demonstrates:
- **Full-stack development** (React + Express + MongoDB)
- **AI integration** (Gemini API for analysis)
- **Geospatial queries** (MongoDB 2dsphere)
- **Real-time analytics** (aggregation pipelines)
- **Modern UI/UX** (Next.js 16 + Tailwind CSS v4)
- **Data validation** (corroboration algorithms)
- **Production patterns** (environment configs, error handling)

---

**🚀 Your Waysure platform is ready for demo and testing!**
