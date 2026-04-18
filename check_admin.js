import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './Database/Models/Admin.js';

dotenv.config({ path: './Backend/.env' });

async function checkAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await Admin.findOne({ email: 'admin@college.edu' });
  console.log('Admin found:', JSON.stringify(admin, null, 2));
  process.exit(0);
}

checkAdmin();
