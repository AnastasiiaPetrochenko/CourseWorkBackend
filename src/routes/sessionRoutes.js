const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { requireCanEdit } = require('../middlewares/authMiddleware');

router.get('/', sessionController.getAllSessions);
router.post('/', requireCanEdit, sessionController.createSession);
router.delete('/:id', requireCanEdit, sessionController.deleteSession);
router.get('/:id/seats', sessionController.getSessionSeats);

module.exports = router;
