import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
  studentId:    { type: String, required: true, unique: true },
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  phone:        String,
  dateOfBirth:  Date,
  gender:       { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  department:   String,
  year:         Number,
  rollNumber:   String,
  admissionYear:Number,
  category:     { type: String, enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'] },
  address:      String,
  role:         { type: String, default: 'student' },
  password:     { type: String, required: true },
  isVerified:   { type: Boolean, default: false },
  otp:          String,
  otpExpires:   Date,
  otpRetries:   { type: Number, default: 0 },
  fees: {
    total: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    lastPayment: Date,
    paymentHistory: [{
      amount: Number,
      date: Date,
      method: String,
      receiptId: String
    }]
  },
  scholarship: {
    eligible: { type: Boolean, default: true },
    applied: { type: Boolean, default: false },
    status: { type: String, default: 'Not Applied' },
    amount: { type: Number, default: 0 },
    applicationDate: Date,
    documents: [String],
    mahadbtId: String,
    schemeName: String,
    mahadbtStatus: String
  }
}, { timestamps: true });

// Pre-save hook to hash password
studentSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Method to compare password
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ensure virtual 'id' is included in JSON/Object
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
