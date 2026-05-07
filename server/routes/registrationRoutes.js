const express = require('express');
const router = express.Router();
const {
  registerPlayer,
  getRegistrations,
  deleteRegistration,
} = require('../controllers/registrationController');

// POST /api/register — Register a player
router.post('/register', registerPlayer);

// GET /api/registrations — List all registrations
router.get('/registrations', getRegistrations);

// DELETE /api/registrations/:id — Delete a registration
router.delete('/registrations/:id', deleteRegistration);

module.exports = router;
