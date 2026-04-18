import mongoose from 'mongoose';

const feeReceiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: String,
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  paymentMethod: String,
  description: String
}, { timestamps: true });

const FeeReceipt = mongoose.model('FeeReceipt', feeReceiptSchema);
export default FeeReceipt;
