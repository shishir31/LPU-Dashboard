const multer = require('multer');

// Use memory storage — works on Render and other platforms with ephemeral filesystems
// The file is kept in RAM as a Buffer (req.file.buffer) instead of being written to disk
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.originalname.match(/\.(pdf|xlsx|xls)$/i)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Excel files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;
