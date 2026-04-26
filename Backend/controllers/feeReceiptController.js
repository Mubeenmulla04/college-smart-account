import FeeReceipt from '../models/FeeReceipt.js';
import Student from '../models/Student.js';
import mongoose from 'mongoose';

export const getAllReceipts = async (req, res) => {
  try {
    const receipts = await FeeReceipt.find().sort({ createdAt: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReceiptByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Collect all possible IDs this student's receipts could be stored under
    const possibleIds = new Set([studentId]);

    // Look up the student to find both their custom studentId and MongoDB _id
    // This handles old receipts saved with _id and new ones saved with STUxxxx
    try {
      const student = await Student.findOne({
        $or: [
          { studentId },
          ...(mongoose.Types.ObjectId.isValid(studentId) ? [{ _id: studentId }] : [])
        ]
      });
      if (student) {
        possibleIds.add(String(student._id));   // MongoDB _id string
        possibleIds.add(student.studentId);      // custom STUxxxx
      }
    } catch (_) { /* ignore lookup errors, fall back to direct match */ }

    const idArray = [...possibleIds].filter(Boolean);
    const receipts = await FeeReceipt.find({ studentId: { $in: idArray } }).sort({ createdAt: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const createReceipt = async (req, res) => {
  try {
    // Security: if requester is a student, they can only create receipts for themselves
    if (req.user.role === 'student') {
      const reqStudentId = String(req.body.studentId);
      const userStudentId = req.user.studentId || String(req.user._id);
      if (reqStudentId !== userStudentId && reqStudentId !== String(req.user._id)) {
        return res.status(403).json({ error: 'You can only create receipts for your own account.' });
      }
    }
    const newReceipt = new FeeReceipt(req.body);
    await newReceipt.save();
    res.status(201).json(newReceipt);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
