require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('./models/Registration');
const Student = require('./models/Student');

async function fix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    // Fix ALL pending registrations that should be verified
    const pendings = await Registration.find({ status: 'PENDING' });
    let count = 0;
    
    for (const p of pendings) {
      const s = await Student.findOne({ registrationId: p.registrationId });
      if (s) {
        p.status = 'VERIFIED';
        await p.save();
        count++;
        console.log(`✅ Updated ${p.name} (${p.registrationId}) to VERIFIED`);
      }
    }
    
    console.log(`\n🎉 Successfully fixed ${count} stuck pending registrations!`);
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fix();
