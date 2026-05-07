const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// --------------- Middleware ---------------
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from FRONTEND_URL or any localhost port
    const allowedOrigin = process.env.FRONTEND_URL;
    
    if (!origin || origin.match(/^http:\/\/localhost:\d+$/) || (allowedOrigin && origin === allowedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------- API Routes ---------------
app.use('/api/students', studentRoutes);
app.use('/api', registrationRoutes);
app.use('/api', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------- MongoDB & Server Start ---------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cisce_badminton';

async function startServer() {
  let mongoUri = MONGO_URI;

  try {
    // First, try connecting to the configured MongoDB URI
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.log('⚠️  Could not connect to MongoDB at', mongoUri);
    console.log('🔄 Starting in-memory MongoDB for development...');

    // Fall back to in-memory MongoDB
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();

    await mongoose.connect(mongoUri);
    console.log('✅ In-memory MongoDB started at', mongoUri);

    // Auto-seed sample data in development mode
    await seedDevelopmentData();
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${PORT} is busy, trying ${PORT + 1}...`);
      app.listen(PORT + 1, () => {
        console.log(`🚀 Server running on http://localhost:${PORT + 1}`);
      });
    } else {
      throw err;
    }
  });
}

async function seedDevelopmentData() {
  const Student = require('./models/Student');
  const Registration = require('./models/Registration');

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

  const sampleRegistrations = [
    { registrationId: 'REG2024001', name: 'Arjun Sharma', class: '10', section: 'A', gender: 'Male', school: 'DPS Public School', eventCategory: 'Singles', status: 'VERIFIED' },
    { registrationId: 'REG2024042', name: 'Sneha Reddy', class: '12', section: 'B', gender: 'Female', school: "St. Mary's Convent", eventCategory: 'Doubles', status: 'MATCH NOT FOUND' },
    { registrationId: 'REG2024089', name: 'Rohan Verma', class: '11', section: 'C', gender: 'Male', school: 'Modern High School', eventCategory: 'Singles', status: 'VERIFIED' },
    { registrationId: 'REG2024112', name: 'Ananya Iyer', class: '9', section: 'A', gender: 'Female', school: 'National Public School', eventCategory: 'Mixed Doubles', status: 'VERIFIED' },
    { registrationId: 'REG2024220', name: 'Kabir Khan', class: '11', section: 'D', gender: 'Male', school: 'Bishop Cotton', eventCategory: 'Singles', status: 'MATCH NOT FOUND' },
  ];

  await Student.insertMany(sampleStudents);
  await Registration.insertMany(sampleRegistrations);
  console.log('📦 Auto-seeded sample data for development');
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
