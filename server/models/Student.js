const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: [true, 'Registration ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    dob: {
      type: String,
      trim: true,
      default: '',
    },
    class: {
      type: String,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', ''],
    },
    school: {
      type: String,
      trim: true,
    },
    eventCategory: {
      type: String,
      enum: ['Singles', 'Doubles', 'Mixed Doubles', 'Singles & Doubles'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
