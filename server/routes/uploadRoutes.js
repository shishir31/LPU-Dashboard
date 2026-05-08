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
// Wrap multer in a callback to catch errors and return proper JSON
router.post('/upload-pdf', (req, res, next) => {
  upload.single('pdf')(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
      });
    }
    next();
  });
}, uploadPDF);

// GET /api/verification-status — Get verification status of all registrations
router.get('/verification-status', getVerificationStatus);

// GET /api/uploads — List all uploaded PDFs
router.get('/uploads', getUploads);

// DELETE /api/uploads/:id — Delete an upload
router.delete('/uploads/:id', deleteUpload);

module.exports = router;
