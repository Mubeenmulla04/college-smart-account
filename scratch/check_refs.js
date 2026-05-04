import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Check Student
    const student = await db.collection('students').findOne({ _id: new mongoose.Types.ObjectId("69e3cfab83e041b25392e31a") });
    console.log('Student:', student ? student.name : 'NOT FOUND');

    // Check Scholarship
    const scholarship = await db.collection('scholarships').findOne({ _id: new mongoose.Types.ObjectId("69e3cfab83e041b25392e320") });
    console.log('Scholarship:', scholarship ? scholarship.name : 'NOT FOUND');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

check();
