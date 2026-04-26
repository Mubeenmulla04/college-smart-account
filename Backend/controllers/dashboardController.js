import Student from '../models/Student.js';
import Receipt from '../models/Receipt.js';
import Scholarship from '../models/Scholarship.js';
import ScholarshipApplication from '../models/ScholarshipApplication.js';
import logger from '../utils/logger.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    
    const students = await Student.find({}, 'fees scholarship');
    
    const totalFees = students.reduce((sum, s) => sum + (s.fees?.total || 0), 0);
    const pendingFees = students.reduce((sum, s) => sum + (s.fees?.pending || 0), 0);
    
    const scholarshipApplications = await ScholarshipApplication.countDocuments();
    const pendingScholarships = await ScholarshipApplication.countDocuments({ status: 'Under Review' });

    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email department fees studentId');

    res.json({
      success: true,
      totalStudents,
      totalFees,
      pendingFees,
      scholarshipApplications,
      pendingScholarships,
      recentStudents
    });
  } catch (error) {
    logger.error('Error fetching admin stats:', error);
    next(error);
  }
};

export const getStudentStats = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user._id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const receipts = await Receipt.find({ studentId: student._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      profile: student,
      recentReceipts: receipts
    });
  } catch (error) {
    next(error);
  }
};
