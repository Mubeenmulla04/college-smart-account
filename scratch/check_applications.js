import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../Backend/.env') });

const check = async () => {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI.replace(/:([^:@]{1,})@/, ':****@'));
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    const db = mongoose.connection.db;
    const appsCol = db.collection('scholarshipapplications'); // Mongoose pluralizes and lowercases by default
    const count = await appsCol.countDocuments();
    console.log(`Found ${count} applications in scholarshipapplications collection`);

    const apps = await appsCol.find().toArray();
    apps.forEach((app, i) => {
      console.log(`\nApp ${i + 1}:`, JSON.stringify(app, null, 2));
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

check();
