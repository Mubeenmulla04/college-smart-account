import mongoose from 'mongoose';

const scholarshipApplicationSchema = new mongoose.Schema({
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  familyIncome: {
    type: Number,
    required: true
  },
  academicPerformance: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  documents: [String],
  status: {
    type: String,
    enum: ['Under Review', 'Approved', 'Rejected'],
    default: 'Under Review'
  },
  mahadbtId: String,
  schemeName: String,
  mahadbtStatus: {
    type: String,
    enum: ['Applied', 'Under Scrutiny', 'Approved', 'Redeemed', 'Rejected'],
    default: 'Applied'
  },
  casteCategory: {
    type: String,
    required: true
  },
  isMinority: {
    type: Boolean,
    default: false
  },
  previousYearMarks: {
    type: Number,
    required: true
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  documentUrls: {
    aadharCard: String,
    incomeCertificate: String,
    casteCertificate: String,
    previousMarksheet: String,
    rationCard: String
  },
  estimatedAmount: {
    type: Number,
    default: 0
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  reviewDate: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  adminComments: String
}, { timestamps: true });

const ScholarshipApplication = mongoose.model('ScholarshipApplication', scholarshipApplicationSchema);
export default ScholarshipApplication;
