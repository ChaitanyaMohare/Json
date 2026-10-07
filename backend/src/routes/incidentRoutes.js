const express = require('express');
const router = express.Router();
const {
  getIncidents,
  getNearbyIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
  getIncidentEvidence
} = require('../controllers/incidentController');

// Nearby search must come before /:id parameter
router.get('/nearby', getNearbyIncidents);

router.route('/')
  .get(getIncidents)
  .post(createIncident);

router.route('/:id')
  .get(getIncidentById);

router.route('/:id/status')
  .patch(updateIncidentStatus);

router.route('/:id/evidence')
  .get(getIncidentEvidence);

module.exports = router;
