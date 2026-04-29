const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin, requireCanEdit } = require('../middlewares/authMiddleware');

router.get('/statistics', requireAdmin, adminController.getStatistics);
router.get('/logs', requireAdmin, adminController.getLogs);

router.get('/employees', requireAdmin, adminController.getEmployees);
router.post('/employees', requireAdmin, adminController.createEmployee);
router.delete('/employees/:id', requireAdmin, adminController.deleteEmployee);

module.exports = router;
