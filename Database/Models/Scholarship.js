import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema({
  scholarshipId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  amount: Number,
  eligibilityCriteria: mongoose.Schema.Types.Mixed,
  deadline: Date,
  status: { type: String, default: 'Active' }
}, { timestamps: true });

scholarshipSchema.set('toJSON', { virtuals: true });
scholarshipSchema.set('toObject', { virtuals: true });

const Scholarship = mongoose.model('Scholarship', scholarshipSchema);
export default Scholarship;
