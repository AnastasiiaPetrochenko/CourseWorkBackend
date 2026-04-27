const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const sessionController = require('../controllers/sessionController');
const adminController = require('../controllers/adminController');
const { requireCanEdit } = require('../middlewares/authMiddleware');

router.get('/', movieController.getAllMovies);
router.post('/import', requireCanEdit, adminController.importMovies);
router.get('/:id', movieController.getMovieById);
router.post('/', requireCanEdit, movieController.createMovie);
router.put('/:id', requireCanEdit, movieController.updateMovie);
router.delete('/:id', requireCanEdit, movieController.deleteMovie);
router.get('/:id/sessions', sessionController.getSessionsByMovie);

module.exports = router;

