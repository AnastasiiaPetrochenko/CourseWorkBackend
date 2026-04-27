const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const { requireCanEdit } = require('../middlewares/authMiddleware');

router.get('/', hallController.getActiveHalls);

router.get('/all', requireCanEdit, hallController.getAllHallsAdmin);
router.post('/', requireCanEdit, hallController.createHall);
router.patch('/:id/toggle', requireCanEdit, hallController.toggleHallStatus);

module.exports = router;
