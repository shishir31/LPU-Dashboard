const Registration = require('../models/Registration');
const Upload = require('../models/Upload');

// GET /api/dashboard/stats — Aggregate dashboard statistics
exports.getStats = async (_req, res) => {
  try {
    const totalRegistrations = await Registration.countDocuments();
    const verifiedCount = await Registration.countDocuments({ status: 'VERIFIED' });
    const notFoundCount = await Registration.countDocuments({ status: 'MATCH NOT FOUND' });
    const pendingCount = await Registration.countDocuments({ status: 'PENDING' });
    const uploadedPDFs = await Upload.countDocuments();

    // Get recent registrations for the dashboard table
    const recentRegistrations = await Registration.find({})
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalRegistrations,
        verifiedCount,
        notFoundCount,
        pendingCount,
        uploadedPDFs,
        recentRegistrations,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
