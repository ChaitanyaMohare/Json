const express = require('express');
const router = express.Router();
const { analyzeReport } = require('../controllers/aiController');

router.post('/analyze-report', analyzeReport);

module.exports = router;
