import express from 'express';
const router = express.Router();
import * as feeReceiptController from '../Controllers/feeReceiptController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

router.get('/', protect, feeReceiptController.getAllReceipts);
router.get('/student/:studentId', protect, feeReceiptController.getReceiptByStudentId);
router.post('/', protect, adminOnly, feeReceiptController.createReceipt);

export default router;
