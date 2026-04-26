import express from 'express';
const router = express.Router();

import * as paymentController from '../Controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, paymentController.createPayment);
router.post('/verify', protect, paymentController.verifyPayment);
router.get('/receipt/:receiptId', protect, paymentController.downloadReceipt);

export default router;
