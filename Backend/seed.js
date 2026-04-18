import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Import Models
import Student from '../Database/Models/Student.js';
import Admin from '../Database/Models/Admin.js';
import Department from '../Database/Models/Department.js';
import Scholarship from '../Database/Models/Scholarship.js';
import FeeReceipt from '../Database/Models/FeeReceipt.js';

const demoData = {
  admins: [
    {
      adminId: 'ADM001',
      name: 'College Admin',
      email: 'admin@college.edu',
      role: 'admin',
      password: 'Password123'
    }
  ],
  departments: [
    { deptId: 'CS001', name: 'Computer Science', code: 'CS', totalStudents: 150, headOfDepartment: 'Dr. Smith' },
    { deptId: 'EE001', name: 'Electrical Engineering', code: 'EE', totalStudents: 120, headOfDepartment: 'Dr. Johnson' },
    { deptId: 'ME001', name: 'Mechanical Engineering', code: 'ME', totalStudents: 100, headOfDepartment: 'Dr. Williams' }
  ],
  students: [
    {
      studentId: 'STU001',
      name: 'John Doe',
      email: 'john.doe@student.edu',
      phone: '1234567890',
      department: 'Computer Science',
      year: 3,
      address: '123 Main St, City',
      password: 'Password123',
      fees: {
        total: 50000,
        paid: 20000,
        pending: 30000,
        paymentHistory: [
          { amount: 20000, date: new Date(), method: 'Online', receiptId: 'REC001' }
        ]
      },
      scholarship: {
        eligible: true,
        applied: true,
        status: 'Approved',
        amount: 5000,
        applicationDate: new Date()
      }
    }
  ],
  scholarships: [
    { scholarshipId: 'SCH001', name: 'Merit Scholarship', description: 'For top students', amount: 5000, status: 'Active' },
    { scholarshipId: 'SCH002', name: 'Need-based Aid', description: 'For financial assistance', amount: 3000, status: 'Active' }
  ]
};

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not defined in .env");
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Admin.deleteMany({});
    await Student.deleteMany({});
    await Department.deleteMany({});
    await Scholarship.deleteMany({});
    await FeeReceipt.deleteMany({});
    console.log('Cleared existing data.');

    // Insert new data (using save() to trigger pre-save hooks for hashing)
    for (const admin of demoData.admins) {
      await new Admin(admin).save();
    }
    for (const student of demoData.students) {
      await new Student(student).save();
    }
    
    await Department.insertMany(demoData.departments);
    await Scholarship.insertMany(demoData.scholarships);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();