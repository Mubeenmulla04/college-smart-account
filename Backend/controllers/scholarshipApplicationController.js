import ScholarshipApplication from '../models/ScholarshipApplication.js';
import Scholarship from '../models/Scholarship.js';
import Student from '../models/Student.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

export const applyForScholarship = async (req, res, next) => {
  try {
    const { 
      scholarshipId, familyIncome, academicPerformance, reason, documents, 
      mahadbtId, schemeName, mahadbtStatus,
      casteCategory, isMinority, previousYearMarks, bankDetails, documentUrls
    } = req.body;
    const studentId = req.user._id;

    // Check if already applied
    const existing = await ScholarshipApplication.findOne({ studentId, scholarshipId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied for this scholarship.' });

    // FUNDING LOGIC
    // Get student to check total fees for percentage calculation
    const student = await Student.findById(studentId);
    const totalTuitionFees = student.fees.total || 100000; // Fallback for calculation
    let estimatedAmount = 0;

    switch(schemeName) {
      case 'Rajarshi Chhatrapati Shahu Maharaj Fee Reimbursement':
        estimatedAmount = totalTuitionFees * 0.50; // 50% EBC
        break;
      case 'Post-Matric Scholarship to SC Students':
      case 'Post-Matric Scholarship to ST Students':
        estimatedAmount = totalTuitionFees; // 100% for SC/ST
        break;
      case 'Post-Matric Scholarship to OBC Students':
        estimatedAmount = totalTuitionFees * 0.50; // 50% for OBC
        break;
      case 'Dr. Panjabrao Deshmukh Hostel Allowance':
        estimatedAmount = 20000; // Fixed hostel allowance
        break;
      case 'State Minority Scholarship Purshottam Das':
        estimatedAmount = 25000; // Fixed minority scholarship
        break;
      default:
        estimatedAmount = 5000; // Base amount
    }

    const application = new ScholarshipApplication({
      scholarshipId,
      studentId,
      familyIncome,
      academicPerformance,
      reason,
      documents,
      mahadbtId,
      schemeName,
      mahadbtStatus: mahadbtStatus || 'Applied',
      casteCategory,
      isMinority,
      previousYearMarks,
      bankDetails,
      documentUrls,
      estimatedAmount,
      studentName: student.name,
      studentRollNo: student.studentId,
      department: student.department
    });

    await application.save();
    
    // Update student's scholarship status
    await Student.findByIdAndUpdate(studentId, {
      'scholarship.applied': true,
      'scholarship.status': 'Under Review',
      'scholarship.mahadbtId': mahadbtId,
      'scholarship.schemeName': schemeName,
      'scholarship.mahadbtStatus': mahadbtStatus || 'Applied',
      'scholarship.amount': estimatedAmount
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await ScholarshipApplication.find({ studentId: req.user._id })
      .populate('scholarshipId', 'name amount');
    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

export const getAllApplications = async (req, res, next) => {
  try {
    const applications = await ScholarshipApplication.find()
      .populate('studentId', 'name studentId email department')
      .populate('scholarshipId', 'name amount');
    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

export const reviewApplication = async (req, res, next) => {
  try {
    const { status, adminComments } = req.body;
    const { id } = req.params;

    const application = await ScholarshipApplication.findById(id).populate('scholarshipId');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (application.status !== 'Under Review') {
      return res.status(400).json({ success: false, message: 'Application has already been reviewed.' });
    }

    application.status = status;
    application.adminComments = adminComments;
    application.reviewDate = Date.now();
    application.reviewedBy = req.user._id;
    await application.save();

    if (status === 'Approved') {
      const scholarshipAmount = application.scholarshipId.amount;
      const student = await Student.findById(application.studentId);

      // REDUCTION LOGIC: Apply scholarship to fees
      student.fees.paid += scholarshipAmount;
      student.fees.pending = Math.max(0, student.fees.pending - scholarshipAmount);
      student.scholarship.status = 'Approved';
      student.scholarship.amount = scholarshipAmount;
      
      await student.save();

      await AuditLog.create({
        action: 'SCHOLARSHIP_APPROVED',
        performedBy: req.user._id,
        targetId: student._id,
        targetModel: 'Student',
        details: `Approved scholarship of ₹${scholarshipAmount}`
      });
      
      logger.info(`Scholarship approved for student ${student.email}. Amount: ${scholarshipAmount}`);
    } else {
      await Student.findByIdAndUpdate(application.studentId, {
        'scholarship.status': 'Rejected'
      });
    }

    res.json({ success: true, message: `Application ${status.toLowerCase()} successfully` });
  } catch (error) {
    next(error);
  }
};
