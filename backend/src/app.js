const express = require('express');
const cors = require('cors');
const incidentRoutes = require('./routes/incidentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());

// Root health check & API health check - DO NOT BREAK
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'RouteGuard API'
  });
});

// Resource Routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handler Middleware
app.use(errorHandler);

module.exports = app;
