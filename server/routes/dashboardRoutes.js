const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');

// GET /api/dashboard/stats — Get dashboard statistics
router.get('/stats', getStats);

module.exports = router;
