const express = require('express');
const router = express.Router();
const {
  getAnalyticsOverview,
  getHotspots
} = require('../controllers/analyticsController');

// Aggregated road safety overview stats
router.get('/overview', getAnalyticsOverview);

// Geographic road safety hotspots with deterministic risk scoring
router.get('/hotspots', getHotspots);

module.exports = router;
