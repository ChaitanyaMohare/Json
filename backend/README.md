# RouteGuard - Backend API

Node.js, Express, and MongoDB Atlas REST API service for RouteGuard.

## Tech Stack
- **Runtime:** Node.js (v22+)
- **Framework:** Express.js
- **Database:** MongoDB Atlas / Mongoose
- **Utilities:** `cors`, `dotenv`

## Directory Structure
```
backend/
└── src/
    ├── config/
    │   └── db.js                 # MongoDB connection setup
    ├── models/
    │   ├── User.js               # User schema
    │   ├── Incident.js           # Incident schema (GeoJSON 2dsphere)
    │   └── Report.js             # Report schema (GeoJSON 2dsphere)
    ├── controllers/
    │   ├── incidentController.js # Incident handlers & geospatial search
    │   └── reportController.js   # Community report handlers
    ├── routes/
    │   ├── incidentRoutes.js     # /api/incidents routes
    │   └── reportRoutes.js       # /api/reports routes
    ├── middleware/
    │   └── errorHandler.js       # Standardized error handling
    ├── app.js                    # Express app configuration & middleware
    └── server.js                 # Server entry point & listener
```

## Environment Variables (`.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/routeguard?retryWrites=true&w=majority
```
*(If MONGODB_URI is left blank locally, it defaults to `mongodb://127.0.0.1:27017/routeguard`)*

## API Endpoints

### Health
- `GET /api/health` - Basic health check

### Incidents
- `GET /api/incidents` - Get all incidents (Supports `?type=`, `?severity=`, `?status=`)
- `GET /api/incidents/nearby` - Geospatial radius search (`?latitude=&longitude=&radius=` in meters)
- `GET /api/incidents/:id` - Get incident by ID
- `POST /api/incidents` - Create new incident
- `PATCH /api/incidents/:id/status` - Update status (`NEW`, `ACTIVE`, `VERIFIED`, `RESOLVED`, `REJECTED`)

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Submit incident report