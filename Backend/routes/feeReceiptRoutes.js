import express from 'express';
const router = express.Router();
import * as feeReceiptController from '../Controllers/feeReceiptController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.get('/', protect, adminOnly, feeReceiptController.getAllReceipts);
router.get('/student/:studentId', protect, feeReceiptController.getReceiptByStudentId);
router.post('/', protect, feeReceiptController.createReceipt);  // Students can create their own receipts

export default router;
