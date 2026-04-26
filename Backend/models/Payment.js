import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  method: { type: String, enum: ['cash', 'online', 'scholarship'], required: true },
  transactionId: { type: String },
  date: { type: Date, default: Date.now },
  description: String,
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
