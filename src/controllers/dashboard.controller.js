const dashboardService = require('../services/dashboard.service');
const catchAsync = require('../utils/catchAsync');

const getSummary = catchAsync(async (req, res) => {
  const summary = await dashboardService.getSummary(req.user._id);
  res.json({ success: true, summary });
});

const getCategoryBreakdown = catchAsync(async (req, res) => {
  const breakdown = await dashboardService.getCategoryBreakdown(req.user._id);
  res.json({ success: true, breakdown });
});

const getMonthlyTrends = catchAsync(async (req, res) => {
  const trends = await dashboardService.getMonthlyTrends(req.user._id);
  res.json({ success: true, trends });
});

const getRecentTransactions = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  const transactions = await dashboardService.getRecentTransactions(req.user._id, limit);
  res.json({ success: true, transactions });
});

module.exports = { 
  getSummary, 
  getCategoryBreakdown, 
  getMonthlyTrends, 
  getRecentTransactions 
};
