/**
 * Seed Script — Run with: node seed.js
 * Populates the MongoDB database with sample students and registrations for testing.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');
const Registration = require('./models/Registration');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cisce_badminton';

const sampleStudents = [
  { admissionNo: '2024001', name: 'Arjun Sharma', class: '10', section: 'A', gender: 'Male', school: 'DPS Public School' },
  { admissionNo: '2024042', name: 'Sneha Reddy', class: '12', section: 'B', gender: 'Female', school: "St. Mary's Convent" },
  { admissionNo: '2024089', name: 'Rohan Verma', class: '11', section: 'C', gender: 'Male', school: 'Modern High School' },
  { admissionNo: '2024112', name: 'Ananya Iyer', class: '9', section: 'A', gender: 'Female', school: 'National Public School' },
  { admissionNo: '2024220', name: 'Kabir Khan', class: '11', section: 'D', gender: 'Male', school: 'Bishop Cotton' },
  { admissionNo: '2024305', name: 'Priya Menon', class: '10', section: 'B', gender: 'Female', school: 'Kendriya Vidyalaya' },
  { admissionNo: '2024410', name: 'Vikram Singh', class: '12', section: 'A', gender: 'Male', school: 'La Martiniere College' },
  { admissionNo: '2024518', name: 'Meera Joshi', class: '9', section: 'C', gender: 'Female', school: 'Sacred Heart Convent' },
  { admissionNo: '2024622', name: 'Aditya Patel', class: '10', section: 'A', gender: 'Male', school: 'Scindia School' },
  { admissionNo: '2024730', name: 'Ishita Gupta', class: '11', section: 'B', gender: 'Female', school: 'Welham Girls School' },
];

const sampleRegistrations = [
  { admissionNo: '2024001', name: 'Arjun Sharma', class: '10', section: 'A', gender: 'Male', school: 'DPS Public School', eventCategory: 'Singles', status: 'VERIFIED' },
  { admissionNo: '2024042', name: 'Sneha Reddy', class: '12', section: 'B', gender: 'Female', school: "St. Mary's Convent", eventCategory: 'Doubles', status: 'MATCH NOT FOUND' },
  { admissionNo: '2024089', name: 'Rohan Verma', class: '11', section: 'C', gender: 'Male', school: 'Modern High School', eventCategory: 'Singles', status: 'VERIFIED' },
  { admissionNo: '2024112', name: 'Ananya Iyer', class: '9', section: 'A', gender: 'Female', school: 'National Public School', eventCategory: 'Mixed Doubles', status: 'VERIFIED' },
  { admissionNo: '2024220', name: 'Kabir Khan', class: '11', section: 'D', gender: 'Male', school: 'Bishop Cotton', eventCategory: 'Singles', status: 'MATCH NOT FOUND' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Seed students
    for (const s of sampleStudents) {
      await Student.updateOne({ admissionNo: s.admissionNo }, { $set: s }, { upsert: true });
    }
    console.log(`📦 Seeded ${sampleStudents.length} students`);

    // Seed registrations
    for (const r of sampleRegistrations) {
      await Registration.updateOne(
        { admissionNo: r.admissionNo, eventCategory: r.eventCategory },
        { $set: r },
        { upsert: true }
      );
    }
    console.log(`📦 Seeded ${sampleRegistrations.length} registrations`);

    console.log('🎉 Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
