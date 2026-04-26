import Payment from '../models/Payment.js';
import Receipt from '../models/Receipt.js';
import Student from '../models/Student.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { generateReceiptPDF } from '../utils/pdfGenerator.js';
import { sendEmail } from '../utils/email.js';

export const createPayment = async (req, res, next) => {
  try {
    const { studentId, amount, method, description } = req.body;
    
    // Validate student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // For simplicity in this demo, we auto-approve cash payments or partial payments
    const payment = new Payment({
      studentId: student._id,
      amount,
      method,
      description,
      status: method === 'cash' ? 'paid' : 'pending'
    });

    if (method === 'online') {
      // Logic for Razorpay order creation could go here
      // payment.transactionId = 'order_xyz'; 
    }

    await payment.save();

    if (payment.status === 'paid') {
      await finalizePayment(payment._id, req);
    }

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

const finalizePayment = async (paymentId, req) => {
  const payment = await Payment.findById(paymentId).populate('studentId');
  const student = payment.studentId;

  // Update student fees
  student.fees.paid += payment.amount;
  student.fees.pending = student.fees.total - student.fees.paid;
  student.fees.lastPayment = new Date();
  
  // Create Receipt
  const receiptNumber = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const receipt = new Receipt({
    receiptNumber,
    paymentId: payment._id,
    studentId: student._id,
    amount: payment.amount,
  });
  await receipt.save();

  // Add to History
  student.fees.paymentHistory.push({
    amount: payment.amount,
    date: new Date(),
    method: payment.method,
    receiptId: receipt.receiptNumber
  });

  await student.save();

  // Audit Log
  await createAuditLog({
    action: 'PAYMENT_SUCCESS',
    performedBy: req.user._id,
    targetId: student._id,
    targetModel: 'Student',
    details: { paymentId: payment._id, receiptNumber },
    req
  });

  // Send Success Email
  try {
    await sendEmail({
      to: student.email,
      subject: 'Payment Successful - Receipt Attached',
      text: `Your payment of ₹${payment.amount} was successful. Receipt No: ${receiptNumber}`,
      html: `<h3>Payment Successful</h3><p>Your payment of <b>₹${payment.amount}</b> was confirmed.</p><p>Receipt No: ${receiptNumber}</p>`
    });
  } catch (e) {
    // Log email failure but don't fail the whole process
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, transactionId } = req.body;
    const payment = await Payment.findById(paymentId);
    
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = 'paid';
    payment.transactionId = transactionId;
    await payment.save();

    await finalizePayment(payment._id, req);

    res.json({ success: true, message: 'Payment verified and receipt generated' });
  } catch (error) {
    next(error);
  }
};

export const downloadReceipt = async (req, res, next) => {
  try {
    const { receiptId } = req.params;
    const receipt = await Receipt.findOne({ receiptNumber: receiptId }).populate('studentId').populate('paymentId');
    
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });

    // Ensure student only downloads their own receipt (Security)
    if (req.user.role === 'student' && receipt.studentId._id.toString() !== req.user._id.toString()) {
       return res.status(403).json({ success: false, message: 'Unauthorized access to this receipt' });
    }

    const filePath = await generateReceiptPDF(receipt, receipt.studentId, receipt.paymentId);
    
    res.download(filePath, `receipt_${receiptId}.pdf`, (err) => {
      if (err) next(err);
      // Optional: Cleanup temp file later
    });
  } catch (error) {
    next(error);
  }
};
