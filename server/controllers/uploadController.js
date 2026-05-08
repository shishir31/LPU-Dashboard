const Upload = require('../models/Upload');
const Registration = require('../models/Registration');
const Student = require('../models/Student');
const { extractStudentsFromPDF } = require('../utils/pdfParser');

// POST /api/upload-pdf — Upload a PDF, extract students, and save them to the database
exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded',
      });
    }

    // Create upload record
    const uploadRecord = await Upload.create({
      filename: req.file.originalname,
      filepath: '', // memory storage — no disk path
      status: 'PROCESSING',
    });

    // Extract students from the PDF buffer (in-memory, no disk write needed)
    let extracted;
    try {
      extracted = await extractStudentsFromPDF(req.file.buffer);
    } catch (parseError) {
      console.error('PDF parse error:', parseError);
      uploadRecord.status = 'FAILED';
      await uploadRecord.save();
      return res.status(422).json({
        success: false,
        message: 'Failed to parse PDF. Make sure the PDF contains selectable text.',
      });
    }

    // Save extracted students into the Student collection (the master database)
    // This makes them available for lookup via Registration ID on the registration form
    let savedCount = 0;
    for (const s of extracted.students) {
      if (s.registrationId) {
        await Student.updateOne(
          { registrationId: s.registrationId },
          {
            $set: {
              registrationId: s.registrationId,
              name: s.name || 'Unknown',
              fatherName: s.fatherName || '',
              category: s.category || '',
              dob: s.dob || '',
              school: s.school || '',
              class: s.class || '',
              section: s.section || '',
              gender: s.gender || '',
              eventCategory: s.eventCategory || 'Singles',
            },
          },
          { upsert: true }
        );
        savedCount++;
      }
    }

    console.log(`📄 Extracted ${extracted.students.length} students from PDF, saved ${savedCount} to database`);

    // Cross-reference with existing registrations to update verification status
    let verifiedCount = 0;
    let notFoundCount = 0;

    const extractedRegIds = extracted.students
      .map((s) => s.registrationId)
      .filter(Boolean);

    const registrations = await Registration.find({});
    for (const reg of registrations) {
      const foundInPDF = extractedRegIds.includes(reg.registrationId);
      if (foundInPDF) {
        if (reg.status !== 'VERIFIED') {
          reg.status = 'VERIFIED';
          verifiedCount++;
        }
      } else {
        if (reg.status === 'PENDING') {
          reg.status = 'MATCH NOT FOUND';
          notFoundCount++;
        }
      }
      await reg.save();
    }

    // Update upload record
    uploadRecord.extractedStudents = extracted.students;
    uploadRecord.verifiedCount = verifiedCount;
    uploadRecord.notFoundCount = notFoundCount;
    uploadRecord.status = 'COMPLETED';
    await uploadRecord.save();

    res.json({
      success: true,
      message: `PDF processed! ${savedCount} students extracted and saved. ${verifiedCount} registrations verified, ${notFoundCount} not found.`,
      data: {
        uploadId: uploadRecord._id,
        filename: uploadRecord.filename,
        extractedCount: extracted.students.length,
        savedCount,
        verifiedCount,
        notFoundCount,
        totalPages: extracted.totalPages,
        students: extracted.students,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Server error during upload' });
  }
};

// GET /api/verification-status — Get all registrations with status
exports.getVerificationStatus = async (_req, res) => {
  try {
    const registrations = await Registration.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: registrations,
      count: registrations.length,
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/uploads — List all uploads
exports.getUploads = async (_req, res) => {
  try {
    const uploads = await Upload.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: uploads,
      count: uploads.length,
    });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/uploads/:id — Delete an upload record
exports.deleteUpload = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({ success: false, message: 'Upload not found' });
    }

    // Delete students extracted from this PDF to keep the database clean
    if (upload.extractedStudents && upload.extractedStudents.length > 0) {
      const regIds = upload.extractedStudents.map(s => s.registrationId).filter(Boolean);
      await Student.deleteMany({ registrationId: { $in: regIds } });
    }

    await Upload.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Upload and associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting upload:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
