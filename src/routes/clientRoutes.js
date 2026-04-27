const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/:id/tickets', ticketController.getClientTickets);

module.exports = router;
