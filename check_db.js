import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './Database/Models/Student.js';

dotenv.config({ path: './Backend/.env' });

async function checkStudent() {
  await mongoose.connect(process.env.MONGODB_URI);
  const student = await Student.findOne({ email: 'john.doe@student.edu' });
  console.log('Student found:', JSON.stringify(student, null, 2));
  process.exit(0);
}

checkStudent();
