const Registration = require('../models/Registration');
const Student = require('../models/Student');

// POST /api/register — Register a player for the tournament
// Auto-fetches full student data from master DB using Registration ID
exports.registerPlayer = async (req, res) => {
  try {
    const { registrationId, name, school, dob } = req.body;

    if (!registrationId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Registration ID and student name are required',
      });
    }

    // Check if already registered
    const existing = await Registration.findOne({ registrationId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Student with Registration ID ${registrationId} is already registered`,
      });
    }

    // Try to auto-fetch full student data from master database
    const studentData = await Student.findOne({ registrationId });

    const registration = await Registration.create({
      registrationId,
      name: studentData?.name || name,
      school: studentData?.school || school || '',
      class: studentData?.class || '',
      section: studentData?.section || '',
      gender: studentData?.gender || '',
      dob: studentData?.dob || dob || '',
      category: studentData?.category || '',
      eventCategory: studentData?.eventCategory || 'Singles',
      status: studentData ? 'VERIFIED' : 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Player registered successfully',
      data: registration,
    });
  } catch (error) {
    console.error('Error registering player:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/registrations — List all registrations with optional search/filter
exports.getRegistrations = async (req, res) => {
  try {
    const { search, status } = req.query;
    let filter = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { registrationId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { school: { $regex: search, $options: 'i' } },
      ];
    }

    const registrations = await Registration.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: registrations,
      count: registrations.length,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/registrations/:id — Delete a registration
exports.deleteRegistration = async (req, res) => {
  try {
    const deleted = await Registration.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    res.json({ success: true, message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
