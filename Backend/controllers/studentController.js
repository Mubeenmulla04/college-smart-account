import Student from '../models/Student.js';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export const getAllStudents = async (req, res) => {
  try {
    const { email, search, department } = req.query;
    const { role, email: userEmail } = req.user;
    
    console.log('DEBUG: Full req.user:', JSON.stringify(req.user));
    console.log('DEBUG: Query params:', { email, search, department }, 'Role:', role);

    // Security: Students can only fetch their own profile
    if (role === 'student') {
      const student = await Student.findOne({ email: userEmail });
      return res.json(student ? [student] : []);
    }

    // Admins can filter
    let query = {};
    
    if (email) {
      query.email = email;
    } else if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }

    const students = await Student.find(query).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ 
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { studentId: id }
      ]
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { 
      studentId, name, email, phone, department, 
      year, address, password, fees, scholarship 
    } = req.body;
    
    logger.info(`DEBUG: Received fees: ${JSON.stringify(fees)}`);
    logger.info(`DEBUG: Received scholarship: ${JSON.stringify(scholarship)}`);
    logger.info(`DEBUG: Received studentId: ${studentId}`);
    
    const existingStudent = await Student.findOne({ 
      $or: [{ email }, { studentId }] 
    });
    
    if (existingStudent) {
      return res.status(409).json({ error: 'A student with this Email or PRN already exists.' });
    }
    
    const newStudent = new Student({
      studentId: studentId || `STU${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      phone,
      department,
      year: year ? parseInt(year) : undefined,
      address,
      password: password || 'password123',
      fees: {
        total: Number(fees?.total) || 0,
        paid: Number(fees?.paid) || 0,
        pending: Number(fees?.pending ?? (fees?.total || 0)) || 0,
        paymentHistory: Array.isArray(fees?.paymentHistory) ? fees.paymentHistory : []
      },
      scholarship: {
        eligible: scholarship?.eligible ?? true,
        applied: scholarship?.applied ?? false,
        status: scholarship?.status || 'Not Applied',
        amount: Number(scholarship?.amount) || 0,
        documents: Array.isArray(scholarship?.documents) ? scholarship.documents : []
      }
    });
    
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    logger.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: Date.now() };
    
    const student = await Student.findOneAndUpdate(
      { 
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
          { studentId: id }
        ]
      },
      { $set: updateData },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOneAndDelete({ 
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { studentId: id }
      ]
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    // req.user is already populated by the protect middleware
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
