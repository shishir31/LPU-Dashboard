const express = require('express');
const router = express.Router();
const {
  getStudentByRegistrationId,
  getAllStudents,
  seedStudents,
} = require('../controllers/studentController');

// GET /api/students — List all students (with optional ?search= query)
router.get('/', getAllStudents);

// POST /api/students/seed — Seed sample students for testing
router.post('/seed', seedStudents);

// GET /api/students/:registrationId — Fetch single student by Registration ID
router.get('/:registrationId', getStudentByRegistrationId);

module.exports = router;
