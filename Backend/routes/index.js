import express from 'express';
const router = express.Router();

import studentRoutes from './studentRoutes.js';
import authRoutes from './authRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import scholarshipRoutes from './scholarshipRoutes.js';
import feeReceiptRoutes from './feeReceiptRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import exportRoutes from './exportRoutes.js';

import dashboardRoutes from './dashboardRoutes.js';

router.use('/students', studentRoutes);
router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/scholarships', scholarshipRoutes);
router.use('/feeReceipts', feeReceiptRoutes);
router.use('/payments', paymentRoutes);
router.use('/exports', exportRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
