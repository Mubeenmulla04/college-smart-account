import FeeReceipt from '../../Database/Models/FeeReceipt.js';

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
    const receipts = await FeeReceipt.find({ studentId });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createReceipt = async (req, res) => {
  try {
    const newReceipt = new FeeReceipt(req.body);
    await newReceipt.save();
    res.status(201).json(newReceipt);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
