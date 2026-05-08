const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    filepath: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PROCESSING',
    },
    extractedStudents: [
      {
        name: String,
        registrationId: String,
        school: String,
        eventCategory: String,
      },
    ],
    verifiedCount: {
      type: Number,
      default: 0,
    },
    notFoundCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Upload', uploadSchema);
