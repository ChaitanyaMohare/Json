const express = require('express');
const router = express.Router();
const {
  getReports,
  getReportById,
  createReport,
  promoteReportToIncident,
  getReportCorroboration
} = require('../controllers/reportController');

router.route('/')
  .get(getReports)
  .post(createReport);

router.route('/:id')
  .get(getReportById);

router.route('/:id/promote')
  .post(promoteReportToIncident);

router.route('/:id/corroboration')
  .get(getReportCorroboration);

module.exports = router;
