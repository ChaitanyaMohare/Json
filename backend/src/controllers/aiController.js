const mongoose = require('mongoose');
const Report = require('../models/Report');
const { analyzeRoadReportWithGemini } = require('../services/geminiService');

// @desc    Analyze a community road hazard report using Gemini AI
// @route   POST /api/ai/analyze-report
exports.analyzeReport = async (req, res) => {
  try {
    const { reportId, description, type, imageUrl } = req.body;

    let targetReport = null;
    let desc = description;
    let repType = type;
    let img = imageUrl;

    // If reportId provided, retrieve the document from MongoDB
    if (reportId) {
      if (!mongoose.Types.ObjectId.isValid(reportId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reportId format'
        });
      }

      targetReport = await Report.findById(reportId);
      if (!targetReport) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      desc = desc !== undefined ? desc : targetReport.description;
      repType = repType || targetReport.type;
      img = img || targetReport.imageUrl;
    }

    // Perform Gemini AI analysis
    const analysis = await analyzeRoadReportWithGemini({
      type: repType,
      description: desc,
      imageUrl: img
    });

    // Store AI analysis in Report model if document exists
    if (targetReport) {
      targetReport.aiAnalysis = analysis;
      await targetReport.save();
    }

    return res.status(200).json({
      success: true,
      data: analysis,
      report: targetReport
    });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze report with AI',
      error: error.message
    });
  }
};
