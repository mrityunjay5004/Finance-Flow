const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../utils/constants');

// Analytics access for Analysts and Admins
router.use(authenticate, authorize(ROLES.ANALYST, ROLES.ADMIN));

router.get('/summary', dashboardController.getSummary);
router.get('/category-breakdown', dashboardController.getCategoryBreakdown);
router.get('/monthly-trends', dashboardController.getMonthlyTrends);
router.get('/recent-transactions', dashboardController.getRecentTransactions);

module.exports = router;
