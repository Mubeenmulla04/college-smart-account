import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  items: [{
    description: String,
    amount: Number
  }]
}, { timestamps: true });

const Receipt = mongoose.model('Receipt', receiptSchema);
export default Receipt;
