const Student = require('../models/Student');

// GET /api/students/:registrationId — Fetch a single student by Registration ID
exports.getStudentByRegistrationId = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const student = await Student.findOne({ registrationId });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this Registration ID',
      });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/students — List all students (with optional search)
exports.getAllStudents = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      filter = {
        $or: [
          { registrationId: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { school: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const students = await Student.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: students, count: students.length });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/students/seed — Seed sample student data (for testing)
exports.seedStudents = async (_req, res) => {
  try {
    const sampleStudents = [
      { registrationId: 'REG2024001', name: 'Arjun Sharma', class: '10', section: 'A', gender: 'Male', school: 'DPS Public School', eventCategory: 'Singles' },
      { registrationId: 'REG2024042', name: 'Sneha Reddy', class: '12', section: 'B', gender: 'Female', school: "St. Mary's Convent", eventCategory: 'Doubles' },
      { registrationId: 'REG2024089', name: 'Rohan Verma', class: '11', section: 'C', gender: 'Male', school: 'Modern High School', eventCategory: 'Singles' },
      { registrationId: 'REG2024112', name: 'Ananya Iyer', class: '9', section: 'A', gender: 'Female', school: 'National Public School', eventCategory: 'Mixed Doubles' },
      { registrationId: 'REG2024220', name: 'Kabir Khan', class: '11', section: 'D', gender: 'Male', school: 'Bishop Cotton', eventCategory: 'Singles' },
      { registrationId: 'REG2024305', name: 'Priya Menon', class: '10', section: 'B', gender: 'Female', school: 'Kendriya Vidyalaya', eventCategory: 'Doubles' },
      { registrationId: 'REG2024410', name: 'Vikram Singh', class: '12', section: 'A', gender: 'Male', school: 'La Martiniere College', eventCategory: 'Singles' },
      { registrationId: 'REG2024518', name: 'Meera Joshi', class: '9', section: 'C', gender: 'Female', school: 'Sacred Heart Convent', eventCategory: 'Mixed Doubles' },
      { registrationId: 'REG2024622', name: 'Aditya Patel', class: '10', section: 'A', gender: 'Male', school: 'Scindia School', eventCategory: 'Singles' },
      { registrationId: 'REG2024730', name: 'Ishita Gupta', class: '11', section: 'B', gender: 'Female', school: 'Welham Girls School', eventCategory: 'Doubles' },
    ];

    for (const s of sampleStudents) {
      await Student.updateOne(
        { registrationId: s.registrationId },
        { $set: s },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: `Seeded ${sampleStudents.length} students`,
    });
  } catch (error) {
    console.error('Error seeding students:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
