import Student from '../../Database/Models/Student.js';
import mongoose from 'mongoose';

export const getAllStudents = async (req, res) => {
  try {
    const { email } = req.query;
    const { role, email: userEmail } = req.user;
    
    console.log('DEBUG: Full req.user:', JSON.stringify(req.user));
    console.log('DEBUG: Query email:', email, 'Role:', role, 'UserEmail:', userEmail);

    // Security: Students can only fetch their own profile
    if (role === 'student') {
      if (email && email.toLowerCase() === userEmail.toLowerCase()) {
        const student = await Student.findOne({ email });
        return res.json(student ? [student] : []);
      }
      console.warn(`Unauthorized student access attempt: ${userEmail} tried to access ${email}`);
      return res.status(403).json({ error: 'Permission denied. Students can only access their own data.' });
    }

    // Admins can filter by email or list all
    if (email) {
      const student = await Student.findOne({ email });
      res.json(student ? [student] : []);
    } else {
      const students = await Student.find().sort({ createdAt: -1 });
      res.json(students);
    }
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
    const { name, email, phone, department, year, address, password, fees, scholarship } = req.body;
    
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ error: 'A student with this email already exists.' });
    }
    
    const studentId = `STU${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newStudent = new Student({
      studentId,
      name,
      email,
      phone,
      department,
      year: parseInt(year),
      address,
      password,
      fees: fees || {
        total: 50000,
        paid: 0,
        pending: 50000,
        paymentHistory: []
      },
      scholarship: scholarship || {
        eligible: true,
        applied: false,
        status: 'Not Applied',
        amount: 0,
        documents: []
      }
    });
    
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('Error creating student:', error);
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
