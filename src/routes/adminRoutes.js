const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin, requireCanEdit } = require('../middlewares/authMiddleware');

router.get('/statistics', requireAdmin, adminController.getStatistics);
router.get('/logs', requireAdmin, adminController.getLogs);

module.exports = router;
