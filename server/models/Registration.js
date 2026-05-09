const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      required: [true, 'Registration ID is required'],
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    school: {
      type: String,
      trim: true,
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
      enum: ['Male', 'Female'],
    },
    dob: {
      type: String,
      trim: true,
      default: '',
    },
    eventCategory: {
      type: String,
      enum: ['Singles', 'Doubles', 'Mixed Doubles', 'Singles & Doubles'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'MATCH NOT FOUND'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
