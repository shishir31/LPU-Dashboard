const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadPDF,
  getVerificationStatus,
  getUploads,
  deleteUpload,
} = require('../controllers/uploadController');

// POST /api/upload-pdf — Upload a PDF file
router.post('/upload-pdf', upload.single('pdf'), uploadPDF);

// GET /api/verification-status — Get verification status of all registrations
router.get('/verification-status', getVerificationStatus);

// GET /api/uploads — List all uploaded PDFs
router.get('/uploads', getUploads);

// DELETE /api/uploads/:id — Delete an upload
router.delete('/uploads/:id', deleteUpload);

module.exports = router;
